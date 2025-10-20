import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";

import { useUpdateUser, useUserDetail } from "@shared/api/users";

const STATUS_OPTIONS = [
  { label: "Активен", value: "active" },
  { label: "Заблокирован", value: "blocked" },
  { label: "Удалён", value: "deleted" }
];

export const UserDetailPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const numericId = useMemo(() => (userId ? Number(userId) : undefined), [userId]);
  const navigate = useNavigate();

  const { data, isLoading, error } = useUserDetail(numericId);
  const { mutateAsync, isPending } = useUpdateUser(numericId ?? 0);

  const [formState, setFormState] = useState({
    fullName: "",
    username: "",
    language: "",
    status: "",
    notes: "",
    isBlocked: false
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>(
    { open: false, message: "", severity: "success" }
  );

  useEffect(() => {
    if (data) {
      setFormState({
        fullName: data.fullName ?? "",
        username: data.username ?? "",
        language: data.language ?? "",
        status: data.status ?? "",
        notes: data.notes ?? "",
        isBlocked: Boolean(data.isBlocked)
      });
    }
  }, [data]);

  const handleChange = (field: string, value: unknown) => {
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
        fullName: formState.fullName || undefined,
        username: formState.username || undefined,
        language: formState.language || undefined,
        status: formState.status || undefined,
        notes: formState.notes || undefined,
        isBlocked: formState.isBlocked
      });
      setSnackbar({ open: true, message: "Данные пользователя обновлены", severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: "Не удалось сохранить изменения", severity: "error" });
    }
  };

  if (!numericId) {
    return (
      <Alert severity="error">Некорректный идентификатор пользователя</Alert>
    );
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return <Alert severity="error">Не удалось загрузить данные пользователя</Alert>;
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
          <CardHeader title={`Пользователь #${data.id}`} subheader={data.username ? `@${data.username}` : data.fullName} />
          <CardContent>
            <Stack spacing={3}>
              <TextField
                label="Полное имя"
                value={formState.fullName}
                onChange={event => handleChange("fullName", event.target.value)}
              />
              <TextField
                label="Username"
                value={formState.username}
                onChange={event => handleChange("username", event.target.value)}
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Язык"
                  value={formState.language}
                  onChange={event => handleChange("language", event.target.value)}
                  sx={{ flex: 1 }}
                />
                <FormControl sx={{ flex: 1 }}>
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
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body1">Блокировка</Typography>
                <Switch
                  checked={formState.isBlocked}
                  onChange={(_, checked) => handleChange("isBlocked", checked)}
                />
              </Stack>
              <TextField
                label="Заметки"
                value={formState.notes}
                onChange={event => handleChange("notes", event.target.value)}
                multiline
                minRows={3}
              />
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
                Telegram ID: <Typography component="span">{data.telegramId ?? "—"}</Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Создан: <Typography component="span">{data.createdAt ? new Date(data.createdAt).toLocaleString() : "—"}</Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: <Typography component="span">{data.email ?? "—"}</Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Phone: <Typography component="span">{data.phone ?? "—"}</Typography>
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
