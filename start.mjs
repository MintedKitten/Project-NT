import T from "./node_modules/next/dist/server/next.js";
import j from "./node_modules/express/index.js";
import { MongoClient as R } from "./node_modules/mongodb/lib/index.js";
import { ObjectId as H } from "./node_modules/bson/lib/bson.js";
import _ from "./node_modules/formidable/src/index.js";
import {
  createReadStream as A,
  createWriteStream as D,
  existsSync as k,
  mkdirSync as N,
} from "fs";
import { createHash as B } from "crypto";
import { getToken as x } from "./node_modules/next-auth/jwt/index.js";
function W(n) {
  let t = new TextEncoder().encode(n),
    e = B("sha256").update(t).digest();
  return Array.from(new Uint8Array(e))
    .map((s) => s.toString(16).padStart(2, "0"))
    .join("");
}
var b = parseInt(`${process.env.PORT}`) || 3e3,
  v = process.env.NODE_ENV !== "production",
  M = T({ dev: v }),
  z = M.getRequestHandler(),
  y = v ? "devProcurement" : "Procurement",
  F = "FilesMetadata",
  h;
async function I() {
  return (
    h || (h = new R(process.env.EXPRESS_MONGO_STRING + "")), await h.connect()
  );
}
function G(n) {
  return "originalFilename" in n;
}
function J(n) {
  return "length" in n;
}
async function U(n) {
  return await (
    await I()
  )
    .db(y)
    .collection(F)
    .findOne({ _id: n }, { projection: { filename: 1, dir: 1 } });
}
async function V(n) {
  let t = await I(),
    e = await t
      .db(y)
      .collection(F)
      .insertOne(n)
      .then((i) => i.insertedId);
  return await t.close(), e;
}
async function X(n, t) {
  let e = await I(),
    i = await e
      .db(y)
      .collection(F)
      .updateOne({ _id: n }, { $set: { dir: t.dir } })
      .then((a) => a.upsertedId);
  return await e.close(), i;
}
function E(n = "") {
  let t = n.split("; "),
    e = {};
  return (
    t.forEach((i) => {
      let a = i.indexOf("="),
        s = i.substring(0, a),
        c = i.substring(a + 1);
      e[s] = decodeURIComponent(c);
    }),
    e
  );
}
var w = "./files/";
M.prepare()
  .then(() => {
    let n = j();
    n
      .get("/files/:fmid", async (t, e, i) => {
        if (
          ((t.cookies = E(t.headers.cookie)),
          !(await x({ req: t, secret: `${process.env.JWT_SECRET}` })))
        )
          return e.status(401).end();
        try {
          let s = await U(new H(t.params.fmid));
          if (s) {
            let { filename: c, dir: o } = s;
            if (!o || (o && !k(o)))
              return e.status(404).end("Can't find that file, sorry!");
            console.log(`File downloading: ${c}
At: ${o}`),
              e.download(`${o}`, `${c}`, function (d) {
                return d
                  ? (console.log(`Error downloading: ${d}`), i(d))
                  : (console.log(`Successfully downloaded: ${c}`),
                    e.status(200).end());
              });
          } else return e.status(404).end("Can't find that file, sorry!");
        } catch (s) {
          return console.log(s), e.status(500).end("Something went wrong.");
        }
      })
      .post("/files/", async (t, e, i) => {
        if (
          ((t.cookies = E(t.headers.cookie)),
          !(await x({ req: t, secret: `${process.env.JWT_SECRET}` })))
        )
          return e.status(401).end();
        let s = _(),
          c = new Promise((o, d) => {
            s.parse(t, (l, f, r) => {
              l && d(l), o({ fields: f, files: r });
            });
          });
        k(w) || N(w),
          await c
            .then((o) => {
              let { fields: d, files: l } = o,
                f = [];
              if (
                (G(l.file) ? (f[0] = l.file) : J(l.file) && (f = l.file),
                f.length < 1)
              )
                throw new Error("Can't find any files");
              f.forEach(async (r) => {
                let O = r.originalFilename?.lastIndexOf("."),
                  S = r.originalFilename?.substring(O ? O + 1 : 0),
                  u = await V({
                    filename: r.originalFilename ? r.originalFilename : "",
                    filetype: S || "",
                    contentType: r.mimetype ? r.mimetype : "",
                    size: r.size,
                    uploadDate: new Date(),
                  }),
                  m = w + W(u.toHexString());
                return (
                  await new Promise((g, $) => {
                    let C = A(r.filepath),
                      p = D(m);
                    p.on("error", (P) => {
                      $(P);
                    }),
                      p.on("finish", () => {
                        g();
                      }),
                      C.pipe(p);
                  }).catch((g) => {
                    throw new Error(g);
                  }),
                  await X(u, { dir: m }),
                  console.log(`New file uploaded at: ${m}`),
                  console.log("fmid: " + u.toHexString()),
                  e.status(201).json({ data: { fmid: u.toHexString() } })
                );
              });
            })
            .catch((o) => (console.log(o), e.status(500).end(o)));
      })
      .all("*", (t, e) => z(t, e)),
      n.listen(b, () => {
        console.log(`Server started on port ${b}`);
      });
  })
  .catch((n) => {
    console.error(n), process.exit(1);
  });
