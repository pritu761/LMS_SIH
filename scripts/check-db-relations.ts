import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
  const competencies = await prisma.competency.findMany();
  const courses = await prisma.course.findMany({ include: { trainer: true } });
  console.log('Competencies:', competencies);
  console.log('Courses:', courses.map(c => ({ id: c.id, title: c.title, code: c.code, trainerEmail: c.trainer?.email })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
