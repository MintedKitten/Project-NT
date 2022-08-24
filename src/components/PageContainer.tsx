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
          mx: { sm: "60px" },
          my: { sm: 3 },
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
