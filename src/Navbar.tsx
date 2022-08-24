import React from "react";
import {
  Link,
  AppBar,
  Toolbar,
  CssBaseline,
  Typography,
  ThemeProvider,
  Box,
  Button,
  Container,
} from "@mui/material";
import { createTheme } from "@mui/material/styles";
import AdbIcon from "@mui/icons-material/Adb";


// const theme = createTheme({
//   logo: {},
//   links: {},
// });

const Navbar = (props?: any) => {
  return (
    // <ThemeProvider theme={theme}>
    <AppBar
      position="sticky"
      {...props}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ height: "100px" }}>
          <AdbIcon sx={{ display: "flex", ml: 2, mr: 1 }} />
          <Box>
            <Typography
              variant="h5"
              component="a"
              noWrap
              href="#"
              sx={{
                mr: 2,
                display: "flex",
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              Menu
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="h5"
              component="a"
              noWrap
              href="/RegisterPage"
              sx={{
                ml: 5,
                display: "flex",
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              Register
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Button color="inherit">Login</Button>
          <Button color="inherit">Logout</Button>
        </Toolbar>
      </Container>
    </AppBar>
    // </ThemeProvider>
  );
};

export default Navbar;
