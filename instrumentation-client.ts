// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://eb07e875f68c8410ccd13ccca45ebecb@o4509587904331776.ingest.de.sentry.io/4509587912458320",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  integrations: [
    // Send console.info, console.error, and console.warn calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["info", "error", "warn"] }),
    // Capture user interactions
    // Sentry.browserTracingIntegration(),
  ],

  _experiments: {
    enableLogs: true,
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
