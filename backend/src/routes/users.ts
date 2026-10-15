import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

const router = Router();

// GET /api/users/leaderboard - Top 10 naturalists
router.get('/leaderboard', async (req: Request, res: Response, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        sightings: {
          select: {
            speciesId: true,
          },
        },
        _count: {
          select: { badges: true },
        },
      },
    });

    const leaderboard = users
      .map((u) => {
        const totalSightings = u.sightings.length;
        const uniqueSpecies = new Set(
          u.sightings.map((s) => s.speciesId).filter((id): id is number => id !== null)
        ).size;

        return {
          id: u.id,
          name: u.name,
          totalSightings,
          speciesFound: uniqueSpecies,
          badgesCount: u._count.badges,
        };
      })
      .sort((a, b) => b.totalSightings - a.totalSightings || b.speciesFound - a.speciesFound)
      .slice(0, 10);

    return res.json({ leaderboard });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id/stats - Profile statistics, field journal, and earned badges
router.get('/:id/stats', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        badges: {
          include: {
            badge: true,
          },
          orderBy: { earnedAt: 'desc' },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const totalSightings = await prisma.sighting.count({
      where: { userId: id },
    });

    const userSightings = await prisma.sighting.findMany({
      where: { userId: id, speciesId: { not: null } },
      select: { speciesId: true },
    });

    const speciesFound = new Set(userSightings.map((s) => s.speciesId)).size;

    const recentSightings = await prisma.sighting.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        species: true,
        _count: {
          select: { comments: true, verifications: true },
        },
      },
    });

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      badges: user.badges.map((ub) => ({
        id: ub.badge.id,
        name: ub.badge.name,
        description: ub.badge.description,
        icon: ub.badge.icon,
        category: ub.badge.category,
        earnedAt: ub.earnedAt,
      })),
      totalSightings,
      speciesFound,
      recentSightings,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id/export - Export field journal as research CSV
router.get('/:id/export', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;

    const sightings = await prisma.sighting.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      include: { species: true },
    });

    let csv = 'Sighting ID,Common Name,Scientific Name,Family,Latitude,Longitude,AI Confidence,Status,Date,Notes\n';

    for (const s of sightings) {
      const row = [
        s.id,
        `"${(s.species?.commonName || 'Unknown').replace(/"/g, '""')}"`,
        `"${(s.species?.scientificName || 'Unknown').replace(/"/g, '""')}"`,
        `"${(s.species?.family || 'Unknown').replace(/"/g, '""')}"`,
        s.latitude,
        s.longitude,
        s.aiConfidence ? `${Math.round(s.aiConfidence * 100)}%` : 'N/A',
        s.status,
        new Date(s.createdAt).toISOString(),
        `"${(s.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
      csv += row + '\n';
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="wildbugs-field-journal.csv"');
    return res.send(csv);
  } catch (err) {
    next(err);
  }
});

export default router;
