import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ParamListBase } from "@react-navigation/native";
import { Avatar, LevelInfo, p, Screen, spacing, theme, typography, Text, m, Achievement } from "@quip/native-ui";
import { View, StyleSheet } from "react-native";
import { IconButton } from "react-native-paper";

function Profile({navigation}: NativeStackScreenProps<ParamListBase, "profile">) {
  return (
    <Screen screenStyle={[{backgroundColor: theme.colors.background}]} style={[spacing.fill]}>
      <View style={[spacing.fill, p('a', 4)]}>
        <View style={[styles.topView, p('a', 6), p('t', 8)]}>
          <View style={[styles.topProfileHeader, m('b', 7)]}>
            <IconButton onPress={() => {
              navigation.goBack()
            }} icon={"close"}/>
            <Text style={[typography.h6]}>Profile</Text>
            <IconButton style={{opacity: 0}} icon={"close"}/>
          </View>
          <Avatar size={112} source={require('../../../assets/AvatarTest.png')}/>
          <Text style={[typography.h5, {color: theme.colors.p1}, m('t', 4), m('b', 6)]}>Username</Text>
          <LevelInfo level={10} currExp={200} totalExp={1000}/>
        </View>
        <View style={[styles.bottomView, m('t', 6)]}>
          <Achievement color={theme.colors.p2} name="Quip!" description="Play 10 quips" progress={3} maxProgress={10} level={2}/>
          <Achievement color={theme.colors.p1} name="GG!" description="Win 5 quips" progress={1} maxProgress={5} level={2}/>
          <Achievement color={"#39C0EB"} name="Sizzling!" description="Win 3 quips in a row" progress={1} maxProgress={3} level={1}/>
        </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  topView: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    backgroundColor: theme.colors.s5,
    borderRadius: 16,
  },
  bottomView: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  topProfileHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%"
  }
})

export default Profile
