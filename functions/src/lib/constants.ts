import {MockupTypes} from "./types/generator";

export const RESIZE_DIMENSIONS: DIMENSIONS = {
  shirt_gilden: {
    FRONT: {
      width: 3.8,
      height: 3.8,
      top: 355,
      left: 550,
      top_m: 3.95,
      left_m: 3.8,
    },
    BACK: {
      width: 3.8,
      height: 3.8,
      top: 255,
      left: 550,
      top_m: 3.95,
      left_m: 3.8,
    },
  },
  hoodie_lane_7: {
    FRONT: {
      width: 3.8,
      height: 3.8,
      top: 720,
      left: 550,
      top_m: 3.95,
      left_m: 5,
    },
    BACK: {
      width: 3.8,
      height: 3.8,
      top: 720,
      left: 530,
      top_m: 3.95,
      left_m: 4.5,
    },
  },
};

type DIMENSIONS = {
  [key in MockupTypes]: {
    FRONT: {
      width: number;
      height: number;
      top: number;
      left: number;
      top_m: number;
      left_m: number;
    };
    BACK: {
      width: number;
      height: number;
      top: number;
      left: number;
      top_m: number;
      left_m: number;
    };
  };
};

export const COMPOSITE_DIMENSIONS = {
  shirt_gilden: {height: 2301, width: 1950},
  hoodie_lane_7: {height: 2560, width: 1950},
};
