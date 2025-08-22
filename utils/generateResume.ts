import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import { PDFGenerationOptions, ResumeData } from '../types/resume';

const createResumeHTML = (data: ResumeData): string => {
  const { personalInfo, education, skills, workExperience, summary } = data;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Resume - ${personalInfo.fullName}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
          background: white;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #2c3e50;
          padding-bottom: 20px;
        }
        
        .name {
          font-size: 32px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        .contact-info {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
        }
        
        .section {
          margin-bottom: 25px;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #2c3e50;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-bottom: 1px solid #bdc3c7;
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
        
        .summary {
          font-style: italic;
          color: #555;
          margin-bottom: 20px;
          padding: 15px;
          background-color: #f8f9fa;
          border-left: 4px solid #3498db;
        }
        
        .education-item, .experience-item, .project-item {
          margin-bottom: 20px;
          padding-left: 20px;
          border-left: 2px solid #ecf0f1;
        }
        
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 5px;
        }
        
        .item-title {
          font-weight: bold;
          color: #2c3e50;
          font-size: 16px;
        }
        
        .item-subtitle {
          color: #7f8c8d;
          font-size: 14px;
          margin-bottom: 5px;
        }
        
        .item-duration {
          color: #95a5a6;
          font-size: 14px;
          font-weight: 500;
        }
        
        .item-description {
          color: #555;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .skills-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .skill-item {
          background-color: #3498db;
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .skills-list {
          list-style: none;
          padding: 0;
        }
        
        .skills-list li {
          display: inline-block;
          background-color: #ecf0f1;
          color: #2c3e50;
          padding: 8px 15px;
          margin: 5px 5px 5px 0;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 500;
        }

        .achievements-list {
          margin-top: 10px;
          padding-left: 20px;
        }

        .achievements-list li {
          margin-bottom: 5px;
          color: #555;
          font-size: 14px;
        }

        .tech-stack {
          margin-top: 10px;
          font-size: 14px;
          color: #666;
        }

        .project-links {
          margin-top: 10px;
        }

        .project-link {
          display: inline-block;
          margin-right: 15px;
          color: #3498db;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
        }

        .project-link:hover {
          text-decoration: underline;
        }
        
        @media print {
          body {
            padding: 20px;
          }
          
          .header {
            margin-bottom: 20px;
          }
          
          .section {
            margin-bottom: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="name">${personalInfo.fullName}</div>
        <div class="contact-info">${personalInfo.email}</div>
        <div class="contact-info">${personalInfo.phone}</div>
        ${personalInfo.address ? `<div class="contact-info">${personalInfo.address}</div>` : ''}
        ${personalInfo.linkedIn ? `<div class="contact-info">${personalInfo.linkedIn}</div>` : ''}
        ${personalInfo.website ? `<div class="contact-info">${personalInfo.website}</div>` : ''}
      </div>

      ${summary ? `
        <div class="section">
          <div class="section-title">Professional Summary</div>
          <div class="summary">${summary}</div>
        </div>
      ` : ''}

      ${education.length > 0 ? `
        <div class="section">
          <div class="section-title">Education</div>
          ${education.map(edu => `
            <div class="education-item">
              <div class="item-header">
                <div class="item-title">${edu.degree}</div>
                <div class="item-duration">${edu.year}</div>
              </div>
              <div class="item-subtitle">${edu.institution}</div>
              ${edu.gpa ? `<div class="item-subtitle">GPA: ${edu.gpa}</div>` : ''}
              ${edu.description ? `<div class="item-description">${edu.description}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${workExperience.length > 0 ? `
        <div class="section">
          <div class="section-title">Work Experience</div>
          ${workExperience.map(exp => `
            <div class="experience-item">
              <div class="item-header">
                <div class="item-title">${exp.role}</div>
                <div class="item-duration">${exp.duration}</div>
              </div>
              <div class="item-subtitle">${exp.company}${exp.location ? ` - ${exp.location}` : ''}</div>
              <div class="item-description">${exp.description}</div>
              ${exp.achievements && exp.achievements.length > 0 ? `
                <ul class="achievements-list">
                  ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${data.projects && data.projects.length > 0 ? `
        <div class="section">
          <div class="section-title">Projects</div>
          ${data.projects.map(project => `
            <div class="project-item">
              <div class="item-header">
                <div class="item-title">${project.name}</div>
                ${project.duration ? `<div class="item-duration">${project.duration}</div>` : ''}
              </div>
              <div class="item-description">${project.description}</div>
              ${project.techStack && project.techStack.length > 0 ? `
                <div class="tech-stack">
                  <strong>Tech Stack:</strong> ${project.techStack.join(', ')}
                </div>
              ` : ''}
              ${project.url || project.github ? `
                <div class="project-links">
                  ${project.url ? `<a href="${project.url}" class="project-link">Live Demo</a>` : ''}
                  ${project.github ? `<a href="${project.github}" class="project-link">GitHub</a>` : ''}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${skills.length > 0 ? `
        <div class="section">
          <div class="section-title">Skills</div>
          <ul class="skills-list">
            ${skills.map(skill => `<li>${skill.trim()}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </body>
    </html>
  `;
};

export const generateResumePDF = async (
  data: ResumeData,
  options: PDFGenerationOptions = {}
): Promise<string> => {
  try {
    const html = createResumeHTML(data);
    
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
      ...options,
    });

    return uri;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF resume');
  }
};

export const saveResumeToDevice = async (
  pdfUri: string,
  fileName: string = 'resume.pdf'
): Promise<string> => {
  try {
    const documentDirectory = FileSystem.documentDirectory;
    if (!documentDirectory) {
      throw new Error('Document directory not available');
    }

    const fileUri = `${documentDirectory}${fileName}`;
    await FileSystem.copyAsync({
      from: pdfUri,
      to: fileUri,
    });

    return fileUri;
  } catch (error) {
    console.error('Error saving PDF to device:', error);
    throw new Error('Failed to save PDF to device');
  }
};
