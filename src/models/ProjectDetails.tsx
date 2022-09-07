import { Grid, Typography, Box } from "@mui/material";
import Big from "big.js";
import { itemObjectInt } from "../db";
import { formatDateDDMMYY, InputEn } from "../local";
import { typeArray } from "../search/projects";

interface ProjectDetailsProps {
  topic: string;
  value: any;
  type: InputEn;
}

export const ProjectDetails = ({ topic, value, type }: ProjectDetailsProps) => {
  if (type === InputEn.Date) {
    const date: Date = value;
    return (
      <>
        <Grid item xs={12} sm={6}>
          <Typography sx={{ fontWeight: "bold" }}>{topic}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography sx={{ fontWeight: "Medium" }}>{`${formatDateDDMMYY(
            date
          )}`}</Typography>
        </Grid>
      </>
    );
  }
  if (type === InputEn.Year) {
    const year: number = value;
    return (
      <>
        <Grid item xs={12} sm={6}>
          <Typography sx={{ fontWeight: "bold" }}>{topic}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography sx={{ fontWeight: "Medium" }}>{`${
            year + 543
          }`}</Typography>
        </Grid>
      </>
    );
  }
  if (type === InputEn.Item) {
    const { amount, unit }: itemObjectInt = value;
    return (
      <>
        <Grid item xs={12} sm={6}>
          <Typography sx={{ fontWeight: "bold" }}>{topic}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box sx={{ display: "flex" }}>
            <Typography sx={{ fontWeight: "Medium" }}>
              {amount} {unit ? unit : "-"}
            </Typography>
          </Box>
        </Grid>
      </>
    );
  }
  if (type === InputEn.TypeList) {
    const l: number = value;
    return (
      <>
        <Grid item xs={12} sm={6}>
          <Typography sx={{ fontWeight: "bold" }}>{topic}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography sx={{ fontWeight: "Medium" }}>{typeArray[l]}</Typography>
        </Grid>
      </>
    );
  }
  if (type == InputEn.Float) {
    const fl: Big = value;
    return (
      <>
        <Grid item xs={12} sm={6}>
          <Typography sx={{ fontWeight: "bold" }}>{topic}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography sx={{ fontWeight: "Medium" }}>{fl.toString()}</Typography>
        </Grid>
      </>
    );
  }
  // Type InputEn.String InputEn.Integer
  return (
    <>
      <Grid item xs={12} sm={6}>
        <Typography sx={{ fontWeight: "bold" }}>{topic}</Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Typography sx={{ fontWeight: "Medium" }}>
          {value ? value : "-"}
        </Typography>
      </Grid>
    </>
  );
};
