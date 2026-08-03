import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function validateExclusiveOutput(content, primaryType) {
  const trimmed = content.trim();
  let entries = [];

  if (trimmed) {
    try {
      const document = JSON.parse(trimmed);
      entries = Array.isArray(document?.items) ? document.items : [document];
    } catch {
      entries = trimmed.split(/\r?\n/).map((line, index) => {
        try {
          return JSON.parse(line);
        } catch (error) {
          throw new Error(
            `Safe output line ${index + 1} is not valid JSON: ${error.message}`,
          );
        }
      });
    }
  }

  if (entries.length !== 1) {
    throw new Error(
      `Expected exactly one ${primaryType} or noop output, found ${entries.length}`,
    );
  }
  const [entry] = entries;
  if (!entry || ![primaryType, "noop"].includes(entry.type)) {
    throw new Error(
      `Expected output type ${primaryType} or noop, found ${entry?.type ?? "missing"}`,
    );
  }
}

async function main() {
  const primaryType = process.argv[2];
  if (!primaryType) {
    throw new Error("A primary safe-output type is required");
  }
  const outputFile =
    process.env.GH_AW_AGENT_OUTPUT ??
    process.env.GH_AW_SAFE_OUTPUTS ??
    path.join(
      process.env.RUNNER_TEMP ?? "",
      "gh-aw",
      "safeoutputs",
      "outputs.jsonl",
    );
  validateExclusiveOutput(await readFile(outputFile, "utf8"), primaryType);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
