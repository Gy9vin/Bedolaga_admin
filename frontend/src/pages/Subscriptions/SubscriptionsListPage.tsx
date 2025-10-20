import { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";

import { useSubscriptionsList, SubscriptionListFilters } from "@shared/api/subscriptions";

const STATUS_OPTIONS = [
  { label: "Все", value: null },
  { label: "Активные", value: "active" },
  { label: "Просроченные", value: "expired" },
  { label: "Пауза", value: "paused" }
];

const formatStatus = (status?: string | null) => {
  switch (status) {
    case "active":
      return { label: "Активна", color: "success" as const };
    case "expired":
      return { label: "Просрочена", color: "warning" as const };
    case "paused":
      return { label: "Пауза", color: "default" as const };
    default:
      return { label: status ?? "—", color: "default" as const };
  }
};

export const SubscriptionsListPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SubscriptionListFilters>({
    limit: 20,
    offset: 0,
    status: null,
    isTrial: null,
    userId: null
  });

  const { data, isFetching, refetch } = useSubscriptionsList(filters);

  const currentPage = useMemo(() => {
    const limit = filters.limit ?? 20;
    return Math.floor((filters.offset ?? 0) / limit);
  }, [filters.limit, filters.offset]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setFilters(prev => ({
      ...prev,
      offset: (prev.limit ?? 20) * newPage
    }));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(event.target.value, 10);
    setFilters(prev => ({
      ...prev,
      limit: newLimit,
      offset: 0
    }));
  };

  const handleRowClick = (id: number) => {
    navigate(`/subscriptions/${id}`);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="flex-start">
              <Typography variant="h5">Подписки</Typography>
              {isFetching && <Chip label="Обновление" size="small" />}
              <Tooltip title="Обновить">
                <span>
                  <IconButton onClick={() => refetch()}>
                    <RefreshIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 2 }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="status-select-label">Статус</InputLabel>
                <Select
                  labelId="status-select-label"
                  label="Статус"
                  value={filters.status ?? ""}
                  onChange={event =>
                    setFilters(prev => ({
                      ...prev,
                      status: event.target.value ? (event.target.value as string) : null,
                      offset: 0
                    }))
                  }
                >
                  {STATUS_OPTIONS.map(option => (
                    <MenuItem key={option.label} value={option.value ?? ""}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="ID пользователя"
                value={filters.userId ?? ""}
                onChange={event =>
                  setFilters(prev => ({
                    ...prev,
                    userId: event.target.value ? Number(event.target.value) : null,
                    offset: 0
                  }))
                }
                sx={{ width: 200 }}
              />
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2">Тестовый период</Typography>
                <Switch
                  checked={filters.isTrial === true}
                  onChange={(_, checked) =>
                    setFilters(prev => ({
                      ...prev,
                      isTrial: checked ? true : null,
                      offset: 0
                    }))
                  }
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Paper>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Пользователь</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Тариф</TableCell>
                  <TableCell>Начало</TableCell>
                  <TableCell>Окончание</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.items.map(subscription => {
                  const status = formatStatus(subscription.status);
                  return (
                    <TableRow
                      key={subscription.id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleRowClick(subscription.id)}
                    >
                      <TableCell>{subscription.id}</TableCell>
                      <TableCell>{subscription.userId}</TableCell>
                      <TableCell>
                        <Chip label={status.label} color={status.color} size="small" />
                      </TableCell>
                      <TableCell>{subscription.planId ?? "—"}</TableCell>
                      <TableCell>
                        {subscription.startedAt ? new Date(subscription.startedAt).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        {subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {data && data.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Box py={4}>
                        <Typography variant="body2" color="text.secondary">
                          Подписки не найдены
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={data?.total ?? 0}
            page={currentPage}
            onPageChange={handleChangePage}
            rowsPerPage={filters.limit ?? 20}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 20, 50, 100]}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};
