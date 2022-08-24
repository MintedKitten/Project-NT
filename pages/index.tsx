import type { NextPage } from "next";
import { Container, Box, Typography, Link } from "@mui/material";

const HomePage: NextPage = () => {
  return (
    <Container maxWidth="xl">
      <Box
        sx={{
          my: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h1"
          noWrap
          sx={{
            fontFamily: "Roboto",
            color: "inherit",
            fontWeight: 700,
            fontSize: "2rem",
            borderRadius: 1,
            paddingLeft: 2,
          }}
        >
          Hello! Welcome to HomePage
        </Typography>
      </Box>
    </Container>
  );
};

export default HomePage;
