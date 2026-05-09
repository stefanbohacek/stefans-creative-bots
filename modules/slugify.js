export default (str) => {
  let slug = "";

  if (str) {
    slug = str.toLowerCase().trim();
    slug = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    slug = slug.replace(/[^a-z0-9\s-]/g, " ").trim();
    slug = slug.replace(/[\s-]+/g, "-");
  }
  return slug;
};
