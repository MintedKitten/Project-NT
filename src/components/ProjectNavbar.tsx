import { Box, Container, Tab, Tabs, Toolbar, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";
import { NavbarProjNavlink } from "../local";

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
        color: "inherit",
        fontWeight: 500,
        fontSize: "1rem",
        mx: 2,
      }}
    >
      {label}
    </Typography>
  );
};

const ProjectNavbar: FunctionComponent<{
  navlink: NavbarProjNavlink[];
  currentTab: string | boolean;
  pid: string;
}> = ({ navlink, currentTab, pid }) => {
  const router = useRouter();

  const reroute = (route: string) => {
    router.push({ pathname: route, query: { pid: pid } });
  };

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: "flex",
          overflow: "auto",
          justifyContent: { xs: "start", sm: "center" },
        }}
      >
        <Toolbar disableGutters sx={{ height: "40px" }}>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
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
                    sx={{
                      marginLeft: ml,
                      ":hover": {
                        boxShadow:
                          "inset 0 0 100px 100px rgba(255, 255, 255, 0.2)",
                      },
                    }}
                    onClick={(event) => {
                      reroute(Link);
                    }}
                  />
                );
              })}
            </Tabs>
          </Box>
        </Toolbar>
      </Box>
    </Container>
  );
};

export default ProjectNavbar;
