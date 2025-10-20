import { useContext } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography
} from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { ColorModeContext } from "@app/providers/AppThemeProvider";

export const AdminLayout = () => {
  const { mode, toggleColorMode } = useContext(ColorModeContext);
  const location = useLocation();
  const isDashboardActive = location.pathname === "/";
  const isUsersActive = location.pathname.startsWith("/users");
  const isSubscriptionsActive = location.pathname.startsWith("/subscriptions");
  const isTokensActive = location.pathname.startsWith("/tokens");

  return (
    <Box display="flex" minHeight="100vh" sx={{ backgroundColor: "background.default" }}>
      <Box component="nav" width={0} aria-label="sidebar" />
      <Box flexGrow={1} display="flex" flexDirection="column">
        <AppBar position="sticky" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ mr: 3 }}>
              RemnaWave Admin
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
              <Button
                component={NavLink}
                to="/"
                end
                color="inherit"
                sx={{
                  opacity: isDashboardActive ? 1 : 0.6,
                  fontWeight: isDashboardActive ? 600 : 400
                }}
              >
                Дашборд
              </Button>
              <Button
                component={NavLink}
                to="/users"
                color="inherit"
                sx={{
                  opacity: isUsersActive ? 1 : 0.6,
                  fontWeight: isUsersActive ? 600 : 400
                }}
              >
                Пользователи
              </Button>
              <Button
                component={NavLink}
                to="/subscriptions"
                color="inherit"
                sx={{
                  opacity: isSubscriptionsActive ? 1 : 0.6,
                  fontWeight: isSubscriptionsActive ? 600 : 400
                }}
              >
                Подписки
              </Button>
              <Button
                component={NavLink}
                to="/tokens"
                color="inherit"
                sx={{
                  opacity: isTokensActive ? 1 : 0.6,
                  fontWeight: isTokensActive ? 600 : 400
                }}
              >
                Токены
              </Button>
            </Stack>
            <Tooltip title="Переключить тему">
              <IconButton color="inherit" onClick={toggleColorMode}>
                {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Выйти">
              <span>
                <IconButton color="inherit" disabled>
                  <LogoutIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Toolbar>
        </AppBar>
        <Container component="main" maxWidth="xl" sx={{ py: 4, flexGrow: 1 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};
