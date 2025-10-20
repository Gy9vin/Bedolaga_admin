import { CssBaseline } from "@mui/material";
import { BrowserRouter } from "react-router-dom";

import { AppThemeProvider } from "@app/providers/AppThemeProvider";
import { QueryProvider } from "@app/providers/QueryProvider";
import { AppRouter } from "@app/routes/AppRouter";

const App = () => (
  <AppThemeProvider>
    <CssBaseline />
    <QueryProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </QueryProvider>
  </AppThemeProvider>
);

export default App;
