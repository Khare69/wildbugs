import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/challenges - List all seasonal missions with progress metrics
router.get('/', optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user?.userId;
    const now = new Date();

    const challenges = await prisma.challenge.findMany({
      include: {
        progress: true,
      },
      orderBy: { endsAt: 'asc' },
    });

    const enrichedChallenges = challenges.map((ch) => {
      const daysRemaining = Math.max(
        0,
        Math.ceil((new Date(ch.endsAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );

      const userProgressRecord = userId
        ? ch.progress.find((p) => p.userId === userId) || null
        : null;

      return {
        id: ch.id,
        title: ch.title,
        description: ch.description,
        targetCount: ch.targetCount,
        speciesFamily: ch.speciesFamily,
        startsAt: ch.startsAt,
        endsAt: ch.endsAt,
        daysRemaining,
        totalParticipants: ch.progress.length,
        userProgress: userProgressRecord
          ? {
              progress: userProgressRecord.progress,
              completed: userProgressRecord.completed,
            }
          : null,
      };
    });

    return res.json({ challenges: enrichedChallenges });
  } catch (err) {
    next(err);
  }
});

// POST /api/challenges/:id/join - Enroll user in a challenge
router.post('/:id/join', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const challengeId = parseInt(req.params.id, 10);
    if (isNaN(challengeId)) {
      return res.status(400).json({ error: 'Invalid challenge ID' });
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Check if progress already exists
    let progressRecord = await prisma.challengeProgress.findUnique({
      where: {
        challengeId_userId: {
          challengeId,
          userId,
        },
      },
    });

    if (!progressRecord) {
      progressRecord = await prisma.challengeProgress.create({
        data: {
          challengeId,
          userId,
          progress: 0,
          completed: false,
        },
      });
    }

    return res.json({ progress: progressRecord });
  } catch (err) {
    next(err);
  }
});

export default router;
