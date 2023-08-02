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
        <Text>
          Deposit
        </Text>
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
