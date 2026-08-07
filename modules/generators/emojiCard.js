import renderHtml from "../renderHtml.js";

export default async ({
  mainText,
  captionText,
  emoji,
  width,
  height,
  mainFontSize,
  captionFontSize,
  captionMarginTop,
  emojiFontSize,
  emojiMarginTop,
  scale = 1,
}) => {
  const html = /* html */ `
    <div id="main">${mainText}</div>
    <div id="caption">${captionText}</div>
    <div id="emoji">${emoji}</div>
  `;

  return renderHtml({
    html,
    cssInline: /* css */ `
      @font-face {
        font-family: "Go Noto Kurrent";
        src: url("https://bots.stefanbohacek.com/fonts/GoNotoKurrent-Regular.ttf");
      }
      body {
        margin: 0;
        width: ${width}px;
        height: ${height}px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        font-family: "Go Noto Kurrent", serif;
        transform: scale(${scale});
        transform-origin: top left;
      }
      #main {
        font-size: ${mainFontSize}px;
      }
      #caption {
        margin-top: ${captionMarginTop}px;
        font-size: ${captionFontSize}px;
      }
      #emoji {
        margin-top: ${emojiMarginTop}px;
        font-size: ${emojiFontSize}px;
      }
    `,
  });
};
