import { Card, CardContent, Grid, Skeleton, Typography } from "@mui/material";

import { useStatsOverview } from "@shared/api/stats";

export const DashboardPage = () => {
  const {
    data,
    isLoading,
    error
  } = useStatsOverview();

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
      {error && (
        <Grid item xs={12}>
          <Card sx={{ border: 1, borderColor: "error.main" }}>
            <CardContent>
              <Typography color="error">Не удалось загрузить статистику</Typography>
            </CardContent>
          </Card>
        </Grid>
      )}
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
