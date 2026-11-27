const handleDatabaseError = require('../utils/databaseErrors');
const prisma = require('../db/prisma');

async function findAll() {
  return prisma.post.findMany({
    orderBy: { id: 'asc' },
  });
}

async function findById(id) {
  return prisma.post.findUnique({
    where: { id: Number(id) },
  });
}

async function create(fields) {
  try {
    return await prisma.post.create({
      data: {
        title: fields.title,
        body: fields.body || '',
        authorId: Number(fields.authorId),
      },
    });
  } catch (error) {
    throw handleDatabaseError(error);
  }
}

async function update(id, patch) {
  const existing = await findById(id);

  if (!existing) return null;

  try {
    return await prisma.post.update({
      where: { id: Number(id) },
      data: {
        ...(patch.title !== undefined && { title: patch.title }),
        ...(patch.body !== undefined && { body: patch.body }),
      },
    });
  } catch (error) {
    throw handleDatabaseError(error);
  }
}

async function remove(id) {
  const result = await prisma.post.deleteMany({
    where: { id: Number(id) },
  });

  return result.count > 0;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
