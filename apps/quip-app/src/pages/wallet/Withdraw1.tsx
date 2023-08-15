import { spacing, Text, Screen } from "@quip/native-ui";
import { TextInput } from "react-native-paper";
import { useEffect, useState } from "react";
import { BarCodeScanner } from "expo-barcode-scanner";
import { StyleSheet, Button } from "react-native";
import Scanner from "./Scanner";

export function Withdraw1() {
  return (
    <Screen hasSafeArea={false} style={[spacing.fill]}>
      {/*<TextInput*/}
      {/*  label={"Address"}*/}
      {/*  mode="flat"*/}
      {/*  style={{*/}
      {/*    backgroundColor: "white"*/}
      {/*  }}*/}
      {/*  right={<TextInput.Icon containerColor="white" icon="qrcode"/>}*/}
      {/*/>*/}
      <Scanner style={styles.cameraView}/>
    </Screen>
  )
}

const styles = StyleSheet.create({
  cameraView: {
    width: "100%",
    height: "100%",
  }
})

export default Withdraw1;
