import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import {
  Backdrop,
  CircularProgress,
  Step,
  StepButton,
  StepLabel,
  Stepper,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { getMongoClient, stagesFindAll, stagesInt } from "../../src/db";
import Head from "next/head";
import { pid } from "process";
import PageAppbar from "../../src/components/PageAppbar";
import PageContainer from "../../src/components/PageContainer";
import PageNavbar from "../../src/components/PageNavbar";
import ProjectNavbar from "../../src/components/ProjectNavbar";
import { ObjectId } from "bson";
import { getLength, StagesProgress } from "../../src/local";
import { useEffect, useRef, useState } from "react";

const ProjectStagesPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ pid, preresult }) => {
  const session = useSession();
  const router = useRouter();
  const { status, data } = session;

  const myRef = useRef(null);

  let stages = preresult.map((res) => {
    return convBack(res);
  });

  stages = stages.sort((a, b) => {
    return a.order < b.order ? -1 : 1;
  });

  const [activeStep, setActiveStep] = useState(() => {
    let activestep = 0;
    for (let index = 0; index < stages.length; index++) {
      const element = stages[index];
      if (
        element.status === StagesProgress.OnGoing &&
        element.order < activestep
      ) {
        activestep = element.order;
      }
    }
    return activestep;
  });

  useEffect(() => {
    const actstep = document.getElementById("activeStep");
    if (actstep) {
      actstep.scrollTo();
    }
  }, []);

  const handleChangeActiveStep = (step: number, id: string) => {
    setActiveStep(step);
    const actstep = document.getElementById(id);
    if (actstep) {
      actstep.scrollTo({ left: 1 });
    }
  };

  // const totalSteps = () => {
  //   return stages.length;
  // };

  // const completedSteps = () => {
  //   return Object.keys(completed).length;
  // };

  // const isLastStep = () => {
  //   return activeStep === totalSteps() - 1;
  // };

  // const allStepsCompleted = () => {
  //   return completedSteps() === totalSteps();
  // };

  // const handleNext = () => {
  //   const newActiveStep =
  //     isLastStep() && !allStepsCompleted()
  //       ? // It's the last step, but not all stages have been completed,
  //         // find the first step that has been completed
  //         stages.findIndex((stage, i) => !(i in completed))
  //       : activeStep + 1;
  //   setActiveStep(newActiveStep);
  // };

  // const handleBack = () => {
  //   setActiveStep((prevActiveStep) => prevActiveStep - 1);
  // };

  // const handleStep = (step: number) => () => {
  //   setActiveStep(step);
  // };

  // const handleComplete = () => {
  //   const newCompleted = completed;
  //   newCompleted[activeStep] = true;
  //   setCompleted(newCompleted);
  //   handleNext();
  // };

  if (status === "unauthenticated") {
    router.push("/api/auth/signin");
  }

  if (status === "authenticated") {
    return (
      <>
        <Head>
          <title>Project Details</title>
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
            currentTab={"Stages"}
            pid={pid}
          />
        </PageAppbar>

        <PageContainer>
          <div style={{ width: "100%", overflow: "auto" }}>
            <Stepper nonLinear alternativeLabel activeStep={activeStep}>
              {stages.map((stage, index) => {
                const { name, order, projId, status, _id } = stage;
                console.log(getLength(name));
                return (
                  <Step
                    key={index}
                    completed={status === StagesProgress.Complete}
                    id={_id?.toHexString()}
                    sx={{
                      minWidth: getLength(name) * 10,
                      minHeight: "140px",
                    }}
                  >
                    <StepButton
                      onClick={() => {
                        handleChangeActiveStep(index, `${_id?.toHexString()}`);
                      }}
                    >
                      {name}
                    </StepButton>
                  </Step>
                );
              })}
            </Stepper>
          </div>
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

export default ProjectStagesPage;

export const getServerSideProps: GetServerSideProps<{
  pid: string;
  preresult: ReturnType<typeof convtoSerializable>[];
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
  const stages = await stagesFindAll(conn, {
    projId: new ObjectId(webquery["pid"]),
  });
  const preresult = stages.map((stage) => {
    return convtoSerializable(stage);
  });
  conn.close();
  return { props: { pid: webquery.pid as string, preresult: preresult } };
};

function convtoSerializable(data: stagesInt) {
  const { _id, projId, ...r } = data;
  return {
    _id: _id?.toHexString(),
    projId: projId.toHexString(),
    ...r,
  };
}

function convBack(data: ReturnType<typeof convtoSerializable>): stagesInt {
  const { _id: s_id, projId: sprojId, ...r } = data;
  return {
    _id: new ObjectId(s_id),
    projId: new ObjectId(sprojId),
    ...r,
  };
}
