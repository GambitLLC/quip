import { View, ViewProps } from "react-native";
import Avatar, { AvatarProps } from "./avatar";
import theme from "../../theme";
import { typography } from "../styles/typography";
import { p } from "../styles/spacing";
import React from "react";
import Svg, { Circle } from "react-native-svg";
import { Text } from "../text/text"

interface AvatarXpProps extends AvatarProps {
  percentage: number,
  level: number,
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function circleSvgPath(angleInDegrees: number, radius: number) {
  const start = polarToCartesian(radius, radius, radius, 0);
  const end = polarToCartesian(radius, radius, radius, angleInDegrees);

  const largeArcFlag = angleInDegrees <= 180 ? "0" : "1";

  const d = [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");

  return d;
}

export function AvatarXp(props: ViewProps & AvatarXpProps) {
  const svgPercentage = 1 - props.percentage
  const size = 64
  const radius = size / 2
  const strokeWidth = 4
  const circum = radius * 2 * Math.PI

  return (
    <View style={[{
      width: size,
      height: size,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative"
    }, props.style]}>
      <View style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Avatar style={{position: "absolute"}} source={props.source}/>
      </View>
      <View style={{
        position: "absolute",
        padding: 2,
        backgroundColor: theme.colors.background,
        borderRadius: 9999,
        right: -6,
        bottom: -6,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 5,
      }}>
        <View style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 9999,
          backgroundColor: theme.colors.p1,
        }}>
          <Text style={[typography.p3, p('x', 2), { color: theme.colors.s2 }]}>
            {props.level}
          </Text>
        </View>
      </View>
      <Svg width={size} height={size}>
        <Circle
          cx={size/2}
          cy={size/2}
          fill="transparent"
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          stroke={"#E7E9FD"}
          r={size/2 - strokeWidth/2}
        />
        <Circle
          cx={size/2}
          cy={size/2}
          fill="transparent"
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          stroke={theme.colors.p1}
          r={size/2 - strokeWidth/2}
          strokeDasharray={`${circum} ${circum}`}
          strokeDashoffset={radius * Math.PI * 2 * svgPercentage}
          transform={`rotate(90, ${size/2}, ${size/2})`}
        />
      </Svg>
    </View>
  )

  return (
    <View style={{
      width: 64,
      height: 64,
      backgroundColor: theme.colors.p1,
      borderRadius: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative"
    }}>
      <View style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        borderRadius: 9999,
        backgroundColor: "red",
        zIndex: 3
      }}/>
      <View style={{
        margin: 4,
        width: "100%",
        height: "100%",
        backgroundColor: theme.colors.s2,
        borderRadius: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 4,
        position: "absolute",
      }} {...props}>
        <Avatar style={{position: "absolute"}} source={props.source}/>
        <View style={{
          position: "absolute",
          padding: 2,
          backgroundColor: theme.colors.background,
          borderRadius: 9999,
          right: -6,
          bottom: -6,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <View style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 9999,
            backgroundColor: theme.colors.p1,
          }}>
            <Text style={[typography.p3, p('x', 2), { color: theme.colors.s2 }]}>
              {props.level}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default AvatarXp;
