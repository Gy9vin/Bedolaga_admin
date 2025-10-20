import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Select
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";

import { useSubscriptionDetail, useUpdateSubscription } from "@shared/api/subscriptions";

const STATUS_OPTIONS = [
  { label: "Активна", value: "active" },
  { label: "Пауза", value: "paused" },
  { label: "Просрочена", value: "expired" },
  { label: "Отменена", value: "cancelled" }
];

export const SubscriptionDetailPage = () => {
  const { subscriptionId } = useParams<{ subscriptionId: string }>();
  const numericId = useMemo(() => (subscriptionId ? Number(subscriptionId) : undefined), [subscriptionId]);
  const navigate = useNavigate();

  const { data, isLoading, error } = useSubscriptionDetail(numericId);
  const { mutateAsync, isPending } = useUpdateSubscription(numericId ?? 0);

  const [formState, setFormState] = useState({
    status: "",
    planId: "",
    expiresAt: "",
    deviceLimit: "",
    trafficLimitGb: ""
  });

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    if (data) {
      setFormState({
        status: data.status ?? "",
        planId: data.planId?.toString() ?? "",
        expiresAt: data.expiresAt ? data.expiresAt.slice(0, 16) : "",
        deviceLimit: data.deviceLimit?.toString() ?? "",
        trafficLimitGb: data.trafficLimitGb?.toString() ?? ""
      });
    }
  }, [data]);

  const handleChange = (field: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!numericId) {
      return;
    }
    try {
      await mutateAsync({
        status: formState.status || undefined,
        planId: formState.planId ? Number(formState.planId) : undefined,
        expiresAt: formState.expiresAt ? new Date(formState.expiresAt).toISOString() : undefined,
        deviceLimit: formState.deviceLimit ? Number(formState.deviceLimit) : undefined,
        trafficLimitGb: formState.trafficLimitGb ? Number(formState.trafficLimitGb) : undefined
      });
      setSnackbar({ open: true, message: "Подписка обновлена", severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: "Не удалось сохранить изменения", severity: "error" });
    }
  };

  if (!numericId) {
    return <Alert severity="error">Некорректный идентификатор подписки</Alert>;
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        Loading...
      </Box>
    );
  }

  if (error || !data) {
    return <Alert severity="error">Не удалось загрузить данные подписки</Alert>;
  }

  return (
    <Grid container spacing={3} component="form" onSubmit={handleSubmit}>
      <Grid item xs={12}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Назад к списку
        </Button>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card>
          <CardHeader title={`Подписка #${data.id}`} subheader={`Пользователь #${data.userId}`} />
          <CardContent>
            <Stack spacing={3}>
              <FormControl>
                <InputLabel id="status-select">Статус</InputLabel>
                <Select
                  labelId="status-select"
                  label="Статус"
                  value={formState.status}
                  onChange={event => handleChange("status", event.target.value)}
                >
                  {STATUS_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Тариф (ID)"
                value={formState.planId}
                onChange={event => handleChange("planId", event.target.value)}
              />

              <TextField
                label="Окончание"
                type="datetime-local"
                value={formState.expiresAt}
                onChange={event => handleChange("expiresAt", event.target.value)}
                InputLabelProps={{ shrink: true }}
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Лимит устройств"
                  value={formState.deviceLimit}
                  onChange={event => handleChange("deviceLimit", event.target.value)}
                  sx={{ flex: 1 }}
                  type="number"
                />
                <TextField
                  label="Лимит трафика (ГБ)"
                  value={formState.trafficLimitGb}
                  onChange={event => handleChange("trafficLimitGb", event.target.value)}
                  sx={{ flex: 1 }}
                  type="number"
                />
              </Stack>

              <Stack direction="row" justifyContent="flex-end" spacing={2}>
                <Button type="submit" variant="contained" disabled={isPending}>
                  {isPending ? "Сохранение..." : "Сохранить"}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title="Информация" />
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Начало:{" "}
                <Typography component="span">
                  {data.startedAt ? new Date(data.startedAt).toLocaleString() : "—"}
                </Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Окончание:{" "}
                <Typography component="span">
                  {data.expiresAt ? new Date(data.expiresAt).toLocaleString() : "—"}
                </Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Трафик:{" "}
                <Typography component="span">
                  {data.trafficUsedGb ?? 0}/{data.trafficLimitGb ?? "∞"} ГБ
                </Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Лимит устройств:{" "}
                <Typography component="span">{data.deviceLimit ?? "—"}</Typography>
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};
