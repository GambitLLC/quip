import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AvatarXp, Balance, m, p, QuipNav, Screen, Slider, spacing, theme } from "@quip/native-ui";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

export default function Home({navigation}: NativeStackScreenProps<any, "home">) {
  return (
    <>
      <Screen screenStyle={{backgroundColor: theme.colors.background}} style={[spacing.fill, spacing.center]}>
        {/*Player Topbar*/}
        <View>
          <Balance amount={2.18}/>
          <AvatarXp style={m('a', 6)} level={99} percentage={.05} source={require('../../../assets/AvatarTest.png')}/>
        </View>
        {/*Select Quip*/}
        <View>
          <Text>
            Select Quip
          </Text>
        </View>
        {/*Slider*/}
        <View>
          <Slider/>
        </View>
        {/*Quip Info*/}
        <View>
          <Text>
            quip Race
          </Text>
          <Text>
            Enjoy fun physics-based games from your favorite creators.
          </Text>
        </View>
        {/*Play Now*/}
        <View>
          <Button mode="contained">
            Play Now
          </Button>
        </View>
        {/*Bottom Quip Nav*/}
        <View>
          <QuipNav/>
        </View>
      </Screen>
    </>
  )
}

const styles = StyleSheet.create({
  playerBar: {

  },
  slider: {

  },
  info: {

  }
})
