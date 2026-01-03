const http = require("http");
const https = require("https");

const endpoint = process.env.DYNAMODB_ENDPOINT || "http://localhost:8000";
const timeoutMs = Number(process.env.DYNAMODB_WAIT_TIMEOUT_MS || 30_000);
const intervalMs = Number(process.env.DYNAMODB_WAIT_INTERVAL_MS || 500);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requestOnce(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === "https:" ? https : http;

    const req = lib.request(
      {
        protocol: u.protocol,
        hostname: u.hostname,
        port: u.port,
        path: u.pathname || "/",
        method: "GET",
        timeout: 2_000,
      },
      (res) => {
        // DynamoDB Local suele responder 400/404 al GET, pero eso igual
        // nos confirma que el proceso está vivo y acepta conexiones.
        res.resume();
        resolve();
      }
    );

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy(new Error("timeout"));
    });

    req.end();
  });
}

async function main() {
  const start = Date.now();
  while (true) {
    try {
      await requestOnce(endpoint);
      console.log(`✅ DynamoDB Local listo en ${endpoint}`);
      return;
    } catch (err) {
      const elapsed = Date.now() - start;
      if (elapsed >= timeoutMs) {
        console.error(`❌ Timeout esperando DynamoDB Local en ${endpoint}`);
        console.error(err);
        process.exit(1);
      }
      await sleep(intervalMs);
    }
  }
}

main();
