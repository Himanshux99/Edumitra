import {
  StudentDataUploadForm,
  SubjectFormData,
  CompletedCourseFormData,
  StudentDataValidationErrors
} from '../types/student';

/**
 * Validate CGPA value
 * @param cgpa - CGPA string value
 * @returns Error message or undefined if valid
 */
export function validateCGPA(cgpa: string): string | undefined {
  if (!cgpa) {
    return 'CGPA is required';
  }
  
  const cgpaNum = parseFloat(cgpa);
  
  if (isNaN(cgpaNum)) {
    return 'CGPA must be a valid number';
  }
  
  if (cgpaNum < 0 || cgpaNum > 10) {
    return 'CGPA must be between 0 and 10';
  }
  
  if (cgpaNum.toString().split('.')[1]?.length > 2) {
    return 'CGPA can have maximum 2 decimal places';
  }
  
  return undefined;
}

/**
 * Validate attendance percentage
 * @param attendance - Attendance percentage string
 * @returns Error message or undefined if valid
 */
export function validateAttendance(attendance: string): string | undefined {
  if (!attendance) {
    return 'Attendance is required';
  }
  
  const attendanceNum = parseFloat(attendance);
  
  if (isNaN(attendanceNum)) {
    return 'Attendance must be a valid number';
  }
  
  if (attendanceNum < 0 || attendanceNum > 100) {
    return 'Attendance must be between 0 and 100';
  }
  
  return undefined;
}

/**
 * Validate semester number
 * @param semester - Semester string value
 * @returns Error message or undefined if valid
 */
export function validateSemester(semester: string): string | undefined {
  if (!semester) {
    return 'Semester is required';
  }
  
  const semesterNum = parseInt(semester);
  
  if (isNaN(semesterNum)) {
    return 'Semester must be a valid number';
  }
  
  if (semesterNum < 1 || semesterNum > 12) {
    return 'Semester must be between 1 and 12';
  }
  
  return undefined;
}

/**
 * Validate academic year format
 * @param academicYear - Academic year string (e.g., "2023-24")
 * @returns Error message or undefined if valid
 */
export function validateAcademicYear(academicYear: string): string | undefined {
  if (!academicYear) {
    return 'Academic year is required';
  }
  
  const yearPattern = /^\d{4}-\d{2}$/;
  if (!yearPattern.test(academicYear)) {
    return 'Academic year must be in format YYYY-YY (e.g., 2023-24)';
  }
  
  const [startYear, endYear] = academicYear.split('-');
  const startYearNum = parseInt(startYear);
  const endYearNum = parseInt(`20${endYear}`);
  
  if (endYearNum !== startYearNum + 1) {
    return 'Academic year format is invalid';
  }
  
  const currentYear = new Date().getFullYear();
  if (startYearNum < currentYear - 10 || startYearNum > currentYear + 5) {
    return 'Academic year seems unrealistic';
  }
  
  return undefined;
}

/**
 * Validate subject form data
 * @param subject - Subject form data
 * @returns Object with field-specific errors
 */
export function validateSubject(subject: SubjectFormData): { [field: string]: string } {
  const errors: { [field: string]: string } = {};
  
  // Subject Code
  if (!subject.subjectCode.trim()) {
    errors.subjectCode = 'Subject code is required';
  } else if (subject.subjectCode.length < 2 || subject.subjectCode.length > 10) {
    errors.subjectCode = 'Subject code must be 2-10 characters';
  }
  
  // Subject Name
  if (!subject.subjectName.trim()) {
    errors.subjectName = 'Subject name is required';
  } else if (subject.subjectName.length < 3 || subject.subjectName.length > 100) {
    errors.subjectName = 'Subject name must be 3-100 characters';
  }
  
  // Credits
  if (!subject.credits) {
    errors.credits = 'Credits are required';
  } else {
    const creditsNum = parseInt(subject.credits);
    if (isNaN(creditsNum) || creditsNum < 1 || creditsNum > 10) {
      errors.credits = 'Credits must be between 1 and 10';
    }
  }
  
  // Grade
  const validGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];
  if (!subject.grade) {
    errors.grade = 'Grade is required';
  } else if (!validGrades.includes(subject.grade)) {
    errors.grade = 'Invalid grade selected';
  }
  
  // Marks
  if (!subject.marks) {
    errors.marks = 'Marks are required';
  } else {
    const marksNum = parseFloat(subject.marks);
    if (isNaN(marksNum) || marksNum < 0) {
      errors.marks = 'Marks must be a positive number';
    }
  }
  
  // Max Marks
  if (!subject.maxMarks) {
    errors.maxMarks = 'Maximum marks are required';
  } else {
    const maxMarksNum = parseFloat(subject.maxMarks);
    const marksNum = parseFloat(subject.marks);
    
    if (isNaN(maxMarksNum) || maxMarksNum <= 0) {
      errors.maxMarks = 'Maximum marks must be a positive number';
    } else if (!isNaN(marksNum) && marksNum > maxMarksNum) {
      errors.marks = 'Marks cannot exceed maximum marks';
    }
  }
  
  // Semester
  const semesterError = validateSemester(subject.semester);
  if (semesterError) {
    errors.semester = semesterError;
  }
  
  // Exam Type
  const validExamTypes = ['midterm', 'final', 'assignment', 'quiz', 'project'];
  if (!subject.examType) {
    errors.examType = 'Exam type is required';
  } else if (!validExamTypes.includes(subject.examType)) {
    errors.examType = 'Invalid exam type selected';
  }
  
  return errors;
}

/**
 * Validate completed course form data
 * @param course - Completed course form data
 * @returns Object with field-specific errors
 */
export function validateCompletedCourse(course: CompletedCourseFormData): { [field: string]: string } {
  const errors: { [field: string]: string } = {};
  
  // Course Code
  if (!course.courseCode.trim()) {
    errors.courseCode = 'Course code is required';
  } else if (course.courseCode.length < 2 || course.courseCode.length > 15) {
    errors.courseCode = 'Course code must be 2-15 characters';
  }
  
  // Course Name
  if (!course.courseName.trim()) {
    errors.courseName = 'Course name is required';
  } else if (course.courseName.length < 3 || course.courseName.length > 150) {
    errors.courseName = 'Course name must be 3-150 characters';
  }
  
  // Credits
  if (!course.credits) {
    errors.credits = 'Credits are required';
  } else {
    const creditsNum = parseInt(course.credits);
    if (isNaN(creditsNum) || creditsNum < 1 || creditsNum > 10) {
      errors.credits = 'Credits must be between 1 and 10';
    }
  }
  
  // Grade
  const validGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];
  if (!course.grade) {
    errors.grade = 'Grade is required';
  } else if (!validGrades.includes(course.grade)) {
    errors.grade = 'Invalid grade selected';
  }
  
  // Completion Date
  if (!course.completionDate) {
    errors.completionDate = 'Completion date is required';
  } else {
    const completionDate = new Date(course.completionDate);
    const currentDate = new Date();
    
    if (isNaN(completionDate.getTime())) {
      errors.completionDate = 'Invalid completion date';
    } else if (completionDate > currentDate) {
      errors.completionDate = 'Completion date cannot be in the future';
    }
  }
  
  // Semester
  const semesterError = validateSemester(course.semester);
  if (semesterError) {
    errors.semester = semesterError;
  }
  
  // Instructor
  if (!course.instructor.trim()) {
    errors.instructor = 'Instructor name is required';
  } else if (course.instructor.length < 2 || course.instructor.length > 100) {
    errors.instructor = 'Instructor name must be 2-100 characters';
  }
  
  return errors;
}

/**
 * Validate entire student data upload form
 * @param formData - Complete form data
 * @returns Validation errors object
 */
export function validateStudentDataForm(formData: StudentDataUploadForm): StudentDataValidationErrors {
  const errors: StudentDataValidationErrors = {};
  
  // Validate basic fields
  const cgpaError = validateCGPA(formData.cgpa);
  if (cgpaError) errors.cgpa = cgpaError;
  
  const attendanceError = validateAttendance(formData.overallAttendance);
  if (attendanceError) errors.attendance = attendanceError;
  
  const semesterError = validateSemester(formData.currentSemester);
  if (semesterError) errors.general = semesterError;
  
  const academicYearError = validateAcademicYear(formData.academicYear);
  if (academicYearError) {
    errors.general = errors.general ? `${errors.general}; ${academicYearError}` : academicYearError;
  }
  
  // Validate attendance consistency
  const totalClasses = parseInt(formData.totalClasses);
  const attendedClasses = parseInt(formData.attendedClasses);
  
  if (!isNaN(totalClasses) && !isNaN(attendedClasses)) {
    if (attendedClasses > totalClasses) {
      errors.attendance = 'Attended classes cannot exceed total classes';
    }
    
    const calculatedAttendance = (attendedClasses / totalClasses) * 100;
    const providedAttendance = parseFloat(formData.overallAttendance);
    
    if (!isNaN(providedAttendance) && Math.abs(calculatedAttendance - providedAttendance) > 1) {
      errors.attendance = 'Attendance percentage does not match the class counts';
    }
  }
  
  // Validate subjects
  if (formData.subjects && formData.subjects.length > 0) {
    errors.subjects = {};
    formData.subjects.forEach((subject, index) => {
      const subjectErrors = validateSubject(subject);
      if (Object.keys(subjectErrors).length > 0) {
        errors.subjects![index] = subjectErrors;
      }
    });
    
    // Remove subjects errors if no errors found
    if (Object.keys(errors.subjects).length === 0) {
      delete errors.subjects;
    }
  }
  
  // Validate completed courses
  if (formData.completedCourses && formData.completedCourses.length > 0) {
    errors.completedCourses = {};
    formData.completedCourses.forEach((course, index) => {
      const courseErrors = validateCompletedCourse(course);
      if (Object.keys(courseErrors).length > 0) {
        errors.completedCourses![index] = courseErrors;
      }
    });
    
    // Remove completed courses errors if no errors found
    if (Object.keys(errors.completedCourses).length === 0) {
      delete errors.completedCourses;
    }
  }
  
  return errors;
}

/**
 * Check if validation errors object has any errors
 * @param errors - Validation errors object
 * @returns True if there are errors, false otherwise
 */
export function hasValidationErrors(errors: StudentDataValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Get first error message from validation errors
 * @param errors - Validation errors object
 * @returns First error message or undefined
 */
export function getFirstValidationError(errors: StudentDataValidationErrors): string | undefined {
  if (errors.general) return errors.general;
  if (errors.cgpa) return errors.cgpa;
  if (errors.attendance) return errors.attendance;
  
  if (errors.subjects) {
    const firstSubjectIndex = Object.keys(errors.subjects)[0];
    if (firstSubjectIndex) {
      const subjectErrors = errors.subjects[parseInt(firstSubjectIndex)];
      const firstFieldError = Object.keys(subjectErrors)[0];
      if (firstFieldError) {
        return `Subject ${parseInt(firstSubjectIndex) + 1}: ${subjectErrors[firstFieldError]}`;
      }
    }
  }
  
  if (errors.completedCourses) {
    const firstCourseIndex = Object.keys(errors.completedCourses)[0];
    if (firstCourseIndex) {
      const courseErrors = errors.completedCourses[parseInt(firstCourseIndex)];
      const firstFieldError = Object.keys(courseErrors)[0];
      if (firstFieldError) {
        return `Course ${parseInt(firstCourseIndex) + 1}: ${courseErrors[firstFieldError]}`;
      }
    }
  }
  
  return undefined;
}

/**
 * Convert grade to grade points
 * @param grade - Letter grade
 * @returns Grade points (0-10 scale)
 */
export function gradeToPoints(grade: string): number {
  const gradeMap: { [key: string]: number } = {
    'A+': 10,
    'A': 9,
    'A-': 8.5,
    'B+': 8,
    'B': 7,
    'B-': 6.5,
    'C+': 6,
    'C': 5,
    'C-': 4.5,
    'D+': 4,
    'D': 3,
    'F': 0
  };
  
  return gradeMap[grade] || 0;
}

/**
 * Calculate CGPA from subjects
 * @param subjects - Array of subject performance data
 * @returns Calculated CGPA
 */
export function calculateCGPA(subjects: SubjectFormData[]): number {
  if (subjects.length === 0) return 0;
  
  let totalPoints = 0;
  let totalCredits = 0;
  
  subjects.forEach(subject => {
    const credits = parseInt(subject.credits);
    const gradePoints = gradeToPoints(subject.grade);
    
    if (!isNaN(credits) && gradePoints >= 0) {
      totalPoints += gradePoints * credits;
      totalCredits += credits;
    }
  });
  
  return totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;
}
