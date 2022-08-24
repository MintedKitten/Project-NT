import { Box } from "@mui/material";

type Direction = "row" | "column";
// type RespNum = Breakpoint;

const Space = ({
  size,
  direction = "row",
  sx = {},
  ...props
}: {
  size: string | number | { [key: string]: number | string };
  direction: Direction;
  sx?: { [key: string]: any };
  props?: any[];
}) => {
  const style = { ...sx };
  if (direction === "row") {
    style["height"] = size;
  } else {
    style["width"] = size;
  }
  return <Box sx={style} {...props} />;
};

export default Space;
