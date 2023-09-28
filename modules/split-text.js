const splitText = (text, length) => {
  // const expression = new RegExp(`.{1,${length}}`, "g");
  // return text.match(expression, "g");

  let chunks = [];

  for (let i = 0, charsLength = text.length; i < charsLength; i += length) {
    chunks.push(text.substring(i, i + length));
  }

  return chunks;
};

export default splitText;
