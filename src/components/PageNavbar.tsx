import { Toolbar, Typography, Box, Button, Container } from "@mui/material";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";

interface NavbarNavlink {
  Header: string;
  Link: string;
  Icon: FunctionComponent;
}

const PageNavbar: FunctionComponent<{
  navlink: NavbarNavlink[];
  currentTab: number;
  session: Session;
}> = ({ navlink, session, currentTab }) => {
  const router = useRouter();

  const reroute = (route: string) => {
    router.push(route);
  };

  return (
    <Container maxWidth="xl">
      <Toolbar disableGutters sx={{ height: "40px", overflow: "auto" }}>
        <Box sx={{ display: "flex" }}>
          {navlink.map((navl, index) => {
            const { Header, Link, Icon } = navl;
            return (
              <Box
                key={index}
                sx={{
                  ml: 1,
                  cursor: "pointer",
                  border: currentTab === index ? 2 : 1,
                  borderRadius: 1,
                  padding: 1,
                  display: "flex",
                }}
              >
                <Icon />
                <Typography
                  variant="h5"
                  noWrap
                  onClick={(event) => {
                    event.preventDefault();
                    reroute(Link);
                  }}
                  sx={{
                    fontWeight: currentTab === index ? 600 : 300,
                    fontSize: 16,
                    color: "inherit",
                  }}
                >
                  {Header}
                </Typography>
              </Box>
            );
          })}
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Typography sx={{ mx: 2 }}>Hello! {session.user?.name}</Typography>
        <Button
          color="inherit"
          variant="outlined"
          onClick={() => {
            signOut({ redirect: false, callbackUrl: window.location.origin });
          }}
        >
          Logout
        </Button>
      </Toolbar>
    </Container>
  );
};

export default PageNavbar;
