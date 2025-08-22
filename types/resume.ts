export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  linkedIn?: string;
  website?: string;
  github?: string;
  portfolio?: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
  gpa?: string;
  description?: string;
  location?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
  location?: string;
  achievements?: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  duration?: string;
  url?: string;
  github?: string;
  highlights?: string[];
}

export interface ResumeData {
  id?: string;
  userId?: string;
  title?: string;
  personalInfo: PersonalInfo;
  education: Education[];
  skills: string[];
  workExperience: WorkExperience[];
  projects: Project[];
  summary?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResumeFormErrors {
  personalInfo?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  education?: { [key: string]: { degree?: string; institution?: string; year?: string } };
  workExperience?: { [key: string]: { company?: string; role?: string; duration?: string; description?: string } };
  projects?: { [key: string]: { name?: string; description?: string; techStack?: string } };
  skills?: string;
}

export interface PDFGenerationOptions {
  format?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
}
