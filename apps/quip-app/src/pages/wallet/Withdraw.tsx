import {View, StyleSheet, Pressable} from "react-native";
import {m, p, Screen, spacing, Text, theme, typography} from "@quip/native-ui";
import { CryptoNumpadInput } from "@quip/native-ui";
import {FontAwesome} from "@expo/vector-icons";
import {IconButton, TouchableRipple} from "react-native-paper";
import {useNavigation} from "@react-navigation/native";

interface DepositProps {

}

export function Deposit(props: DepositProps) {
  const navigation = useNavigation();
  return (
    <Screen style={[spacing.fill]}>
      <View style={[spacing.fill, p('a', 4)]}>
        <View style={[p('a', 6), styles.depositHeader]}>
          <View style={[styles.depositHeaderRow, m('b', 4)]}>
            <IconButton iconColor={theme.colors.s1} size={24} icon="close" onPress={() => {
              navigation.goBack();
            }}/>
            <Text style={typography.h6}>Withdraw</Text>
            <IconButton icon="" onPress={() => {}}/>
          </View>
          <View style={styles.depositHeaderRow}>
            <TouchableRipple borderless onPress={() => {}} style={styles.depositButton}>
              <Text style={styles.maxText}>MAX</Text>
            </TouchableRipple>
            <View style={styles.info}>
              <Text style={styles.subtext}>USD</Text>
              <View style={{flexDirection: "row", display: "flex", alignItems:"center"}}>
                <FontAwesome size={36} style={[m('b', 1), m('r', 1)]} name="usd"/>
                <Text style={[typography.h4, p('y', 2)]}>0</Text>
              </View>
              <Text style={styles.subtext}>0 SOL</Text>
            </View>
            <TouchableRipple borderless onPress={() => {}} style={styles.depositButton}>
              <FontAwesome color={theme.colors.p1} size={16} name="refresh"/>
            </TouchableRipple>
          </View>
        </View>
        <View style={[spacing.fill, m('y', 10)]}>
          <CryptoNumpadInput/>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  depositHeader: {
    backgroundColor: theme.colors.s5,
    borderRadius: 16,
  },

  depositHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  depositButton: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 56,
    height: 56,
  },

  maxText: {
    fontSize: 14,
    color: theme.colors.p1,
  },

  subtext: {
    fontSize: 14,
    color: theme.colors.s4,
  },

  info: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }
});

export default Deposit;

