import { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";

import { useUsersList, UserListFilters } from "@shared/api/users";

const STATUS_OPTIONS = [
  { label: "Все", value: null },
  { label: "Активные", value: "active" },
  { label: "Заблокированные", value: "blocked" },
  { label: "Удаленные", value: "deleted" }
];

const formatStatus = (status?: string | null) => {
  switch (status) {
    case "active":
      return { label: "Активен", color: "success" as const };
    case "blocked":
      return { label: "Блок", color: "warning" as const };
    case "deleted":
      return { label: "Удалён", color: "default" as const };
    default:
      return { label: status ?? "—", color: "default" as const };
  }
};

export const UsersListPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<UserListFilters>({
    limit: 20,
    offset: 0,
    status: null,
    search: null
  });

  const { data, isLoading, isFetching } = useUsersList(filters);

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

  const handleRowClick = (userId: number) => {
    navigate(`/users/${userId}`);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Stack direction={{ xs: "column", sm: "row" }} gap={2} alignItems="flex-start">
              <Typography variant="h5">Пользователи</Typography>
              {isFetching && <CircularProgress size={18} />}
            </Stack>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                placeholder="Поиск по имени, username или ID"
                InputProps={{
                  startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />
                }}
                value={filters.search ?? ""}
                onChange={event =>
                  setFilters(prev => ({
                    ...prev,
                    search: event.target.value || null,
                    offset: 0
                  }))
                }
              />
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
                  <TableCell>Telegram</TableCell>
                  <TableCell>Имя</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Язык</TableCell>
                  <TableCell>Создан</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Box py={4}>
                        <CircularProgress size={24} />
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : data && data.items.length > 0 ? (
                  data.items.map(user => {
                    const status = formatStatus(user.status);
                    return (
                      <TableRow
                        key={user.id}
                        hover
                        sx={{ cursor: "pointer" }}
                        onClick={() => handleRowClick(user.id)}
                      >
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.telegramId ?? "—"}</TableCell>
                        <TableCell>
                          <Stack direction="column" spacing={0.5}>
                            <Typography variant="body2">{user.fullName ?? "—"}</Typography>
                            {user.username && (
                              <Typography variant="caption" color="text.secondary">
                                @{user.username}
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip label={status.label} color={status.color} size="small" />
                        </TableCell>
                        <TableCell>{user.language ?? "—"}</TableCell>
                        <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleString() : "—"}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Box py={4}>
                        <Typography variant="body2" color="text.secondary">
                          Пользователи не найдены
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
