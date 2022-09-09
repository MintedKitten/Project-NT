import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { callAuthSignup, callRegcheck } from "../frontend";
import { useRouter } from "next/router";
import { useState } from "react";

export default function SignUp() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const user = {
      username: data.get("username") + "",
      password: data.get("password") + "",
      name: data.get("name") + "",
    };
    let nameer = "";
    let usernameer = "";
    let passworder = "";
    if (!user.name) {
      nameer = "Name can't be empty";
    }
    if (!user.username) {
      usernameer = "Username can't be empty";
    }
    if (!user.password) {
      passworder = "Password can't be empty";
    } else {
      if (user.password.length < 8) {
        passworder = passworder.concat(
          "Password has to contain atleast 8 characters"
        );
      }
    }
    setNameError(nameer);
    setUsernameError(usernameer);
    setPasswordError(passworder);
    const isValid = nameer === "" && usernameer === "" && passworder === "";
    if (isValid) {
      const usercheck = await callRegcheck("" + user.username);
      if (usercheck) {
        setError("This username has already been taken!");
      } else {
        const signupComplete = await callAuthSignup(
          "" + user.username,
          "" + user.password,
          "" + user.name
        );
        if (signupComplete) {
          setError("");
          router.push({ pathname: "/" });
        } else {
          setError("Signup failed. Please, try again.");
        }
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <Box sx={{ display: error === "" ? "none" : "flex" }}>
          <Alert severity="error">{error}</Alert>
        </Box>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="name"
                label="Name"
                name="name"
                autoComplete="name"
                error={nameError !== ""}
                helperText={nameError !== "" ? nameError : ""}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
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
                type="password"
                id="password"
                autoComplete="new-password"
                error={passwordError !== ""}
                helperText={passwordError !== "" ? passwordError : ""}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link href="/api/auth/signin" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}
