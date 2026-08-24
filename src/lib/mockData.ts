// Capacity Connect - High Fidelity Mock Repository & Seed Data
// Supports live demoing, testing, and fallback when database is not connected

export interface MockUser {
  id: string;
  email: string;
  passwordHash: string; // bcrypt for "Password123!"
  role: 'TRAINEE' | 'TRAINER' | 'ADMIN';
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
  isVerified: boolean;
  profile: {
    fullName: string;
    headline: string;
    bio: string;
    organization: string;
    department: string;
    avatarUrl: string;
    phone: string;
    location: string;
    qualifications: Array<{ degree: string; institution: string; year: string; field: string }>;
    experience: Array<{ title: string; company: string; startYear: string; endYear: string; description: string }>;
    certificates: Array<{ title: string; issuer: string; issueDate: string; credentialUrl: string }>;
  };
  competencies: Array<{ competencyId: string; competencyName: string; code: string; proficiencyLevel: number; verified: boolean }>;
}

export interface MockCompetency {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  targetLevel: number;
}

export interface MockCourse {
  id: string;
  title: string;
  code: string;
  slug: string;
  description: string;
  category: string;
  level: string;
  durationHours: number;
  thumbnail: string;
  status: 'PUBLISHED' | 'DRAFT';
  trainerId: string;
  trainerName: string;
  trainerRating: number;
  competencies: Array<{ competencyId: string; competencyName: string; requiredProficiency: number; weight: number }>;
  materials: Array<{
    id: string;
    title: string;
    description: string;
    type: 'VIDEO' | 'PDF' | 'PPT' | 'DOC';
    url: string;
    downloadUrl?: string;
    durationSeconds?: number;
    fileSize: string;
    sortOrder: number;
    isPreview: boolean;
  }>;
  assessmentId: string;
}

export interface MockAssessment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  timeLimitMinutes: number;
  passingScorePercentage: number;
  maxAttempts: number;
  submissionDeadline?: string;
  questions: Array<{
    id: string;
    questionText: string;
    questionType: 'SINGLE_CHOICE' | 'MULTI_CHOICE';
    options: Array<{ id: string; text: string }>;
    correctOption: string | string[];
    weight: number;
    explanation: string;
    sortOrder: number;
  }>;
}

export interface MockEnrollment {
  id: string;
  userId: string;
  courseId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
  progressPercentage: number;
  completedMaterialIds: string[];
  currentMaterialId?: string | null;
  enrolledAt: string;
  completedAt?: string | null;
  certificateId?: string | null;
  certificateUrl?: string | null;
}

export interface MockFeedback {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userRole: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface MockAnnouncement {
  id: string;
  title: string;
  content: string;
  type: 'ALERT' | 'SPOTLIGHT' | 'ACHIEVEMENT' | 'GENERAL';
  isPinned: boolean;
  authorName: string;
  createdAt: string;
}

// ----------------------------------------------------
// INITIAL MOCK REPOSITORY DATA
// ----------------------------------------------------

export const initialCompetencies: MockCompetency[] = [
  {
    id: 'comp-1',
    name: 'Cloud Infrastructure & Kubernetes',
    code: 'CLOUD-K8S',
    category: 'Cloud & DevOps',
    description: 'Design, deployment, and cluster orchestration with containerization and microservices.',
    targetLevel: 4,
  },
  {
    id: 'comp-2',
    name: 'Enterprise Security & Zero Trust',
    code: 'SEC-ZERO-TRUST',
    category: 'Cybersecurity',
    description: 'Network perimeter defense, identity federation, cryptographic enforcement, and compliance.',
    targetLevel: 4,
  },
  {
    id: 'comp-3',
    name: 'Data Engineering & Scalable ETL',
    code: 'DATA-ETL',
    category: 'Data & AI',
    description: 'Distributed data pipelines, streaming architectures, Apache Spark, and real-time processing.',
    targetLevel: 4,
  },
  {
    id: 'comp-4',
    name: 'AI/ML Model Lifecycle & MLOps',
    code: 'AI-MLOPS',
    category: 'Data & AI',
    description: 'Production model deployment, feature stores, monitoring drift, and inference scaling.',
    targetLevel: 4,
  },
  {
    id: 'comp-5',
    name: 'Public Policy & Digital Governance',
    code: 'GOV-DIGITAL',
    category: 'Governance & Leadership',
    description: 'Citizen-centric e-governance architectures, digital identity programs, and DPI frameworks.',
    targetLevel: 3,
  },
  {
    id: 'comp-6',
    name: 'Agile Product & Capacity Management',
    code: 'MGMT-AGILE',
    category: 'Management',
    description: 'Institutional capability maturity, rapid scrum execution, and stakeholder alignment.',
    targetLevel: 3,
  },
];

export const initialUsers: MockUser[] = [
  {
    id: 'user-admin-1',
    email: 'admin@capacityconnect.gov',
    passwordHash: '$2a$10$X8mR08fMsqa5WJsm2gN9..3uK6Osk4Rj4l37zT6a8K2V5ZJ9b6Yhe', // Password123!
    role: 'ADMIN',
    status: 'APPROVED',
    isVerified: true,
    profile: {
      fullName: 'Dr. Rajeshwari Sharma',
      headline: 'Chief Director of Digital Capacity Building',
      bio: 'Leading national civil service modernization and enterprise capacity transformations across 14 ministries.',
      organization: 'Ministry of Skill Development & Entrepreneurship',
      department: 'Digital Governance Cell',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face',
      phone: '+91 98100 12345',
      location: 'New Delhi, India',
      qualifications: [
        { degree: 'Ph.D. in Public Systems & Information Systems', institution: 'IIT Delhi', year: '2014', field: 'Digital Transformation' },
        { degree: 'M.Tech in Computer Science', institution: 'BITS Pilani', year: '2008', field: 'Distributed Systems' }
      ],
      experience: [
        { title: 'National Director', company: 'Digital India Mission', startYear: '2019', endYear: 'Present', description: 'Overseeing sitewide digital training architectures.' },
        { title: 'Principal Consultant', company: 'NITI Aayog', startYear: '2014', endYear: '2019', description: 'Institutional capacity benchmarking.' }
      ],
      certificates: [
        { title: 'Executive Leadership in DPI', issuer: 'Harvard Kennedy School', issueDate: '2022', credentialUrl: 'https://credentials.harvard.edu/123' }
      ]
    },
    competencies: [
      { competencyId: 'comp-5', competencyName: 'Public Policy & Digital Governance', code: 'GOV-DIGITAL', proficiencyLevel: 5, verified: true },
      { competencyId: 'comp-6', competencyName: 'Agile Product & Capacity Management', code: 'MGMT-AGILE', proficiencyLevel: 5, verified: true }
    ]
  },
  {
    id: 'user-trainer-1',
    email: 'vikram.trainer@capacityconnect.gov',
    passwordHash: '$2a$10$X8mR08fMsqa5WJsm2gN9..3uK6Osk4Rj4l37zT6a8K2V5ZJ9b6Yhe',
    role: 'TRAINER',
    status: 'APPROVED',
    isVerified: true,
    profile: {
      fullName: 'Prof. Vikramaditya Sen',
      headline: 'Principal Cloud Architect & Senior Faculty',
      bio: 'Over 16 years architecting mission-critical cloud backbones, Kubernetes clusters, and microservices for fintech and sovereign clouds.',
      organization: 'National Institute of Smart Government',
      department: 'Cloud & Enterprise Architecture',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
      phone: '+91 98200 45678',
      location: 'Bengaluru, India',
      qualifications: [
        { degree: 'M.S. in Computer Engineering', institution: 'Georgia Tech', year: '2011', field: 'Distributed Networks' },
        { degree: 'B.E. in Information Science', institution: 'RV College of Engineering', year: '2007', field: 'Computer Science' }
      ],
      experience: [
        { title: 'Chief Cloud Architect', company: 'GovTech Innovations', startYear: '2018', endYear: 'Present', description: 'Architecting sovereign multicloud platforms.' },
        { title: 'Staff DevOps Engineer', company: 'AWS Professional Services', startYear: '2012', endYear: '2018', description: 'Large-scale containerization migrations.' }
      ],
      certificates: [
        { title: 'AWS Certified Solutions Architect - Professional', issuer: 'Amazon Web Services', issueDate: '2023', credentialUrl: 'https://aws.amazon.com/verify/100' },
        { title: 'Certified Kubernetes Administrator (CKA)', issuer: 'Cloud Native Computing Foundation', issueDate: '2023', credentialUrl: 'https://cncf.io/verify/cka' }
      ]
    },
    competencies: [
      { competencyId: 'comp-1', competencyName: 'Cloud Infrastructure & Kubernetes', code: 'CLOUD-K8S', proficiencyLevel: 5, verified: true },
      { competencyId: 'comp-2', competencyName: 'Enterprise Security & Zero Trust', code: 'SEC-ZERO-TRUST', proficiencyLevel: 4, verified: true },
      { competencyId: 'comp-3', competencyName: 'Data Engineering & Scalable ETL', code: 'DATA-ETL', proficiencyLevel: 4, verified: true }
    ]
  },
  {
    id: 'user-trainer-2',
    email: 'ananya.ai@capacityconnect.gov',
    passwordHash: '$2a$10$X8mR08fMsqa5WJsm2gN9..3uK6Osk4Rj4l37zT6a8K2V5ZJ9b6Yhe',
    role: 'TRAINER',
    status: 'APPROVED',
    isVerified: true,
    profile: {
      fullName: 'Dr. Ananya Roy',
      headline: 'Lead AI Scientist & MLOps Practitioner',
      bio: 'Specialist in responsible generative AI deployments, model guardrails, and enterprise deep learning pipelines.',
      organization: 'Center for AI & Robotics',
      department: 'Cognitive Computing Division',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face',
      phone: '+91 99300 89012',
      location: 'Hyderabad, India',
      qualifications: [
        { degree: 'Ph.D. in Machine Learning', institution: 'IISc Bangalore', year: '2017', field: 'Deep Learning' }
      ],
      experience: [
        { title: 'Senior Research Scientist', company: 'AI Research Labs', startYear: '2019', endYear: 'Present', description: 'Production foundation models & LLMOps.' }
      ],
      certificates: [
        { title: 'TensorFlow Advanced Specialist', issuer: 'Google Cloud', issueDate: '2022', credentialUrl: 'https://cloud.google.com/verify/ai' }
      ]
    },
    competencies: [
      { competencyId: 'comp-4', competencyName: 'AI/ML Model Lifecycle & MLOps', code: 'AI-MLOPS', proficiencyLevel: 5, verified: true },
      { competencyId: 'comp-3', competencyName: 'Data Engineering & Scalable ETL', code: 'DATA-ETL', proficiencyLevel: 4, verified: true }
    ]
  },
  {
    id: 'user-trainer-pending',
    email: 'karthik.devops@capacityconnect.gov',
    passwordHash: '$2a$10$X8mR08fMsqa5WJsm2gN9..3uK6Osk4Rj4l37zT6a8K2V5ZJ9b6Yhe',
    role: 'TRAINER',
    status: 'PENDING',
    isVerified: false,
    profile: {
      fullName: 'Karthik Raman',
      headline: 'DevOps & Site Reliability Architect',
      bio: 'Expert in infrastructure as code (Terraform), CI/CD security pipelines, and multi-region failovers.',
      organization: 'TechStack Solutions',
      department: 'Infrastructure Delivery',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      phone: '+91 97100 67890',
      location: 'Chennai, India',
      qualifications: [
        { degree: 'B.Tech in Information Technology', institution: 'Anna University', year: '2015', field: 'Software Engineering' }
      ],
      experience: [
        { title: 'Lead SRE', company: 'CloudWorks', startYear: '2020', endYear: 'Present', description: 'Zero downtime continuous deployments.' }
      ],
      certificates: [
        { title: 'HashiCorp Certified: Terraform Associate', issuer: 'HashiCorp', issueDate: '2023', credentialUrl: 'https://hashicorp.com/cert' }
      ]
    },
    competencies: [
      { competencyId: 'comp-1', competencyName: 'Cloud Infrastructure & Kubernetes', code: 'CLOUD-K8S', proficiencyLevel: 4, verified: false },
      { competencyId: 'comp-2', competencyName: 'Enterprise Security & Zero Trust', code: 'SEC-ZERO-TRUST', proficiencyLevel: 3, verified: false }
    ]
  },
  {
    id: 'user-trainee-1',
    email: 'aarav.trainee@capacityconnect.gov',
    passwordHash: '$2a$10$X8mR08fMsqa5WJsm2gN9..3uK6Osk4Rj4l37zT6a8K2V5ZJ9b6Yhe',
    role: 'TRAINEE',
    status: 'APPROVED',
    isVerified: true,
    profile: {
      fullName: 'Aarav Patel',
      headline: 'Junior Cloud Operations Associate',
      bio: 'Aspiring Cloud & DevOps architect dedicated to mastering containerized deployments and sovereign infrastructure security.',
      organization: 'State Data Center Operations',
      department: 'Systems Engineering',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face',
      phone: '+91 98765 43210',
      location: 'Gandhinagar, Gujarat',
      qualifications: [
        { degree: 'B.E. in Computer Science', institution: 'Gujarat Technological University', year: '2022', field: 'Cloud Computing' }
      ],
      experience: [
        { title: 'Associate Systems Engineer', company: 'State Data Center', startYear: '2022', endYear: 'Present', description: 'Monitoring Kubernetes node health and network alerts.' }
      ],
      certificates: [
        { title: 'Linux Professional Institute Certification (LPIC-1)', issuer: 'LPI Org', issueDate: '2023', credentialUrl: 'https://lpi.org/verify/100' }
      ]
    },
    competencies: [
      { competencyId: 'comp-1', competencyName: 'Cloud Infrastructure & Kubernetes', code: 'CLOUD-K8S', proficiencyLevel: 2, verified: true },
      { competencyId: 'comp-2', competencyName: 'Enterprise Security & Zero Trust', code: 'SEC-ZERO-TRUST', proficiencyLevel: 2, verified: true }
    ]
  },
  {
    id: 'user-trainee-pending',
    email: 'priya.sharma@capacityconnect.gov',
    passwordHash: '$2a$10$X8mR08fMsqa5WJsm2gN9..3uK6Osk4Rj4l37zT6a8K2V5ZJ9b6Yhe',
    role: 'TRAINEE',
    status: 'PENDING',
    isVerified: false,
    profile: {
      fullName: 'Priya Sharma',
      headline: 'Data Analyst & Governance Intern',
      bio: 'Interested in mastering digital governance pipelines, DPI, and ethical AI auditing.',
      organization: 'Department of Administrative Reforms',
      department: 'Data Analytics Wing',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face',
      phone: '+91 98333 11223',
      location: 'Jaipur, Rajasthan',
      qualifications: [
        { degree: 'B.Sc. in Statistics', institution: 'Rajasthan University', year: '2023', field: 'Applied Statistics' }
      ],
      experience: [
        { title: 'Analytics Intern', company: 'DARPG', startYear: '2023', endYear: 'Present', description: 'Public grievance trend analysis.' }
      ],
      certificates: []
    },
    competencies: [
      { competencyId: 'comp-5', competencyName: 'Public Policy & Digital Governance', code: 'GOV-DIGITAL', proficiencyLevel: 2, verified: false }
    ]
  }
];

export const initialCourses: MockCourse[] = [
  {
    id: 'course-cloud-101',
    title: 'Architecting Sovereign Cloud & Kubernetes Systems',
    code: 'CC-ARCH-501',
    slug: 'architecting-sovereign-cloud-kubernetes-systems',
    description: 'Master the foundational patterns of high-availability Kubernetes cluster deployments, infrastructure as code with Terraform, container security hardening, and resilient microservices architectures tailored for national digital public infrastructure.',
    category: 'Cloud & DevOps',
    level: 'Advanced',
    durationHours: 18.5,
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    status: 'PUBLISHED',
    trainerId: 'user-trainer-1',
    trainerName: 'Prof. Vikramaditya Sen',
    trainerRating: 4.85,
    competencies: [
      { competencyId: 'comp-1', competencyName: 'Cloud Infrastructure & Kubernetes', requiredProficiency: 4, weight: 1.5 },
      { competencyId: 'comp-2', competencyName: 'Enterprise Security & Zero Trust', requiredProficiency: 3, weight: 1.0 },
      { competencyId: 'comp-3', competencyName: 'Data Engineering & Scalable ETL', requiredProficiency: 2, weight: 0.8 },
    ],
    materials: [
      {
        id: 'mat-1',
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
        id: 'mat-2',
        title: 'Architecture Blueprint & Kubernetes Topologies (Slide Deck)',
        description: 'High-resolution architectural diagrams illustrating etcd quorum, overlay networks (Calico/Cilium), and ingress controllers.',
        type: 'PDF',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: '18.4 MB',
        sortOrder: 2,
        isPreview: false,
      },
      {
        id: 'mat-3',
        title: 'Module 2: Container Runtime Security & Pod Hardening Policies',
        description: 'Hands-on breakdown of admission controllers, OPA Gatekeeper, Seccomp profiles, and runtime audit telemetry.',
        type: 'VIDEO',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        durationSeconds: 1860,
        fileSize: '198 MB',
        sortOrder: 3,
        isPreview: false,
      },
      {
        id: 'mat-4',
        title: 'Security Compliance Matrix & Production Hardening Guide (Doc)',
        description: 'Detailed compliance checklist based on CIS Benchmarks for Kubernetes 1.30 and ISO 27001.',
        type: 'DOC',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: '6.2 MB',
        sortOrder: 4,
        isPreview: false,
      }
    ],
    assessmentId: 'assess-k8s-final',
  },
  {
    id: 'course-ai-mlops-201',
    title: 'Enterprise MLOps & Production Model Governance',
    code: 'CC-AI-602',
    slug: 'enterprise-mlops-production-model-governance',
    description: 'Learn end-to-end machine learning engineering: continuous training pipelines, feature store design with Feast, model registry versioning, drift detection, and ethical fairness auditing.',
    category: 'Data & AI',
    level: 'Advanced',
    durationHours: 14.0,
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
    status: 'PUBLISHED',
    trainerId: 'user-trainer-2',
    trainerName: 'Dr. Ananya Roy',
    trainerRating: 4.92,
    competencies: [
      { competencyId: 'comp-4', competencyName: 'AI/ML Model Lifecycle & MLOps', requiredProficiency: 5, weight: 1.8 },
      { competencyId: 'comp-3', competencyName: 'Data Engineering & Scalable ETL', requiredProficiency: 4, weight: 1.2 },
    ],
    materials: [
      {
        id: 'mat-ai-1',
        title: 'Module 1: Machine Learning Operations & Pipeline Automation',
        description: 'Introduction to automated CI/CD for machine learning, model registry patterns, and reproducibility.',
        type: 'VIDEO',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        durationSeconds: 1200,
        fileSize: '110 MB',
        sortOrder: 1,
        isPreview: true,
      },
      {
        id: 'mat-ai-2',
        title: 'MLOps Architectural Reference Guide (PDF)',
        description: 'Comprehensive slides outlining feature store integrations and Triton inference server deployments.',
        type: 'PDF',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: '14.2 MB',
        sortOrder: 2,
        isPreview: false,
      }
    ],
    assessmentId: 'assess-mlops-final',
  }
];

export const initialAssessments: MockAssessment[] = [
  {
    id: 'assess-k8s-final',
    courseId: 'course-cloud-101',
    title: 'Kubernetes & Sovereign Infrastructure Certification Exam',
    description: 'Timed rigorous evaluation assessing mastery over Kubernetes control plane topologies, container security, network policies, and persistent storage management.',
    timeLimitMinutes: 25,
    passingScorePercentage: 70.0,
    maxAttempts: 3,
    questions: [
      {
        id: 'q1',
        questionText: 'In a high-availability Kubernetes cluster, what is the minimum recommended number of master nodes required to maintain etcd consensus fault tolerance against a single node failure?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { id: 'opt_1', text: '2 Master Nodes' },
          { id: 'opt_2', text: '3 Master Nodes' },
          { id: 'opt_3', text: '4 Master Nodes' },
          { id: 'opt_4', text: '5 Master Nodes' },
        ],
        correctOption: 'opt_2',
        weight: 2.0,
        explanation: 'Etcd uses the Raft consensus algorithm where a majority quorum (N/2 + 1) is required. With 3 nodes, quorum is 2, allowing survival of 1 node failure without split-brain.',
        sortOrder: 1,
      },
      {
        id: 'q2',
        questionText: 'Which Kubernetes resource specification enforces network isolation by blocking all ingress traffic to pods in a namespace unless explicitly allowlisted?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { id: 'opt_1', text: 'SecurityContext: { readOnlyRootFilesystem: true }' },
          { id: 'opt_2', text: 'NetworkPolicy with podSelector: {} and ingress: [] (Default Deny)' },
          { id: 'opt_3', text: 'ClusterRoleBinding with non-root ServiceAccount' },
          { id: 'opt_4', text: 'IngressController with tls: [{ hosts: [...] }]' },
        ],
        correctOption: 'opt_2',
        weight: 2.5,
        explanation: 'A NetworkPolicy selecting all pods ({}) with an empty ingress rule list creates a Default Deny Ingress rule, stopping all unapproved cross-pod or external traffic.',
        sortOrder: 2,
      },
      {
        id: 'q3',
        questionText: 'When designing zero-downtime rolling deployments for stateful workloads in Kubernetes, which component guarantees sequential, ordered termination and predictable network DNS hostnames?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { id: 'opt_1', text: 'DaemonSet' },
          { id: 'opt_2', text: 'ReplicaSet with maxSurge: 25%' },
          { id: 'opt_3', text: 'StatefulSet with Headless Service' },
          { id: 'opt_4', text: 'Job with parallelCompletions: 3' },
        ],
        correctOption: 'opt_3',
        weight: 2.0,
        explanation: 'StatefulSet provides unique ordinal index names (e.g. redis-0, redis-1), graceful sequential rolling updates, and dedicated DNS entries via a Headless Service.',
        sortOrder: 3,
      },
      {
        id: 'q4',
        questionText: 'Which kernel-level security mechanism is utilized by container runtimes to restrict direct system call (syscall) invocation from compromised container processes?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { id: 'opt_1', text: 'Seccomp (Secure Computing Mode)' },
          { id: 'opt_2', text: 'Cgroups v2 memory limits' },
          { id: 'opt_3', text: 'iptables NAT forwarding' },
          { id: 'opt_4', text: 'etcd TLS mutual authentication' },
        ],
        correctOption: 'opt_1',
        weight: 2.5,
        explanation: 'Seccomp filters and blocks unauthorized Linux system calls (e.g., preventing sys_chroot or ptrace) executed by containerized processes.',
        sortOrder: 4,
      },
      {
        id: 'q5',
        questionText: 'What happens when a Kubernetes Pod memory usage exceeds its defined "resources.limits.memory" threshold?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { id: 'opt_1', text: 'The CPU is throttled to 10% capacity' },
          { id: 'opt_2', text: 'The Pod is terminated by the Linux Out-Of-Memory (OOM) Killer with Exit Code 137' },
          { id: 'opt_3', text: 'The Pod automatically provisions an additional Replica' },
          { id: 'opt_4', text: 'Memory is paged to disk swap space indefinitely' },
        ],
        correctOption: 'opt_2',
        weight: 2.0,
        explanation: 'When a container breaches its memory limit, the Linux kernel OOM Killer immediately kills the process (SIGKILL, exit code 137) and Kubernetes reports OOMKilled.',
        sortOrder: 5,
      }
    ]
  },
  {
    id: 'assess-mlops-final',
    courseId: 'course-ai-mlops-201',
    title: 'Enterprise MLOps & Production Model Governance Exam',
    description: 'Assess continuous training pipelines, feature store design, model registry versioning, and drift monitoring.',
    timeLimitMinutes: 20,
    passingScorePercentage: 70.0,
    maxAttempts: 3,
    questions: [
      {
        id: 'q_ml_1',
        questionText: 'What type of drift occurs when the statistical distribution of input features P(X) changes over time while the conditional ground truth relationship P(Y|X) remains constant?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { id: 'opt_1', text: 'Concept Drift' },
          { id: 'opt_2', text: 'Covariate Shift (Data Drift)' },
          { id: 'opt_3', text: 'Prior Probability Shift' },
          { id: 'opt_4', text: 'Label Inversion' },
        ],
        correctOption: 'opt_2',
        weight: 2.5,
        explanation: 'Covariate Shift (Data Drift) refers to changes in the distribution of input features P(X) without altering the true target mapping function P(Y|X).',
        sortOrder: 1,
      },
      {
        id: 'q_ml_2',
        questionText: 'In an enterprise feature store architecture, what is the primary distinction between the "Online Store" and "Offline Store"?',
        questionType: 'SINGLE_CHOICE',
        options: [
          { id: 'opt_1', text: 'Online Store provides ultra-low latency key-value lookup for real-time inference; Offline Store stores historical partitioned data for batch training.' },
          { id: 'opt_2', text: 'Online Store is stored in memory without encryption; Offline Store is air-gapped.' },
          { id: 'opt_3', text: 'Online Store is only used during local development; Offline Store runs on the cloud.' },
          { id: 'opt_4', text: 'Online Store holds unstructured data; Offline Store holds tabular numbers only.' },
        ],
        correctOption: 'opt_1',
        weight: 2.5,
        explanation: 'The Online Store (e.g., Redis/DynamoDB) serves single-millisecond feature vectors to inference servers, while the Offline Store (e.g., Parquet/Snowflake) facilitates point-in-time correct batch dataset generation.',
        sortOrder: 2,
      }
    ]
  }
];

export const initialEnrollments: MockEnrollment[] = [
  {
    id: 'enroll-1',
    userId: 'user-trainee-1',
    courseId: 'course-cloud-101',
    status: 'ACTIVE',
    progressPercentage: 50.0,
    completedMaterialIds: ['mat-1', 'mat-2'],
    currentMaterialId: 'mat-3',
    enrolledAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    completedAt: null,
    certificateId: null,
    certificateUrl: null,
  }
];

export const initialFeedbacks: MockFeedback[] = [
  {
    id: 'fb-1',
    courseId: 'course-cloud-101',
    userId: 'user-trainee-1',
    userName: 'Aarav Patel',
    userRole: 'Junior Cloud Operations Associate',
    rating: 5,
    comment: 'Exceptional depth on Kubernetes topologies and zero-trust perimeter configuration. The hands-on labs and compliance checklists are directly applicable to state data centers.',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  }
];

export const initialAnnouncements: MockAnnouncement[] = [
  {
    id: 'ann-1',
    title: '🚀 National Capacity Building Summit & Certification Drive 2026',
    content: 'All certified trainees and senior trainers are invited to participate in the National Digital Governance and Cloud Sovereign Architecture symposium scheduled for next month.',
    type: 'SPOTLIGHT' as const,
    isPinned: true,
    authorName: 'Dr. Rajeshwari Sharma (Director)',
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'ann-2',
    title: '⚠️ Scheduled Platform Maintenance & Assessment Window Alert',
    content: 'Assessment servers will undergo a routine security patch on Saturday between 02:00 AM - 04:00 AM IST. Quiz submissions during this window will be auto-cached.',
    type: 'ALERT' as const,
    isPinned: false,
    authorName: 'Dr. Rajeshwari Sharma (Director)',
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'ann-3',
    title: '🏆 Milestone Achievement: 25,000+ Civil Service Officers Upskilled',
    content: 'Capacity Connect has officially crossed the 25,000 active learner milestone with a 94.2% course completion rate across 28 states and union territories.',
    type: 'ACHIEVEMENT' as const,
    isPinned: true,
    authorName: 'Admin Governance Cell',
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
  }
];
