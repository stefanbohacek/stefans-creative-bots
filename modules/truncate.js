export default (str, n) =>
  str && str.length > n ? str.slice(0, n - 1) + "…" : str;
