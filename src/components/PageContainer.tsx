import { Container, Box } from "@mui/material";
import { ReactElement } from "react";

const PageContainer = ({
  children,
}: {
  children?: ReactElement | ReactElement[];
}) => {
  return (
    <Container maxWidth="lg">
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
