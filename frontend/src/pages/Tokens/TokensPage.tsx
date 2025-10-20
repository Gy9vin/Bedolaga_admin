import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
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
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

import { useTokensList, useCreateToken, useRevokeToken } from "@shared/api/tokens";
import { format } from "date-fns";

export const TokensPage = () => {
  const [params, setParams] = useState({ limit: 20, offset: 0, search: "" });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", expiresAt: "", scopes: "" });
  const [plainToken, setPlainToken] = useState<string | null>(null);

  const { data, isLoading } = useTokensList({
    limit: params.limit,
    offset: params.offset,
    search: params.search || null
  });

  const createToken = useCreateToken();
  const revokeToken = useRevokeToken();

  const currentPage = useMemo(() => Math.floor(params.offset / params.limit), [params.offset, params.limit]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setParams(prev => ({ ...prev, offset: prev.limit * newPage }));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(event.target.value, 10);
    setParams(prev => ({ ...prev, limit: newLimit, offset: 0 }));
  };

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const scopesList = createForm.scopes
      ? createForm.scopes.split(",").map(scope => scope.trim()).filter(Boolean)
      : [];
    const response = await createToken.mutateAsync({
      name: createForm.name,
      expiresAt: createForm.expiresAt ? new Date(createForm.expiresAt).toISOString() : undefined,
      scopes: scopesList
    });
    setPlainToken(response.plainToken ?? null);
    setCreateForm({ name: "", expiresAt: "", scopes: "" });
    setIsCreateOpen(false);
  };

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="flex-start">
              <Typography variant="h5">API токены</Typography>
              <Box flexGrow={1} />
              <Button startIcon={<AddIcon />} variant="contained" onClick={() => setIsCreateOpen(true)}>
                Новый токен
              </Button>
            </Stack>
            <TextField
              fullWidth
              sx={{ mt: 2 }}
              placeholder="Поиск по названию или префиксу"
              InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} /> }}
              value={params.search}
              onChange={event => setParams(prev => ({ ...prev, search: event.target.value, offset: 0 }))}
            />
          </CardContent>
        </Card>
      </Grid>

      {plainToken && (
        <Grid item xs={12}>
          <Alert
            severity="success"
            action={
              <Button color="inherit" onClick={() => handleCopy(plainToken)}>
                Скопировать
              </Button>
            }
          >
            Сгенерирован новый токен: {plainToken}. Сохраните его — показать повторно будет нельзя.
          </Alert>
        </Grid>
      )}

      <Grid item xs={12}>
        <Paper>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Название</TableCell>
                  <TableCell>Префикс</TableCell>
                  <TableCell>Срок действия</TableCell>
                  <TableCell>Последнее использование</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Box py={4}>Загрузка...</Box>
                    </TableCell>
                  </TableRow>
                ) : data && data.items.length > 0 ? (
                  data.items.map(token => (
                    <TableRow key={token.id}>
                      <TableCell>{token.id}</TableCell>
                      <TableCell>{token.name}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography>{token.tokenPrefix}</Typography>
                          <Tooltip title="Скопировать префикс">
                            <IconButton size="small" onClick={() => handleCopy(token.tokenPrefix)}>
                              <ContentCopyIcon fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {token.expiresAt ? format(new Date(token.expiresAt), "dd.MM.yyyy HH:mm") : "Без срока"}
                      </TableCell>
                      <TableCell>
                        {token.lastUsedAt ? format(new Date(token.lastUsedAt), "dd.MM.yyyy HH:mm") : "—"}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Отозвать токен">
                          <span>
                            <IconButton
                              color="error"
                              size="small"
                              disabled={revokeToken.isPending}
                              onClick={() => revokeToken.mutate(token.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Box py={4}>
                        <Typography variant="body2" color="text.secondary">
                          Токены не найдены
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
            rowsPerPage={params.limit}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 20, 50]}
          />
        </Paper>
      </Grid>

      <Dialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Создать токен</DialogTitle>
        <Box component="form" onSubmit={handleCreateSubmit}>
          <DialogContent>
            <DialogContentText>Укажите название, срок действия и (опционально) список scopes.</DialogContentText>
            <TextField
              label="Название"
              value={createForm.name}
              onChange={event => setCreateForm(prev => ({ ...prev, name: event.target.value }))}
              margin="normal"
              fullWidth
              required
            />
            <TextField
              label="Срок действия"
              type="datetime-local"
              value={createForm.expiresAt}
              onChange={event => setCreateForm(prev => ({ ...prev, expiresAt: event.target.value }))}
              margin="normal"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Scopes (через запятую)"
              value={createForm.scopes}
              onChange={event => setCreateForm(prev => ({ ...prev, scopes: event.target.value }))}
              margin="normal"
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsCreateOpen(false)}>Отмена</Button>
            <Button type="submit" variant="contained" disabled={createToken.isPending}>
              {createToken.isPending ? "Создание..." : "Создать"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Grid>
  );
};
