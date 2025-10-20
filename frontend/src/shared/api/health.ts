import { useQuery } from "@tanstack/react-query";

import { apiClient } from "./client";

export type HealthComponents = Record<string, boolean>;
export type HealthFeatures = Record<string, boolean>;

export type HealthStatus = {
  status: string;
  apiVersion: string | null;
  botVersion: string | null;
  components: HealthComponents;
  features: HealthFeatures;
  latencyMs: number;
};

export const fetchHealthStatus = async (): Promise<HealthStatus> => {
  const response = await apiClient.get("/v1/health");
  const payload = response.data ?? {};

  return {
    status: payload.status ?? "unknown",
    apiVersion: payload.api_version ?? null,
    botVersion: payload.bot_version ?? null,
    components: payload.components ?? {},
    features: payload.features ?? {},
    latencyMs: payload.latency_ms ?? 0
  };
};

export const useHealthStatus = () =>
  useQuery({
    queryKey: ["health"],
    queryFn: fetchHealthStatus,
    staleTime: 15 * 1000,
    refetchInterval: 15 * 1000
  });
