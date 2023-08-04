import { StyleSheet } from "react-native";

export const flex = StyleSheet.create({
  //shared
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  start: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  end: {
    justifyContent: "flex-end",
    alignItems: "flex-end"
  },

  //align
  alignCenter: {
    alignItems: "center"
  },
  alignStart: {
    alignItems: "flex-start"
  },
  alignEnd: {
    alignItems: "flex-end"
  },
  alignStretch: {
    alignItems: "stretch"
  },
  alignBase: {
    alignItems: "baseline"
  },

  //justify
  justifyCenter: {
    justifyContent: "center"
  },
  justifyStart: {
    justifyContent: "flex-start"
  },
  justifyEnd: {
    justifyContent: "flex-end"
  },
  spaceBetween: {
    justifyContent: "space-between"
  },
  spaceAround: {
    justifyContent: "space-around"
  },
  spaceEvenly: {
    justifyContent: "space-evenly"
  },

  //sizing
  fill: {
    width: "100%",
    height: "100%"
  },
  fillH: {
    height: "100%"
  },
  fillW: {
    width: "100%"
  },

  shrink: {
    flexShrink: 1
  },

  grow: {
    flexGrow: 1
  },

  //primitives
  col: {
    display: "flex",
    flexDirection: "column"
  },
  row: {
    display: "flex",
    flexDirection: "row"
  },

})
