import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut } from '../lib/api';
import { Teacher, Review } from '../types';

interface ApiTeacherListItem {
  id: string;
  name: string;
  avatar: string | null;
  timezone: string;
  country: string;
  countryCode: string;
  intro: string;
  yearsExp: number | null;
  education: string | null;
  hourlyRate: string | number;
  trialPrice: string | number;
  videoUrl: string | null;
  whatsapp: string | null;
  ratingAvg: string | number | null;
  reviewCount: number;
  status: string;
  tags: string[];
}

interface ApiTeacherDetail extends ApiTeacherListItem {
  weeklySlots: string[]; // ["1-9", "2-14", ...]
  availableSlots: string[]; // ISO UTC
  reviews: Array<{
    id: string;
    studentName: string;
    rating: number;
    comment: string | null;
    date: string;
  }>;
}

interface TeachersResponse {
  data: ApiTeacherListItem[];
  total: number;
  page: number;
  pageSize: number;
}

function toTeacher(t: ApiTeacherListItem): Teacher {
  return {
    id: t.id,
    name: t.name,
    country: t.country,
    countryCode: t.countryCode,
    avatar: t.avatar ?? '',
    tags: t.tags,
    price: Number(t.hourlyRate),
    trialPrice: Number(t.trialPrice),
    rating: t.ratingAvg ? Number(t.ratingAvg) : 0,
    reviewCount: t.reviewCount,
    timezone: t.timezone,
    intro: t.intro,
    videoUrl: t.videoUrl ?? '',
    availableSlots: [],
    yearsExp: t.yearsExp ?? undefined,
    education: t.education ?? undefined,
    whatsapp: t.whatsapp ?? undefined,
  };
}

function toTeacherDetail(t: ApiTeacherDetail): Teacher {
  return {
    ...toTeacher(t),
    availableSlots: t.availableSlots,
    weeklySlots: t.weeklySlots,
    reviews: t.reviews.map<Review>((r) => ({
      id: r.id,
      studentName: r.studentName,
      rating: r.rating,
      comment: r.comment ?? '',
      date: r.date,
    })),
  };
}

export function useTeachers(params?: { search?: string; tag?: string }) {
  return useQuery({
    queryKey: ['teachers', params ?? {}],
    queryFn: async () => {
      const data = await apiGet<TeachersResponse>('/teachers', { params });
      return data.data.map(toTeacher);
    },
  });
}

export function useTeacher(id: string | undefined) {
  return useQuery({
    queryKey: ['teacher', id],
    queryFn: () => apiGet<ApiTeacherDetail>(`/teachers/${id}`).then(toTeacherDetail),
    enabled: !!id,
  });
}

export function useSetAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slots: Array<{ dayOfWeek: number; hour: number }>) =>
      apiPut('/teachers/me/availability', { slots }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher'] });
      qc.invalidateQueries({ queryKey: ['users', 'me'] });
    },
  });
}
