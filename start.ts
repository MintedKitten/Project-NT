import * as dotenv from "dotenv";
dotenv.config({ path: "/.env.local" });
import next from "next";
import express from "express";

import { MongoClient } from "mongodb";
import { ObjectId } from "bson";
import formidable, { Fields, File, Files } from "formidable";
import { createReadStream, createWriteStream, existsSync, mkdirSync } from "fs";
import { createHash } from "crypto";

import { fileMetadataInt } from "./src/db";
import { getToken } from "next-auth/jwt";

/**
 * SHA256 Hashing
 * @param msg the string to be hashed
 * @returns hashed string
 */
function sha256(msg: string) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(msg);
  // hash the message
  const hashBuffer = createHash("sha256").update(msgBuffer).digest();
  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // convert bytes to hex string
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

// Server config from env and server request handler
const port = parseInt(`${process.env.PORT}`, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev: dev });
const nexthandler = app.getRequestHandler();

// const expressMongoString = `mongodb+srv://expressjs:fVlgIRopIn2V6LLN@cluster0.n9ki8.mongodb.net/?retryWrites=true&w=majority`;
const DBname = dev ? "devProcurement" : "Procurement";
const FilesMetaColl = "FilesMetadata";

// ExpressJS DB Functions
// Statically create the client, so there's only 1 client per connection

let client: MongoClient;

async function getMongoclient(): Promise<MongoClient> {
  if (!client) {
    client = new MongoClient(process.env.EXPRESS_MONGO_STRING + "");
  }
  return await client.connect();
}

function isInstanceOfFile(ob: any): ob is File {
  return "originalFilename" in ob;
}

function isInstanceOfArrayFile(ob: any): ob is File[] {
  return "length" in ob;
}

async function getFileName(fmid: ObjectId): Promise<fileMetadataInt | null> {
  const conn = await getMongoclient();
  const result = await conn
    .db(DBname)
    .collection(FilesMetaColl)
    .findOne({ _id: fmid }, { projection: { filename: 1, dir: 1 } });

  return result as fileMetadataInt | null;
}

async function insoFileMetadata(query: fileMetadataInt): Promise<ObjectId> {
  const conn = await getMongoclient();
  const id = await conn
    .db(DBname)
    .collection(FilesMetaColl)
    .insertOne(query)
    .then((value) => {
      return value.insertedId;
    });
  await conn.close();
  return id;
}

async function insoDir2FileMetadata(
  fmid: ObjectId,
  query: { dir: string }
): Promise<ObjectId> {
  const conn = await getMongoclient();
  const id = await conn
    .db(DBname)
    .collection(FilesMetaColl)
    .updateOne({ _id: fmid }, { $set: { dir: query.dir } })
    .then((value) => {
      return value.upsertedId;
    });
  await conn.close();
  return id;
}
const dirfilepath = "./files/";

// declare module "express-serve-static-core" {
//   interface Request extends NextApiRequestExtended {}
// }

// start nextjs env and server, then start expressjs as fileserver, authenticate
app
  .prepare()
  .then(() => {
    const fileserver = express();

    fileserver
      // Download a file
      .get("/files/:fmid", async (req, res, next) => {
        const token = await getToken({
          req: req,
          secret: `${process.env.JWT_SECRET}`,
        });
        if (!token) {
          return res.status(401).end();
        }
        try {
          const result = await getFileName(new ObjectId(req.params.fmid));
          if (result) {
            const { filename, dir } = result;
            if (!dir || (dir && !existsSync(dir))) {
              return res.status(404).end("Can't find that file, sorry!");
            }
            console.log(`File downloading: ${filename}\nAt: ${dir}`);
            res.download(`${dir}`, `${filename}`, function (err) {
              if (!err) {
                // File downloaded successfully
                console.log(`Successfully downloaded: ${filename}`);
                return res.status(200).end();
              } else {
                console.log(`Error downloading: ${err}`);
                return next(err);
              }
            });
          } else {
            return res.status(404).end("Can't find that file, sorry!");
          }
        } catch (err) {
          console.log(err);
          return res.status(500).end("Something went wrong.");
        }
      })
      .post("/files/", async (req, res, next) => {
        const token = await getToken({
          req: req,
          secret: `${process.env.JWT_SECRET}`,
        });
        if (!token) {
          return res.status(401).end();
        }
        const form = formidable();
        const getDataFromBody = new Promise<{ fields: Fields; files: Files }>(
          (resolve, reject) => {
            form.parse(req, (err, fields, files) => {
              if (err) {
                reject(err);
              }
              resolve({ fields, files });
            });
          }
        );
        if (!existsSync(dirfilepath)) {
          mkdirSync(dirfilepath);
        }
        await getDataFromBody
          .then((value) => {
            const { fields, files } = value;
            let filelist: File[] = [];
            if (isInstanceOfFile(files.file)) {
              filelist[0] = files.file;
            } else if (isInstanceOfArrayFile(files.file)) {
              filelist = files.file;
            }
            if (filelist.length < 1) {
              throw new Error("Can't find any files");
            }
            filelist.forEach(async (file) => {
              // Insert file metadata into database
              let index = file.originalFilename?.lastIndexOf(".");
              let filetype = file.originalFilename?.substring(
                index ? index + 1 : 0
              );

              const fmid = await insoFileMetadata({
                filename: file.originalFilename ? file.originalFilename : "",
                filetype: filetype ? filetype : "",
                contentType: file.mimetype ? file.mimetype : "",
                size: file.size,
                uploadDate: new Date(),
              });

              const dir = dirfilepath + sha256(fmid.toHexString());
              await new Promise<void>((resolve, reject) => {
                const reader = createReadStream(file.filepath);
                const writer = createWriteStream(dir);
                writer.on("error", (err) => {
                  reject(err);
                });
                writer.on("finish", () => {
                  resolve();
                });
                reader.pipe(writer);
              }).catch((err) => {
                throw new Error(err);
              });
              await insoDir2FileMetadata(fmid, { dir: dir });
              console.log(`New file uploaded at: ${dir}`);
              console.log(`fmid: ` + fmid.toHexString());
              return res
                .status(201)
                .json({ data: { fmid: fmid.toHexString() } });
            });
          })
          .catch((err) => {
            console.log(err);
            return res.status(500).end(err);
          });
      })
      .all("*", (req, res) => {
        return nexthandler(req, res);
      });
    fileserver.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
