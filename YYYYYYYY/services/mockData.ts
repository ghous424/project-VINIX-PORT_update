
import { User, Project, Certificate, Skill, AssessmentQuestion, AnalyticsData } from '../types';

export const mockUser: User = {
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  avatarUrl: 'https://picsum.photos/seed/user1/200/200',
  title: 'Frontend Developer & UI/UX Enthusiast',
  bio: 'isi tentang anda.......',
  role: 'user',
};

export const mockSkills: Skill[] = [
  { name: 'React', level: 90 },
  { name: 'TypeScript', level: 85 },
  { name: 'Tailwind CSS', level: 95 },
  { name: 'Node.js', level: 70 },
  { name: 'UI/UX Design', level: 80 },
  { name: 'SQL', level: 65 },
];

export const mockProjects: Project[] = [];

export const mockCertificates: Certificate[] = [];

export const mockAssessmentQuestions: AssessmentQuestion[] = [
    // Bagian 1: Soft Skills
    { id: 1, category: 'Soft Skills', question: "Saya dapat mengomunikasikan ide saya dengan jelas kepada orang lain." },
    { id: 2, category: 'Soft Skills', question: "Saya mampu bekerja sama dengan anggota tim yang baru saya kenal." },
    { id: 3, category: 'Soft Skills', question: "Saya dapat menyelesaikan konflik dalam tim dengan cara yang baik." },
    { id: 4, category: 'Soft Skills', question: "Saya mampu mengatur waktu ketika memiliki banyak tugas sekaligus." },
    { id: 5, category: 'Soft Skills', question: "Saya dapat mengambil keputusan dengan cepat saat situasi mendesak." },
    
    // Bagian 2: Basic Digital Skills
    { id: 6, category: 'Digital Skills', question: "Saya terbiasa menggunakan tools digital seperti Google Docs, Sheets, atau Drive." },
    { id: 7, category: 'Digital Skills', question: "Saya mampu mengikuti arahan tugas atau instruksi mentor yang berbentuk digital (PDF, Notion, GDrive)." },
    { id: 8, category: 'Digital Skills', question: "Saya dapat mengorganisir file dan dokumen digital dengan rapi." },
    { id: 9, category: 'Digital Skills', question: "Saya mampu mencari informasi atau referensi di internet secara efektif." },
    { id: 10, category: 'Digital Skills', question: "Saya dapat menggunakan platform komunikasi digital (Zoom, WhatsApp Group, Slack) dengan lancar." },

    // Bagian 3: Workplace Readiness
    { id: 11, category: 'Workplace Readiness', question: "Saya biasanya menyelesaikan tugas sebelum atau tepat waktu." },
    { id: 12, category: 'Workplace Readiness', question: "Saya bisa menerima feedback (kritik/saran) dengan baik dan memperbaikinya." },
    { id: 13, category: 'Workplace Readiness', question: "Saya cepat beradaptasi ketika diberi tugas baru yang belum pernah saya lakukan." },
    { id: 14, category: 'Workplace Readiness', question: "Saya dapat bekerja secara mandiri tanpa harus selalu diarahkan." },
    { id: 15, category: 'Workplace Readiness', question: "Saya memiliki motivasi tinggi untuk mengembangkan skill baru." }
];


export const mockAnalyticsData: AnalyticsData = {
    profileViews: [
        { date: '2024-07-01', views: 15 },
        { date: '2024-07-02', views: 22 },
        { date: '2024-07-03', views: 30 },
        { date: '2024-07-04', views: 25 },
        { date: '2024-07-05', views: 40 },
        { date: '2024-07-06', views: 35 },
        { date: '2024-07-07', views: 50 },
    ],
    projectClicks: [
        { name: 'E-commerce Platform', clicks: 120 },
        { name: 'Data Viz Dashboard', clicks: 95 },
        { name: 'Mobile Banking App', clicks: 80 },
    ],
    skillDistribution: mockSkills.map(skill => ({name: skill.name, value: skill.level})),
};
