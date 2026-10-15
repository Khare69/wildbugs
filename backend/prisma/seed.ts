import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.sighting.deleteMany();
  await prisma.challengeProgress.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.species.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Demo User
  const hashedPassword = await bcrypt.hash('password123', 10);
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@wildbugs.org',
      password: hashedPassword,
      name: 'Demo Explorer',
      role: 'user',
    },
  });
  console.log('Created demo user:', demoUser.email);

  // 2. Insert 15 Insect Species
  const speciesData = [
    {
      commonName: 'Monarch Butterfly',
      scientificName: 'Danaus plexippus',
      family: 'Nymphalidae',
      description: 'Famous for its spectacular annual migration across North America. Easily identified by bright orange wings interlaced with bold black veins and white border dots.',
      habitat: 'Meadows, fields, roadsides, and milkweed patches',
      diet: 'Caterpillars feed exclusively on milkweed; adults sip flower nectar',
      lifecycle: 'Complete metamorphosis: egg, larva (caterpillar), pupa (chrysalis), adult',
      imageUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600',
      conservationStatus: 'EN',
    },
    {
      commonName: 'Honeybee',
      scientificName: 'Apis mellifera',
      family: 'Apidae',
      description: 'Crucial global pollinator that produces honey and royal jelly within complex social hives. Worker bees communicate flower locations through an intricate waggle dance.',
      habitat: 'Agricultural areas, gardens, meadows, and orchards',
      diet: 'Pollen and nectar collected from diverse flowering plants',
      lifecycle: 'Complete metamorphosis: egg, larva, pupa, adult caste (queen, worker, drone)',
      imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600',
      conservationStatus: 'LC',
    },
    {
      commonName: 'Seven-Spotted Ladybug',
      scientificName: 'Coccinella septempunctata',
      family: 'Coccinellidae',
      description: 'Beloved dome-shaped beetle known for its bright red elytra adorned with seven black spots. Highly beneficial to gardeners as voracious predators of agricultural aphids.',
      habitat: 'Gardens, grasslands, suburban yards, and crop fields',
      diet: 'Aphids, scale insects, whiteflies, and mites',
      lifecycle: 'Complete metamorphosis: cluster eggs, active spiny larvae, pupa, adult beetle',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600',
      conservationStatus: 'LC',
    },
    {
      commonName: 'Praying Mantis',
      scientificName: 'Mantis religiosa',
      family: 'Mantidae',
      description: 'Formidable ambush predator capable of rotating its triangular head a full 180 degrees. Holds its spiked raptorial forelegs folded in a deceptively pious prayer stance.',
      habitat: 'Shrubberies, tall grasslands, sunny gardens, and hedgerows',
      diet: 'Live insects, crickets, flies, moths, and occasionally small vertebrates',
      lifecycle: 'Incomplete metamorphosis: ootheca egg case, growing nymphs, winged adult',
      imageUrl: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=600',
      conservationStatus: 'LC',
    },
    {
      commonName: 'Green Darner Dragonfly',
      scientificName: 'Anax junius',
      family: 'Aeshnidae',
      description: 'One of the fastest flying predatory insects, capable of agile backwards flight and hovering. Features a vivid green thorax and striking sky-blue abdomen in males.',
      habitat: 'Freshwater ponds, marshes, slow streams, and lakeshores',
      diet: 'Mosquitoes, gnats, midges, and small flying insects caught in mid-air',
      lifecycle: 'Incomplete metamorphosis: aquatic nymph, molts directly into winged aerial adult',
      imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5703bc20d?w=600',
      conservationStatus: 'LC',
    },
    {
      commonName: 'Luna Moth',
      scientificName: 'Actias luna',
      family: 'Saturniidae',
      description: 'Luminous lime-green silk moth sporting elongated hindwing tails and delicate eyespots. Adult moths lack functional mouthparts and live solely for roughly one week to reproduce.',
      habitat: 'Deciduous hardwood forests and suburban woodlands',
      diet: 'Caterpillars eat walnut, hickory, and birch leaves; adults do not feed',
      lifecycle: 'Complete metamorphosis: egg, plump green caterpillar, leaf-wrapped cocoon, adult moth',
      imageUrl: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=600',
      conservationStatus: 'LC',
    },
    {
      commonName: 'Common Eastern Firefly',
      scientificName: 'Photinus pyralis',
      family: 'Lampyridae',
      description: 'Nocturnal soft-winged beetle celebrated for producing bioluminescent yellow-green evening flashes. Males emit rhythmic light signals while flying in characteristic J-shaped patterns.',
      habitat: 'Damp lawns, meadows, forest edges, and riverbanks',
      diet: 'Larvae hunt earthworms and snails; adults eat nectar or do not feed',
      lifecycle: 'Complete metamorphosis: glowing eggs, underground glowworm larvae, pupa, flashing adult',
      imageUrl: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600',
      conservationStatus: 'LC',
    },
    {
      commonName: 'Periodical Cicada',
      scientificName: 'Magicicada septendecim',
      family: 'Cicadidae',
      description: 'Spends 17 years underground sucking xylem root sap before emerging in massive synchronized broods. Adults fill summer afternoons with deafening choruses produced by tymbal organs.',
      habitat: 'Deciduous woodlands, forested parks, and suburban canopies',
      diet: 'Underground root fluids as nymphs; branch xylem as adults',
      lifecycle: 'Incomplete metamorphosis: underground nymph stages over 17 years, synchronized adult molt',
      imageUrl: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=600',
      conservationStatus: 'LC',
    },
    {
      commonName: 'Blue Morpho',
      scientificName: 'Morpho peleides',
      family: 'Nymphalidae',
      description: 'Tropical rainforest butterfly legendary for the iridescent optical blue of its upper wing scales. Underside wings display dull brown camouflage rings to evade forest predators.',
      habitat: 'Neotropical rainforests, wet secondary growth, and river corridors',
      diet: 'Fermenting fruit juice, decomposing tree sap, and nutrient-rich mud',
      lifecycle: 'Complete metamorphosis: egg, patterned bristled caterpillar, green jade chrysalis, adult',
      imageUrl: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=600',
      conservationStatus: 'NT',
    },
    {
      commonName: 'Stag Beetle',
      scientificName: 'Lucanus cervus',
      family: 'Lucanidae',
      description: 'One of the largest European beetles, named for the male’s enormous antler-like mandibles. Males lock jaws in dramatic treetop wrestling tournaments for mating territory.',
      habitat: 'Ancient oak woodlands, hedgerows, and decaying fallen timber',
      diet: 'Larvae eat rotting heartwood; adults sip sweet sap from bark wounds',
      lifecycle: 'Complete metamorphosis: 3-5 years as wood-boring grub, subterranean pupa, brief adult stage',
      imageUrl: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?w=600',
      conservationStatus: 'NT',
    },
    {
      commonName: 'American Grasshopper',
      scientificName: 'Schistocerca americana',
      family: 'Acrididae',
      description: 'Strong-jumping orthopteran with powerful hind legs built for escaping predators and leaping flight. Features yellow-brown bodies patterned with intricate dark mottling.',
      habitat: 'Open fields, prairie pastures, crop borders, and weed patches',
      diet: 'Grasses, cultivated crops, broadleaf foliage, and vegetable gardens',
      lifecycle: 'Incomplete metamorphosis: soil egg pods, five nymph instars, winged hopper adult',
      imageUrl: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=600',
      conservationStatus: 'LC',
    },
    {
      commonName: 'Red Imported Fire Ant',
      scientificName: 'Solenopsis invicta',
      family: 'Formicidae',
      description: 'Extremely aggressive social insect living in massive subterranean mound colonies. Inflicts painful stinging venom when disturbed and exhibits remarkable collective swarm defense.',
      habitat: 'Disturbed soils, agricultural pastures, lawns, and sunny roadsides',
      diet: 'Omnivorous: seeds, plant matter, sweet honeydew, and other invertebrates',
      lifecycle: 'Complete metamorphosis: queen lays eggs, nursing worker care of larvae, pupae, sterile adult workers',
      imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600',
      conservationStatus: 'LC',
    },
    {
      commonName: 'Buff-Tailed Bumblebee',
      scientificName: 'Bombus terrestris',
      family: 'Apidae',
      description: 'Plump, densely furry bee capable of buzz pollination by vibrating flight muscles at high frequency. Builds cozy underground nests in abandoned rodent burrows every spring.',
      habitat: 'Cool temperate meadows, coastal dunes, urban flower gardens, and parks',
      diet: 'Nectar and pollen from deep tubular blossoms',
      lifecycle: 'Complete metamorphosis: hibernating solitary queen founds seasonal colony, autumn die-off',
      imageUrl: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?w=600',
      conservationStatus: 'LC',
    },
    {
      commonName: 'Atlas Moth',
      scientificName: 'Attacus atlas',
      family: 'Saturniidae',
      description: 'Possesses one of the greatest wingspans among all living insects, often exceeding 25 centimeters. Wingtips resemble the head of a cobra snake to ward off hungry birds.',
      habitat: 'Tropical rainforests and shrubby montane forests of Southeast Asia',
      diet: 'Caterpillars feed on citrus, willow, and guava leaves; non-feeding adults live ~10 days',
      lifecycle: 'Complete metamorphosis: giant caterpillars, durable fagara silk cocoon, massive winged moth',
      imageUrl: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef6?w=600',
      conservationStatus: 'LC',
    },
    {
      commonName: 'Indian Stick Insect',
      scientificName: 'Carausius morosus',
      family: 'Phasmatidae',
      description: 'Master of camouflage that perfectly mimics thin brown and green twigs among garden branches. Can reproduce via parthenogenesis without male fertilization when populations decline.',
      habitat: 'Shrubby woodlands, brambles, hedges, and tropical foliage',
      diet: 'Leaves of bramble, raspberry, privet, and rose bushes',
      lifecycle: 'Incomplete metamorphosis: dropped seed-like eggs, delicate wingless nymphs, cryptic adult',
      imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600',
      conservationStatus: 'LC',
    },
  ];

  const createdSpecies = [];
  for (const s of speciesData) {
    const item = await prisma.species.create({ data: s });
    createdSpecies.push(item);
  }
  console.log(`Seeded ${createdSpecies.length} insect species.`);

  // 3. Insert 2 Challenges
  const now = new Date();
  const challenge1 = await prisma.challenge.create({
    data: {
      title: 'Spring Butterfly Hunt',
      description: 'Spot and catalog 5 different butterflies in the Nymphalidae family to support our spring biodiversity census.',
      targetCount: 5,
      speciesFamily: 'Nymphalidae',
      startsAt: now,
      endsAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  const challenge2 = await prisma.challenge.create({
    data: {
      title: 'Pollinator Patrol',
      description: 'Document 3 bees or wasps pollinating local blossoms to monitor wild pollinator health in urban corridors.',
      targetCount: 3,
      speciesFamily: 'Apidae',
      startsAt: now,
      endsAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days
    },
  });
  console.log('Seeded 2 challenges.');

  // 4. Enroll demo user in Pollinator Patrol with progress 1
  await prisma.challengeProgress.create({
    data: {
      challengeId: challenge2.id,
      userId: demoUser.id,
      progress: 1,
      completed: false,
    },
  });

  // 5. Insert 4 initial sightings for the demo user
  const initialSightings = [
    {
      userId: demoUser.id,
      speciesId: createdSpecies[0].id, // Monarch
      photoUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600',
      latitude: 28.6139,
      longitude: 77.2090,
      aiConfidence: 0.94,
      status: 'identified',
      notes: 'Spotted resting on garden milkweed near the central fountain.',
    },
    {
      userId: demoUser.id,
      speciesId: createdSpecies[1].id, // Honeybee
      photoUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600',
      latitude: 19.0760,
      longitude: 72.8777,
      aiConfidence: 0.89,
      status: 'identified',
      notes: 'Active worker collecting pollen from yellow marigolds.',
    },
    {
      userId: demoUser.id,
      speciesId: createdSpecies[2].id, // Ladybug
      photoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600',
      latitude: 12.9716,
      longitude: 77.5946,
      aiConfidence: 0.91,
      status: 'identified',
      notes: 'Found hunting aphids on hibiscus leaves after rain.',
    },
    {
      userId: demoUser.id,
      speciesId: createdSpecies[4].id, // Dragonfly
      photoUrl: 'https://images.unsplash.com/photo-1508873696983-2df5703bc20d?w=600',
      latitude: 22.5726,
      longitude: 88.3639,
      aiConfidence: 0.86,
      status: 'identified',
      notes: 'Perched on water reed near botanical lake edge.',
    },
  ];

  for (const sighting of initialSightings) {
    await prisma.sighting.create({ data: sighting });
  }
  console.log(`Seeded ${initialSightings.length} initial sightings.`);
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
