import { Image, ImageSourcePropType, ViewProps } from "react-native";

export interface AvatarProps {
  source: ImageSourcePropType
  size?: number
}

export function Avatar(props: ViewProps & AvatarProps) {
  return (
    <Image source={props.source} style={{
      borderRadius: 9999,
      width: props.size ?? 52,
      height: props.size ?? 52
    }}/>
  )
}

export default Avatar;
