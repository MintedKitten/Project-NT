/**
 * @file Frontend Component
 * The container for the navigation bar
 */
import { AppBar, AppBarProps, Box, useScrollTrigger } from "@mui/material";
import { cloneElement, ReactElement } from "react";

interface ElevationProps {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window;
  children: ReactElement;
}

function ElevationScroll(props: ElevationProps) {
  const { children, window } = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
    target: window ? window() : undefined,
  });

  return cloneElement(children, {
    elevation: trigger ? 4 : 0,
  });
}

const PageAppbar = (props: AppBarProps) => {
  const { position, children, ...r } = props;
  return (
    <ElevationScroll>
      <AppBar
        position={position || "sticky"}
        {...r}
        sx={{ bgcolor: "transparent" }}
      >
        <Box>{children}</Box>
      </AppBar>
    </ElevationScroll>
  );
};

export default PageAppbar;
