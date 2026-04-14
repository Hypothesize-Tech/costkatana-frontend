import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { decisionsService } from "@/services/decisions.service";
import type {
  DecisionContext,
  DecisionListFilters,
  SavingsSummary,
} from "@/types/decision.types";

const DECISIONS_KEY = "decisions";

export function useTopDecision() {
  return useQuery<{ decision: DecisionContext | null }>(
    [DECISIONS_KEY, "top"],
    () => decisionsService.getTop(),
    {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );
}

export function useDecisionQueue(filters: DecisionListFilters = {}) {
  return useQuery<DecisionContext[]>(
    [DECISIONS_KEY, "list", filters],
    () => decisionsService.list(filters),
    {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );
}

export function useSavingsSummary(sinceDays = 30) {
  return useQuery<SavingsSummary>(
    [DECISIONS_KEY, "savings-summary", sinceDays],
    () => decisionsService.savingsSummary(sinceDays),
    {
      staleTime: 300_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );
}

export function useApplyDecision() {
  const queryClient = useQueryClient();
  return useMutation((id: string) => decisionsService.apply(id), {
    onSuccess: () => {
      queryClient.invalidateQueries([DECISIONS_KEY]);
    },
  });
}

export function useDismissDecision() {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, reason }: { id: string; reason?: string }) =>
      decisionsService.dismiss(id, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([DECISIONS_KEY]);
      },
    },
  );
}

export function useSnoozeDecision() {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, durationMs }: { id: string; durationMs?: number }) =>
      decisionsService.snooze(id, durationMs),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([DECISIONS_KEY]);
      },
    },
  );
}
