import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { identifyInsect } from '../services/identification';
import { checkAndAwardBadges } from '../services/badgeService';

const router = Router();

// POST /api/sightings - Upload photo, AI identification, and record sighting
router.post(
  '/',
  authenticate,
  upload.single('photo'),
  async (req: AuthRequest, res: Response, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Please upload an insect photo.' });
      }

      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized user.' });
      }

      const rawLat = parseFloat(req.body.latitude);
      const rawLng = parseFloat(req.body.longitude);
      const latitude = isNaN(rawLat) ? 28.6139 : rawLat;
      const longitude = isNaN(rawLng) ? 77.2090 : rawLng;
      const notes = req.body.notes || null;

      const photoUrl = `/uploads/${req.file.filename}`;

      // AI Identification with Top-3 Candidates & Hybrid Vision
      const { species, confidence, candidates, aiModel, notes: aiNotes } = await identifyInsect(req.file.path);

      // If user passed a confirmed speciesId override
      const manualSpeciesId = req.body.speciesId ? parseInt(req.body.speciesId, 10) : null;
      const finalSpeciesId = manualSpeciesId && !isNaN(manualSpeciesId) ? manualSpeciesId : species?.id;

      const sighting = await prisma.sighting.create({
        data: {
          userId,
          speciesId: finalSpeciesId,
          photoUrl,
          latitude,
          longitude,
          aiConfidence: confidence,
          status: 'pending',
          notes,
        },
        include: {
          species: true,
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Update challenge progress if sighting matches challenge speciesFamily
      if (sighting.species?.family) {
        const activeChallenges = await prisma.challenge.findMany({
          where: {
            speciesFamily: sighting.species.family,
            startsAt: { lte: new Date() },
            endsAt: { gte: new Date() },
          },
        });

        for (const ch of activeChallenges) {
          const userProgress = await prisma.challengeProgress.findUnique({
            where: {
              challengeId_userId: {
                challengeId: ch.id,
                userId,
              },
            },
          });

          if (userProgress && !userProgress.completed) {
            const nextProgress = userProgress.progress + 1;
            const completed = nextProgress >= ch.targetCount;
            await prisma.challengeProgress.update({
              where: { id: userProgress.id },
              data: {
                progress: nextProgress,
                completed,
              },
            });
          }
        }
      }

      // Check and award badges
      const newBadges = await checkAndAwardBadges(userId);

      return res.status(201).json({
        sighting,
        species: sighting.species,
        confidence,
        candidates,
        newBadges,
        aiModel,
        aiNotes,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/sightings - List sightings with optional filters
router.get('/', async (req, res, next) => {
  try {
    const userId = typeof req.query.userId === 'string' ? req.query.userId : undefined;
    const speciesIdStr = typeof req.query.speciesId === 'string' ? req.query.speciesId : undefined;
    const timeframe = typeof req.query.timeframe === 'string' ? req.query.timeframe : 'all';
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 100, 200);

    const where: any = {};
    if (userId) where.userId = userId;
    if (speciesIdStr) {
      const spId = parseInt(speciesIdStr, 10);
      if (!isNaN(spId)) where.speciesId = spId;
    }

    if (timeframe === '7d') {
      where.createdAt = { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    } else if (timeframe === '30d') {
      where.createdAt = { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    }

    const sightings = await prisma.sighting.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        species: true,
        user: {
          select: { id: true, name: true },
        },
        _count: {
          select: { comments: true, verifications: true },
        },
      },
    });

    return res.json({ sightings, count: sightings.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/sightings/export/csv - Global research biodiversity dataset CSV
router.get('/export/csv', async (req, res, next) => {
  try {
    const sightings = await prisma.sighting.findMany({
      include: {
        species: true,
        user: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    let csv = 'id,observerName,commonName,scientificName,family,latitude,longitude,aiConfidence,status,createdAt,notes\n';
    for (const s of sightings) {
      const row = [
        s.id,
        `"${(s.user?.name || 'Anonymous').replace(/"/g, '""')}"`,
        `"${(s.species?.commonName || 'Unknown').replace(/"/g, '""')}"`,
        `"${(s.species?.scientificName || 'Unknown').replace(/"/g, '""')}"`,
        `"${(s.species?.family || 'Unknown').replace(/"/g, '""')}"`,
        s.latitude,
        s.longitude,
        s.aiConfidence !== null ? s.aiConfidence : '',
        s.status,
        s.createdAt.toISOString(),
        `"${(s.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
      csv += row + '\n';
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="wildbugs-global-biodiversity.csv"');
    return res.send(csv);
  } catch (err) {
    next(err);
  }
});

// GET /api/sightings/:id - Sighting detail with comments and verifications
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.userId;

    const sighting = await prisma.sighting.findUnique({
      where: { id },
      include: {
        species: true,
        user: {
          select: { id: true, name: true, createdAt: true },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        verifications: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        likes: true,
      },
    });

    if (!sighting) {
      return res.status(404).json({ error: 'Sighting not found' });
    }

    const verificationCount = sighting.verifications.filter((v) => v.agree).length;
    const hasVerified = currentUserId
      ? sighting.verifications.some((v) => v.userId === currentUserId && v.agree)
      : false;

    const likeCount = sighting.likes.length;
    const hasLiked = currentUserId
      ? sighting.likes.some((l) => l.userId === currentUserId)
      : false;

    return res.json({
      sighting,
      verificationCount,
      hasVerified,
      likeCount,
      hasLiked,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/sightings/:id/comments - Add community comment
router.post('/:id/comments', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const { content } = req.body;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content cannot be empty' });
    }

    const sighting = await prisma.sighting.findUnique({ where: { id } });
    if (!sighting) {
      return res.status(404).json({ error: 'Sighting not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        sightingId: id,
        userId,
        content: content.trim(),
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
});

// POST /api/sightings/:id/verify - Confirm and peer-verify species identification
router.post('/:id/verify', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const sighting = await prisma.sighting.findUnique({
      where: { id },
      include: { verifications: true },
    });

    if (!sighting) {
      return res.status(404).json({ error: 'Sighting not found' });
    }

    // Toggle or upsert verification
    const existing = await prisma.verification.findUnique({
      where: {
        sightingId_userId: {
          sightingId: id,
          userId,
        },
      },
    });

    if (existing) {
      // Remove verification if already agreed
      await prisma.verification.delete({
        where: { id: existing.id },
      });
    } else {
      await prisma.verification.create({
        data: {
          sightingId: id,
          userId,
          agree: true,
        },
      });
    }

    // Recalculate verifications
    const updatedVerifications = await prisma.verification.findMany({
      where: { sightingId: id, agree: true },
    });

    // Auto promote to community_verified if >= 2 community verifications
    const newStatus = updatedVerifications.length >= 2 ? 'community_verified' : 'pending';
    await prisma.sighting.update({
      where: { id },
      data: { status: newStatus },
    });

    // Award badges to verifier
    await checkAndAwardBadges(userId);

    return res.json({
      verificationCount: updatedVerifications.length,
      hasVerified: !existing,
      status: newStatus,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/sightings/:id/like - Toggle heart/like reaction
router.post('/:id/like', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const sighting = await prisma.sighting.findUnique({ where: { id } });
    if (!sighting) return res.status(404).json({ error: 'Sighting not found' });

    const existing = await prisma.sightingLike.findUnique({
      where: {
        sightingId_userId: {
          sightingId: id,
          userId,
        },
      },
    });

    if (existing) {
      await prisma.sightingLike.delete({ where: { id: existing.id } });
    } else {
      await prisma.sightingLike.create({
        data: {
          sightingId: id,
          userId,
        },
      });
    }

    const likeCount = await prisma.sightingLike.count({ where: { sightingId: id } });
    return res.json({ likeCount, hasLiked: !existing });
  } catch (err) {
    next(err);
  }
});

export default router;
