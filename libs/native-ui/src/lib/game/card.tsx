import { ImageSourcePropType, StyleSheet, View, ViewProps } from "react-native";
import Svg, { Defs, LinearGradient, Path, Pattern, Stop, SvgProps, Use, Image} from "react-native-svg";

interface CardProps {
  imgSrc: ImageSourcePropType
}

export function Card(props: SvgProps & CardProps) {
  return (
    <View style={styles.container}>
      <Svg {...props} width={props.width ?? "250"} height={props.height ?? "300"} viewBox="0 0 250 300" fill="none">
        <Path d="M2.37581 33.5854C2.72499 16.4755 16.4742 2.66867 33.5825 2.24797L125 0L216.417 2.24797C233.526 2.66867 247.275 16.4755 247.624 33.5854L250 150L247.624 266.415C247.275 283.525 233.526 297.331 216.417 297.752L125 300L33.5825 297.752C16.4742 297.331 2.72499 283.525 2.37581 266.415L0 150L2.37581 33.5854Z" fill="#D9D9D9"/>
        <Path d="M2.37581 33.5854C2.72499 16.4755 16.4742 2.66867 33.5825 2.24797L125 0L216.417 2.24797C233.526 2.66867 247.275 16.4755 247.624 33.5854L250 150L247.624 266.415C247.275 283.525 233.526 297.331 216.417 297.752L125 300L33.5825 297.752C16.4742 297.331 2.72499 283.525 2.37581 266.415L0 150L2.37581 33.5854Z" fill="url(#pattern0)"/>
        <Path d="M2.37581 33.5854C2.72499 16.4755 16.4742 2.66867 33.5825 2.24797L125 0L216.417 2.24797C233.526 2.66867 247.275 16.4755 247.624 33.5854L250 150L247.624 266.415C247.275 283.525 233.526 297.331 216.417 297.752L125 300L33.5825 297.752C16.4742 297.331 2.72499 283.525 2.37581 266.415L0 150L2.37581 33.5854Z" fill="url(#paint0_linear_267_3024)" fillOpacity={0.6}/>
        <Defs>
          <Pattern id="pattern0" patternContentUnits="objectBoundingBox" width={1} height={1}>
            <Use xlinkHref="#image0_267_3024" transform="matrix(0.00148148 0 0 0.00123457 -0.566667 0)"/>
          </Pattern>
          <LinearGradient id="paint0_linear_267_3024" x1="125" y1="106.5" x2="125" y2="300" gradientUnits="userSpaceOnUse">
            <Stop stopOpacity={0}/>
            <Stop offset={1}/>
          </LinearGradient>
          <Image id="image0_267_3024" width={1440} height={810} xlinkHref={props.imgSrc}/>
        </Defs>
      </Svg>
      <View style={styles.card}>
        {props.children}
      </View>
    </View>

  )
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  card: {
    position: "absolute",
    width: "100%",
    height: "100%",
  }
})

export default Card
