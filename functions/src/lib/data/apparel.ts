import {MockupTypes} from "../types/generator";

export type ApparelDataType = {
  [key in MockupTypes]: {[key: string]: any};
};

export const apparel_blanks: ApparelDataType = {
  shirt_gilden: {
    front: {
      ["BLACK"]:
        "https://cdn.shopify.com/s/files/1/0731/7048/5544/files/black_front.png?v=1687985191",
      ["WHITE"]:
        "https://cdn.shopify.com/s/files/1/0731/7048/5544/files/tshirt.png?v=1687918758",
      ["BLUE"]:
        "https://cdn.shopify.com/s/files/1/0731/7048/5544/files/blue_front.png?v=1687985192",
      ["GREEN"]:
        "https://cdn.shopify.com/s/files/1/0731/7048/5544/files/green_front.png?v=1687985193",
      ["GRAY"]:
        "https://cdn.shopify.com/s/files/1/0731/7048/5544/files/gray_front.png?v=1687985193",
    },
    back: {
      ["BLACK"]:
        "https://cdn.shopify.com/s/files/1/0731/7048/5544/files/back_black.png?v=1688057544",
      ["WHITE"]:
        "https://cdn.shopify.com/s/files/1/0731/7048/5544/files/back_white.png?v=1688057546",
      ["BLUE"]:
        "https://cdn.shopify.com/s/files/1/0731/7048/5544/files/back_blue.png?v=1688057546",
      ["GREEN"]:
        "https://cdn.shopify.com/s/files/1/0731/7048/5544/files/back_green.png?v=1688057546",
      ["GRAY"]:
        "https://cdn.shopify.com/s/files/1/0731/7048/5544/files/back_gray.png?v=1688057547",
    },
  },
  hoodie_lane_7: {
    front: {
      ["BLACK"]:
        "https://cdn.shopify.com/s/files/1/0731/7048/5544/files/black_hoodie.png?v=1688134615",
      ["WHITE"]:
        "https://cdn.shopify.com/s/files/1/0731/7048/5544/files/white_hoodie.png?v=1688134616",
      ["BLUE"]:
        "https://cdn.shopify.com/s/files/1/0731/7048/5544/files/navy_hoodie.png?v=1688134616",
      ["GREEN"]:
        "https://cdn.shopify.com/s/files/1/0731/7048/5544/files/green_hoodie_w_drawstrings.png?v=1688133011",
      ["GRAY"]:
        "https://cdn.shopify.com/s/files/1/0731/7048/5544/files/hgrey_hoodie.png?v=1688138135",
    },
    back: {
      ["BLACK"]:
        "https://cdn.shopify.com/s/files/1/0783/4802/6165/files/black.png?v=1712154341",
      ["WHITE"]:
        "https://cdn.shopify.com/s/files/1/0783/4802/6165/files/white.png?v=1712154342",
      ["BLUE"]:
        "https://cdn.shopify.com/s/files/1/0783/4802/6165/files/navy.png?v=1712154342",
      ["GREEN"]:
        "https://cdn.shopify.com/s/files/1/0783/4802/6165/files/olive.png?v=1712154342",
      ["GRAY"]:
        "https://cdn.shopify.com/s/files/1/0783/4802/6165/files/grey.png?v=1712154342",
    },
  },
};
