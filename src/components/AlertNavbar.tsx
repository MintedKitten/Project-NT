import { TabContext, TabList } from "@mui/lab";
import { Typography, Box, Tab, Container, Toolbar } from "@mui/material";
import { SyntheticEvent } from "react";

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

const AlertNavbar = ({
  keyDate,
  handleChange,
}: {
  keyDate: string;
  handleChange: (
    event: SyntheticEvent,
    newValue: "contractendDate" | "maendDate"
  ) => void;
}) => {
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
          <Toolbar disableGutters>
            <TabContext value={keyDate}>
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                }}
              >
                <TabList onChange={handleChange}>
                  <Tab
                    label={tabLabel("Contract Status")}
                    value="contractendDate"
                    {...a11yProps(0)}
                  />
                  <Tab
                    label={tabLabel("MA Status")}
                    value="maendDate"
                    {...a11yProps(1)}
                  />
                </TabList>
              </Box>
            </TabContext>
          </Toolbar>
        </Box>
      </Container>
    </Box>
  );
};

export default AlertNavbar;
