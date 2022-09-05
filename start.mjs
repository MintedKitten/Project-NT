import * as M from "./node_modules/dotenv/lib/main.js";
import j from "./node_modules/next/dist/server/next.js";
import C from "./node_modules/express/index.js";
import { MongoClient as H } from "./node_modules/mongodb/lib/index.js";
import { ObjectId as A } from "./node_modules/bson/lib/bson.js";
import D from "./node_modules/formidable/src/index.js";
import {
  createReadStream as N,
  createWriteStream as R,
  existsSync as S,
  mkdirSync as _,
} from "fs";
import { createHash as B } from "crypto";
M.config({ path: "/.env.local" });
function T(t) {
  let n = new TextEncoder().encode(t),
    e = B("sha256").update(n).digest();
  return Array.from(new Uint8Array(e))
    .map((s) => s.toString(16).padStart(2, "0"))
    .join("");
}
var x = parseInt(`${process.env.PORT}`, 10) || 3e3,
  b = process.env.NODE_ENV !== "production",
  v = j({ dev: b }),
  z = v.getRequestHandler(),
  w = b ? "devProcurement" : "Procurement",
  y = "FilesMetadata",
  g;
async function F() {
  return (
    g || (g = new H(process.env.EXPRESS_MONGO_STRING + "")), await g.connect()
  );
}
function G(t) {
  return "originalFilename" in t;
}
function k(t) {
  return "length" in t;
}
async function q(t) {
  return await (
    await F()
  )
    .db(w)
    .collection(y)
    .findOne({ _id: t }, { projection: { filename: 1, dir: 1 } });
}
async function U(t) {
  let n = await F(),
    e = await n
      .db(w)
      .collection(y)
      .insertOne(t)
      .then((a) => a.insertedId);
  return await n.close(), e;
}
async function V(t, n) {
  let e = await F(),
    a = await e
      .db(w)
      .collection(y)
      .updateOne({ _id: t }, { $set: { dir: n.dir } })
      .then((r) => r.upsertedId);
  return await e.close(), a;
}
var h = "./files/";
v.prepare()
  .then(() => {
    let t = C();
    t
      .get("/files/:fmid", async (n, e, a) => {
        try {
          let r = await q(new A(n.params.fmid));
          if (r) {
            let { filename: s, dir: o } = r;
            if (!o || (o && !S(o)))
              return e.status(404).end("Can't find that file, sorry!");
            console.log(`File downloading: ${s}
At: ${o}`),
              e.download(`${o}`, `${s}`, function (c) {
                return c
                  ? (console.log(`Error downloading: ${c}`), a(c))
                  : (console.log(`Successfully downloaded: ${s}`),
                    e.status(200).end());
              });
          } else return e.status(404).end("Can't find that file, sorry!");
        } catch (r) {
          return console.log(r), e.status(500).end("Something went wrong.");
        }
      })
      .post("/files/", async (n, e, a) => {
        let r = D(),
          s = new Promise((o, c) => {
            r.parse(n, (l, d, i) => {
              l && c(l), o({ fields: d, files: i });
            });
          });
        S(h) || _(h),
          await s
            .then((o) => {
              let { fields: c, files: l } = o,
                d = [];
              if (
                (G(l.file) ? (d[0] = l.file) : k(l.file) && (d = l.file),
                d.length < 1)
              )
                throw new Error("Can't find any files");
              d.forEach(async (i) => {
                let I = i.originalFilename?.lastIndexOf("."),
                  O = i.originalFilename?.substring(I ? I + 1 : 0),
                  f = await U({
                    filename: i.originalFilename ? i.originalFilename : "",
                    filetype: O || "",
                    contentType: i.mimetype ? i.mimetype : "",
                    size: i.size,
                    uploadDate: new Date(),
                  }),
                  m = h + T(f.toHexString());
                return (
                  await new Promise((u, P) => {
                    let $ = N(i.filepath),
                      p = R(m);
                    p.on("error", (E) => {
                      P(E);
                    }),
                      p.on("finish", () => {
                        u();
                      }),
                      $.pipe(p);
                  }).catch((u) => {
                    throw new Error(u);
                  }),
                  await V(f, { dir: m }),
                  console.log(`New file uploaded at: ${m}`),
                  console.log("fmid: " + f.toHexString()),
                  e.status(201).json({ data: { fmid: f.toHexString() } })
                );
              });
            })
            .catch((o) => (console.log(o), e.status(500).end(o)));
      })
      .all("*", (n, e) => z(n, e)),
      t.listen(x, () => {
        console.log(`Server started on port ${x}`);
      });
  })
  .catch((t) => {
    console.error(t), process.exit(1);
  });
