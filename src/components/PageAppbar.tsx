import { AppBar, Box } from "@mui/material";
import { Session } from "next-auth";
import { FunctionComponent, ReactElement } from "react";

export interface NavBarComponent extends FunctionComponent {}

const PageAppbar = ({
  children,
  session,
}: {
  children?: ReactElement | ReactElement[];
  session: Session;
}) => {
  return (
    <AppBar position="sticky">
      <Box>{children}</Box>
    </AppBar>
  );
};

export default PageAppbar;
