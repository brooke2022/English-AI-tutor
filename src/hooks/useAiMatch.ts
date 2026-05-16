import { useMutation } from '@tanstack/react-query';
import { apiPost } from '../lib/api';

export interface MatchResponse {
  teacherIds: string[];
  reasoning: string;
}

export function useAiMatch() {
  return useMutation({
    mutationFn: (input: { goals: string; level?: string }) =>
      apiPost<MatchResponse>('/ai/match', input),
  });
}
