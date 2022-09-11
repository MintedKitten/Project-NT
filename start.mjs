import C from"./node_modules/next/dist/server/next.js";import P from"./node_modules/express/index.js";import{MongoClient as T}from"./node_modules/mongodb/lib/index.js";import{ObjectId as A}from"./node_modules/bson/lib/bson.js";import R from"./node_modules/formidable/src/index.js";import{createReadStream as H,createWriteStream as _,existsSync as I,mkdirSync as D}from"fs";import{createHash as N}from"crypto";import{getToken as O}from"./node_modules/next-auth/jwt/index.js";function B(t){let n=new TextEncoder().encode(t),e=N("sha256").update(n).digest();return Array.from(new Uint8Array(e)).map(s=>s.toString(16).padStart(2,"0")).join("")}var S=parseInt(`${process.env.PORT}`)||3e3,E=process.env.NODE_ENV!=="production",v=C({dev:E}),W=v.getRequestHandler(),w=E?"devProcurement":"Procurement",y="FilesMetadata";async function F(){return await new T(process.env.EXPRESS_MONGO_STRING+"").on("open",n=>{console.log("An expressjs mongoclient has been opened")}).on("close",()=>{console.log("An expressjs mongoclient has been closed")}).connect()}function z(t){return"originalFilename"in t}function G(t){return"length"in t}async function J(t){return await(await F()).db(w).collection(y).findOne({_id:t},{projection:{filename:1,dir:1}})}async function U(t){let n=await F(),e=await n.db(w).collection(y).insertOne(t).then(i=>i.insertedId);return await n.close(),e}async function V(t,n){let e=await F(),i=await e.db(w).collection(y).updateOne({_id:t},{$set:{dir:n.dir}}).then(a=>a.upsertedId);return await e.close(),i}function k(t=""){let n=t.split("; "),e={};return n.forEach(i=>{let a=i.indexOf("="),s=i.substring(0,a),c=i.substring(a+1);e[s]=decodeURIComponent(c)}),e}var h="./files/";v.prepare().then(()=>{let t=P();t.get("/files/:fmid",async(n,e,i)=>{if(n.cookies=k(n.headers.cookie),!await O({req:n,secret:`${process.env.JWT_SECRET}`}))return e.status(401).end();try{let s=await J(new A(n.params.fmid));if(s){let{filename:c,dir:o}=s;if(!o||o&&!I(o))return e.status(404).end("Can't find that file, sorry!");console.log(`File downloading: ${c}
At: ${o}`),e.download(`${o}`,`${c}`,function(d){return d?(console.log(`Error downloading: ${d}`),i(d)):(console.log(`Successfully downloaded: ${c}`),e.status(200).end())})}else return e.status(404).end("Can't find that file, sorry!")}catch(s){return console.log(s),e.status(500).end("Something went wrong.")}}).post("/files/",async(n,e,i)=>{if(n.cookies=k(n.headers.cookie),!await O({req:n,secret:`${process.env.JWT_SECRET}`}))return e.status(401).end();let s=R(),c=new Promise((o,d)=>{s.parse(n,(l,f,r)=>{l&&d(l),o({fields:f,files:r})})});I(h)||D(h),await c.then(o=>{let{fields:d,files:l}=o,f=[];if(z(l.file)?f[0]=l.file:G(l.file)&&(f=l.file),f.length<1)throw new Error("Can't find any files");f.forEach(async r=>{let x=r.originalFilename?.lastIndexOf("."),b=r.originalFilename?.substring(x?x+1:0),m=await U({filename:r.originalFilename?r.originalFilename:"",filetype:b||"",contentType:r.mimetype?r.mimetype:"",size:r.size,uploadDate:new Date}),u=h+B(m.toHexString());return await new Promise((g,M)=>{let $=H(r.filepath),p=_(u);p.on("error",j=>{M(j)}),p.on("finish",()=>{g()}),$.pipe(p)}).catch(g=>{throw new Error(g)}),await V(m,{dir:u}),console.log(`New file uploaded at: ${u}`),console.log("fmid: "+m.toHexString()),e.status(201).json({data:{fmid:m.toHexString()}})})}).catch(o=>(console.log(o),e.status(500).end(o)))}).all("*",(n,e)=>W(n,e)),t.listen(S,()=>{console.log(`Server started on port ${S}`)})}).catch(t=>{console.error(t),process.exit(1)});
