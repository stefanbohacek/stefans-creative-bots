import path from "path";

export default (url) => {
  const fileExtension = path.extname(url).toLowerCase();
  const extensions = [".png", ".jpg", ".jpeg", ".gif"];
  return extensions.indexOf(fileExtension) !== -1;
};
