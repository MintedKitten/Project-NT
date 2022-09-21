/**
 * @file Frontend Component
 * Sign in form
 */
import {
  Button,
  TextField,
  Box,
  Typography,
  Container,
  Grid,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { Alert } from "@mui/material";
import { FormEvent, useState } from "react";
import { decode, sign } from "jsonwebtoken";

export default function SignIn({
  csrfToken,
  encToken,
}: {
  csrfToken: string;
  encToken: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [signin, setSignin] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const user = {
      username: data.get("username") + "",
      password: data.get("password") + "",
      name: data.get("name") + "",
    };
    let usernameer = "";
    let passworder = "";
    // Validate Username
    if (!user.username.trim()) {
      usernameer = "Username can't be empty.";
    }
    // Validate Password
    if (!user.password.trim()) {
      passworder = "Password can't be empty.";
    }
    setUsernameError(usernameer);
    setPasswordError(passworder);
    const isValid = usernameer === "" && passworder === "";
    if (isValid) {
      function decToken(): {
        enc: string;
        date: string;
      } {
        return decode(encToken) as { enc: string; date: string };
      }
      const encpassword = sign(
        {
          password: user.password,
          sub: Math.random(),
          date: decToken().date,
        },
        decToken().enc
      );
      const result = await signIn("credentials", {
        username: user.username,
        password: encpassword,
        redirect: false,
      });
      if (result) {
        if (!result.ok) {
          setError("Username or password is incorrect.\nPlease, try again.");
        } else {
          setError("");
          setSignin(true);
          setTimeout(() => {
            router.push({ pathname: "/" });
          }, 10);
        }
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
                error={usernameError !== ""}
                helperText={usernameError !== "" ? usernameError : ""}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                error={passwordError !== ""}
                helperText={passwordError !== "" ? passwordError : ""}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowPassword((oldValue) => {
                            return !oldValue;
                          });
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                        }}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
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
