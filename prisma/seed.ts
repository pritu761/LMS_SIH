import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Capacity Connect Database...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Seed Competencies
  const cloudComp = await prisma.competency.upsert({
    where: { code: 'CLOUD-K8S' },
    update: {},
    create: {
      name: 'Cloud Infrastructure & Kubernetes',
      code: 'CLOUD-K8S',
      category: 'Cloud & DevOps',
      description: 'Design, deployment, and cluster orchestration with containerization and microservices.',
      targetLevel: 4,
    },
  });

  const secComp = await prisma.competency.upsert({
    where: { code: 'SEC-ZERO-TRUST' },
    update: {},
    create: {
      name: 'Enterprise Security & Zero Trust',
      code: 'SEC-ZERO-TRUST',
      category: 'Cybersecurity',
      description: 'Network perimeter defense, identity federation, cryptographic enforcement, and compliance.',
      targetLevel: 4,
    },
  });

  const dataComp = await prisma.competency.upsert({
    where: { code: 'DATA-ETL' },
    update: {},
    create: {
      name: 'Data Engineering & Scalable ETL',
      code: 'DATA-ETL',
      category: 'Data & AI',
      description: 'Distributed data pipelines, streaming architectures, Apache Spark, and real-time processing.',
      targetLevel: 4,
    },
  });

  // 2. Seed Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@capacityconnect.gov' },
    update: {},
    create: {
      email: 'admin@capacityconnect.gov',
      passwordHash,
      role: 'ADMIN',
      status: 'APPROVED',
      isVerified: true,
      profile: {
        create: {
          fullName: 'Dr. Rajeshwari Sharma',
          headline: 'Chief Director of Digital Capacity Building',
          bio: 'Leading national civil service modernization and enterprise capacity transformations across 14 ministries.',
          organization: 'Ministry of Skill Development & Entrepreneurship',
          department: 'Digital Governance Cell',
          avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face',
          phone: '+91 98100 12345',
          location: 'New Delhi, India',
        },
      },
    },
  });

  // 3. Seed Trainer User
  const trainerUser = await prisma.user.upsert({
    where: { email: 'vikram.trainer@capacityconnect.gov' },
    update: {},
    create: {
      email: 'vikram.trainer@capacityconnect.gov',
      passwordHash,
      role: 'TRAINER',
      status: 'APPROVED',
      isVerified: true,
      profile: {
        create: {
          fullName: 'Prof. Vikramaditya Sen',
          headline: 'Principal Cloud Architect & Senior Faculty',
          bio: 'Over 16 years architecting mission-critical cloud backbones, Kubernetes clusters, and microservices for fintech and sovereign clouds.',
          organization: 'National Institute of Smart Government',
          department: 'Cloud & Enterprise Architecture',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
          phone: '+91 98200 45678',
          location: 'Bengaluru, India',
        },
      },
      competencies: {
        create: [
          { competencyId: cloudComp.id, proficiencyLevel: 5, verified: true },
          { competencyId: secComp.id, proficiencyLevel: 4, verified: true },
        ],
      },
    },
  });

  // 4. Seed Trainee User
  const traineeUser = await prisma.user.upsert({
    where: { email: 'aarav.trainee@capacityconnect.gov' },
    update: {},
    create: {
      email: 'aarav.trainee@capacityconnect.gov',
      passwordHash,
      role: 'TRAINEE',
      status: 'APPROVED',
      isVerified: true,
      profile: {
        create: {
          fullName: 'Aarav Patel',
          headline: 'Junior Cloud Operations Associate',
          bio: 'Aspiring Cloud & DevOps architect dedicated to mastering containerized deployments and sovereign infrastructure security.',
          organization: 'State Data Center Operations',
          department: 'Systems Engineering',
          avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face',
          phone: '+91 98765 43210',
          location: 'Gandhinagar, Gujarat',
        },
      },
      competencies: {
        create: [
          { competencyId: cloudComp.id, proficiencyLevel: 2, verified: true },
        ],
      },
    },
  });

  // 5. Seed Course
  const course = await prisma.course.upsert({
    where: { code: 'CC-ARCH-501' },
    update: {},
    create: {
      title: 'Architecting Sovereign Cloud & Kubernetes Systems',
      code: 'CC-ARCH-501',
      slug: 'architecting-sovereign-cloud-kubernetes-systems',
      description: 'Master the foundational patterns of high-availability Kubernetes cluster deployments, infrastructure as code with Terraform, container security hardening, and resilient microservices architectures.',
      category: 'Cloud & DevOps',
      level: 'Advanced',
      durationHours: 18.5,
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
      status: 'PUBLISHED',
      trainerId: trainerUser.id,
      competencies: {
        create: [
          { competencyId: cloudComp.id, requiredProficiency: 4, weight: 1.5 },
          { competencyId: secComp.id, requiredProficiency: 3, weight: 1.0 },
        ],
      },
      materials: {
        create: [
          {
            title: 'Module 1: Sovereign Cloud Architecture & Zero-Downtime Foundations',
            description: 'Comprehensive overview of multi-region fault tolerance, control plane topologies, and sovereign compliance guardrails.',
            type: 'VIDEO',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            durationSeconds: 1420,
            fileSize: '145 MB',
            sortOrder: 1,
            isPreview: true,
          },
          {
            title: 'Architecture Blueprint & Kubernetes Topologies (Slide Deck)',
            description: 'High-resolution architectural diagrams illustrating etcd quorum and overlay networks.',
            type: 'PDF',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            fileSize: '18.4 MB',
            sortOrder: 2,
            isPreview: false,
          },
        ],
      },
    },
  });

  // 6. Seed Assessment
  const assessment = await prisma.assessment.create({
    data: {
      courseId: course.id,
      title: 'Kubernetes & Sovereign Infrastructure Certification Exam',
      description: 'Timed rigorous evaluation assessing mastery over Kubernetes control plane topologies, container security, network policies, and persistent storage management.',
      timeLimitMinutes: 25,
      passingScorePercentage: 70.0,
      maxAttempts: 3,
      totalQuestions: 2,
      totalWeight: 4.5,
      isPublished: true,
      questions: {
        create: [
          {
            questionText: 'In a high-availability Kubernetes cluster, what is the minimum recommended number of master nodes required to maintain etcd consensus fault tolerance against a single node failure?',
            questionType: 'SINGLE_CHOICE',
            options: [
              { id: 'opt_1', text: '2 Master Nodes' },
              { id: 'opt_2', text: '3 Master Nodes' },
              { id: 'opt_3', text: '4 Master Nodes' },
            ],
            correctOption: 'opt_2',
            weight: 2.0,
            explanation: 'Etcd uses Raft consensus where majority quorum (N/2 + 1) is required. With 3 nodes, quorum is 2, allowing survival of 1 node failure.',
            sortOrder: 1,
          },
          {
            questionText: 'Which Kubernetes resource specification enforces network isolation by blocking all ingress traffic to pods in a namespace unless explicitly allowlisted?',
            questionType: 'SINGLE_CHOICE',
            options: [
              { id: 'opt_1', text: 'SecurityContext: { readOnlyRootFilesystem: true }' },
              { id: 'opt_2', text: 'NetworkPolicy with Default Deny' },
              { id: 'opt_3', text: 'ClusterRoleBinding' },
            ],
            correctOption: 'opt_2',
            weight: 2.5,
            explanation: 'A NetworkPolicy with an empty ingress rule list creates a Default Deny Ingress rule.',
            sortOrder: 2,
          },
        ],
      },
    },
  });

  // 7. Seed Enrollment
  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: traineeUser.id,
        courseId: course.id,
      },
    },
    update: {},
    create: {
      userId: traineeUser.id,
      courseId: course.id,
      status: 'ACTIVE',
      progressPercentage: 50.0,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
