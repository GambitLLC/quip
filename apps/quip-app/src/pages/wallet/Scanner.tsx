import { View, StyleSheet, ViewProps, Alert } from "react-native";
import { useEffect, useState } from "react";
import { BarCodeEvent, BarCodeScanner } from "expo-barcode-scanner";
import { spacing, Screen, Text, flex, Sol, theme, typography, m, SolFull, Scan } from "@quip/native-ui";
import { PublicKey } from "@solana/web3.js";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { ScannerProps, Withdraw1Props } from "./Withdraw";

export function Scanner({navigation}: ScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = (event: BarCodeEvent) => {
    setScanned(true)
    let isSolana = false;
    try {
      const pubKey = new PublicKey(event.data)
      isSolana = PublicKey.isOnCurve(pubKey)
    } catch (e) {
      isSolana = false
    }

    if (isSolana) {
      navigation.navigate("withdraw1", {
        address: event.data
      })
    } else {
      Alert.alert("Invalid QR Code", undefined, [
        {
          text: "OK",
          onPress: () => {
            setScanned(false)
          }
        }
      ])
    }
  };

  return (
    <Screen hasSafeArea={false} style={[spacing.fill]} screenStyle={{position: "relative"}}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={styles.cameraView}
        barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
      />
      <View style={[styles.uiView, flex.col, flex.center]}>
        <Scan/>
        <View style={[flex.col, flex.center, m('t', 20)]}>
          <SolFull color={theme.colors.p1} width={40} height={40}/>
          <Text style={[
            m('t', 4),
            typography.p2,
            {color: theme.colors.background}
          ]}>
            Scan SOL address to send funds
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cameraView: {
    width: "100%",
    height: "100%"
  },
  uiView: {
    width: "100%",
    height: "100%",
    position: "absolute"
  }
});

export default Scanner;
