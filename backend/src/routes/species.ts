import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

const router = Router();

// GET /api/species - list all species with optional ?search=
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';

    let speciesList = await prisma.species.findMany({
      orderBy: { commonName: 'asc' },
    });

    if (search) {
      speciesList = speciesList.filter(
        (s) =>
          s.commonName.toLowerCase().includes(search) ||
          s.scientificName.toLowerCase().includes(search) ||
          s.family.toLowerCase().includes(search)
      );
    }

    return res.json({ species: speciesList, count: speciesList.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/species/:id - single species detail
router.get('/:id', async (req: Request, res: Response, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid species ID' });
    }

    const species = await prisma.species.findUnique({
      where: { id },
    });

    if (!species) {
      return res.status(404).json({ error: 'Species not found' });
    }

    return res.json({ species });
  } catch (err) {
    next(err);
  }
});

export default router;
