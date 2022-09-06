import { AppBar, Box } from "@mui/material";
import { ReactElement } from "react";

const PageAppbar = ({
  children,
}: {
  children?: ReactElement | ReactElement[];
}) => {
  return (
    <AppBar position="sticky">
      <Box>{children}</Box>
    </AppBar>
  );
};

export default PageAppbar;
