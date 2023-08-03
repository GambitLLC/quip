import { View, StyleSheet } from "react-native";
import {p, Screen, spacing, theme, Text, m, border, shortAddress} from "@quip/native-ui";

import QRCodeStyled from 'react-native-qrcode-styled';
import {IconButton, TouchableRipple} from "react-native-paper";
import {MaterialIcons} from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';

interface DepositProps {

}

export function Deposit(props: DepositProps) {
  const address = "HJ7MqeXQL1MLfVEh4qZeUzExKg8RUS9Pxiu98oXruG6j";

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(address);
  };

  return (
    <Screen style={[spacing.fill]}>
      <View style={[styles.deposit, p('a', 6)]}>
        <View style={[{width: "100%"}, m('b', 4)]}>
          <Text style={styles.subtext}>
            QR Code
          </Text>
        </View>
        <View style={[m('b', 8)]}>
          <QRCodeStyled
            data={'HJ7MqeXQL1MLfVEh4qZeUzExKg8RUS9Pxiu98oXruG6j'}
            style={{backgroundColor: 'white'}}
            color={theme.colors.p1}
            padding={0}
            isPiecesGlued={true}
            pieceBorderRadius={2}
            pieceSize={6}
          />
        </View>
        <View style={[{width: "100%"}, m('b', 4)]}>
          <Text style={styles.subtext}>
            Wallet Address
          </Text>
        </View>
        <TouchableRipple
          borderless
          onPress={copyToClipboard}
          style={[
            border.quip,
            styles.address,
            p('x', 6),
            p('y', 2),
          ]}
        >
          <View style={styles.addressView}>
            <Text style={styles.addressText}>
              {address}
            </Text>
            <View style={[p('l', 2)]}>
              <MaterialIcons name="content-copy" size={24} color={theme.colors.p1}/>
            </View>
          </View>
        </TouchableRipple>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  deposit: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },

  subtext: {
    color: theme.colors.s4,
    fontSize: 14,
  },

  address: {
    borderRadius: 24,
    width: "100%"
  },

  addressView: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%"
  },

  addressText: {
    color: theme.colors.s4,
    fontSize: 14,
    flexShrink: 1
  }
});

export default Deposit;
