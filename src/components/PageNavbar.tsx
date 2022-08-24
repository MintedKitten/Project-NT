import { Toolbar, Typography, Box, Button, Container } from "@mui/material";
import {} from "next";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";

interface NavbarNavlink {
  Header: string;
  Link: string;
}

const PageNavbar: FunctionComponent<{
  navlink: NavbarNavlink[];
  currentTab: string;
  session: Session;
}> = ({ navlink, session, currentTab }) => {
  const router = useRouter();

  const reroute = (route: string) => {
    router.push(route);
  };

  return (
    <Container maxWidth="xl">
      <Toolbar disableGutters sx={{ height: "40px" }}>
        {navlink.map((navl, index) => {
          const { Header, Link } = navl;
          return (
            <Box key={index}>
              <Typography
                variant="h5"
                noWrap
                onClick={(event) => {
                  event.preventDefault();
                  reroute(Link);
                }}
                sx={{
                  fontWeight: currentTab === Header ? 600 : 300,
                  ml: 1,
                  fontSize: 16,
                  color: "inherit",
                  textDecoration: "none",
                  cursor: "pointer",
                  border: currentTab === Header ? 2 : 1,
                  borderRadius: 1,
                  padding: 1,
                }}
              >
                {Header}
              </Typography>
            </Box>
          );
        })}
        <Box sx={{ flexGrow: 1 }} />
        <Button color="inherit">{`Hello! ${session.user?.name}`}</Button>
        <Button color="inherit" variant="outlined">
          Logout
        </Button>
      </Toolbar>
    </Container>
  );
};

export default PageNavbar;
