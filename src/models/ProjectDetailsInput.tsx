import {
  Grid,
  TextField,
  Typography,
  MenuItem,
  Select,
  Box,
} from "@mui/material";
import {
  LocalizationProvider,
  MobileDatePicker,
  DesktopDatePicker,
} from "@mui/x-date-pickers";
import Space from "../components/Space";
import { itemObjectInt } from "../db";
import { InputEn } from "../local";
import { typeArray } from "../search/projects";
import { ThaiAdapterDayjs } from "./classDateAdapter";

const today = new Date();

export type ProjectDetailsInputType = {
  id?: string;
  header: string;
  value: string;
  type: InputEn;
  isDisplayMobile?: boolean;
  onChange: (value: string) => void;
};

export const ProjectDetailsInput = ({
  header,
  value,
  type,
  onChange,
  isDisplayMobile,
}: ProjectDetailsInputType) => {
  if (type === InputEn.Integer) {
    return (
      <>
        <Grid item xs={12} sm={4}>
          <Typography sx={{ fontWeight: "bold" }}>{header}</Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            value={value}
            label={header}
            type="number"
            onChange={(e) => {
              if (e) {
                onChange(e.target.value);
              }
            }}
          />
        </Grid>
      </>
    );
  }
  if (type === InputEn.Float) {
    return (
      <>
        <Grid item xs={12} sm={4}>
          <Typography sx={{ fontWeight: "bold" }}>{header}</Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            value={value}
            label={header}
            type="text"
            onChange={(e) => {
              if (e.target.value) {
                onChange(e.target.value);
              } else {
                onChange(0 + "");
              }
            }}
          />
        </Grid>
      </>
    );
  }
  if (type === InputEn.Date) {
    const date = new Date(value);
    const minD = new Date(
      today.getFullYear() - 50,
      today.getMonth(),
      today.getDate()
    );
    const maxD = new Date(
      today.getFullYear() + 50,
      today.getMonth(),
      today.getDate()
    );
    return (
      <>
        <Grid item xs={12} sm={4}>
          <Typography sx={{ fontWeight: "bold" }}>{header}</Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <LocalizationProvider
            dateAdapter={ThaiAdapterDayjs}
            dateFormats={{
              monthAndYear: "MMMM(MM) BBBB",
              monthShort: "MMM(MM)",
              year: "BBBB",
            }}
          >
            {isDisplayMobile ? (
              <MobileDatePicker
                minDate={minD}
                maxDate={maxD}
                value={date}
                views={["year", "month", "day"]}
                onChange={(e: any | null) => {
                  if (e) {
                    onChange(new Date(e["$y"], e["$M"], e["$D"]).toString());
                  }
                }}
                inputFormat="DD/MM/BBBB"
                showDaysOutsideCurrentMonth
                renderInput={(params) => (
                  <TextField size="small" {...params} disabled />
                )}
              />
            ) : (
              <>
                <TextField
                  sx={{ width: "72px", marginTop: { xs: 1, lg: 0 } }}
                  placeholder="00"
                  value={date.getDate()}
                  size="small"
                  inputProps={{}}
                  label="วัน"
                  onChange={(e) => {
                    if (e.target.value) {
                      onChange(
                        new Date(
                          date.getFullYear(),
                          date.getMonth(),
                          parseInt(e.target.value)
                        ).toString()
                      );
                    } else {
                      onChange(
                        new Date(
                          date.getFullYear(),
                          date.getMonth(),
                          1
                        ).toString()
                      );
                    }
                  }}
                  type="number"
                />
                <TextField
                  sx={{ width: "72px", marginTop: { xs: 1, lg: 0 } }}
                  placeholder="00"
                  value={date.getMonth() + 1}
                  size="small"
                  label="เดือน"
                  onChange={(e) => {
                    if (e.target.value) {
                      onChange(
                        new Date(
                          date.getFullYear(),
                          parseInt(e.target.value) - 1,
                          date.getDate()
                        ).toString()
                      );
                    } else {
                      onChange(
                        new Date(
                          date.getFullYear(),
                          0,
                          date.getDate()
                        ).toString()
                      );
                    }
                  }}
                  type="number"
                />
                <TextField
                  sx={{ width: "90px", marginTop: { xs: 1, lg: 0 } }}
                  placeholder="0000"
                  value={date.getFullYear() + 543}
                  size="small"
                  label="ปี"
                  onChange={(e) => {
                    if (e.target.value.length > 0) {
                      let t = e.target.value;
                      if (t.length > 4) {
                        t = t.slice(-4);
                      }
                      onChange(
                        new Date(
                          parseInt(t) - 543,
                          date.getMonth(),
                          date.getDate()
                        ).toString()
                      );
                    } else {
                      onChange(
                        new Date(
                          -543,
                          date.getMonth(),
                          date.getDate()
                        ).toString()
                      );
                    }
                  }}
                  type="number"
                />
                <DesktopDatePicker
                  minDate={minD}
                  maxDate={maxD}
                  value={date}
                  views={["year", "month", "day"]}
                  onChange={(e: any | null) => {
                    if (e) {
                      onChange(new Date(e["$y"], e["$M"], e["$D"]).toString());
                    }
                  }}
                  inputFormat="DD/MM/BBBB"
                  showDaysOutsideCurrentMonth
                  renderInput={(params) => {
                    let pr = { ...params };
                    if (pr.inputProps) {
                      pr.inputProps.readOnly = true;
                    }
                    return (
                      <TextField
                        size="small"
                        sx={{
                          width: 150,
                          marginTop: { xs: 1, lg: 0 },
                          marginBottom: { xs: 1, lg: 0 },
                        }}
                        {...pr}
                        disabled
                      />
                    );
                  }}
                />
              </>
            )}
          </LocalizationProvider>
        </Grid>
      </>
    );
  }
  if (type === InputEn.Year) {
    const date = new Date(value);
    const minD = new Date(
      today.getFullYear() - 50,
      today.getMonth(),
      today.getDate()
    );
    const maxD = new Date(
      today.getFullYear() + 50,
      today.getMonth(),
      today.getDate()
    );
    return (
      <>
        <Grid item xs={12} sm={4}>
          <Typography sx={{ fontWeight: "bold" }}>{header}</Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <LocalizationProvider
            dateAdapter={ThaiAdapterDayjs}
            dateFormats={{
              monthAndYear: "MMMM(MM) BBBB",
              monthShort: "MMM(MM)",
              year: "BBBB",
            }}
          >
            {isDisplayMobile ? (
              <MobileDatePicker
                minDate={minD}
                maxDate={maxD}
                value={date}
                views={["year"]}
                onChange={(e: any | null) => {
                  if (e) {
                    onChange(new Date(e["$y"], e["$M"], e["$D"]).toString());
                  }
                }}
                inputFormat="BBBB"
                showDaysOutsideCurrentMonth
                renderInput={(params) => (
                  <TextField size="small" {...params} disabled />
                )}
              />
            ) : (
              <>
                <TextField
                  sx={{ width: "90px", marginTop: { xs: 1, lg: 0 } }}
                  placeholder="0000"
                  value={date.getFullYear() + 543}
                  size="small"
                  label="ปี"
                  onChange={(e) => {
                    if (e.target.value.length > 0) {
                      let t = e.target.value;
                      if (t.length > 4) {
                        t = t.slice(-4);
                      }
                      onChange(
                        new Date(
                          parseInt(t) - 543,
                          date.getMonth(),
                          date.getDate()
                        ).toString()
                      );
                    } else {
                      onChange(
                        new Date(
                          -543,
                          date.getMonth(),
                          date.getDate()
                        ).toString()
                      );
                    }
                  }}
                  type="number"
                />
                <DesktopDatePicker
                  minDate={minD}
                  maxDate={maxD}
                  value={date}
                  views={["year"]}
                  onChange={(e: any | null) => {
                    if (e) {
                      onChange(new Date(e["$y"], e["$M"], e["$D"]).toString());
                    }
                  }}
                  inputFormat="BBBB"
                  showDaysOutsideCurrentMonth
                  renderInput={(params) => {
                    let pr = { ...params };
                    if (pr.inputProps) {
                      pr.inputProps.readOnly = true;
                    }
                    return (
                      <TextField
                        size="small"
                        sx={{
                          width: 100,
                          marginTop: { xs: 1, lg: 0 },
                          marginBottom: { xs: 1, lg: 0 },
                        }}
                        {...pr}
                        disabled
                      />
                    );
                  }}
                />
              </>
            )}
          </LocalizationProvider>
        </Grid>
      </>
    );
  }
  if (type === InputEn.Item) {
    const { amount, unit }: itemObjectInt = JSON.parse(value);
    return (
      <>
        <Grid item xs={12} sm={4}>
          <Typography sx={{ fontWeight: "bold" }}>{header}</Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <Box sx={{ display: "flex" }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              value={amount}
              label="จำนวน"
              type="number"
              onChange={(e) => {
                if (e) {
                  onChange(
                    JSON.stringify({ amount: e.target.value, unit: unit })
                  );
                }
              }}
            />
            <Space size={{ xs: "5%", sm: "20%" }} direction="column" />
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              value={unit}
              label="หน่วย"
              type="text"
              onChange={(e) => {
                if (e) {
                  onChange(
                    JSON.stringify({ amount: amount, unit: e.target.value })
                  );
                }
              }}
            />
          </Box>
        </Grid>
      </>
    );
  }
  if (type === InputEn.TypeList) {
    return (
      <>
        <Grid item xs={12} sm={4}>
          <Typography sx={{ fontWeight: "bold" }}>{header}</Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <Select
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
            }}
            size="small"
          >
            {typeArray.slice(1, typeArray.length).map((typeP, index) => (
              <MenuItem key={index} value={index + 1}>
                {typeP}
              </MenuItem>
            ))}
          </Select>
        </Grid>
      </>
    );
  }
  // Type InputEn.String
  return (
    <>
      <Grid item xs={12} sm={4}>
        <Typography sx={{ fontWeight: "bold" }}>{header}</Typography>
      </Grid>
      <Grid item xs={12} sm={8}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          value={value}
          label={header}
          onChange={(e) => {
            if (e) {
              onChange(e.target.value);
            }
          }}
        />
      </Grid>
    </>
  );
};
