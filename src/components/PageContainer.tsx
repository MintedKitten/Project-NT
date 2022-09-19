/**
 * @file Frontend Component
 * The container for the body
 */
import { Container, Box, Breakpoint } from "@mui/material";
import { ReactElement } from "react";

const PageContainer = ({
  children,
  maxWidth = "lg",
}: {
  children?: ReactElement | ReactElement[];
  maxWidth?: Breakpoint;
}) => {
  return (
    <Container maxWidth={maxWidth}>
      <Box
        sx={{
          my: 3,
          mt: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {children}
      </Box>
    </Container>
  );
};

export default PageContainer;
