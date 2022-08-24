import { AppBar } from "@mui/material";
import { ReactElement } from "react";

const PageAppbar = ({
  children,
}: {
  children?: ReactElement | ReactElement[];
}) => {
  return <AppBar position="sticky">{children}</AppBar>;
};

export default PageAppbar;
