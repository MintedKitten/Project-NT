import { nxcHandler } from "../../src/defaultHandler";

const handler = nxcHandler().all(async (req, res) => {
  try {
    const body = JSON.parse(req.body);
    return res.status(200).json({ data: "hello" });
  } catch (err) {
    return res.status(400).end();
  }
});
export default handler;
