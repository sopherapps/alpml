// get environment varable
const ci = Boolean(process.env.CI || false);

const baseOptions = {
  server: {
    command: "npm run serve",
    port: 3000,
    launchTimeout: 10000,
    debug: true,
  },
};

const ciPipelineOptions = {
  launch: {
    headless: true,
    args: [
      "--ignore-certificate-errors",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
    ],
  },
  server: baseOptions.server,
};

/** @type {import('jest-environment-puppeteer').JestPuppeteerConfig} */
module.exports = ci ? ciPipelineOptions : baseOptions;
