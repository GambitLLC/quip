import { View, StyleSheet, Pressable } from "react-native";
import theme from "../../theme";
import { Text } from "../text/Text";
import { m } from "../styles/Spacing"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { CommonActions, useNavigation } from "@react-navigation/native";
import {TouchableRipple} from "react-native-paper";
import ButtonClick from "../animations/ButtonClick";

interface WalletNavIconProps {
  title: string,
  icon: "arrow-downward" | "arrow-upward" | "credit-card" | "qr-code-scanner",
  route: string
}

export function WalletNavIcon(props: WalletNavIconProps) {
  const navigation = useNavigation();

  return (
    <View>
      <ButtonClick borderless onPress={() => {
        navigation.dispatch({
          ...CommonActions.navigate(props.route),
        })
      }} style={styles.icon}>
        <MaterialIcons name={props.icon} size={24} color={theme.colors.p1}/>
      </ButtonClick>
      <Text style={[styles.iconLabel, m('t', 2)]}>{props.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    width: 56,
    height: 56,
    borderRadius: 16,
  },

  iconLabel: {
    textAlign: 'center',
    fontSize: 12,
  }
});

export default WalletNavIcon;
