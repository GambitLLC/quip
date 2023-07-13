import { View, StyleSheet } from "react-native";
import { Screen, spacing, Text } from "@quip/native-ui";

interface QRCodeProps {

}

export function QRCode(props: QRCodeProps) {
  return (
    <Screen style={[spacing.fill]}>
      <View style={[spacing.fill]}>
        <Text>QrCode</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({});

export default QRCode;
