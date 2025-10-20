import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@shared/api/client";

export type SubscriptionListFilters = {
  limit?: number;
  offset?: number;
  status?: string | null;
  userId?: number | null;
  isTrial?: boolean | null;
};

export type Subscription = {
  id: number;
  userId: number;
  status?: string | null;
  planId?: number | null;
  isTrial?: boolean | null;
  startedAt?: string | null;
  expiresAt?: string | null;
  trafficLimitGb?: number | null;
  trafficUsedGb?: number | null;
  deviceLimit?: number | null;
};

export type SubscriptionListResponse = {
  items: Subscription[];
  total: number;
  limit: number;
  offset: number;
};

export type SubscriptionDetail = Subscription & {
  plan?: {
    id?: number | null;
    name?: string | null;
    trafficLimitGb?: number | null;
    deviceLimit?: number | null;
  } | null;
};

export type SubscriptionUpdatePayload = {
  status?: string;
  planId?: number;
  expiresAt?: string;
  deviceLimit?: number;
  trafficLimitGb?: number;
};

const normalizeSubscription = (raw: any): Subscription => ({
  id: raw?.id,
  userId: raw?.user_id ?? raw?.userId,
  status: raw?.status ?? null,
  planId: raw?.plan_id ?? raw?.planId ?? null,
  isTrial: raw?.is_trial ?? raw?.isTrial ?? null,
  startedAt: raw?.started_at ?? raw?.startedAt ?? null,
  expiresAt: raw?.expires_at ?? raw?.expiresAt ?? null,
  trafficLimitGb: raw?.traffic_limit_gb ?? raw?.trafficLimitGb ?? null,
  trafficUsedGb: raw?.traffic_used_gb ?? raw?.trafficUsedGb ?? null,
  deviceLimit: raw?.device_limit ?? raw?.deviceLimit ?? null
});

const normalizeDetail = (raw: any): SubscriptionDetail => ({
  ...normalizeSubscription(raw),
  plan: raw?.plan
    ? {
        id: raw.plan?.id ?? null,
        name: raw.plan?.name ?? null,
        trafficLimitGb: raw.plan?.traffic_limit_gb ?? raw.plan?.trafficLimitGb ?? null,
        deviceLimit: raw.plan?.device_limit ?? raw.plan?.deviceLimit ?? null
      }
    : null
});

export const fetchSubscriptions = async (filters: SubscriptionListFilters): Promise<SubscriptionListResponse> => {
  const response = await apiClient.get("/v1/subscriptions", {
    params: {
      limit: filters.limit,
      offset: filters.offset,
      status: filters.status ?? undefined,
      userId: filters.userId ?? undefined,
      isTrial: filters.isTrial ?? undefined
    }
  });

  const payload = response.data ?? {};
  const items = Array.isArray(payload.items) ? payload.items.map(normalizeSubscription) : [];

  return {
    items,
    total: payload.total ?? items.length,
    limit: payload.limit ?? filters.limit ?? 20,
    offset: payload.offset ?? filters.offset ?? 0
  };
};

export const fetchSubscriptionDetail = async (subscriptionId: number): Promise<SubscriptionDetail> => {
  const response = await apiClient.get(`/v1/subscriptions/${subscriptionId}`);
  const payload = response.data ?? {};
  const subscription = payload.subscription ?? payload;
  return normalizeDetail(subscription);
};

export const updateSubscription = async (
  subscriptionId: number,
  payload: SubscriptionUpdatePayload
): Promise<SubscriptionDetail> => {
  const response = await apiClient.patch(`/v1/subscriptions/${subscriptionId}`, payload);
  const body = response.data ?? {};
  const subscription = body.subscription ?? body;
  return normalizeDetail(subscription);
};

export const useSubscriptionsList = (filters: SubscriptionListFilters) =>
  useQuery<SubscriptionListResponse>({
    queryKey: ["subscriptions", filters],
    queryFn: () => fetchSubscriptions(filters),
    placeholderData: previous => previous
  });

export const useSubscriptionDetail = (subscriptionId?: number) =>
  useQuery<SubscriptionDetail>({
    queryKey: ["subscriptions", subscriptionId],
    queryFn: () => fetchSubscriptionDetail(subscriptionId as number),
    enabled: Boolean(subscriptionId)
  });

export const useUpdateSubscription = (subscriptionId: number) => {
  const queryClient = useQueryClient();
  return useMutation<SubscriptionDetail, Error, SubscriptionUpdatePayload>({
    mutationFn: payload => updateSubscription(subscriptionId, payload),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.setQueryData(["subscriptions", subscriptionId], data);
    }
  });
};
