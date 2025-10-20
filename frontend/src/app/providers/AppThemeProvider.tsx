import { createContext, ReactNode, useCallback, useMemo, useState } from "react";
import { PaletteMode, ThemeProvider, createTheme } from "@mui/material";

type ColorModeContextValue = {
  mode: PaletteMode;
  toggleColorMode: () => void;
};

export const ColorModeContext = createContext<ColorModeContextValue>({
  mode: "light",
  toggleColorMode: () => undefined
});

const getInitialMode = (): PaletteMode => {
  if (typeof window === "undefined") {
    return "light";
  }
  const stored = localStorage.getItem("remnawave-admin-color-mode") as PaletteMode | null;
  return stored ?? "light";
};

const persistMode = (mode: PaletteMode) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("remnawave-admin-color-mode", mode);
  }
};

const buildTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "light" ? "#3949ab" : "#90caf9"
      },
      background: {
        default: mode === "light" ? "#f5f7fb" : "#0f172a",
        paper: mode === "light" ? "#fff" : "#111827"
      }
    },
    shape: {
      borderRadius: 12
    },
    typography: {
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }
  });

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<PaletteMode>(getInitialMode);

  const toggleColorMode = useCallback(() => {
    setMode(prev => {
      const next = prev === "light" ? "dark" : "light";
      persistMode(next);
      return next;
    });
  }, []);

  const theme = useMemo(() => buildTheme(mode), [mode]);

  const contextValue = useMemo<ColorModeContextValue>(
    () => ({
      mode,
      toggleColorMode
    }),
    [mode, toggleColorMode]
  );

  return (
    <ColorModeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
};
