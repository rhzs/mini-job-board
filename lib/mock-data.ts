export interface Job {
  id: string
  title: string
  company: string
  location: string
  salary?: {
    min: number
    max: number
    period: 'hour' | 'day' | 'week' | 'month' | 'year'
    currency: string
  }
  jobType: string[]
  remote: boolean
  description: string
  requirements: string[]
  benefits: string[]
  postedDate: string
  responseRate?: string
  easyApply: boolean
  isUrgent?: boolean
  companyRating?: number
  logo?: string
}

export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Science/Math Tutors Needed (Part Time/Full Time) 50+ Daily Assignments',
    company: 'Premium Tutors',
    location: 'Singapore',
    jobType: ['Part-time', 'Freelance'],
    remote: false,
    description: 'We are looking for passionate Science and Math tutors to join our team. You will be responsible for providing high-quality tutoring services to students across various levels.',
    requirements: ['Bachelor\'s degree in Science/Math', 'Teaching experience preferred', 'Strong communication skills'],
    benefits: ['Flexible schedule', 'Competitive rates', 'Professional development'],
    postedDate: '2025-01-24',
    responseRate: 'Typically responds within 1 day',
    easyApply: true,
    isUrgent: true
  },
  {
    id: '2',
    title: 'Full Stack Developer',
    company: 'GREEN SOLAR CONSULTANT PTE. LTD.',
    location: 'Remote',
    salary: {
      min: 5000,
      max: 6000,
      period: 'month',
      currency: 'S$'
    },
    jobType: ['Full-time'],
    remote: true,
    description: 'Join our dynamic team as a Full Stack Developer. You will work on cutting-edge web applications using modern technologies.',
    requirements: ['3+ years experience', 'React, Node.js', 'Database management', 'Git proficiency'],
    benefits: ['Health insurance', 'Work from home', 'Flexible schedule', 'Late shift options'],
    postedDate: '2025-01-23',
    responseRate: 'Typically responds within 1 day',
    easyApply: true
  },
  {
    id: '3',
    title: 'Full Stack Developer (PHP/Laravel) - Hybrid',
    company: 'USEA Pte Ltd',
    location: 'Singapore 388410',
    salary: {
      min: 2800,
      max: 3600,
      period: 'month',
      currency: 'S$'
    },
    jobType: ['Full-time'],
    remote: false,
    description: 'Seeking an experienced Full Stack Developer with expertise in PHP and Laravel framework for hybrid work arrangement.',
    requirements: ['PHP/Laravel expertise', 'Frontend technologies', 'Database design', 'API development'],
    benefits: ['Professional development', 'Hybrid work', 'Career growth opportunities'],
    postedDate: '2025-01-22',
    responseRate: 'Typically responds within 1 day',
    easyApply: true
  },
  {
    id: '4',
    title: 'Senior Software Engineer',
    company: 'TechCorp Singapore',
    location: 'Singapore CBD',
    salary: {
      min: 8000,
      max: 12000,
      period: 'month',
      currency: 'S$'
    },
    jobType: ['Full-time'],
    remote: false,
    description: 'Lead technical initiatives and mentor junior developers in our growing engineering team.',
    requirements: ['5+ years experience', 'Leadership skills', 'System architecture', 'Agile methodologies'],
    benefits: ['Medical coverage', 'Bonus scheme', 'Learning budget', 'Flexible hours'],
    postedDate: '2025-01-21',
    easyApply: false,
    companyRating: 4.2
  },
  {
    id: '5',
    title: 'Frontend Developer - React Specialist',
    company: 'Digital Solutions Hub',
    location: 'Singapore',
    salary: {
      min: 4500,
      max: 7000,
      period: 'month',
      currency: 'S$'
    },
    jobType: ['Full-time', 'Contract'],
    remote: true,
    description: 'Create beautiful and responsive user interfaces using React and modern frontend technologies.',
    requirements: ['React expertise', 'TypeScript', 'CSS/SASS', 'REST APIs'],
    benefits: ['Remote work', 'Stock options', 'Health insurance', 'Learning budget'],
    postedDate: '2025-01-20',
    easyApply: true,
    companyRating: 3.8
  },
  {
    id: '6',
    title: 'Backend Developer - Node.js',
    company: 'StartupXYZ',
    location: 'Singapore',
    salary: {
      min: 5500,
      max: 8500,
      period: 'month',
      currency: 'S$'
    },
    jobType: ['Full-time'],
    remote: false,
    description: 'Build scalable backend systems and APIs for our growing platform using Node.js and cloud technologies.',
    requirements: ['Node.js/Express', 'MongoDB/PostgreSQL', 'AWS/GCP', 'Microservices'],
    benefits: ['Startup equity', 'Flexible schedule', 'Modern office', 'Team lunches'],
    postedDate: '2025-01-19',
    easyApply: true,
    companyRating: 4.0
  },
  {
    id: '7',
    title: 'Data Scientist',
    company: 'Analytics Pro',
    location: 'Singapore',
    salary: {
      min: 6000,
      max: 9000,
      period: 'month',
      currency: 'S$'
    },
    jobType: ['Full-time'],
    remote: true,
    description: 'Analyze complex datasets and build machine learning models to drive business insights.',
    requirements: ['Python/R', 'Machine Learning', 'SQL', 'Statistics background'],
    benefits: ['Remote work', 'Conference budget', 'Latest hardware', 'Research time'],
    postedDate: '2025-01-18',
    easyApply: false,
    companyRating: 4.5
  },
  {
    id: '8',
    title: 'DevOps Engineer',
    company: 'CloudTech Solutions',
    location: 'Singapore',
    salary: {
      min: 7000,
      max: 10000,
      period: 'month',
      currency: 'S$'
    },
    jobType: ['Full-time'],
    remote: false,
    description: 'Manage cloud infrastructure and CI/CD pipelines to support our development teams.',
    requirements: ['Docker/Kubernetes', 'AWS/Azure', 'CI/CD tools', 'Infrastructure as Code'],
    benefits: ['Cloud certifications', 'On-call allowance', 'Health coverage', 'Training budget'],
    postedDate: '2025-01-17',
    easyApply: true,
    companyRating: 4.1
  },
  {
    id: '9',
    title: 'UX/UI Designer',
    company: 'Design Studio Plus',
    location: 'Singapore',
    salary: {
      min: 4000,
      max: 6500,
      period: 'month',
      currency: 'S$'
    },
    jobType: ['Full-time', 'Contract'],
    remote: true,
    description: 'Create intuitive and beautiful user experiences for web and mobile applications.',
    requirements: ['Figma/Sketch', 'User research', 'Prototyping', 'Design systems'],
    benefits: ['Creative freedom', 'Design tools budget', 'Flexible hours', 'Remote work'],
    postedDate: '2025-01-16',
    easyApply: true,
    companyRating: 3.9
  },
  {
    id: '10',
    title: 'Product Manager',
    company: 'Innovation Labs',
    location: 'Singapore CBD',
    salary: {
      min: 8500,
      max: 12000,
      period: 'month',
      currency: 'S$'
    },
    jobType: ['Full-time'],
    remote: false,
    description: 'Drive product strategy and work with cross-functional teams to deliver amazing user experiences.',
    requirements: ['Product management experience', 'Analytics tools', 'Agile/Scrum', 'Market research'],
    benefits: ['Stock options', 'Medical coverage', 'Team retreats', 'Professional development'],
    postedDate: '2025-01-15',
    easyApply: false,
    companyRating: 4.3
  }
]

export const jobCategories = [
  'Software Engineering',
  'Data Science',
  'Product Management',
  'Design',
  'DevOps',
  'Marketing',
  'Sales',
  'Customer Service',
  'Education',
  'Healthcare'
]

export const salaryRanges = [
  { label: 'S$2,000 - S$4,000', min: 2000, max: 4000 },
  { label: 'S$4,000 - S$6,000', min: 4000, max: 6000 },
  { label: 'S$5,000 - S$8,000', min: 5000, max: 8000 },
  { label: 'S$8,000 - S$12,000', min: 8000, max: 12000 },
  { label: 'S$10,000 - S$15,000', min: 10000, max: 15000 },
  { label: 'S$15,000 - S$20,000', min: 15000, max: 20000 },
  { label: 'S$20,000+', min: 20000, max: Infinity }
] 