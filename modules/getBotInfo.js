import { fileURLToPath } from "url";
import path from "path";

export default (importMetaUrl) => {
  const __dirname = path.dirname(fileURLToPath(importMetaUrl));
  const botID = path.basename(__dirname);

  const getTempDirPath = (ext) =>
    path.join(__dirname, "..", "..", "temp", `${botID}.${ext}`);

  return { botID, getTempDirPath };
};
