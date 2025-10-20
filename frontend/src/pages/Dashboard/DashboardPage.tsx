import { Card, CardContent, Chip, Grid, Skeleton, Stack, Typography } from "@mui/material";

import { useHealthStatus } from "@shared/api/health";
import { useStatsOverview } from "@shared/api/stats";

const formatLabel = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase());

export const DashboardPage = () => {
  const {
    data,
    isLoading,
    error
  } = useStatsOverview();
  const {
    data: health,
    isLoading: isHealthLoading,
    error: healthError
  } = useHealthStatus();

  const renderCard = (title: string, value?: number, secondary?: string | null) => (
    <Card>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        {isLoading ? (
          <Skeleton variant="text" width="50%" />
        ) : (
          <Typography variant="h4" sx={{ mt: 1 }}>
            {value ?? "—"}
          </Typography>
        )}
        {secondary && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {secondary}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Grid container spacing={3}>
      {(error || healthError) && (
        <Grid item xs={12}>
          <Card sx={{ border: 1, borderColor: "error.main" }}>
            <CardContent>
              <Typography color="error">Не удалось загрузить данные мониторинга</Typography>
            </CardContent>
          </Card>
        </Grid>
      )}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              Состояние сервисов
            </Typography>
            {isHealthLoading ? (
              <Stack spacing={1} sx={{ mt: 1 }}>
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="rectangular" height={32} />
              </Stack>
            ) : health ? (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-start">
                  <Typography variant="h4">{health.status.toUpperCase()}</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={`Latency ${Math.round(health.latencyMs)} ms`} color="default" size="small" />
                    <Chip label={`API v${health.apiVersion ?? "?"}`} size="small" />
                    <Chip label={`Bot v${health.botVersion ?? "?"}`} size="small" />
                  </Stack>
                </Stack>
                {Object.keys(health.components).length > 0 && (
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {Object.entries(health.components).map(([key, value]) => (
                      <Chip
                        key={`component-${key}`}
                        label={`${formatLabel(key)}: ${value ? "OK" : "Issue"}`}
                        color={value ? "success" : "warning"}
                        variant={value ? "filled" : "outlined"}
                        size="small"
                      />
                    ))}
                  </Stack>
                )}
                {Object.keys(health.features).length > 0 && (
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {Object.entries(health.features).map(([key, value]) => (
                      <Chip
                        key={`feature-${key}`}
                        label={`${formatLabel(key)}`}
                        color={value ? "primary" : "default"}
                        variant={value ? "filled" : "outlined"}
                        size="small"
                      />
                    ))}
                  </Stack>
                )}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Нет данных о состоянии сервисов.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        {renderCard("Пользователи", data?.users.total, data?.users.new ? `+${data.users.new} сегодня` : null)}
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        {renderCard(
          "Подписки",
          data?.subscriptions.total,
          data?.subscriptions.active ? `${data.subscriptions.active} активные` : null
        )}
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        {renderCard("Поддержка", data?.support.total, data?.support.active ? `${data.support.active} в работе` : null)}
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        {renderCard(
          "Платежи (₽)",
          data?.payments.totalRubles,
          data?.payments.todayRubles ? `${data.payments.todayRubles} сегодня` : null
        )}
      </Grid>
    </Grid>
  );
};
