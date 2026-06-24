import ColorThief from "colorthief";
import rgbToHex from "./rgbToHex.js";
import getLuminosity from "./getLuminosity.js";

const PALETTE_SIZE = 10;

export const getImageLuminosity = async (imagePath) => {
  let luminosity = 0;
  try {
    const palette = await ColorThief.getPalette(imagePath, PALETTE_SIZE);
    const luminosities = palette.map(([r, g, b]) =>
      getLuminosity(rgbToHex(r, g, b)),
    );
    luminosity =
      luminosities.reduce((sum, l) => sum + l, 0) / luminosities.length;
  } catch (err) {
    /* noop */
  }
  return luminosity;
};

export const checkImageLuminosity = async (imagePath, min = 20, max = 200) => {
  const luminosity = await getImageLuminosity(imagePath);
  return luminosity > min && luminosity < max;
};
