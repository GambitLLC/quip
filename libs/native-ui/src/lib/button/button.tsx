import React from 'react';
import { Button as PaperButton } from 'react-native-paper';
import { IconSource } from "react-native-paper/lib/typescript/src/components/Icon";
import { StyleProp, ViewStyle } from "react-native";

export function Button(props: {
  onPress: () => void,
  title: string,
  icon?: IconSource,
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal',
  compact?: boolean,
  disabled?: boolean,
  accessibilityLabel?: string,
  style?: StyleProp<ViewStyle>,
}) {
  return (
    <PaperButton
      onPress={props.onPress}
      icon={props.icon}
      mode={props.mode ?? "text"}
      compact={props.compact ?? false}
      accessibilityLabel={props.accessibilityLabel ?? props.title}
      contentStyle={props.style}
    >
      {props.title}
    </PaperButton>
  );
}

export default Button;
