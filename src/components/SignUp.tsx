/**
 * @file Frontend Component
 * Sign up form
 */
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { callAuthSignup, callRegcheck } from "../frontend";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";

export default function SignUp() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
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

    let nameer = "";
    let usernameer = "";
    let passworder = "";
    // Validate Name
    const regexAlphabetandSpace = new RegExp("^[a-zA-Z -]*$");
    if (!user.name.trim()) {
      nameer = "Name can't be empty.";
    }
    if (!regexAlphabetandSpace.test(user.name)) {
      nameer = [
        nameer,
        "Name can only consists of alphabet, space, and dash.",
      ].join("\n");
    }
    const regexAlphanumericandSomespecialcharacters = new RegExp(
      "^[a-zA-Z0-9._#@/?!-]*$"
    );
    // Validate Username
    if (!user.username.trim()) {
      usernameer = "Username can't be empty.";
    }
    if (!regexAlphanumericandSomespecialcharacters.test(user.username)) {
      usernameer = [
        usernameer,
        "Username can only consists of alphabet, number, and special characters . _ # @ / ? ! -.",
      ].join("\n");
    }
    if (!user.password.trim()) {
      // Validate Password
      passworder = "Password can't be empty.";
    }
    if (user.password.length < 8) {
      passworder = [
        passworder,
        "Password has to contain at least 8 characters.",
      ].join("\n");
    }
    if (!regexAlphanumericandSomespecialcharacters.test(user.password)) {
      passworder = [
        passworder,
        "Password can only consists of alphabet, number, and special characters . _ # @ / ? ! -.",
      ].join("\n");
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
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="new-password"
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
