import * as React from "react"
import Svg, { Path, Defs, LinearGradient, Stop, SvgProps } from "react-native-svg"

interface ScanProps {

}

export function Scan(props: ScanProps) {
  return (
    <Svg
      width={230}
      height={230}
      viewBox="-2 -2 204 204"
      fill="none"
      stroke={"white"}
      strokeWidth={3}
      strokeLinecap={"round"}
    >
      <Path d="M 0 50 L 0 30 C 0 10, 10 0, 30 0 L 50 0"/>
      <Path d="M 200 50 L 200 30 C 200 10, 190 0, 170 0 L 150 0"/>
      <Path d="M 0 150 L 0 170 C 0 190, 10 200, 30 200 L 50 200"/>
      <Path d="M 200 150 L 200 170 C 200 190, 190 200, 170 200 L 150 200"/>
    </Svg>
  );
}

export default Scan;
