import { useContext } from "react";
import {
  AppBar,
  Box,
  Container,
  IconButton,
  Toolbar,
  Tooltip,
  Typography
} from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import { Outlet } from "react-router-dom";

import { ColorModeContext } from "@app/providers/AppThemeProvider";

export const AdminLayout = () => {
  const { mode, toggleColorMode } = useContext(ColorModeContext);

  return (
    <Box display="flex" minHeight="100vh" sx={{ backgroundColor: "background.default" }}>
      <Box component="nav" width={0} aria-label="sidebar" />
      <Box flexGrow={1} display="flex" flexDirection="column">
        <AppBar position="sticky" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              RemnaWave Admin
            </Typography>
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
