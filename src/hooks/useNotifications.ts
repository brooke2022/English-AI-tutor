import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../lib/api';
import { connectSocket, disconnectSocket } from '../lib/socket';

export interface Notification {
  id: string;
  type: 'BOOKING_CREATED' | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'LESSON_REMINDER';
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiGet<Notification[]>('/notifications'),
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPost(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiPost('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

/** Subscribe to realtime notifications. Mount once near the root. */
export function useRealtimeNotifications(enabled: boolean) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    const sock = connectSocket();
    if (!sock) return;

    const onNotification = () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['bookings'] });
    };
    sock.on('notification', onNotification);

    return () => {
      sock.off('notification', onNotification);
      disconnectSocket();
    };
  }, [enabled, qc]);
}
