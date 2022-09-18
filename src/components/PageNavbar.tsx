import {
  Toolbar,
  Typography,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { FunctionComponent, MouseEvent, useState } from "react";
import { navInfo } from "../local";

const PageNavbar: FunctionComponent<{
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
    <Box sx={{ bgcolor: "primary.main" }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ height: "40px" }}>
          <Box
            sx={{
              display: "flex",
            }}
          >
            {navlinkPage.map((navl, index) => {
              const { Header, Link, Icon } = navl;
              return (
                <Box
                  key={index}
                  sx={{
                    ml: 1,
                    cursor: "pointer",
                    borderRadius: 1,
                    padding: 1,
                    display: "flex",
                    alignItems: "center",
                    ":hover": {
                      boxShadow:
                        "inset 0 0 100px 100px rgba(255, 255, 255, 0.2)",
                    },
                  }}
                  onClick={(event) => {
                    event.preventDefault();
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
                </Box>
              );
            })}
          </Box>
          <Box sx={{ flexGrow: 1 }} />
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
            <SettingsIcon fontSize="medium" />
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
            <MenuItem
              onClick={() => {
                handleClose();
              }}
            >
              <Typography sx={{ mx: 2 }} noWrap>
                Hello! {session.user?.name}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                handleClose();
                signOut();
              }}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <Typography
                sx={{ mx: 2, overflow: "auto", width: "10rem" }}
                noWrap
              >
                Logout
              </Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </Box>
  );
};

export default PageNavbar;
