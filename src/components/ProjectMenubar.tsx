import {
  Toolbar,
  Typography,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Box,
} from "@mui/material";
import {
  DragHandle as DragHandleIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { FunctionComponent, MouseEvent, useState } from "react";
import { navInfo, projectNavInfo } from "../local";

const ProjectMenubar: FunctionComponent<{
  session: Session;
}> = ({ session }) => {
  const router = useRouter();
  const pid = router.query["pid"] as string;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const reroute = (route: string) => {
    router.push({ pathname: route, query: { pid: pid } });
  };

  const navlinkPage = navInfo;
  const navlinkProject = projectNavInfo;

  return (
    <Container maxWidth="xl" sx={{ bgcolor: "primary.main" }}>
      <Toolbar disableGutters sx={{ height: "40px" }}>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton
          color="inherit"
          sx={{
            display: {
              xs: "inline-flex",
              md: "none",
            },
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
                    width: "100%",
                  }}
                >
                  {Header}
                </Typography>
              </MenuItem>
            );
          })}
          <Divider />
          {navlinkProject.map((navl, index) => {
            const { Header, Link } = navl;
            return (
              <MenuItem
                key={index}
                onClick={() => {
                  handleClose();
                  reroute(Link);
                }}
              >
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
          <Divider />
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
            }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <Typography
              sx={{ mx: 2, overflow: "auto", width: "10rem" }}
              noWrap
              onClick={() => {
                signOut({
                  redirect: false,
                  callbackUrl: window.location.origin,
                });
              }}
            >
              Logout
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </Container>
  );
};

export default ProjectMenubar;
