import { createWriteStream, WriteStream, existsSync, mkdirSync } from "fs";
import { dirname } from "path";
import { UUID } from "mongodb";

let writer: WriteStream | null;
const log = (logPath: string, content: string) => {
  if (!writer) {
    const dir = dirname(logPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writer = createWriteStream(logPath, { flags: "a", encoding: "utf-8" });
  }
  writer.write(content + "\n");
};

export const logResearchStart = (logPath: string) => {
  const id = new UUID();
  const content = `RESEARCH:${id} | ${Date.now()} START`;
  log(logPath, content);
  return id;
};

export const logResearchEnd = (logPath: string, id: UUID) => {
  const content = `RESEARCH:${id} | ${Date.now()} END`;
  log(logPath, content);
};
