import {View} from 'react-native'
import { spacing, Text, Screen } from "@quip/native-ui";
import { Withdraw3Props } from "./Withdraw";

export function Withdraw3({navigation, route}: Withdraw3Props) {
  const { address, amountSol } = route.params
  return (
    <Screen hasSafeArea={false} style={[spacing.fill]}>
      <View>
        <Text>Withdraw3</Text>
        <Text>{address}</Text>
        <Text>{amountSol}</Text>
      </View>
    </Screen>
  )
}

export default Withdraw3;
