import {MockupSizeTypes} from "../lib/types/generator";

/**
 * Converts full color names into standardized abbreviations suitable for SKUs.
 *
 * @param {string} option - The color name to convert.
 * @returns {string} The abbreviated color code or the original color name in uppercase if not predefined.
 *
 * @example
 * console.log(convertColorForSKU("Red"));    // Outputs: "RED"
 */
export const convertColorForSKu = (option: string) => {
  const c = option.toLocaleUpperCase();

  if (!option.includes("/")) {
    /* eslint-disable indent */
    return c == "GREEN"
      ? "GRN"
      : c == "BLUE"
      ? "NVY"
      : c == "WHITE"
      ? "WHT"
      : c == "BLACK"
      ? "BLK"
      : c == "GRAY" || c == "GREY"
      ? "GRY"
      : c == "#2B6B3F"
      ? "FRT"
      : c == "#37424E"
      ? "CHR"
      : c == "#82C8E4"
      ? "SKY"
      : c == "#575B45"
      ? "LDN"
      : c == "#8A8D92"
      ? "HTR"
      : c == "#F6AA79"
      ? "PCH"
      : c == "KHAKI"
      ? "KHK"
      : c == "RED"
      ? "RED"
      : c == "RED"
      ? "RED"
      : c == "Maroon"
      ? "MRN"
      : c == "ROYAL"
      ? "RYL"
      : String(c).toLocaleUpperCase();
    /* eslint-enable indent */
  } else {
    const [l, r] = c.split("/");
    // console.log({l, r});
    /* eslint-disable indent */
    const left =
      l == "GREEN"
        ? "GRN"
        : l == "BLUE"
        ? "NVY"
        : l == "WHITE"
        ? "WHT"
        : l == "BLACK"
        ? "BLK"
        : l == "GRAY" || l == "GREY"
        ? "GRY"
        : l == "#2B6B3F"
        ? "FRT"
        : l == "#37424E"
        ? "CHR"
        : l == "#82C8E4"
        ? "SKY"
        : l == "#575B45"
        ? "LDN"
        : l == "#8A8D92"
        ? "HTR"
        : l == "#F6AA79"
        ? "PCH"
        : l == "KHAKI"
        ? "KHK"
        : l == "RED"
        ? "RED"
        : l == "RED"
        ? "RED"
        : l == "Maroon"
        ? "MRN"
        : l == "ROYAL"
        ? "RYL"
        : String(l).toLocaleUpperCase();
    const right =
      r == "GREEN"
        ? "GRN"
        : r == "BLUE"
        ? "NVY"
        : r == "WHITE"
        ? "WHT"
        : r == "BLACK"
        ? "BLK"
        : r == "GRAY" || r == "GREY"
        ? "GRY"
        : r == "#2B6B3F"
        ? "FRT"
        : r == "#37424E"
        ? "CHR"
        : r == "#82C8E4"
        ? "SKY"
        : r == "#575B45"
        ? "LDN"
        : r == "#8A8D92"
        ? "HTR"
        : r == "#F6AA79"
        ? "PCH"
        : r == "KHAKI"
        ? "KHK"
        : r == "RED"
        ? "RED"
        : r == "RED"
        ? "RED"
        : r == "MAROON"
        ? "MRN"
        : r == "ROYAL"
        ? "RYL"
        : String(r).toLocaleUpperCase();
    /* eslint-enable indent */
    return `${left}-${right}`;
  }
};

export const convertSizeForSKU = (size: MockupSizeTypes) => {
  switch (size) {
    case "SMALL":
      return "S";
    case "MEDIUM":
      return "M";
    case "LARGE":
      return "L";
    default:
      return size;
  }
};
