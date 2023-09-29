import { View, StyleSheet } from "react-native";
import { flex } from "../styles/Flex"
import { p } from "../styles/Spacing"
import { Text } from "../text/Text"
import { theme } from "../../theme"
import { typography } from "../styles/Typography"
import { IconButton, Button } from "react-native-paper";
import React from "react";

interface WalletModalHeaderProps {
  prev: () => void,
  next?: () => void,
  prevIcon: "arrow-left" | "close"
  title: string,
}

export function WalletModalHeader(props: WalletModalHeaderProps) {
  return (
    <View style={[
      flex.row,
      flex.alignCenter,
      flex.spaceBetween,
      p('y', 1),
      p('x', 2),
      {
        backgroundColor: "#f2f2f2"
      }
    ]}>
      <IconButton
        icon={props.prevIcon}
        iconColor={theme.colors.s1}
        onPress={props.prev}
        rippleColor="#14171F20"
      />
      <Text style={[typography.h6]}>
        {props.title}
      </Text>
      {
        props.next ?
          <Button
            onPress={props.next}
            mode="text"
            rippleColor="#14171F20"
          >
            <Text style={[typography.p1]}>
              Next
            </Text>
          </Button>
          :
          <IconButton icon=""/>
      }
    </View>
  )
}

const styles = StyleSheet.create({});

export default WalletModalHeader;
