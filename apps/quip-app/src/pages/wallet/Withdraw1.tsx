import { spacing, Text, Screen } from "@quip/native-ui";
import { TextInput } from "react-native-paper";
import { useEffect, useState } from "react";
import { BarCodeScanner } from "expo-barcode-scanner";
import { StyleSheet, Button } from "react-native";

export function Withdraw1() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: {type: any, data: any}) => {
    setScanned(true);
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

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
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={styles.cameraView}
      >
        {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
      </BarCodeScanner>
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
