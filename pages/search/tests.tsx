import { Box, Button, InputLabel, TextField, Typography } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import { useEffect, useState } from "react";
import { restype } from "../api/dummy/dummy";
import { WithId } from "mongodb";
import { projectsInt } from "../../src/db";

const SearchProjectsPage: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ test }) => {
  const session = useSession();
  const router = useRouter();
  const { status, data } = session;

  const [searchData, setSearchData] = useState<{
    name: string;
    type: string;
    year: string;
  }>({ name: "", type: "", year: "" });
  const [result, setResult] = useState<WithId<projectsInt>[]>([]);

  useEffect(() => {
    fetch("/api/dummy/dummy", {
      method: "POST",
      body: JSON.stringify(searchData),
    })
      .then((res) => {
        return res.json();
      })
      .then((json: restype) => {
        return json.data;
      })
      .then((result) => {
        setResult(result);
      });
  }, [searchData]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const searchData = {
      name: data.get("name") + "",
      type: data.get("type") + "",
      year: data.get("year") + "",
    };
    setSearchData(searchData);
  };

  return (
    <Box>
      <Typography>Hello {data?.user?.name}</Typography>
      <Typography>Search query {JSON.stringify(searchData)}</Typography>
      <Box component="form" noValidate onSubmit={handleSearchSubmit}>
        <InputLabel id="labelSearchName">Name</InputLabel>
        <TextField margin="dense" size="small" name="name" />
        <InputLabel id="labelSearchName">Type</InputLabel>
        <TextField margin="dense" size="small" name="type" />
        <InputLabel id="labelSearchName">Year</InputLabel>
        <TextField margin="dense" size="small" name="year" />
        <Button type="submit" variant="outlined">
          Search
        </Button>
      </Box>
      <Box component="div">
        {result &&
          result.map((res) => {
            return (
              <Typography key={res.รายการโครงการจัดซื้อจัดจ้าง}>
                {JSON.stringify(res)}
              </Typography>
            );
          })}
      </Box>
    </Box>
  );
};

export default SearchProjectsPage;

export const getStaticProps: GetStaticProps<{ test: string }> = (context) => {
  console.log(context);
  return { props: { test: "" }, revalidate: 1000 };
};

// export const getServerSideProps: GetServerSideProps<{
//   result: ReturnType<typeof convtoTable>[];
//   filterSelectionYear: number[];
// }> = async (context) => {
//   const token = await getToken({
//     req: context.req,
//     secret: `${process.env.secret}`,
//   });
//   if (!token) {
//     return {
//       redirect: {
//         destination: "/api/auth/signin",
//         permanent: false,
//       },
//     };
//   }
//   const webquery = context.query as { [key: string]: any };
//   if ("name" in webquery && webquery["name"]) {
//     webquery["name"] = new RegExp(".*" + webquery["name"] + ".*");
//   }
//   const query: { [key: string]: any } = {};
//   if (webquery["name"]) {
//     query["รายการโครงการจัดซื้อจัดจ้าง"] = webquery["name"];
//   }
//   if (webquery["type"] && webquery["type"] !== "0") {
//     query["ประเภทโครงการ"] = parseInt(webquery["type"]);
//   }
//   if (webquery["year"] && webquery["year"] !== "0") {
//     query["ปีที่ดำเนินการจัดซื้อจัดจ้าง_buddhist"] = parseInt(webquery["year"]);
//   }
//   const conn = await getMongoClient();
//   const presult = await projectFindAll(conn, query, {
//     รายการโครงการจัดซื้อจัดจ้าง: 1,
//     ประเภทโครงการ: 1,
//     ปีที่ดำเนินการจัดซื้อจัดจ้าง_buddhist: 1,
//   });
//   const pyear = await projectDistinct(
//     conn,
//     "ปีที่ดำเนินการจัดซื้อจัดจ้าง_buddhist",
//     {}
//   );
//   await conn.close();
//   const convresult = presult.map((res) => {
//     return convtoTable(res);
//   });
//   return {
//     props: {
//       result: convresult,
//       filterSelectionYear: pyear as number[],
//     },
//   };
// };

// function convtoTable(data: projectsInt) {
//   return {
//     id: (data._id as ObjectId).toHexString(),
//     name: data.รายการโครงการจัดซื้อจัดจ้าง,
//     type: data.ประเภทโครงการ,
//     year: data.ปีที่ดำเนินการจัดซื้อจัดจ้าง_buddhist,
//   };
// }
