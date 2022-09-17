import {
  PHASE_PRODUCTION_SERVER,
  PHASE_PRODUCTION_BUILD,
} from "next/constants.js";
import { NextConfig } from "next";

const start: (
  phase: any,
  { defaultConfig }: { defaultConfig: NextConfig }
) => NextConfig = async (phase, { defaultConfig }): Promise<NextConfig> => {
  let conf = { ...defaultConfig };
  let userconf: Partial<NextConfig> = {};
  let DBname =
    process.env.NODE_ENV !== "production" ? "devProcurement" : "Procurement";
  const env = {
    dbName: DBname,
    projectsCollection: "Projects",
    extraCollection: "Extra",
    projFilesCollection: "ProjFiles",
    equipmentsGroupCollection: "EquipmentsGroup",
    equipmentsCollection: "Equipments",
    stagesCollection: "Stages",
    stageFilesCollection: "StageFiles",
    filesMetadataCollection: "FilesMetadata",
    userCollection: "User",
  };
  userconf = {
    reactStrictMode: true,
    env: env,
    swcMinify: true,
  };
  if (phase === PHASE_PRODUCTION_BUILD || phase === PHASE_PRODUCTION_SERVER) {
    userconf["distDir"] = "build";
  }
  Object.keys(userconf).forEach((key) => {
    conf[key] = userconf[key];
  });
  console.log(`Dev or prod?: ${conf.distDir}`);
  return conf;
};

export default start;
