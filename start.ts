import "dotenv/config";
import next from "next";
import express from "express";

import * as jsonwebtoken from "jsonwebtoken";
import { MongoClient } from "mongodb";
import { ObjectId } from "bson";
import formidable, { Fields, File, Files } from "formidable";
import { createReadStream, createWriteStream, existsSync, mkdirSync } from "fs";
import { createHash } from "crypto";

import { fileMetadataInt } from "./src/db";
import { NextAuthOptions, unstable_getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import seedrandom from "seedrandom";

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

function hashPassword(username: string, password: string) {
  const hashed = sha256(
    username + password + seedrandom(username + password + secret)()
  );
  return hashed;
}

const secret = "AwesomeSauce";
// Server config from env and server request handler
const port = parseInt(`${process.env.PORT}`, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev: dev });
const nexthandler = app.getRequestHandler();

const expressMongoString =
  "mongodb+srv://expressjs:fVlgIRopIn2V6LLN@cluster0.n9ki8.mongodb.net/?retryWrites=true&w=majority";
const DBname = dev ? "devProcurement" : "Procurement";
const FilesMetaColl = "FilesMetadata";
const userColl = "User";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Username" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, req) => {
        if (credentials) {
          const username = credentials.username;
          const password = credentials.password;
          const user = await getUser(
            username,
            hashPassword(username, password)
          );
          if (user) {
            return { id: user._id, name: user.name, admin: user.admin };
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token) {
        session.id = token.id;
      }
      return session;
    },
  },
  secret: `${secret}`,
  jwt: { secret: `${secret}` },
  pages: { signIn: "/auth/login" },
};

// ExpressJS DB Functions
// Statically create the client, so there's only 1 client per connection
const client = new MongoClient(expressMongoString).connect();

async function getMongoclient(): Promise<MongoClient> {
  return await client;
}

async function closeMongoclient(): Promise<void> {
  (await client).close();
}

async function getUser(username: string, password: string) {
  const query = { username: username, password: password };
  const conn = await getMongoclient();
  const user = conn
    .db(DBname)
    .collection(userColl)
    .findOne(query)
    .then((value) => {
      return value;
    });
  conn.close();
  return user;
}

// When Nodejs server shut down, close MongoDBClient
process.on("SIGINT", (signal) => {
  console.log("Closing signal: " + signal);
  closeMongoclient();
});

function isInstanceOfFile(ob: any): ob is File {
  return "originalFilename" in Object;
}

function isInstanceOfArrayFile(ob: any): ob is File[] {
  return "length" in Object;
}

async function getFileName(fmid: ObjectId): Promise<fileMetadataInt | null> {
  const result = await (
    await getMongoclient()
  )
    .db(DBname)
    .collection(FilesMetaColl)
    .findOne({ _id: fmid }, { projection: { filename: 1, dir: 1 } });
  return result as fileMetadataInt | null;
}

async function insoFileMetadata(query: fileMetadataInt): Promise<ObjectId> {
  const id = await (
    await getMongoclient()
  )
    .db(DBname)
    .collection(FilesMetaColl)
    .insertOne(query)
    .then((value) => {
      return value.insertedId;
    });
  return id;
}

async function insoDir2FileMetadata(
  fmid: ObjectId,
  query: { dir: string }
): Promise<ObjectId> {
  const id = await (
    await getMongoclient()
  )
    .db(DBname)
    .collection(FilesMetaColl)
    .updateOne({ _id: fmid }, { $set: { query } })
    .then((value) => {
      return value.upsertedId;
    });
  return id;
}
const dirfilepath = "/files/";

// declare module "express-serve-static-core" {
//   interface Request extends NextApiRequestExtended {}
// }

// start nextjs env and server, then start expressjs as fileserver, authenticate
app
  .prepare()
  .then(() => {
    const fileserver = express();

    // Authenticate connection
    fileserver
      .use("/files/", async (req, res, next) => {
        console.log("auth");
        const session = unstable_getServerSession(req, res, authOptions);
        if (!session) {
          return res.status(401).end("Unauthorised");
        }
      }) // Download a file
      .get("/files/:fmid", async (req, res, next) => {
        try {
          const result = await getFileName(new ObjectId(req.params.fmid));
          if (result) {
            const { filename, dir } = result;
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
        const getDataFromBody = new Promise<{ fields: Fields; files: Files }>(
          (resolve, reject) => {
            const form = new formidable.IncomingForm();
            form.parse(req, (err, fields, files) => {
              if (err) {
                reject(err);
              }
              console.log(fields, files);
              resolve({ fields, files });
            });
          }
        );
        console.log(1);
        return res.status(200).end();
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

              const dir = dirfilepath + (await sha256(fmid.toHexString()));
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
            });
            return res.status(201).end();
          })
          .catch((err) => {
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
