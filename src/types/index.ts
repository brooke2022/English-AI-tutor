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
}

export interface BookedLesson {
  id: string;
  tutorId: string;
  time: string;
  type: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}
