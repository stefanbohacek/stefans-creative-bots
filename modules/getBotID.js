import { fileURLToPath } from "url";
import path from "path";

export default (importMetaUrl) => {
  const __dirname = path.dirname(fileURLToPath(importMetaUrl));
  return { botID: path.basename(__dirname), __dirname };
};
