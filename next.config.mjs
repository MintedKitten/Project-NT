import{PHASE_PRODUCTION_SERVER as l,PHASE_PRODUCTION_BUILD as s}from"./node_modules/next/constants.js";var c=async(o,{defaultConfig:n})=>{let t={...n},e={},r=process.env.NODE_ENV!=="production"?"devProcurement":"Procurement";return e={reactStrictMode:!0,env:{secret:"AwesomeSauce",dbName:r,projectsCollection:"Projects",extraCollection:"Extra",projFilesCollection:"ProjFiles",equipmentsGroupCollection:"EquipmentsGroup",equipmentsCollection:"Equipments",stagesCollection:"Stages",stageFilesCollection:"StageFiles",filesMetadataCollection:"FilesMetadata",userCollection:"User"}},(o===s||o===l)&&(e.distDir="build"),Object.keys(e).forEach(i=>{t[i]=e[i]}),console.log(`Dev or prod?: ${t.distDir}`),t},f=c;export{f as default};