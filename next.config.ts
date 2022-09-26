/**
 * @file Start file of nextjs.
 * Initializing environment.
 */
import {
  PHASE_PRODUCTION_SERVER,
  PHASE_PRODUCTION_BUILD,
} from "next/constants.js";
import { NextConfig } from "next";

const start: (
  phase: any,
  { defaultConfig }: { defaultConfig: NextConfig }
) => NextConfig = async (phase, { defaultConfig }): Promise<NextConfig> => {
  const conf: NextConfig = defaultConfig;
  const env = {
    dbName:
      process.env.NODE_ENV !== "production" ? "devProcurement" : "Procurement",
    projectsColl: "Projects",
    projFilesColl: "ProjFiles",
    equipmentsGroupColl: "EquipmentsGroup",
    equipmentsColl: "Equipments",
    stagesColl: "Stages",
    stageFilesColl: "StageFiles",
    filesMetadataColl: "FilesMetadata",
    userColl: "User",
  };
  const userconf: Partial<NextConfig> = {
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
  return conf;
};

export default start;
