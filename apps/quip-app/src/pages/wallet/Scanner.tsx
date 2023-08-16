import { View, StyleSheet, ViewProps } from "react-native";
import { useEffect, useState } from "react";
import { BarCodeScanner } from "expo-barcode-scanner";
import { spacing, Screen } from "@quip/native-ui";

interface ScannerProps extends ViewProps {

}

export function Scanner(props: ScannerProps) {
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
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={styles.cameraView}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  // cameraView: {
  //   width: "100%",
  //   height: "100%"
  // }
});

export default Scanner;
