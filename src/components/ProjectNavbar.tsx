import { Box, Container, Tab, Tabs, Toolbar, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";

interface NavbarNavlink {
  Header: string;
  Link: string;
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

const tabLabel = (label: string) => {
  return (
    <Typography
      sx={{
        fontFamily: "Roboto",
        color: "inherit",
        fontWeight: 500,
        fontSize: "1rem",
      }}
    >
      {label}
    </Typography>
  );
};

const ProjectNavbar: FunctionComponent<{
  navlink: NavbarNavlink[];
  currentTab: string;
  pid: string;
}> = ({ navlink, currentTab, pid }) => {
  const router = useRouter();

  const reroute = (route: string) => {
    router.push({ pathname: route, query: { pid: pid } }, route);
  };

  return (
    <Container maxWidth="xl">
      <Toolbar disableGutters sx={{ height: "40px" }}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            width: "100%",
          }}
        >
          <Tabs
            value={currentTab}
            variant="fullWidth"
            textColor="inherit"
            indicatorColor="primary"
            TabIndicatorProps={{
              style: {
                backgroundColor: "#fff",
              },
            }}
          >
            {navlink.map((page, index) => {
              const { Header, Link } = page;
              let ml = index !== 0 ? 6 : 0;
              return (
                <Tab
                  key={index}
                  label={tabLabel(Header)}
                  value={Header}
                  {...a11yProps(index)}
                  sx={{ marginLeft: ml }}
                  onClick={(event) => {
                    reroute(Link);
                  }}
                />
              );
            })}
          </Tabs>
        </Box>
      </Toolbar>
    </Container>
  );
};

export default ProjectNavbar;
