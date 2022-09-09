import Head from "next/head";
import { AppProps } from "next/app";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider, EmotionCache } from "@emotion/react";
import theme from "../src/theme";
import createEmotionCache from "../src/createEmotionCache";
import { SessionProvider } from "next-auth/react";
import NextNProgress from "nextjs-progressbar";
import { ConfirmDialogProvider } from "react-mui-confirm";
import "../styles/globals.css";
import { Detector } from "react-detect-offline";
import { Alert, Snackbar } from "@mui/material";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <SessionProvider>
          <NextNProgress color="#CFE8A9" />
          {/* @ts-ignore */}
          <ConfirmDialogProvider preventDuplicate>
            <Detector
              render={({ online }) => {
                if (!online) {
                  return (
                    <Snackbar open={true}>
                      <Alert severity="error" sx={{ width: "100%" }}>
                        No Internet Connection
                      </Alert>
                    </Snackbar>
                  );
                } else {
                  return <></>;
                }
              }}
            />
            <Component {...pageProps} />
          </ConfirmDialogProvider>
        </SessionProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
