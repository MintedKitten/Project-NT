import * as React from "react";
import {
  Button,
  TextField,
  Box,
  Typography,
  Container,
  Grid,
} from "@mui/material";

import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { Alert } from "@mui/material";

export default function SignIn({ csrfToken }: { csrfToken: string }) {
  const router = useRouter();
  const [error, setError] = React.useState("");
  const [signin, setSignin] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      username: data.get("username"),
      password: data.get("password"),
      redirect: false,
    });
    if (result) {
      if (!result.ok) {
        setError("Username or password is incorrect.\nPlease, try again.");
      } else {
        setError("");
        setSignin(true);
        setTimeout(() => {
          router.push({
            pathname: "/search/projects",
            query: { name: "", year: 0, type: 0 },
          });
        }, 10);
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          paddingY: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h2">
          Sign in
        </Typography>
        <Box sx={{ display: error === "" ? "none" : "flex" }}>
          <Alert severity="error">{error}</Alert>
        </Box>
        <Box sx={{ display: signin ? "flex" : "none" }}>
          <Alert severity="success">Signin Successfully, redirecting..</Alert>
        </Box>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
              />
            </Grid>
            <Grid item xs={3} />
            <Grid item xs={6}>
              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 3, mb: 2, width: "100%" }}
              >
                Sign In
              </Button>
            </Grid>
            <Grid item xs={3} />
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}
