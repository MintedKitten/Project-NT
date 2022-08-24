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
import { fileMetadataInt, getMongoClient } from "../../src/db";
import fileSize from "filesize";
import { useConfirmDialog } from "react-mui-confirm";
import { ChangeEvent } from "react";
import { uploadInProject } from "../../src/create/files";

const ProjectFilesPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ pid, files }) => {
  const session = useSession();
  const router = useRouter();
  const { status, data } = session;

  const openConfirmDialog = useConfirmDialog();

  if (status === "unauthenticated") {
    router.push("/api/auth/signin");
  }

  function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    if (!e.target.files) {
      return;
    }
    const file = e.target.files;
    let filename = file[0].name;
    for (let index = 1; index < file.length; index++) {
      const element = file[index].name;
      filename += ", " + element;
    }
    openConfirmDialog({
      title: "Are you sure you want to upload file: " + filename,
      onConfirm: async () => {
        const formData = new FormData();
        for (let index = 1; index < file.length; index++) {
          const elm = file[index];
          formData.append("file", elm);
        }
        formData.append("pid", pid);
        const isUploaded = await uploadInProject(formData);
        // await addFiletoProjFiles(pid, fmid);
        // router.reload();
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
            navlink={[
              { Header: "Search Project", Link: "/search/projects" },
              { Header: "Search Equipments", Link: "/search/equipments" },
              { Header: "Add New Project", Link: "/create/projects" },
            ]}
            currentTab={"Project"}
            session={data}
          />
          <ProjectNavbar
            navlink={[
              { Header: "Details", Link: "/project/projects" },
              { Header: "Files", Link: "/project/files" },
              { Header: "Equipments", Link: "/project/equipments" },
              { Header: "Stages", Link: "/project/stages" },
            ]}
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
                Name
              </Grid>
              <Grid item xs={2}>
                Size
              </Grid>
              <Grid item xs={2}>
                Upload Date
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
                    fontFamily: "Roboto",
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
                        {filetype}
                      </Grid>
                      <Grid
                        item
                        xs={5}
                        sx={{
                          borderBottom: 1,
                          borderColor: "lightgrey",
                        }}
                      >
                        {filename}
                      </Grid>
                      <Grid
                        item
                        xs={2}
                        sx={{
                          borderBottom: 1,
                          borderColor: "lightgrey",
                        }}
                      >
                        {fileSize(size, { standard: "iec" })}
                      </Grid>
                      <Grid
                        item
                        xs={2}
                        sx={{
                          borderBottom: 1,
                          borderColor: "lightgrey",
                        }}
                      >
                        {formatDate(uploadDate)}
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
                          // onClick={(e) => {
                          //   e.preventDefault();
                          //   downloadFile(file);

                          //   setTimeout(() => {
                          //     let d = [...fileLoad];
                          //     d[index] = false;
                          //     setFileLoad(d);
                          //   }, 1000);
                          // }}
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
                                // await deleteFile(`${_id?.toHexString()}`);
                                // router.reload();
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
  files: fileMetadataInt[];
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
  conn.close();
  // const presult = await projectFindOne(conn, {
  //   _id: new ObjectId(webquery["pid"] as string),
  // });
  // if (!presult) {
  //   return {
  //     redirect: {
  //       destination: "/search/projects",
  //       permanent: false,
  //     },
  //   };
  // } else {
  //   const conv = convtoSerializable(presult);
  return { props: { pid: webquery.pid as string, files: [] } };
  // }
};

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
