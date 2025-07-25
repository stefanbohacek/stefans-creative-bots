import ColorThief from "colorthief";
import rgbToHex from "./rgb-to-hex.js";
import getLuminosity from "./get-luminosity.js";

export default async (imagePath) => {
    let luminosity = 0;
    try{
        const color = await ColorThief.getColor(imagePath);
        const hex = rgbToHex(...color);
        luminosity = getLuminosity(hex);
    } catch(err){ /* noop */ }
    return luminosity;
};
