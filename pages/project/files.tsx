import type {
  GetServerSideProps,
  GetServerSidePropsResult,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Delete as DeleteIcon,
  FileUpload as FileUploadIcon,
} from "@mui/icons-material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import PageAppbar from "../../src/components/PageAppbar";
import PageContainer from "../../src/components/PageContainer";
import PageNavbar from "../../src/components/PageNavbar";
import ProjectNavbar from "../../src/components/ProjectNavbar";
import {
  fileMetadataInt,
  getFileMetadata,
  getMongoClient,
  projectFilesFindAll,
} from "../../src/db";
import fileSize from "filesize";
import { useConfirmDialog } from "react-mui-confirm";
import { ChangeEvent } from "react";
import {
  addFMidsToProject,
  deleteFileFromProject,
  uploadToServer,
} from "../../src/create/files";
import { ObjectId } from "bson";
import { navInfo, projectNavInfo } from "../../src/local";
import { fileicon } from "../../src/fileicon";
import { getToken } from "next-auth/jwt";
import ProjectMenubar from "../../src/components/ProjectMenubar";
import { log } from "../../src/logger";

const ProjectFilesPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ pid, srfiles }) => {
  const isNavbar = useMediaQuery("(min-width:900px)");
  const session = useSession();
  const router = useRouter();
  const { status, data } = session;

  const openConfirmDialog = useConfirmDialog();

  const files = srfiles.map((sfile) => {
    return convToTable(sfile);
  });

  /**
   * Handle when uploading file
   * @param e
   * @returns
   */
  function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    if (!e.target.files) {
      return;
    }
    const file = e.target.files;
    let filename = file[0].name;
    for (let index = 1; index < file.length; index++) {
      const element = file[index];
      filename += ", " + element.name;
    }
    openConfirmDialog({
      title: "Are you sure you want to upload file: " + filename,
      onConfirm: async () => {
        const fmids: string[] = [];
        for (let index = 0; index < file.length; index++) {
          const elm = file[index];
          const formData = new FormData();
          formData.append("file", elm);
          const uploadRes = await uploadToServer(formData);
          fmids.push(uploadRes.fmid);
        }
        const isAllSuccessful = await addFMidsToProject(pid, fmids);
        if (isAllSuccessful) {
          await router.push({
            pathname: "/project/files",
            query: { pid: pid },
          });
        }
      },
      cancelButtonProps: {
        color: "primary",
      },
      confirmButtonProps: {
        color: "primary",
      },
      confirmButtonText: "Upload",
      rejectOnCancel: false,
    });
  }

  const TitleButtonElement = () => {
    return (
      <Button
        variant="contained"
        component="label"
        startIcon={<FileUploadIcon />}
      >
        Upload file
        <input
          type="file"
          hidden
          multiple
          onChange={(e) => {
            handleFileUpload(e);
          }}
        />
      </Button>
    );
  };

  /**
   * Authentication: Redirect if not authenicated
   */
  if (status === "unauthenticated") {
    router.push({ pathname: "/api/auth/signin" });
  }

  if (status === "authenticated") {
    return (
      <>
        <Head>
          <title>Project Files</title>
        </Head>
        <PageAppbar>
          {isNavbar ? (
            <>
              <PageNavbar session={data} />
              <ProjectNavbar pid={pid} />
            </>
          ) : (
            <ProjectMenubar session={data} />
          )}
        </PageAppbar>

        <PageContainer>
          <Box sx={{ display: "flex" }}>
            <TitleButtonElement />
          </Box>
          <Box
            sx={{
              mt: 1,
              border: 1,
              paddingLeft: 1,
              paddingY: 1,
              borderColor: "lightgrey",
              borderRadius: 2,
              overflow: "auto",
            }}
          >
            <Grid container spacing={1} sx={{ minWidth: "600px" }}>
              <Grid
                item
                xs={6}
                sx={{ borderBottom: 1, borderColor: "lightgrey" }}
              >
                <Typography>Name</Typography>
              </Grid>
              <Grid
                item
                xs={2}
                sx={{ borderBottom: 1, borderColor: "lightgrey" }}
              >
                <Typography>Size</Typography>
              </Grid>
              <Grid
                item
                xs={2}
                sx={{ borderBottom: 1, borderColor: "lightgrey" }}
              >
                <Typography>Upload Date</Typography>
              </Grid>
              <Grid
                item
                xs={2}
                sx={{ borderBottom: 1, borderColor: "lightgrey" }}
                columns={2}
              >
                <Typography>Action</Typography>
              </Grid>
            </Grid>
            <Grid
              container
              spacing={1}
              rowSpacing={1}
              sx={{ mt: 0, maxHeight: "65vh", minWidth: "600px" }}
            >
              {files.length === 0 ? (
                <Typography
                  sx={{
                    color: "lightgrey",
                    fontWeight: 300,
                    justifyContent: "flex-start",
                  }}
                >
                  No file was found.
                </Typography>
              ) : (
                files.map((file) => {
                  const { _id, filename, filetype, size, uploadDate } = file;
                  return (
                    <>
                      <Grid
                        item
                        xs={1}
                        sx={{
                          borderTop: 1,
                          borderColor: "lightgrey",
                        }}
                      >
                        <Typography>{fileicon(filetype)}</Typography>
                      </Grid>
                      <Grid
                        item
                        xs={5}
                        sx={{
                          borderTop: 1,
                          borderColor: "lightgrey",
                        }}
                      >
                        <Typography>{filename}</Typography>
                      </Grid>
                      <Grid
                        item
                        xs={2}
                        sx={{
                          borderTop: 1,
                          borderColor: "lightgrey",
                        }}
                      >
                        <Typography>
                          {fileSize(size, { standard: "iec" })}
                        </Typography>
                      </Grid>
                      <Grid
                        item
                        xs={2}
                        sx={{
                          borderTop: 1,
                          borderColor: "lightgrey",
                        }}
                      >
                        <Typography>{formatDate(uploadDate)}</Typography>
                      </Grid>
                      <Grid
                        item
                        xs={1}
                        sx={{
                          borderTop: 1,
                          borderColor: "lightgrey",
                        }}
                      >
                        <a
                          // eslint-disable-next-line react/no-unknown-property
                          download={filename}
                          href={`/files/${_id?.toHexString()}`}
                        >
                          <DownloadIcon sx={{ cursor: "pointer" }} />
                        </a>
                      </Grid>
                      <Grid
                        item
                        xs={1}
                        sx={{
                          borderTop: 1,
                          borderColor: "lightgrey",
                          alignItems: "center",
                        }}
                      >
                        <div
                          onClick={(e) => {
                            e.preventDefault();
                            openConfirmDialog({
                              title: "Remove file: " + filename + "?",
                              onConfirm: async () => {
                                const isDeleteSuccessful =
                                  await deleteFileFromProject(
                                    `${_id?.toHexString()}`
                                  );
                                if (isDeleteSuccessful) {
                                  await router.push({
                                    pathname: "/project/files",
                                    query: { pid: pid },
                                  });
                                }
                              },
                              cancelButtonProps: {
                                color: "primary",
                              },
                              confirmButtonProps: {
                                color: "warning",
                              },
                              confirmButtonText: "Delete",
                            });
                          }}
                        >
                          <DeleteIcon
                            sx={{ cursor: "pointer", color: "red" }}
                          />
                        </div>
                      </Grid>
                    </>
                  );
                })
              )}
            </Grid>
          </Box>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={status === "loading"}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default ProjectFilesPage;

export const getServerSideProps: GetServerSideProps<{
  pid: string;
  srfiles: ReturnType<typeof convToSerializable>[];
}> = async (context) => {
  const token = await getToken({
    req: context.req,
    secret: `${process.env.JWT_SECRET}`,
  });
  if (!token) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }
  const toLog = {
    msg: "Project files page was queried",
    url: "project/files",
    token: token,
    query: context.query,
  };
  log(JSON.stringify(toLog));
  const webquery = context.query as { [key: string]: any };
  if (!webquery["pid"]) {
    return {
      redirect: {
        destination: "/home/status",
        permanent: false,
      },
    };
  }
  let retOb: GetServerSidePropsResult<{
    pid: string;
    srfiles: ReturnType<typeof convToSerializable>[];
  }> = {
    redirect: {
      destination: "/home/status",
      permanent: false,
    },
  };
  const conn = await getMongoClient();
  try {
    const result = await projectFilesFindAll(conn, {
      projId: new ObjectId(webquery["pid"]),
    });
    const files: ReturnType<typeof convToSerializable>[] = [];
    for (let index = 0; index < result.length; index++) {
      const element = result[index];
      const file = await getFileMetadata(conn, { _id: element.fileId });
      if (file) {
        files.push(convToSerializable(file));
      }
    }
    retOb = { props: { pid: webquery.pid as string, srfiles: files } };
  } catch (err) {
    retOb = {
      redirect: {
        destination: "/home/status",
        permanent: false,
      },
    };
  } finally {
    await conn.close();

    return retOb;
  }
};

/**
 * Serializing data
 * @param data
 * @returns
 */
function convToSerializable(data: fileMetadataInt) {
  const { _id, uploadDate, ...r } = data;
  return {
    _id: _id?.toHexString(),
    uploadDate: uploadDate.toString(),
    ...r,
  };
}

/**
 * Convert serialized data back to usable data
 * @param data
 * @returns
 */
function convToTable(
  data: ReturnType<typeof convToSerializable>
): fileMetadataInt {
  const { _id: s_id, uploadDate: suploadDate, ...r } = data;
  return {
    _id: new ObjectId(s_id),
    uploadDate: new Date(suploadDate),
    ...r,
  };
}

/**
 * Date display format
 * @param uploadDate
 * @returns
 */
function formatDate(uploadDate: Date) {
  return `${(uploadDate.getDate() + "").padStart(2, "0")}/${(
    uploadDate.getMonth() +
    1 +
    ""
  ).padStart(2, "0")}/${uploadDate.getFullYear()} ${(
    uploadDate.getHours() + ""
  ).padStart(2, "0")}:${(uploadDate.getMinutes() + "").padStart(2, "0")}:${(
    uploadDate.getSeconds() + ""
  ).padStart(2, "0")}`;
}
