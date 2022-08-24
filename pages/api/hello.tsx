// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
  data: Array<Object>;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const qry = req.query;
  const y = "hi" in req.headers ? "Hello" : "Is anyone there?";
  res.status(200).json({ name: "John Doe " + y, data: [qry, req.headers] });
}
