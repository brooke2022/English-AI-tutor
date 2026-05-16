import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../lib/api';

export interface BookingDto {
  id: string;
  studentId: string;
  teacherId: string;
  slotTime: string;
  type: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  meetingUrl?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  student: { id: string; name: string; email: string; avatarUrl?: string | null };
  teacherProfile: { userId: string; user: { id: string; name: string; email: string; avatarUrl?: string | null }; country: string };
}

export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: () => apiGet<BookingDto[]>('/bookings'),
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { teacherId: string; slotTime: string; type?: string }) =>
      apiPost<BookingDto>('/bookings', input),
    onSuccess: (booking) => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['teacher', booking.teacherId] });
    },
  });
}

export function useAcceptBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; meetingUrl: string }) =>
      apiPost<BookingDto>(`/bookings/${input.id}/accept`, { meetingUrl: input.meetingUrl }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
}

export function useRejectBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; reason: string }) =>
      apiPost<BookingDto>(`/bookings/${input.id}/reject`, { reason: input.reason }),
    onSuccess: (booking) => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['teacher', booking.teacherId] });
    },
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPost<BookingDto>(`/bookings/${id}/cancel`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
}
