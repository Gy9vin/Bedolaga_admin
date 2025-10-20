import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@shared/api/client";

export type UserListFilters = {
  limit?: number;
  offset?: number;
  status?: string | null;
  promoGroupId?: number | null;
  search?: string | null;
};

export type UserListItem = {
  id: number;
  telegramId?: number | null;
  username?: string | null;
  fullName?: string | null;
  language?: string | null;
  status?: string | null;
  isBlocked?: boolean | null;
  createdAt?: string | null;
};

export type UserListResponse = {
  items: UserListItem[];
  total: number;
  limit: number;
  offset: number;
};

export type UserDetail = UserListItem & {
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  tags?: string[];
};

export type UserDetailResponse = {
  user: UserDetail;
};

export type UserUpdatePayload = {
  fullName?: string;
  username?: string;
  language?: string;
  status?: string;
  promoGroupId?: number | null;
  isBlocked?: boolean;
  notes?: string;
};

const normalizeUser = (raw: any): UserListItem => ({
  id: raw?.id,
  telegramId: raw?.telegram_id ?? raw?.telegramId ?? null,
  username: raw?.username ?? null,
  fullName: raw?.full_name ?? raw?.fullName ?? null,
  language: raw?.language ?? null,
  status: raw?.status ?? null,
  isBlocked: raw?.is_blocked ?? raw?.isBlocked ?? null,
  createdAt: raw?.created_at ?? raw?.createdAt ?? null
});

const normalizeUserDetail = (raw: any): UserDetail => ({
  ...normalizeUser(raw),
  email: raw?.email ?? null,
  phone: raw?.phone ?? null,
  notes: raw?.notes ?? null,
  tags: raw?.tags ?? []
});

export const fetchUsers = async (filters: UserListFilters): Promise<UserListResponse> => {
  const response = await apiClient.get("/v1/users", {
    params: {
      limit: filters.limit,
      offset: filters.offset,
      status: filters.status ?? undefined,
      promoGroupId: filters.promoGroupId ?? undefined,
      search: filters.search ?? undefined
    }
  });

  const payload = response.data ?? {};
  const items = Array.isArray(payload.items) ? payload.items.map(normalizeUser) : [];

  return {
    items,
    total: payload.total ?? items.length,
    limit: payload.limit ?? filters.limit ?? 20,
    offset: payload.offset ?? filters.offset ?? 0
  };
};

export const fetchUserDetail = async (userId: number): Promise<UserDetail> => {
  const response = await apiClient.get(`/v1/users/${userId}`);
  const payload = response.data ?? {};
  const user = payload.user ?? payload;
  return normalizeUserDetail(user);
};

export const updateUser = async (userId: number, payload: UserUpdatePayload): Promise<UserDetail> => {
  const response = await apiClient.patch(`/v1/users/${userId}`, payload);
  const body = response.data ?? {};
  const user = body.user ?? body;
  return normalizeUserDetail(user);
};

export const useUsersList = (filters: UserListFilters) =>
  useQuery<UserListResponse>({
    queryKey: ["users", filters],
    queryFn: () => fetchUsers(filters),
    placeholderData: previousData => previousData
  });

export const useUserDetail = (userId?: number) =>
  useQuery<UserDetail>({
    queryKey: ["users", userId],
    queryFn: () => fetchUserDetail(userId as number),
    enabled: Boolean(userId)
  });

export const useUpdateUser = (userId: number) => {
  const queryClient = useQueryClient();
  return useMutation<UserDetail, Error, UserUpdatePayload>({
    mutationFn: (payload: UserUpdatePayload) => updateUser(userId, payload),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.setQueryData(["users", userId], data);
    }
  });
};
