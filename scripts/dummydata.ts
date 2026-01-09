import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// Infer transaction type from db instance
type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Seed Script for rateKTH
 * 
 * Seeds comprehensive test data for thorough testing:
 * - Multiple programs (bachelor, 5-year master, 2-year master)
 * - Specializations for master's programs
 * - Realistic KTH courses
 * - Users with varied academic affiliations
 * - Reviews with realistic distribution
 * - Tags and feedback entries
 * 
 * All operations are ACID-compliant within a single transaction.
 */

// ==========================================
// TYPE DEFINITIONS
// ==========================================

interface ProgramSeed {
    code: string;
    name: string;
    type: 'bachelor' | 'master';
    credits: 180 | 300 | 120;
    hasIntegratedMasters?: boolean; // true for 300hp programs with no separate master's track
}

interface SpecializationSeed {
    name: string;
    programCode: string; // References program code
}

interface CourseSeed {
    code: string;
    name: string;
}

interface CourseProgramLink {
    courseCode: string;
    programCode: string;
}

interface CourseSpecializationLink {
    courseCode: string;
    specializationName: string;
    programCode: string; // For lookup
}

interface TagSeed {
    name: string;
    sentiment: 'positive' | 'negative';
}

interface UserSeed {
    email: string;
    programCode?: string; // Base program (180hp or 300hp)
    mastersDegreeCode?: string; // Master's degree (120hp)
    specializationName?: string; // Requires mastersDegreeCode
}

interface ReviewSeed {
    userEmail: string;
    courseCode: string;
    yearTaken: number;
    datePostedOffset: number; // Days ago
    ratingProfessor: number;
    ratingMaterial: number;
    ratingPeers: number;
    ratingWorkload: 'light' | 'medium' | 'heavy';
    content: string | null;
    tagNames?: string[]; // Max 3
}

interface FeedbackSeed {
    userEmail?: string; // Optional - can be anonymous
    content: string;
    createdAtOffset: number; // Days ago
}

// ==========================================
// SEED DATA ARRAYS
// ==========================================

const PROGRAMS: ProgramSeed[] = [
    // Bachelor programs (180hp)
    { code: 'TCOMK', name: 'Information and Communication Technology', type: 'bachelor', credits: 180 },
    { code: 'TIDAB', name: 'Computer Engineering', type: 'bachelor', credits: 180 },
    { code: 'TIDAA', name: 'Industrial Engineering and Management', type: 'bachelor', credits: 180 },

    // 5-year Master programs (300hp) - with separate master's track
    { code: 'CDATE', name: 'Computer Science and Engineering', type: 'master', credits: 300 },
    { code: 'CELTE', name: 'Electrical Engineering', type: 'master', credits: 300 },

    // 5-year Master programs (300hp) - integrated (no separate master's)
    { code: 'ARKIT', name: 'Architecture', type: 'master', credits: 300, hasIntegratedMasters: true },

    // 2-year Master programs (120hp)
    { code: 'TCSCM', name: 'Computer Science', type: 'master', credits: 120 },
    { code: 'TEBSM', name: 'Embedded Systems', type: 'master', credits: 120 },
    { code: 'TIDEM', name: 'Industrial Engineering and Management', type: 'master', credits: 120 },
    { code: 'TELPM', name: 'Electrical Engineering', type: 'master', credits: 120 },

    // TEMPORARY: Test programs for dropdown scroll testing
    { code: 'TEMB1', name: 'Embedded Systems Advanced', type: 'master', credits: 120 },
    { code: 'TEMB2', name: 'Embedded Systems Design', type: 'master', credits: 120 },
    { code: 'TEMB3', name: 'Embedded Software Engineering', type: 'master', credits: 120 },
    { code: 'TEMB4', name: 'Embedded Hardware Systems', type: 'master', credits: 120 },
    { code: 'TEMB5', name: 'Embedded AI Systems', type: 'master', credits: 120 },
    { code: 'TEMB6', name: 'Embedded Real-Time Systems', type: 'master', credits: 120 },
    { code: 'TEMB7', name: 'Embedded IoT Systems', type: 'master', credits: 120 },
    { code: 'TEMB8', name: 'Embedded Control Systems', type: 'master', credits: 120 },
    { code: 'TEMB9', name: 'Embedded Automotive Systems', type: 'master', credits: 120 },
    { code: 'TEMBA', name: 'Embedded Robotics', type: 'master', credits: 120 },
];

const SPECIALIZATIONS: SpecializationSeed[] = [
    { name: 'Machine Learning', programCode: 'TCSCM' },
    { name: 'Computer Systems', programCode: 'TCSCM' },
    { name: 'Theoretical Computer Science', programCode: 'TCSCM' },
    { name: 'Embedded Systems', programCode: 'TEBSM' },
    { name: 'Real-Time Systems', programCode: 'TEBSM' },
    { name: 'Operations Management', programCode: 'TIDEM' },
    { name: 'Product Development', programCode: 'TIDEM' },
    { name: 'Power Systems', programCode: 'TELPM' },
];

const COURSES: CourseSeed[] = [
    // Programming courses
    { code: 'ID1018', name: 'Programmering I' },
    { code: 'ID1019', name: 'Programmering II' },
    { code: 'ID1020', name: 'Algoritmer och datastrukturer' },

    // Machine Learning / AI courses
    { code: 'DD2421', name: 'Machine Learning' },
    { code: 'DD2424', name: 'Deep Learning in Data Science' },
    { code: 'DD2431', name: 'Artificial Intelligence' },

    // Math courses
    { code: 'SF1672', name: 'Linjär algebra' },
    { code: 'SF1625', name: 'Envariabelanalys' },
    { code: 'SF1626', name: 'Flervariabelanalys' },
    { code: 'SF1912', name: 'Sannolikhetsteori och statistik' },

    // Electrical courses
    { code: 'EP1200', name: 'Elektroteknik' },
    { code: 'EL1000', name: 'Reglerteknik' },
    { code: 'EL1001', name: 'Elektronik' },

    // Systems courses
    { code: 'ID2201', name: 'Distribuerade system' },
    { code: 'ID2202', name: 'Databasteknik' },
    { code: 'ID2203', name: 'Operativsystem' },

    // Other
    { code: 'ME1003', name: 'Industriell ekonomi' },
    { code: 'ME1004', name: 'Produktutveckling' },

    // Architecture courses (for ARKIT)
    { code: 'A11HIB', name: 'History and Theory of Architecture 1' },
    { code: 'A11P1B', name: 'Architecture Project 1:1 Assemblies, Geometries, Scales' },
    { code: 'A11TEB', name: 'Architectural Technology 1' },
    { code: 'A21P1C', name: 'Architecture Project 2:1 Structure, Place, Activity' },

    // Zero-review courses (for edge case testing - one per program)
    { code: 'ID1021', name: 'Avancerad programmering' },
    { code: 'ID1022', name: 'Webbutveckling' },
    { code: 'ME1005', name: 'Projektledning' },
    { code: 'DD2432', name: 'Advanced Machine Learning' },
    { code: 'EL1002', name: 'Digital elektronik' },
    { code: 'DD2433', name: 'Research Methods in CS' },
    { code: 'EL2001', name: 'Advanced Embedded Systems' },
    { code: 'ME2001', name: 'Supply Chain Management' },
    { code: 'EL2002', name: 'Smart Grids' },
    { code: 'A31EXA', name: 'Degree Project in Architecture' },
];

const COURSE_PROGRAM_LINKS: CourseProgramLink[] = [
    // TCOMK courses
    { courseCode: 'ID1018', programCode: 'TCOMK' },
    { courseCode: 'ID1019', programCode: 'TCOMK' },
    { courseCode: 'SF1672', programCode: 'TCOMK' },
    { courseCode: 'SF1625', programCode: 'TCOMK' },

    // TIDAB courses
    { courseCode: 'ID1018', programCode: 'TIDAB' },
    { courseCode: 'ID1020', programCode: 'TIDAB' },
    { courseCode: 'SF1672', programCode: 'TIDAB' },
    { courseCode: 'EP1200', programCode: 'TIDAB' },

    // TIDAA courses (Industrial Engineering Bachelor)
    { courseCode: 'SF1672', programCode: 'TIDAA' },
    { courseCode: 'SF1625', programCode: 'TIDAA' },
    { courseCode: 'ME1003', programCode: 'TIDAA' },
    { courseCode: 'ME1004', programCode: 'TIDAA' },

    // CDATE courses
    { courseCode: 'ID1018', programCode: 'CDATE' },
    { courseCode: 'ID1019', programCode: 'CDATE' },
    { courseCode: 'ID1020', programCode: 'CDATE' },
    { courseCode: 'DD2421', programCode: 'CDATE' },
    { courseCode: 'SF1672', programCode: 'CDATE' },
    { courseCode: 'SF1625', programCode: 'CDATE' },

    // CELTE courses
    { courseCode: 'EP1200', programCode: 'CELTE' },
    { courseCode: 'EL1000', programCode: 'CELTE' },
    { courseCode: 'EL1001', programCode: 'CELTE' },
    { courseCode: 'SF1625', programCode: 'CELTE' },

    // TCSCM courses (master's)
    { courseCode: 'DD2421', programCode: 'TCSCM' },
    { courseCode: 'DD2424', programCode: 'TCSCM' },
    { courseCode: 'DD2431', programCode: 'TCSCM' },
    { courseCode: 'ID2201', programCode: 'TCSCM' },
    { courseCode: 'ID2202', programCode: 'TCSCM' },

    // TEBSM courses
    { courseCode: 'ID2203', programCode: 'TEBSM' },
    { courseCode: 'EL1000', programCode: 'TEBSM' },

    // TIDEM courses
    { courseCode: 'ME1003', programCode: 'TIDEM' },
    { courseCode: 'ME1004', programCode: 'TIDEM' },

    // TELPM courses
    { courseCode: 'EP1200', programCode: 'TELPM' },
    { courseCode: 'EL1000', programCode: 'TELPM' },
    { courseCode: 'EL1001', programCode: 'TELPM' },

    // Zero-review courses (one per program for edge case testing)
    { courseCode: 'ID1021', programCode: 'TCOMK' },
    { courseCode: 'ID1022', programCode: 'TIDAB' },
    { courseCode: 'ME1005', programCode: 'TIDAA' },
    { courseCode: 'DD2432', programCode: 'CDATE' },
    { courseCode: 'EL1002', programCode: 'CELTE' },
    { courseCode: 'DD2433', programCode: 'TCSCM' },
    { courseCode: 'EL2001', programCode: 'TEBSM' },
    { courseCode: 'ME2001', programCode: 'TIDEM' },
    { courseCode: 'EL2002', programCode: 'TELPM' },
    { courseCode: 'A31EXA', programCode: 'ARKIT' },

    // ARKIT courses (300hp integrated - no separate master's)
    { courseCode: 'A11HIB', programCode: 'ARKIT' },
    { courseCode: 'A11P1B', programCode: 'ARKIT' },
    { courseCode: 'A11TEB', programCode: 'ARKIT' },
    { courseCode: 'A21P1C', programCode: 'ARKIT' },
];

const COURSE_SPECIALIZATION_LINKS: CourseSpecializationLink[] = [
    { courseCode: 'DD2421', specializationName: 'Machine Learning', programCode: 'TCSCM' },
    { courseCode: 'DD2424', specializationName: 'Machine Learning', programCode: 'TCSCM' },
    { courseCode: 'DD2431', specializationName: 'Machine Learning', programCode: 'TCSCM' },
    { courseCode: 'ID2201', specializationName: 'Computer Systems', programCode: 'TCSCM' },
    { courseCode: 'ID2202', specializationName: 'Computer Systems', programCode: 'TCSCM' },
    { courseCode: 'ID2203', specializationName: 'Embedded Systems', programCode: 'TEBSM' },
    { courseCode: 'EL1000', specializationName: 'Real-Time Systems', programCode: 'TEBSM' },
    { courseCode: 'ME1003', specializationName: 'Operations Management', programCode: 'TIDEM' },
    { courseCode: 'ME1004', specializationName: 'Product Development', programCode: 'TIDEM' },
    { courseCode: 'EL1001', specializationName: 'Power Systems', programCode: 'TELPM' },
];

const TAGS: TagSeed[] = [
    { name: 'Clear explanations', sentiment: 'positive' },
    { name: 'Engaging lectures', sentiment: 'positive' },
    { name: 'Well-structured', sentiment: 'positive' },
    { name: 'Helpful professor', sentiment: 'positive' },
    { name: 'Good labs', sentiment: 'positive' },
    { name: 'Practical assignments', sentiment: 'positive' },
    { name: 'Heavy workload', sentiment: 'negative' },
    { name: 'Outdated material', sentiment: 'negative' },
    { name: 'Poor organization', sentiment: 'negative' },
    { name: 'Difficult exams', sentiment: 'negative' },
    { name: 'Too theoretical', sentiment: 'negative' },
    { name: 'Confusing lectures', sentiment: 'negative' },
];

const USERS: UserSeed[] = [
    // Bachelor students (base program only)
    { email: 'student1@kth.se', programCode: 'TCOMK' },
    { email: 'student2@kth.se', programCode: 'TIDAB' },
    { email: 'student3@kth.se', programCode: 'TIDAA' },

    // 5-year master students (base program only, haven't selected master's yet)
    { email: 'master1@kth.se', programCode: 'CDATE' },
    { email: 'master2@kth.se', programCode: 'CELTE' },

    // 5-year master students (base program + master's degree selected)
    { email: 'master3@kth.se', programCode: 'CDATE', mastersDegreeCode: 'TCSCM' },
    { email: 'master4@kth.se', programCode: 'CDATE', mastersDegreeCode: 'TCSCM' },

    // Direct master's students (no specialization yet)
    { email: 'ms1@kth.se', mastersDegreeCode: 'TCSCM' },
    { email: 'ms2@kth.se', mastersDegreeCode: 'TEBSM' },

    // Direct master's students (with specialization)
    { email: 'ms3@kth.se', mastersDegreeCode: 'TCSCM', specializationName: 'Machine Learning' },
    { email: 'ms4@kth.se', mastersDegreeCode: 'TCSCM', specializationName: 'Computer Systems' },
    { email: 'ms5@kth.se', mastersDegreeCode: 'TEBSM', specializationName: 'Embedded Systems' },
    { email: 'ms6@kth.se', mastersDegreeCode: 'TIDEM', specializationName: 'Operations Management' },
    { email: 'ms7@kth.se', mastersDegreeCode: 'TELPM', specializationName: 'Power Systems' },
];

const REVIEWS: ReviewSeed[] = [
    // ID1018 reviews
    { userEmail: 'student1@kth.se', courseCode: 'ID1018', yearTaken: 2024, datePostedOffset: 5, ratingProfessor: 4, ratingMaterial: 5, ratingPeers: 4, ratingWorkload: 'medium', content: 'Great introduction to programming! The professor explains concepts clearly and the labs are well-designed.', tagNames: ['Clear explanations', 'Good labs'] },
    { userEmail: 'master1@kth.se', courseCode: 'ID1018', yearTaken: 2023, datePostedOffset: 30, ratingProfessor: 5, ratingMaterial: 4, ratingPeers: 5, ratingWorkload: 'light', content: 'Excellent course for beginners. Very supportive environment.', tagNames: ['Engaging lectures', 'Well-structured'] },
    { userEmail: 'master3@kth.se', courseCode: 'ID1018', yearTaken: 2022, datePostedOffset: 60, ratingProfessor: 3, ratingMaterial: 3, ratingPeers: 4, ratingWorkload: 'medium', content: 'Decent course but could be more challenging.', tagNames: ['Too theoretical'] },

    // ID1019 reviews
    { userEmail: 'student1@kth.se', courseCode: 'ID1019', yearTaken: 2024, datePostedOffset: 2, ratingProfessor: 4, ratingMaterial: 4, ratingPeers: 3, ratingWorkload: 'heavy', content: 'More challenging than ID1018. Good follow-up course.', tagNames: ['Heavy workload', 'Practical assignments'] },
    { userEmail: 'master3@kth.se', courseCode: 'ID1019', yearTaken: 2023, datePostedOffset: 45, ratingProfessor: 5, ratingMaterial: 5, ratingPeers: 4, ratingWorkload: 'medium', content: 'Really enjoyed this course. Great progression from ID1018.', tagNames: ['Clear explanations', 'Good labs'] },

    // DD2421 reviews
    { userEmail: 'ms3@kth.se', courseCode: 'DD2421', yearTaken: 2024, datePostedOffset: 1, ratingProfessor: 5, ratingMaterial: 3, ratingPeers: 5, ratingWorkload: 'heavy', content: 'Challenging but rewarding course. The math is intense and the assignments take a lot of time.', tagNames: ['Heavy workload', 'Difficult exams'] },
    { userEmail: 'ms4@kth.se', courseCode: 'DD2421', yearTaken: 2023, datePostedOffset: 20, ratingProfessor: 4, ratingMaterial: 4, ratingPeers: 4, ratingWorkload: 'heavy', content: 'Solid ML course with good theoretical foundation.', tagNames: ['Well-structured', 'Heavy workload'] },
    { userEmail: 'master3@kth.se', courseCode: 'DD2421', yearTaken: 2024, datePostedOffset: 10, ratingProfessor: 3, ratingMaterial: 2, ratingPeers: 3, ratingWorkload: 'heavy', content: 'Found the material outdated. Could use more modern examples.', tagNames: ['Outdated material', 'Too theoretical'] },

    // DD2424 reviews
    { userEmail: 'ms3@kth.se', courseCode: 'DD2424', yearTaken: 2024, datePostedOffset: 3, ratingProfessor: 5, ratingMaterial: 5, ratingPeers: 4, ratingWorkload: 'medium', content: 'Excellent deep learning course. Very practical and up-to-date.', tagNames: ['Practical assignments', 'Clear explanations'] },
    { userEmail: 'ms1@kth.se', courseCode: 'DD2424', yearTaken: 2023, datePostedOffset: 25, ratingProfessor: 4, ratingMaterial: 4, ratingPeers: 5, ratingWorkload: 'medium', content: 'Good course but requires strong ML background.', tagNames: ['Well-structured'] },

    // SF1672 reviews
    { userEmail: 'student1@kth.se', courseCode: 'SF1672', yearTaken: 2024, datePostedOffset: 7, ratingProfessor: 4, ratingMaterial: 4, ratingPeers: 3, ratingWorkload: 'medium', content: 'Standard linear algebra course. Well taught.', tagNames: ['Clear explanations'] },
    { userEmail: 'student2@kth.se', courseCode: 'SF1672', yearTaken: 2023, datePostedOffset: 40, ratingProfessor: 3, ratingMaterial: 3, ratingPeers: 4, ratingWorkload: 'light', content: 'Basic math course. Nothing special.', tagNames: [] },
    { userEmail: 'master1@kth.se', courseCode: 'SF1672', yearTaken: 2022, datePostedOffset: 90, ratingProfessor: 5, ratingMaterial: 5, ratingPeers: 4, ratingWorkload: 'light', content: 'Excellent professor. Made linear algebra interesting.', tagNames: ['Helpful professor', 'Engaging lectures'] },

    // SF1625 reviews
    { userEmail: 'student2@kth.se', courseCode: 'SF1625', yearTaken: 2024, datePostedOffset: 4, ratingProfessor: 4, ratingMaterial: 4, ratingPeers: 3, ratingWorkload: 'medium', content: 'Good calculus course. Fair exams.', tagNames: ['Well-structured'] },
    { userEmail: 'master2@kth.se', courseCode: 'SF1625', yearTaken: 2023, datePostedOffset: 35, ratingProfessor: 3, ratingMaterial: 2, ratingPeers: 3, ratingWorkload: 'heavy', content: 'Too much material in too little time.', tagNames: ['Heavy workload', 'Poor organization'] },

    // EP1200 reviews
    { userEmail: 'student2@kth.se', courseCode: 'EP1200', yearTaken: 2024, datePostedOffset: 6, ratingProfessor: 4, ratingMaterial: 5, ratingPeers: 4, ratingWorkload: 'medium', content: 'Solid introduction to electrical engineering.', tagNames: ['Clear explanations', 'Good labs'] },
    { userEmail: 'master2@kth.se', courseCode: 'EP1200', yearTaken: 2023, datePostedOffset: 50, ratingProfessor: 5, ratingMaterial: 4, ratingPeers: 4, ratingWorkload: 'light', content: 'Great course with practical labs.', tagNames: ['Practical assignments'] },
    { userEmail: 'ms7@kth.se', courseCode: 'EP1200', yearTaken: 2022, datePostedOffset: 100, ratingProfessor: 3, ratingMaterial: 3, ratingPeers: 3, ratingWorkload: 'medium', content: 'Average course. Could be better organized.', tagNames: ['Poor organization'] },

    // ID2201 reviews
    { userEmail: 'ms4@kth.se', courseCode: 'ID2201', yearTaken: 2024, datePostedOffset: 8, ratingProfessor: 5, ratingMaterial: 4, ratingPeers: 5, ratingWorkload: 'heavy', content: 'Challenging distributed systems course. Very relevant.', tagNames: ['Practical assignments', 'Heavy workload'] },
    { userEmail: 'ms1@kth.se', courseCode: 'ID2201', yearTaken: 2023, datePostedOffset: 28, ratingProfessor: 4, ratingMaterial: 5, ratingPeers: 4, ratingWorkload: 'medium', content: 'Good course on distributed systems concepts.', tagNames: ['Well-structured'] },

    // ID2202 reviews
    { userEmail: 'ms4@kth.se', courseCode: 'ID2202', yearTaken: 2024, datePostedOffset: 12, ratingProfessor: 4, ratingMaterial: 4, ratingPeers: 3, ratingWorkload: 'medium', content: 'Solid database course. Good mix of theory and practice.', tagNames: ['Practical assignments'] },
    { userEmail: 'master3@kth.se', courseCode: 'ID2202', yearTaken: 2023, datePostedOffset: 38, ratingProfessor: 3, ratingMaterial: 3, ratingPeers: 4, ratingWorkload: 'light', content: 'Basic database concepts. Could go deeper.', tagNames: ['Too theoretical'] },

    // ID2203 reviews
    { userEmail: 'ms5@kth.se', courseCode: 'ID2203', yearTaken: 2024, datePostedOffset: 9, ratingProfessor: 5, ratingMaterial: 5, ratingPeers: 4, ratingWorkload: 'heavy', content: 'Excellent operating systems course. Very challenging but rewarding.', tagNames: ['Practical assignments', 'Heavy workload', 'Clear explanations'] },
    { userEmail: 'ms2@kth.se', courseCode: 'ID2203', yearTaken: 2023, datePostedOffset: 42, ratingProfessor: 4, ratingMaterial: 4, ratingPeers: 5, ratingWorkload: 'medium', content: 'Good course with interesting projects.', tagNames: ['Good labs'] },

    // EL1000 reviews
    { userEmail: 'ms5@kth.se', courseCode: 'EL1000', yearTaken: 2024, datePostedOffset: 11, ratingProfessor: 4, ratingMaterial: 4, ratingPeers: 3, ratingWorkload: 'medium', content: 'Control systems course. Well structured.', tagNames: ['Well-structured'] },
    { userEmail: 'ms7@kth.se', courseCode: 'EL1000', yearTaken: 2023, datePostedOffset: 55, ratingProfessor: 3, ratingMaterial: 2, ratingPeers: 3, ratingWorkload: 'heavy', content: 'Difficult course with outdated material.', tagNames: ['Outdated material', 'Difficult exams'] },

    // ME1003 reviews
    { userEmail: 'ms6@kth.se', courseCode: 'ME1003', yearTaken: 2024, datePostedOffset: 15, ratingProfessor: 4, ratingMaterial: 5, ratingPeers: 4, ratingWorkload: 'light', content: 'Interesting industrial economics course.', tagNames: ['Engaging lectures'] },
    { userEmail: 'student3@kth.se', courseCode: 'ME1003', yearTaken: 2023, datePostedOffset: 65, ratingProfessor: 3, ratingMaterial: 3, ratingPeers: 3, ratingWorkload: 'light', content: 'Basic economics course. Nothing special.', tagNames: [] },

    // ME1004 reviews
    { userEmail: 'ms6@kth.se', courseCode: 'ME1004', yearTaken: 2024, datePostedOffset: 18, ratingProfessor: 5, ratingMaterial: 4, ratingPeers: 5, ratingWorkload: 'medium', content: 'Great product development course with real projects.', tagNames: ['Practical assignments', 'Helpful professor'] },

    // Additional reviews for more coverage
    { userEmail: 'master4@kth.se', courseCode: 'ID1020', yearTaken: 2024, datePostedOffset: 14, ratingProfessor: 5, ratingMaterial: 5, ratingPeers: 4, ratingWorkload: 'heavy', content: 'Excellent algorithms course. Very challenging but worth it.', tagNames: ['Clear explanations', 'Heavy workload', 'Practical assignments'] },
    { userEmail: 'master1@kth.se', courseCode: 'ID1020', yearTaken: 2023, datePostedOffset: 48, ratingProfessor: 4, ratingMaterial: 4, ratingPeers: 5, ratingWorkload: 'medium', content: 'Good course on algorithms and data structures.', tagNames: ['Well-structured'] },

    { userEmail: 'ms3@kth.se', courseCode: 'DD2431', yearTaken: 2024, datePostedOffset: 16, ratingProfessor: 4, ratingMaterial: 4, ratingPeers: 4, ratingWorkload: 'medium', content: 'Solid AI course covering various topics.', tagNames: ['Well-structured'] },
    { userEmail: 'ms1@kth.se', courseCode: 'DD2431', yearTaken: 2023, datePostedOffset: 32, ratingProfessor: 3, ratingMaterial: 3, ratingPeers: 3, ratingWorkload: 'light', content: 'Broad overview of AI. Could be more in-depth.', tagNames: ['Too theoretical'] },

    { userEmail: 'master2@kth.se', courseCode: 'EL1001', yearTaken: 2023, datePostedOffset: 58, ratingProfessor: 4, ratingMaterial: 4, ratingPeers: 3, ratingWorkload: 'medium', content: 'Good electronics course with hands-on labs.', tagNames: ['Good labs'] },
    { userEmail: 'ms7@kth.se', courseCode: 'EL1001', yearTaken: 2022, datePostedOffset: 120, ratingProfessor: 3, ratingMaterial: 2, ratingPeers: 3, ratingWorkload: 'heavy', content: 'Found the course difficult and poorly organized.', tagNames: ['Poor organization', 'Difficult exams'] },

    { userEmail: 'student3@kth.se', courseCode: 'SF1626', yearTaken: 2024, datePostedOffset: 19, ratingProfessor: 4, ratingMaterial: 4, ratingPeers: 3, ratingWorkload: 'medium', content: 'Multivariable calculus. Standard math course.', tagNames: ['Clear explanations'] },
    { userEmail: 'master1@kth.se', courseCode: 'SF1626', yearTaken: 2023, datePostedOffset: 52, ratingProfessor: 5, ratingMaterial: 5, ratingPeers: 4, ratingWorkload: 'light', content: 'Excellent professor made this course enjoyable.', tagNames: ['Helpful professor', 'Engaging lectures'] },

    { userEmail: 'master2@kth.se', courseCode: 'SF1912', yearTaken: 2023, datePostedOffset: 70, ratingProfessor: 4, ratingMaterial: 4, ratingPeers: 4, ratingWorkload: 'medium', content: 'Good probability and statistics course.', tagNames: ['Well-structured'] },
    { userEmail: 'ms3@kth.se', courseCode: 'SF1912', yearTaken: 2022, datePostedOffset: 110, ratingProfessor: 3, ratingMaterial: 3, ratingPeers: 3, ratingWorkload: 'heavy', content: 'Challenging course. Exams were difficult.', tagNames: ['Difficult exams', 'Heavy workload'] },
];

const FEEDBACK_ENTRIES: FeedbackSeed[] = [
    { userEmail: 'student1@kth.se', content: 'Great platform! Really helpful for choosing courses.', createdAtOffset: 10 },
    { userEmail: 'ms3@kth.se', content: 'Would love to see more filters for searching reviews.', createdAtOffset: 5 },
    { content: 'The UI could be improved. Some pages are hard to navigate.', createdAtOffset: 2 }, // Anonymous
    { userEmail: 'master1@kth.se', content: 'Thanks for building this! Very useful for planning my studies.', createdAtOffset: 15 },
    { content: 'Found a bug in the review form. Will report separately.', createdAtOffset: 1 }, // Anonymous
];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

async function seedPrograms(tx: Transaction): Promise<Map<string, { id: number; code: string }>> {
    const programMap = new Map<string, { id: number; code: string }>();

    for (const program of PROGRAMS) {
        const [inserted] = await tx.insert(schema.program).values({
            name: program.name,
            code: program.code,
            programType: program.type,
            credits: program.credits,
            hasIntegratedMasters: program.hasIntegratedMasters ?? false,
        }).onConflictDoUpdate({
            target: schema.program.code,
            set: {
                name: program.name,
                credits: program.credits,
                hasIntegratedMasters: program.hasIntegratedMasters ?? false,
            }
        }).returning();

        programMap.set(program.code, { id: inserted.id, code: inserted.code });
    }

    console.log(`✓ Seeded ${programMap.size} programs`);
    return programMap;
}

async function seedSpecializations(
    tx: Transaction,
    programMap: Map<string, { id: number; code: string }>
): Promise<Map<string, { id: number; name: string; programId: number }>> {
    const specializationMap = new Map<string, { id: number; name: string; programId: number }>();

    for (const spec of SPECIALIZATIONS) {
        const program = programMap.get(spec.programCode);
        if (!program) {
            console.warn(`⚠ Skipping specialization ${spec.name} - program ${spec.programCode} not found`);
            continue;
        }

        const [inserted] = await tx.insert(schema.specialization).values({
            name: spec.name,
            programId: program.id,
        }).onConflictDoNothing().returning();

        if (inserted) {
            specializationMap.set(`${spec.programCode}:${spec.name}`, {
                id: inserted.id,
                name: inserted.name,
                programId: inserted.programId,
            });
        } else {
            // Fetch existing
            const existing = await tx.query.specialization.findFirst({
                where: and(
                    eq(schema.specialization.name, spec.name),
                    eq(schema.specialization.programId, program.id)
                ),
            });
            if (existing) {
                specializationMap.set(`${spec.programCode}:${spec.name}`, {
                    id: existing.id,
                    name: existing.name,
                    programId: existing.programId,
                });
            }
        }
    }

    console.log(`✓ Seeded ${specializationMap.size} specializations`);
    return specializationMap;
}

async function seedCourses(tx: Transaction): Promise<Map<string, { id: number; code: string }>> {
    const courseMap = new Map<string, { id: number; code: string }>();

    for (const course of COURSES) {
        const [inserted] = await tx.insert(schema.course).values({
            name: course.name,
            code: course.code,
        }).onConflictDoUpdate({
            target: schema.course.code,
            set: { name: course.name }
        }).returning();

        courseMap.set(course.code, { id: inserted.id, code: inserted.code });
    }

    console.log(`✓ Seeded ${courseMap.size} courses`);
    return courseMap;
}

async function seedCoursePrograms(
    tx: Transaction,
    courseMap: Map<string, { id: number; code: string }>,
    programMap: Map<string, { id: number; code: string }>
): Promise<void> {
    let count = 0;

    for (const link of COURSE_PROGRAM_LINKS) {
        const course = courseMap.get(link.courseCode);
        const program = programMap.get(link.programCode);

        if (!course || !program) {
            console.warn(`⚠ Skipping course-program link: ${link.courseCode} → ${link.programCode}`);
            continue;
        }

        await tx.insert(schema.courseProgram).values({
            courseId: course.id,
            programId: program.id,
        }).onConflictDoNothing();
        count++;
    }

    console.log(`✓ Linked ${count} courses to programs`);
}

async function seedCourseSpecializations(
    tx: Transaction,
    courseMap: Map<string, { id: number; code: string }>,
    specializationMap: Map<string, { id: number; name: string; programId: number }>
): Promise<void> {
    let count = 0;

    for (const link of COURSE_SPECIALIZATION_LINKS) {
        const course = courseMap.get(link.courseCode);
        const specKey = `${link.programCode}:${link.specializationName}`;
        const specialization = specializationMap.get(specKey);

        if (!course || !specialization) {
            console.warn(`⚠ Skipping course-specialization link: ${link.courseCode} → ${link.specializationName}`);
            continue;
        }

        await tx.insert(schema.courseSpecialization).values({
            courseId: course.id,
            specializationId: specialization.id,
        }).onConflictDoNothing();
        count++;
    }

    console.log(`✓ Linked ${count} courses to specializations`);
}

async function seedTags(tx: Transaction): Promise<Map<string, { id: number; name: string }>> {
    const tagMap = new Map<string, { id: number; name: string }>();

    for (const tag of TAGS) {
        const [inserted] = await tx.insert(schema.tag).values({
            name: tag.name,
            sentiment: tag.sentiment,
        }).onConflictDoNothing().returning();

        if (inserted) {
            tagMap.set(tag.name, { id: inserted.id, name: inserted.name });
        } else {
            const existing = await tx.query.tag.findFirst({
                where: eq(schema.tag.name, tag.name),
            });
            if (existing) {
                tagMap.set(tag.name, { id: existing.id, name: existing.name });
            }
        }
    }

    console.log(`✓ Seeded ${tagMap.size} tags`);
    return tagMap;
}

async function seedUsers(
    tx: Transaction,
    programMap: Map<string, { id: number; code: string }>,
    specializationMap: Map<string, { id: number; name: string; programId: number }>
): Promise<Map<string, { id: string; email: string }>> {
    const userMap = new Map<string, { id: string; email: string }>();
    const hashedPassword = '$2b$12$DLu1O49pr9sw4d7/tpnXz.V0Z0xAS8T6Au3WMhIZcUjW6mqEaDmxq'; // "password"

    for (const userSeed of USERS) {
        // Check if user already exists
        const existing = await tx.query.user.findFirst({
            where: eq(schema.user.email, userSeed.email),
        });

        if (existing) {
            userMap.set(userSeed.email, { id: existing.id, email: existing.email });
            continue;
        }

        // Validate program references
        let programId: number | undefined;
        let mastersDegreeId: number | undefined;
        let specializationId: number | undefined;

        if (userSeed.programCode) {
            const program = programMap.get(userSeed.programCode);
            if (!program) {
                console.warn(`⚠ Skipping user ${userSeed.email} - program ${userSeed.programCode} not found`);
                continue;
            }
            programId = program.id;
        }

        if (userSeed.mastersDegreeCode) {
            const mastersProgram = programMap.get(userSeed.mastersDegreeCode);
            if (!mastersProgram) {
                console.warn(`⚠ Skipping user ${userSeed.email} - master's program ${userSeed.mastersDegreeCode} not found`);
                continue;
            }
            mastersDegreeId = mastersProgram.id;

            // Validate specialization if provided
            if (userSeed.specializationName) {
                const specKey = `${userSeed.mastersDegreeCode}:${userSeed.specializationName}`;
                const specialization = specializationMap.get(specKey);
                if (!specialization) {
                    console.warn(`⚠ Skipping user ${userSeed.email} - specialization ${userSeed.specializationName} not found`);
                    continue;
                }
                specializationId = specialization.id;
            }
        }

        // Insert user
        const [user] = await tx.insert(schema.user).values({
            email: userSeed.email,
            programId: programId ?? null,
            mastersDegreeId: mastersDegreeId ?? null,
            specializationId: specializationId ?? null,
            emailVerified: new Date(),
            password: hashedPassword,
        }).returning();

        // Generate username
        const programCode = userSeed.programCode || userSeed.mastersDegreeCode || 'USER';
        await tx.update(schema.user)
            .set({ username: `${programCode}${user.id.substring(0, 6)}` })
            .where(eq(schema.user.id, user.id));

        userMap.set(userSeed.email, { id: user.id, email: user.email });
    }

    console.log(`✓ Seeded ${userMap.size} users`);
    return userMap;
}

async function seedReviews(
    tx: Transaction,
    userMap: Map<string, { id: string; email: string }>,
    courseMap: Map<string, { id: number; code: string }>,
    tagMap: Map<string, { id: number; name: string }>
): Promise<void> {
    let count = 0;
    let skipped = 0;

    for (const review of REVIEWS) {
        const user = userMap.get(review.userEmail);
        const course = courseMap.get(review.courseCode);

        if (!user || !course) {
            console.warn(`⚠ Skipping review: user ${review.userEmail} or course ${review.courseCode} not found`);
            skipped++;
            continue;
        }

        // Check if review already exists (one review per user per course)
        const existingReview = await tx.query.post.findFirst({
            where: and(
                eq(schema.post.userId, user.id),
                eq(schema.post.courseId, course.id)
            ),
        });

        if (existingReview) {
            skipped++;
            continue;
        }

        // Validate tag count (max 3)
        const tagIds: number[] = [];
        if (review.tagNames && review.tagNames.length > 0) {
            for (const tagName of review.tagNames.slice(0, 3)) {
                const tag = tagMap.get(tagName);
                if (tag) {
                    tagIds.push(tag.id);
                }
            }
        }

        // Calculate date posted
        const datePosted = new Date(Date.now() - review.datePostedOffset * 24 * 60 * 60 * 1000);

        // Insert review
        const [post] = await tx.insert(schema.post).values({
            userId: user.id,
            courseId: course.id,
            datePosted,
            yearTaken: review.yearTaken,
            ratingProfessor: review.ratingProfessor,
            ratingMaterial: review.ratingMaterial,
            ratingPeers: review.ratingPeers,
            ratingWorkload: review.ratingWorkload,
            content: review.content,
        }).returning();

        // Insert tags
        if (tagIds.length > 0) {
            await tx.insert(schema.postTags).values(
                tagIds.map(tagId => ({
                    postId: post.id,
                    tagId,
                }))
            ).onConflictDoNothing();
        }

        count++;
    }

    console.log(`✓ Seeded ${count} reviews (${skipped} skipped - already exist)`);
}

async function seedFeedback(
    tx: Transaction,
    userMap: Map<string, { id: string; email: string }>
): Promise<void> {
    let count = 0;

    for (const feedback of FEEDBACK_ENTRIES) {
        let userId: string | null = null;

        if (feedback.userEmail) {
            const user = userMap.get(feedback.userEmail);
            if (user) {
                userId = user.id;
            }
        }

        const createdAt = new Date(Date.now() - feedback.createdAtOffset * 24 * 60 * 60 * 1000);

        await tx.insert(schema.feedback).values({
            userId: userId ?? null,
            content: feedback.content,
            createdAt,
        });

        count++;
    }

    console.log(`✓ Seeded ${count} feedback entries`);
}

// ==========================================
// MAIN FUNCTION
// ==========================================

async function main() {
    console.log('--- Seeding Database ---\n');

    try {
        await db.transaction(async (tx) => {
            // Seed in dependency order
            const programs = await seedPrograms(tx);
            const specializations = await seedSpecializations(tx, programs);
            const courses = await seedCourses(tx);
            await seedCoursePrograms(tx, courses, programs);
            await seedCourseSpecializations(tx, courses, specializations);
            const tags = await seedTags(tx);
            const users = await seedUsers(tx, programs, specializations);
            await seedReviews(tx, users, courses, tags);
            await seedFeedback(tx, users);

            console.log('\n✅ Seed completed successfully.');
        });
    } catch (error) {
        console.error('\n❌ Seed failed. All changes rolled back.');
        console.error(error);
        process.exit(1);
    }

    process.exit(0);
}

main();
