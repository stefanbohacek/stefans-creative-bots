export default (word) => {
  if ("aeiou".includes(word[0].toLowerCase())) {
    return "an";
  } else {
    return "a";
  }
};
