import { ResumeData } from '../../types/resume';

export const sampleResumeData: ResumeData = {
  personalInfo: {
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    address: '123 Tech Street, San Francisco, CA 94105',
    linkedIn: 'https://linkedin.com/in/sarahjohnson',
    website: 'https://sarahjohnson.dev',
  },
  summary: 'Passionate software engineer with 3+ years of experience in full-stack development. Specialized in React Native, Node.js, and cloud technologies. Proven track record of delivering high-quality mobile applications and scalable backend systems.',
  education: [
    {
      id: '1',
      degree: 'Bachelor of Science in Computer Science',
      institution: 'University of California, Berkeley',
      year: '2018-2022',
      gpa: '3.8/4.0',
      description: 'Relevant Coursework: Data Structures & Algorithms, Software Engineering, Database Systems, Mobile App Development, Machine Learning',
    },
    {
      id: '2',
      degree: 'High School Diploma',
      institution: 'Lincoln High School',
      year: '2014-2018',
      gpa: '4.0/4.0',
      description: 'Valedictorian, National Honor Society, Computer Science Club President',
    },
  ],
  skills: [
    'JavaScript',
    'TypeScript',
    'React Native',
    'React.js',
    'Node.js',
    'Express.js',
    'Python',
    'Java',
    'Swift',
    'Kotlin',
    'MongoDB',
    'PostgreSQL',
    'Firebase',
    'AWS',
    'Docker',
    'Git',
    'Agile/Scrum',
    'REST APIs',
    'GraphQL',
    'Redux',
  ],
  workExperience: [
    {
      id: '1',
      company: 'TechCorp Solutions',
      role: 'Senior Mobile Developer',
      duration: 'January 2023 - Present',
      location: 'San Francisco, CA',
      description: 'Lead development of cross-platform mobile applications using React Native. Collaborated with design and product teams to deliver user-centric features. Implemented CI/CD pipelines and improved app performance by 40%. Mentored junior developers and conducted code reviews.',
    },
    {
      id: '2',
      company: 'StartupXYZ',
      role: 'Full Stack Developer',
      duration: 'June 2022 - December 2022',
      location: 'Remote',
      description: 'Developed and maintained web and mobile applications using React, Node.js, and React Native. Built RESTful APIs and integrated third-party services. Worked in an agile environment with daily standups and sprint planning. Contributed to architecture decisions and technical documentation.',
    },
    {
      id: '3',
      company: 'InnovateLab',
      role: 'Software Developer Intern',
      duration: 'May 2021 - August 2021',
      location: 'Palo Alto, CA',
      description: 'Developed mobile app features using React Native and Firebase. Participated in code reviews and learned best practices for mobile development. Created automated tests and improved code coverage by 25%. Collaborated with cross-functional teams on product requirements.',
    },
  ],
};

export const minimalResumeData: ResumeData = {
  personalInfo: {
    fullName: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 987-6543',
  },
  education: [
    {
      id: '1',
      degree: 'Bachelor of Arts in Business Administration',
      institution: 'State University',
      year: '2020-2024',
    },
  ],
  skills: ['Microsoft Office', 'Project Management', 'Customer Service'],
  workExperience: [
    {
      id: '1',
      company: 'Local Business Inc.',
      role: 'Business Analyst',
      duration: 'June 2024 - Present',
      description: 'Analyze business processes and provide recommendations for improvement.',
    },
  ],
};

export const studentResumeData: ResumeData = {
  personalInfo: {
    fullName: 'Emily Chen',
    email: 'emily.chen@student.edu',
    phone: '+1 (555) 456-7890',
    address: '456 University Ave, College Town, ST 12345',
  },
  summary: 'Computer Science student with strong academic performance and hands-on experience in software development. Seeking internship opportunities to apply technical skills and contribute to innovative projects.',
  education: [
    {
      id: '1',
      degree: 'Bachelor of Science in Computer Science',
      institution: 'Tech University',
      year: '2022-2026 (Expected)',
      gpa: '3.9/4.0',
      description: 'Dean\'s List for 4 consecutive semesters. Relevant coursework: Object-Oriented Programming, Data Structures, Web Development, Database Design.',
    },
  ],
  skills: [
    'Java',
    'Python',
    'HTML/CSS',
    'JavaScript',
    'SQL',
    'Git',
    'Linux',
    'Problem Solving',
    'Team Collaboration',
  ],
  workExperience: [
    {
      id: '1',
      company: 'University IT Department',
      role: 'Student Technical Assistant',
      duration: 'September 2023 - Present',
      location: 'College Town, ST',
      description: 'Provide technical support to students and faculty. Troubleshoot hardware and software issues. Assist with computer lab maintenance and software installations.',
    },
    {
      id: '2',
      company: 'Local Coffee Shop',
      role: 'Barista',
      duration: 'June 2023 - August 2023',
      location: 'College Town, ST',
      description: 'Provided excellent customer service in fast-paced environment. Handled cash transactions and maintained clean work environment. Demonstrated reliability and teamwork skills.',
    },
  ],
};

// Function to get sample data based on user type
export const getSampleData = (type: 'professional' | 'minimal' | 'student' = 'professional'): ResumeData => {
  switch (type) {
    case 'minimal':
      return minimalResumeData;
    case 'student':
      return studentResumeData;
    case 'professional':
    default:
      return sampleResumeData;
  }
};

// Function to create empty resume data structure
export const createEmptyResumeData = (): ResumeData => ({
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    linkedIn: '',
    website: '',
  },
  education: [
    {
      id: Date.now().toString(),
      degree: '',
      institution: '',
      year: '',
      gpa: '',
      description: '',
    },
  ],
  skills: [],
  workExperience: [
    {
      id: Date.now().toString(),
      company: '',
      role: '',
      duration: '',
      description: '',
      location: '',
    },
  ],
  summary: '',
});
