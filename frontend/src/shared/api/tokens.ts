import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@shared/api/client";

export type Token = {
  id: number;
  name: string;
  tokenPrefix: string;
  createdAt?: string | null;
  lastUsedAt?: string | null;
  lastUsedIp?: string | null;
  expiresAt?: string | null;
  isActive: boolean;
  scopes: string[];
};

export type TokenListResponse = {
  items: Token[];
  total: number;
  limit: number;
  offset: number;
};

export type TokenCreatePayload = {
  name: string;
  expiresAt?: string;
  scopes?: string[];
};

export type TokenCreateResponse = {
  token: Token;
  plainToken?: string | null;
};

const normalizeToken = (raw: any): Token => ({
  id: raw?.id,
  name: raw?.name ?? "",
  tokenPrefix: raw?.token_prefix ?? raw?.tokenPrefix ?? "",
  createdAt: raw?.created_at ?? raw?.createdAt ?? null,
  lastUsedAt: raw?.last_used_at ?? raw?.lastUsedAt ?? null,
  lastUsedIp: raw?.last_used_ip ?? raw?.lastUsedIp ?? null,
  expiresAt: raw?.expires_at ?? raw?.expiresAt ?? null,
  isActive: raw?.is_active ?? raw?.isActive ?? true,
  scopes: raw?.scopes ?? []
});

export const fetchTokens = async (params: { limit?: number; offset?: number; search?: string | null }) => {
  const response = await apiClient.get("/v1/tokens", {
    params: {
      limit: params.limit,
      offset: params.offset,
      search: params.search ?? undefined
    }
  });

  const payload = response.data ?? {};
  const items = Array.isArray(payload.items) ? payload.items.map(normalizeToken) : [];

  return {
    items,
    total: payload.total ?? items.length,
    limit: payload.limit ?? params.limit ?? 20,
    offset: payload.offset ?? params.offset ?? 0
  } as TokenListResponse;
};

export const createToken = async (payload: TokenCreatePayload): Promise<TokenCreateResponse> => {
  const response = await apiClient.post("/v1/tokens", {
    name: payload.name,
    expires_at: payload.expiresAt,
    scopes: payload.scopes
  });
  const body = response.data ?? {};
  const token = body.token ?? body;
  return {
    token: normalizeToken(token),
    plainToken: body.plain_token ?? body.plainToken ?? null
  };
};

export const revokeToken = async (tokenId: number): Promise<void> => {
  await apiClient.post(`/v1/tokens/${tokenId}/revoke`);
};

export const useTokensList = (params: { limit: number; offset: number; search: string | null }) =>
  useQuery<TokenListResponse>({
    queryKey: ["tokens", params],
    queryFn: () => fetchTokens(params),
    placeholderData: previous => previous
  });

export const useCreateToken = () => {
  const queryClient = useQueryClient();
  return useMutation<TokenCreateResponse, Error, TokenCreatePayload>({
    mutationFn: createToken,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    }
  });
};

export const useRevokeToken = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: revokeToken,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    }
  });
};
