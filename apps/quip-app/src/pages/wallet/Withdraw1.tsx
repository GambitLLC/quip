import { spacing, Text, Screen } from "@quip/native-ui";
import { TextInput } from "react-native-paper";
import { useEffect, useState } from "react";
import { BarCodeScanner } from "expo-barcode-scanner";
import { StyleSheet, Button } from "react-native";
import Scanner from "./Scanner";
import { CommonActions, useNavigation } from "@react-navigation/native";

export function Withdraw1() {
  const navigation = useNavigation()

  return (
    <Screen hasSafeArea={false} style={[spacing.fill]}>
      <TextInput
        label={"Address"}
        mode="flat"
        style={{
          backgroundColor: "white"
        }}
        right={<TextInput.Icon
          onPress={() => {
            navigation.dispatch({
              ...CommonActions.navigate("scanner"),
            })
          }}
          containerColor="white"
          icon="qrcode"
        />}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({})

export default Withdraw1;
