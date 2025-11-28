
export interface User {
  name: string;
  email: string;
  avatarUrl: string;
  title: string;
  bio: string;
  id?: number;
  role: 'user' | 'mentor';
}

export interface Skill {
  name: string;
  level: number; // 0-100
}

export interface Project {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  tags: string[];
}

export interface Certificate {
  id: number;
  title: string;
  issuer: string;
  date: string;
  imageUrl: string;
}

export interface AssessmentQuestion {
  id: number;
  category: 'Soft Skills' | 'Digital Skills' | 'Workplace Readiness';
  question: string;
}

export interface AnalyticsData {
  profileViews: { date: string; views: number }[];
  projectClicks: { name: string; clicks: number }[];
  skillDistribution: { name: string; value: number }[];
}

export type ReviewStatus = 'pending' | 'in_progress' | 'completed';

export interface ReviewRequest {
  id: number;
  menteeName: string;
  menteeEmail: string;
  portfolioUrl: string;
  status: ReviewStatus;
  createdAt: string;
  notes?: string;
  paymentStatus?: 'waiting_verification' | 'approved' | 'rejected';
  paymentAmount?: number;
  paymentBank?: string;
  paymentAccountName?: string;
  paymentProofImage?: string;
  mentorFeedback?: string;
}
