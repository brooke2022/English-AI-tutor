export interface Review {
  id: string;
  studentName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Teacher {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  avatar: string;
  tags: string[];
  price: number;
  trialPrice: number;
  rating: number;
  reviewCount: number;
  timezone: string;
  intro: string;
  videoUrl: string;
  availableSlots: string[];
  reviews?: Review[];
  yearsExp?: number;
  education?: string;
  weeklySlots?: string[];
  whatsapp?: string;
}

export interface BookedLesson {
  id: string;
  tutorId: string;
  time: string;
  type: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
  timezone: string;
  createdAt: string;
}

export interface TeacherListing extends Teacher {
  userId?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
}

export interface StudentProfile extends User {
  role: 'student';
  nativeLanguage?: string;
  learningGoals: string[];
  totalHours: number;
  favoriteTutorIds: string[];
}

export interface TeacherProfile extends User {
  role: 'teacher';
  country: string;
  countryCode: string;
  tags: string[];
  price: number;
  trialPrice: number;
  rating: number;
  reviewCount: number;
  intro: string;
  videoUrl: string;
  availableSlots: string[];
  monthlyEarnings: number;
}

export interface RegisterStudentData {
  name: string;
  email: string;
  password: string;
  nativeLanguage?: string;
  learningGoals: string[];
}

export interface RegisterTeacherData {
  name: string;
  email: string;
  password: string;
  country: string;
  timezone: string;
  tags: string[];
  price: number;
  trialPrice: number;
  intro: string;
}
