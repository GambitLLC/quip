import {StyleSheet, ViewStyle } from "react-native";

const spacing = StyleSheet.create({
  fill: {
    flex: 1,
    height: "100%",
    width: "100%",
  },

  center: {
    alignItems: "center",
    justifyContent: "center",
  }
})

type Direction = "t" | "r" | "b" | "l" | "x" | "y" | "a";
type Size = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16
  | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 |30 | 31 | 32
  | -1 | -2 | -3 | -4 | -5 | -6 | -7 | -8 | -9 | -10 | -11 | -12 | -13 | -14 | -15| -16
  | -17 | -18 | -19 | -20 | -21 | -22 | -23 | -24 | -25 | -26 | -27 | -28 | -29 | -30 | -31 | -32
type DirHepler = "" | "Top" | "Right" | "Bottom" | "Left"

function dirHelper(dir: Direction): DirHepler[] {
  switch (dir) {
    case "t":
      return ["Top"];
    case "r":
      return ["Right"];
    case "b":
      return ["Bottom"];
    case "l":
      return ["Left"];
    case "x":
      return ["Left", "Right"];
    case "y":
      return ["Top", "Bottom"];
    case "a":
      return [""];
  }
}

function sizeHelper(size: Size) {
  return size * 4;
}

function p(dir: Direction, size: Size) {
  const hDir = dirHelper(dir);
  const hSize = sizeHelper(size);

  return hDir.reduce((acc, cur) => {
    acc[`padding${cur}`] = hSize;
    return acc;
  }, {} as ViewStyle)
}

function m(dir: Direction, size: Size) {
  const hDir = dirHelper(dir);
  const hSize = sizeHelper(size);

  return hDir.reduce((acc, cur) => {
    acc[`margin${cur}`] = hSize;
    return acc;
  }, {} as ViewStyle)
}

export {
  spacing,
  p,
  m,
}
