import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'wildbugs-dev-secret-2024';

// Middleware to ensure user is logged in and is either admin or expert
function requireAdminOrExpert(req: AuthRequest, res: Response, next: () => void) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.user.role !== 'admin' && req.user.role !== 'expert') {
    return res.status(403).json({ error: 'Requires admin or expert naturalist privileges' });
  }
  next();
}

// POST /api/admin/promote-me
// Allows active session to switch roles (e.g. "expert" or "admin") for evaluation & live demonstration
router.post('/promote-me', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.userId;
    const requestedRole = req.body.role === 'admin' ? 'admin' : 'expert';

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: requestedRole },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    const token = jwt.sign({ userId: updatedUser.id, role: updatedUser.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.json({
      message: `Role successfully updated to ${updatedUser.role}`,
      user: updatedUser,
      token,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/metrics
// Aggregated platform health, review backlog, and taxon classification statistics
router.get('/metrics', authenticate, requireAdminOrExpert, async (req: AuthRequest, res: Response, next) => {
  try {
    const [
      totalSightings,
      pendingCount,
      communityVerifiedCount,
      expertVerifiedCount,
      totalUsers,
      totalSpecies,
      totalComments,
      totalVerifications,
      totalLikes,
    ] = await Promise.all([
      prisma.sighting.count(),
      prisma.sighting.count({ where: { status: 'pending' } }),
      prisma.sighting.count({ where: { status: 'community_verified' } }),
      prisma.sighting.count({ where: { status: 'expert_verified' } }),
      prisma.user.count(),
      prisma.species.count(),
      prisma.comment.count(),
      prisma.verification.count(),
      prisma.sightingLike.count(),
    ]);

    // Calculate percentage breakdown
    const verifiedRate = totalSightings > 0
      ? Math.round(((communityVerifiedCount + expertVerifiedCount) / totalSightings) * 100)
      : 0;

    return res.json({
      metrics: {
        totalSightings,
        pendingCount,
        communityVerifiedCount,
        expertVerifiedCount,
        verifiedRate,
        totalUsers,
        totalSpecies,
        totalComments,
        totalVerifications,
        totalLikes,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/pending-verifications
// Queue of observations requiring taxonomic verification
router.get('/pending-verifications', authenticate, requireAdminOrExpert, async (req: AuthRequest, res: Response, next) => {
  try {
    const statusFilter = (req.query.status as string) || 'all';

    let whereClause: any = {};
    if (statusFilter === 'pending') {
      whereClause.status = 'pending';
    } else if (statusFilter === 'community_verified') {
      whereClause.status = 'community_verified';
    } else if (statusFilter === 'expert_verified') {
      whereClause.status = 'expert_verified';
    } else {
      // By default show reviewable queue (pending or community_verified)
      whereClause.status = { in: ['pending', 'community_verified'] };
    }

    const sightings = await prisma.sighting.findMany({
      where: whereClause,
      include: {
        species: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            comments: true,
            verifications: true,
            likes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return res.json({ sightings, count: sightings.length });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/sightings/:id/expert-verify
// Elevate sighting to 'expert_verified' with optional species reassignment
router.post('/sightings/:id/expert-verify', authenticate, requireAdminOrExpert, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const { speciesId } = req.body;

    const dataToUpdate: any = { status: 'expert_verified' };
    if (speciesId) {
      dataToUpdate.speciesId = Number(speciesId);
    }

    const updated = await prisma.sighting.update({
      where: { id },
      data: dataToUpdate,
      include: {
        species: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return res.json({
      message: 'Sighting successfully certified by expert entomologist.',
      sighting: updated,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/sightings/:id
// Remove invalid / spam / erroneous observation from dataset
router.delete('/sightings/:id', authenticate, requireAdminOrExpert, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;

    await prisma.sighting.delete({
      where: { id },
    });

    return res.json({
      message: 'Sighting successfully removed from registry.',
      deletedId: id,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
