import { ScrollView, StyleSheet, View, ViewProps } from "react-native";

export function Slider(props: ViewProps) {
  return (
    <View style={[styles.container]} {...props}>
      <ScrollView
        horizontal={true}
        decelerationRate={0}
        snapToInterval={274}
        snapToAlignment={"center"}
        style={styles.scroller}
        centerContent={true}
        disableIntervalMomentum={true}
        showsHorizontalScrollIndicator={false}
      >
        {props.children}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 304,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  scroller: {

  }
})

export default Slider
