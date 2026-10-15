import { prisma } from '../prisma';

export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const newBadges: string[] = [];

  const existingUserBadges = await prisma.userBadge.findMany({
    where: { userId },
    select: { badgeId: true },
  });
  const earnedSet = new Set(existingUserBadges.map((b) => b.badgeId));

  const userSightings = await prisma.sighting.findMany({
    where: { userId },
    include: { species: true },
  });

  // 1. First Sighting
  if (!earnedSet.has('first_sighting') && userSightings.length >= 1) {
    await prisma.userBadge.create({ data: { userId, badgeId: 'first_sighting' } });
    newBadges.push('first_sighting');
  }

  // 2. Species Master (5 distinct species)
  const uniqueSpecies = new Set(userSightings.map((s) => s.speciesId).filter(Boolean));
  if (!earnedSet.has('species_master') && uniqueSpecies.size >= 5) {
    await prisma.userBadge.create({ data: { userId, badgeId: 'species_master' } });
    newBadges.push('species_master');
  }

  // 3. Pollinator Champion (Apidae family)
  const apidaeCount = userSightings.filter((s) => s.species?.family === 'Apidae').length;
  if (!earnedSet.has('pollinator_champion') && apidaeCount >= 2) {
    await prisma.userBadge.create({ data: { userId, badgeId: 'pollinator_champion' } });
    newBadges.push('pollinator_champion');
  }

  // 4. Night Crawler (Moth or Firefly)
  const nocturnal = userSightings.some(
    (s) =>
      s.species?.family === 'Lampyridae' ||
      s.species?.family === 'Saturniidae' ||
      s.species?.commonName.includes('Moth') ||
      s.species?.commonName.includes('Firefly')
  );
  if (!earnedSet.has('night_crawler') && nocturnal) {
    await prisma.userBadge.create({ data: { userId, badgeId: 'night_crawler' } });
    newBadges.push('night_crawler');
  }

  // 5. Community Verifier
  const verifyCount = await prisma.verification.count({ where: { userId } });
  if (!earnedSet.has('community_verifier') && verifyCount >= 2) {
    await prisma.userBadge.create({ data: { userId, badgeId: 'community_verifier' } });
    newBadges.push('community_verifier');
  }

  return newBadges;
}
