import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const badges = [
    {
      id: 'first_sighting',
      name: 'Pioneer Explorer',
      description: 'Document your first wild insect sighting in the field.',
      icon: '🌱',
      category: 'exploration',
    },
    {
      id: 'pollinator_champion',
      name: 'Pollinator Ally',
      description: 'Spot and catalog insects from the Apidae (bee) family.',
      icon: '🐝',
      category: 'biodiversity',
    },
    {
      id: 'species_master',
      name: 'Biodiversity Maestro',
      description: 'Discover and log 5 distinct insect species.',
      icon: '🦋',
      category: 'mastery',
    },
    {
      id: 'community_verifier',
      name: 'Eagle Eye',
      description: 'Confirm and verify community sightings with peer peer-review.',
      icon: '👁️',
      category: 'community',
    },
    {
      id: 'night_crawler',
      name: 'Nocturnal Naturalist',
      description: 'Document an evening or nocturnal insect (Moth or Firefly).',
      icon: '🌙',
      category: 'exploration',
    },
  ];

  for (const b of badges) {
    await prisma.badge.upsert({
      where: { id: b.id },
      update: b,
      create: b,
    });
  }

  // Award demo user initial badges
  const demo = await prisma.user.findUnique({
    where: { email: 'demo@wildbugs.org' },
  });

  if (demo) {
    await prisma.userBadge.upsert({
      where: {
        userId_badgeId: {
          userId: demo.id,
          badgeId: 'first_sighting',
        },
      },
      update: {},
      create: {
        userId: demo.id,
        badgeId: 'first_sighting',
      },
    });

    await prisma.userBadge.upsert({
      where: {
        userId_badgeId: {
          userId: demo.id,
          badgeId: 'species_master',
        },
      },
      update: {},
      create: {
        userId: demo.id,
        badgeId: 'species_master',
      },
    });
  }

  console.log('Badges seeded successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
