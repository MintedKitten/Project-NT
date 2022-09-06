import {
  Toolbar,
  Typography,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { DragHandle as DragHandleIcon } from "@mui/icons-material";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { FunctionComponent, MouseEvent, useState } from "react";
import { navInfo } from "../local";

const PageMenubar: FunctionComponent<{
  session: Session;
}> = ({ session }) => {
  const router = useRouter();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const reroute = (route: string) => {
    router.push(route);
  };

  const navlinkPage = navInfo;

  return (
    <Container maxWidth="xl">
      <Toolbar disableGutters sx={{ height: "40px" }}>
        <IconButton
          color="inherit"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            border: 1,
            borderColor: "inherit",
            borderRadius: 1,
            ":hover": {
              boxShadow: "inset 0 0 100px 100px rgba(255, 255, 255, 0.2)",
            },
          }}
          onClick={handleClick}
        >
          <DragHandleIcon fontSize="small" />
        </IconButton>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          {navlinkPage.map((navl, index) => {
            const { Header, Link, Icon } = navl;
            return (
              <MenuItem
                key={index}
                onClick={() => {
                  handleClose();
                  reroute(Link);
                }}
              >
                <Icon />
                <Typography
                  variant="h5"
                  noWrap
                  sx={{
                    fontWeight: window.location.pathname === Link ? 600 : 300,
                    fontSize: 16,
                    color: "inherit",
                  }}
                >
                  {Header}
                </Typography>
              </MenuItem>
            );
          })}
        </Menu>

        <Box sx={{ flexGrow: 1 }} />
        <Box>
          <Typography sx={{ mx: 2, width: "100%" }} noWrap>
            Hello! {session.user?.name}
          </Typography>
        </Box>

        <Button
          color="inherit"
          variant="outlined"
          onClick={() => {
            signOut({ redirect: false, callbackUrl: window.location.origin });
          }}
        >
          Logout
        </Button>
      </Toolbar>
    </Container>
  );
};

export default PageMenubar;
