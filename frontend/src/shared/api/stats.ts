import { useQuery } from "@tanstack/react-query";

import { apiClient } from "./client";

export type StatsBlock = {
  total: number;
  active?: number | null;
  new?: number | null;
  warning?: string | null;
};

export type StatsPayments = {
  totalKopeks: number;
  totalRubles: number;
  todayKopeks: number;
  todayRubles: number;
};

export type StatsOverview = {
  users: StatsBlock;
  subscriptions: StatsBlock;
  support: StatsBlock;
  payments: StatsPayments;
  meta: Record<string, unknown>;
};

const normalizeStatsBlock = (raw: any): StatsBlock => ({
  total: raw?.total ?? 0,
  active: raw?.active ?? null,
  new: raw?.new ?? raw?.delta ?? null,
  warning: raw?.warning ?? null
});

const normalizePayments = (raw: any): StatsPayments => ({
  totalKopeks: raw?.total_kopeks ?? 0,
  totalRubles: raw?.total_rubles ?? (raw?.total_kopeks ? raw.total_kopeks / 100 : 0),
  todayKopeks: raw?.today_kopeks ?? 0,
  todayRubles: raw?.today_rubles ?? (raw?.today_kopeks ? raw.today_kopeks / 100 : 0)
});

export const fetchStatsOverview = async (): Promise<StatsOverview> => {
  const response = await apiClient.get("/v1/stats/overview");
  const payload = response.data ?? {};

  return {
    users: normalizeStatsBlock(payload.users),
    subscriptions: normalizeStatsBlock(payload.subscriptions),
    support: normalizeStatsBlock(payload.support),
    payments: normalizePayments(payload.payments),
    meta: payload.meta ?? {}
  };
};

export const useStatsOverview = () =>
  useQuery({
    queryKey: ["stats", "overview"],
    queryFn: fetchStatsOverview,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false
  });
