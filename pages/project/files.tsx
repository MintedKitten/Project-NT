import type {
  GetServerSideProps,
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
import { isMobile } from "react-device-detect";
import {  navInfo, projectNavInfo } from "../../src/local";

const ProjectFilesPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ pid, srfiles }) => {
  const isDisplayMobile = useMediaQuery("(max-width:600px)") || isMobile;
  const session = useSession();
  const router = useRouter();
  const { status, data } = session;

  const openConfirmDialog = useConfirmDialog();

  const files = srfiles.map((sfile) => {
    return convToTable(sfile);
  });

  if (status === "unauthenticated") {
    router.push({ pathname: "/api/auth/signin" });
  }

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
          const uploadRes = await uploadToServer(formData, (ld, tl) => {
            // For upload progress bar
            // console.log("progress: ", ld / tl);
          });
          fmids.push(uploadRes.fmid);
        }
        const isAllSuccessful = await addFMidsToProject(pid, fmids);
        if (isAllSuccessful) {
          router.push({ pathname: "/project/files", query: { pid: pid } });
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

  if (status === "authenticated") {
    return (
      <>
        <Head>
          <title>Project Files</title>
        </Head>
        <PageAppbar>
          <PageNavbar
            navlink={navInfo}
            currentTab={-1}
            session={data}
          />
          <ProjectNavbar
            navlink={projectNavInfo}
            currentTab={"Files"}
            pid={pid}
          />
        </PageAppbar>

        <PageContainer>
          <Box sx={{ display: "flex" }}>
            <TitleButtonElement />
          </Box>
          <Box
            sx={{
              mt: 1,
              border: 1,
              paddingX: 1,
              paddingY: 1,
              borderColor: "lightgrey",
              borderRadius: 2,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }}
          >
            <Grid container spacing={1} rowSpacing={1}>
              <Grid item xs={6}>
                <Typography>Name</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography> Size</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography>Upload Date</Typography>
              </Grid>
              <Grid item xs={2}></Grid>
            </Grid>
          </Box>
          <Box
            sx={{
              paddingTop: 1,
              paddingLeft: 1,
              borderColor: "lightgrey",
            }}
          >
            <Grid container spacing={1} rowSpacing={1}>
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
                files.map((file, index) => {
                  const { _id, filename, filetype, size, uploadDate, dir } =
                    file;
                  return (
                    <>
                      <Grid
                        item
                        xs={1}
                        sx={{
                          borderLeft: 1,
                          borderBottom: 1,
                          borderColor: "lightgrey",
                        }}
                      >
                        <Typography>{filetype}</Typography>
                      </Grid>
                      <Grid
                        item
                        xs={5}
                        sx={{
                          borderBottom: 1,
                          borderColor: "lightgrey",
                        }}
                      >
                        <Typography>{filename}</Typography>
                      </Grid>
                      <Grid
                        item
                        xs={2}
                        sx={{
                          borderBottom: 1,
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
                          borderBottom: 1,
                          borderColor: "lightgrey",
                        }}
                      >
                        <Typography>{formatDate(uploadDate)}</Typography>
                      </Grid>
                      <Grid
                        item
                        xs={1}
                        sx={{
                          borderBottom: 1,
                          borderColor: "lightgrey",
                        }}
                      >
                        <a
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
                          borderRight: 1,
                          borderBottom: 1,
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
                                  router.push({
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
  const webquery = context.query as { [key: string]: any };
  if (!webquery["pid"]) {
    return {
      redirect: {
        destination: "/project/",
        permanent: false,
      },
    };
  }
  const conn = await getMongoClient();
  const result = await projectFilesFindAll(conn, {
    projId: new ObjectId(webquery["pid"]),
  });
  const files: ReturnType<typeof convToSerializable>[] = [];
  for (let index = 0; index < result.length; index++) {
    const element = result[index];
    const file = await getFileMetadata({ _id: element.fileId });
    if (file) {
      files.push(convToSerializable(file));
    }
  }
  conn.close();
  return { props: { pid: webquery.pid as string, srfiles: files } };
};

function convToSerializable(data: fileMetadataInt) {
  const { _id, uploadDate, ...r } = data;
  return {
    _id: _id?.toHexString(),
    uploadDate: uploadDate.toString(),
    ...r,
  };
}

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
