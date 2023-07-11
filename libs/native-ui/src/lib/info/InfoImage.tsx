import { ImageSourcePropType } from "react-native";
import Svg, { Defs, LinearGradient, Path, Pattern, Stop, SvgProps, Use, Image } from "react-native-svg";

interface InfoImageProps {
  imgSrc: ImageSourcePropType,
}

export function InfoImage(props: SvgProps & InfoImageProps) {
  return (<Svg {...props} width={"100%"} height={280} viewBox="0 0 375 280" fill="none">
    <Path d="M-9.16346 -14.4356C-8.61737 -31.5072 5.23996 -45.1407 22.3182 -45.4086L187.5 -48L352.682 -45.4086C369.76 -45.1407 383.617 -31.5073 384.163 -14.4356L388 105.5L384.064 228.538C383.56 244.304 371.643 257.35 355.987 259.276L191.407 279.519C188.812 279.839 186.188 279.839 183.593 279.519L19.0128 259.276C3.35733 257.35 -8.55991 244.304 -9.06422 228.538L-13 105.5L-9.16346 -14.4356Z" fill="#D9D9D9"/>
    <Path d="M-9.16346 -14.4356C-8.61737 -31.5072 5.23996 -45.1407 22.3182 -45.4086L187.5 -48L352.682 -45.4086C369.76 -45.1407 383.617 -31.5073 384.163 -14.4356L388 105.5L384.064 228.538C383.56 244.304 371.643 257.35 355.987 259.276L191.407 279.519C188.812 279.839 186.188 279.839 183.593 279.519L19.0128 259.276C3.35733 257.35 -8.55991 244.304 -9.06422 228.538L-13 105.5L-9.16346 -14.4356Z" fill="url(#pattern0)"/>
    <Path d="M-9.16346 -14.4356C-8.61737 -31.5072 5.23996 -45.1407 22.3182 -45.4086L187.5 -48L352.682 -45.4086C369.76 -45.1407 383.617 -31.5073 384.163 -14.4356L388 105.5L384.064 228.538C383.56 244.304 371.643 257.35 355.987 259.276L191.407 279.519C188.812 279.839 186.188 279.839 183.593 279.519L19.0128 259.276C3.35733 257.35 -8.55991 244.304 -9.06422 228.538L-13 105.5L-9.16346 -14.4356Z" fill="url(#paint0_linear_318_4576)" fillOpacity={0.6}/>
    <Defs>
      <Pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
        <Use xlinkHref="#image0_318_4576" transform="matrix(0.00100982 0 0 0.00123457 -0.227071 0)"/>
      </Pattern>
      <LinearGradient id="paint0_linear_318_4576" x1="187.5" y1="60.985" x2="187.5" y2="259" gradientUnits="userSpaceOnUse">
        <Stop stopOpacity={0}/>
        <Stop offset={1}/>
      </LinearGradient>
      <Image id="image0_318_4576" width={1440} height={810} xlinkHref={props.imgSrc}/>
    </Defs>
  </Svg>)
}

export default InfoImage
