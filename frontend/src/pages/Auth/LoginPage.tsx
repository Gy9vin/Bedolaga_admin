import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

import { AUTH_TOKEN_STORAGE_KEY, notifyAuthChanged } from "@shared/api/useAuth";

export const LoginPage = () => {
  const [token, setToken] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token.trim());
    notifyAuthChanged();
    const from = (location.state as { from?: Location })?.from?.pathname ?? "/";
    navigate(from, { replace: true });
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ backgroundColor: "background.default" }}
    >
      <Card sx={{ width: 360 }}>
        <CardHeader title="Вход в админку" />
        <CardContent>
          <Stack gap={2} component="form" onSubmit={handleSubmit}>
            <Typography variant="body2">
              Временно используйте API токен RemnaWave для доступа. После интеграции аутентификации этот экран будет
              обновлен.
            </Typography>
            <TextField
              required
              label="API Token"
              value={token}
              onChange={event => setToken(event.target.value)}
            />
            <Button type="submit" variant="contained" size="large" disabled={!token.trim()}>
              Войти
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
