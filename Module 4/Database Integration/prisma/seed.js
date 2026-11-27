
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Create the starter user if it does not exist.
  await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Seed User',
    },
  });

  // Insert the starter posts without creating duplicates.
  const posts = [
    {
      id: 1,
      title: 'First post',
      body: 'The contract survives storage changes.',
      authorId: 1,
    },
    {
      id: 2,
      title: 'Second post',
      body: 'Migrations record database design.',
      authorId: 1,
    },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { id: post.id },
      update: {
        title: post.title,
        body: post.body,
        authorId: post.authorId,
      },
      create: post,
    });
  }

  // Synchronize PostgreSQL sequences after inserting explicit IDs.
  await prisma.$queryRaw`
    SELECT setval(
      pg_get_serial_sequence('"User"', 'id'),
      GREATEST((SELECT MAX(id) FROM "User"), 1),
      true
    )
  `;

  await prisma.$queryRaw`
    SELECT setval(
      pg_get_serial_sequence('"Post"', 'id'),
      GREATEST((SELECT MAX(id) FROM "Post"), 1),
      true
    )
  `;

  console.log('Database seeded successfully!');
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
