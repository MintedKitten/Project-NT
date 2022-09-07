import { AggregationCursor, Filter, MongoClient } from "mongodb";
import {
  eqJoinProj,
  equipmentsInt,
  projectsInt,
  projJoinStage,
  stagesInt,
} from "./db";
import { Socket } from "net";
import { lookup, LookupOptions, resolve } from "dns";

export async function EquipmentWithProjectName(
  conn: MongoClient,
  query: Filter<equipmentsInt>
) {
  let ret: AggregationCursor<Partial<equipmentsInt & projectsInt>> | null =
    null;

  const result = (await eqJoinProj(conn, query)).project<
    Partial<equipmentsInt & projectsInt>
  >({
    partNumber: 1,
    desc: 1,
    qty: 1,
    unit: 1,
    unitPrice: 1,
    projName: 1,
    projId: 1,
  });
  ret = result;
  return ret;
}

export async function ProjectWithInProgressStage(
  conn: MongoClient,
  query: Filter<projectsInt>
) {
  let ret: AggregationCursor<
    projectsInt & {
      stages_docs: stagesInt[];
    }
  > | null = null;
  const result = (await projJoinStage(conn, query)).project<
    projectsInt & { stages_docs: stagesInt[] }
  >({
    projName: 1,
    type: 1,
    systemCount: 1,
    budget: 1,
    budgetType: 1,
    procurementYear: 1,
    contractstartDate: 1,
    contractendDate: 1,
    mastartDate: 1,
    maendDate: 1,
    comments: 1,
    stages_docs: 1,
  });
  ret = result;
  return ret;
}

// Ping the database
let isPinging = false;

const host = "icanhazip.com";
const port = 0; //?

// Ping Database, currently hardcoding path
export async function isDatabaseReachable() {
  // return await testConnection();
  const options: LookupOptions = { all: true };
  resolve(host, (err, addresses) => {
    console.log(addresses);
  });
  lookup(host, options, (err, addresses) => {
    console.log(addresses);
  });
}

async function testConnection(host: string, port: number) {
  if (!isPinging) {
    isPinging = true;
    const isUp = await new Promise<boolean>((resolve) => {
      const socket = new Socket();
      socket.setTimeout(3000);
      socket
        .on("connect", () => {
          console.log(`${host}:${port} - is up`);
          socket.destroy();
          resolve(true);
        })
        .on("error", (err) => {
          console.log(`${host}:${port} - is down: ${err}`);
          resolve(false);
        })
        .on("timeout", () => {
          console.log(`${host}:${port} - is down: timeout`);
          resolve(false);
        });
      socket.connect({ port: port, host: host });
    });
    isPinging = false;
    return isUp;
  } else {
    return null;
  }
}
