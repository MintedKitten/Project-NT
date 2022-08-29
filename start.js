"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// start.ts
var dotenv = __toESM(require("./node_modules/dotenv/lib/main.js"), 1);
var import_next = __toESM(require("./node_modules/next/dist/server/next.js"), 1);
var import_express = __toESM(require("./node_modules/express/index.js"), 1);
var import_mongodb = require("./node_modules/mongodb/lib/index.js");
var import_bson = require("./node_modules/bson/lib/bson.js");
var import_formidable = __toESM(require("./node_modules/formidable/src/index.js"), 1);
var import_fs = require("fs");
var import_crypto = require("crypto");
dotenv.config({ path: "/.env.local" });
function sha256(msg) {
  const msgBuffer = new TextEncoder().encode(msg);
  const hashBuffer = (0, import_crypto.createHash)("sha256").update(msgBuffer).digest();
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}
var port = parseInt(`${process.env.PORT}`, 10) || 3e3;
var dev = process.env.NODE_ENV !== "production";
var app = (0, import_next.default)({ dev });
var nexthandler = app.getRequestHandler();
var expressMongoString = `mongodb+srv://expressjs:fVlgIRopIn2V6LLN@cluster0.n9ki8.mongodb.net/?retryWrites=true&w=majority`;
var DBname = dev ? "devProcurement" : "Procurement";
var FilesMetaColl = "FilesMetadata";
var client = new import_mongodb.MongoClient(expressMongoString).connect();
async function getMongoclient() {
  return await client;
}
async function closeMongoclient() {
  (await client).close();
}
process.on("SIGINT", (signal) => {
  console.log("Closing signal: " + signal);
  closeMongoclient();
});
function isInstanceOfFile(ob) {
  return "originalFilename" in ob;
}
function isInstanceOfArrayFile(ob) {
  return "length" in ob;
}
async function getFileName(fmid) {
  const result = await (await getMongoclient()).db(DBname).collection(FilesMetaColl).findOne({ _id: fmid }, { projection: { filename: 1, dir: 1 } });
  return result;
}
async function insoFileMetadata(query) {
  const id = await (await getMongoclient()).db(DBname).collection(FilesMetaColl).insertOne(query).then((value) => {
    return value.insertedId;
  });
  return id;
}
async function insoDir2FileMetadata(fmid, query) {
  const id = await (await getMongoclient()).db(DBname).collection(FilesMetaColl).updateOne({ _id: fmid }, { $set: { dir: query.dir } }).then((value) => {
    return value.upsertedId;
  });
  return id;
}
var dirfilepath = "./files/";
app.prepare().then(() => {
  const fileserver = (0, import_express.default)();
  fileserver.get("/files/:fmid", async (req, res, next2) => {
    try {
      const result = await getFileName(new import_bson.ObjectId(req.params.fmid));
      if (result) {
        const { filename, dir } = result;
        console.log(`File downloading: ${filename}
At: ${dir}`);
        res.download(`${dir}`, `${filename}`, function(err) {
          if (!err) {
            console.log(`Successfully downloaded: ${filename}`);
            return res.status(200).end();
          } else {
            console.log(`Error downloading: ${err}`);
            return next2(err);
          }
        });
      } else {
        return res.status(404).end("Can't find that file, sorry!");
      }
    } catch (err) {
      console.log(err);
      return res.status(500).end("Something went wrong.");
    }
  }).post("/files/", async (req, res, next2) => {
    const form = (0, import_formidable.default)();
    const getDataFromBody = new Promise(
      (resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) {
            reject(err);
          }
          resolve({ fields, files });
        });
      }
    );
    if (!(0, import_fs.existsSync)(dirfilepath)) {
      (0, import_fs.mkdirSync)(dirfilepath);
    }
    await getDataFromBody.then((value) => {
      const { fields, files } = value;
      let filelist = [];
      if (isInstanceOfFile(files.file)) {
        filelist[0] = files.file;
      } else if (isInstanceOfArrayFile(files.file)) {
        filelist = files.file;
      }
      if (filelist.length < 1) {
        throw new Error("Can't find any files");
      }
      filelist.forEach(async (file) => {
        let index = file.originalFilename?.lastIndexOf(".");
        let filetype = file.originalFilename?.substring(
          index ? index + 1 : 0
        );
        const fmid = await insoFileMetadata({
          filename: file.originalFilename ? file.originalFilename : "",
          filetype: filetype ? filetype : "",
          contentType: file.mimetype ? file.mimetype : "",
          size: file.size,
          uploadDate: new Date()
        });
        const dir = dirfilepath + sha256(fmid.toHexString());
        await new Promise((resolve, reject) => {
          const reader = (0, import_fs.createReadStream)(file.filepath);
          const writer = (0, import_fs.createWriteStream)(dir);
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
        await insoDir2FileMetadata(fmid, { dir });
        console.log(`New file uploaded at: ${dir}`);
        console.log(`fmid: ` + fmid.toHexString());
        return res.status(201).json({ data: { fmid: fmid.toHexString() } });
      });
    }).catch((err) => {
      console.log(err);
      return res.status(500).end(err);
    });
  }).all("*", (req, res) => {
    return nexthandler(req, res);
  });
  fileserver.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
