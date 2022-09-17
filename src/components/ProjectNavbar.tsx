import { Box, Container, Tab, Toolbar, Typography } from "@mui/material";
import { TabContext, TabList } from "@mui/lab";
import { useRouter } from "next/router";
import { FunctionComponent, SyntheticEvent, useState } from "react";
import { projectNavInfo } from "../local";

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
  pid: string;
}> = ({ pid }) => {
  const router = useRouter();

  const [value, setValue] = useState(window.location.pathname);

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const reroute = (route: string) => {
    router.push({ pathname: route, query: { pid: pid } });
  };

  const navlinkProject = projectNavInfo;

  return (
    <Box sx={{ bgcolor: "white" }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            overflow: "auto",
            justifyContent: "center",
          }}
        >
          <Toolbar disableGutters sx={{ height: "40px" }}>
            <TabContext value={value}>
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                }}
              >
                <TabList variant="fullWidth" onChange={handleChange}>
                  {navlinkProject.map((page, index) => {
                    const { Header, Link } = page;
                    return (
                      <Tab
                        key={index}
                        label={tabLabel(Header)}
                        value={Link}
                        {...a11yProps(index)}
                        sx={{
                          marginLeft: index !== 0 ? 6 : 0,
                          ":hover": {
                            boxShadow:
                              "inset 0 0 100px 100px rgba(255, 255, 255, 0.2)",
                          },
                          borderRadius: 1,
                        }}
                        onClick={(event) => {
                          reroute(Link);
                        }}
                      />
                    );
                  })}
                </TabList>
              </Box>
            </TabContext>
          </Toolbar>
        </Box>
      </Container>
    </Box>
  );
};

export default ProjectNavbar;
