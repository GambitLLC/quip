import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
  ViewProps
} from "react-native";
import React, { useRef, useState } from "react";
import { p } from "../styles/Spacing";
import Card from "../game/Card";
import theme from "../../theme";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { useGameStore } from "../store/GameStore";

const scrollOffset = 0

interface SliderProps {
  navigation:  NativeStackNavigationProp<ParamListBase>,

}

export function Slider(props: ViewProps & SliderProps) {
  const snapOffsets = [...Array(5).keys()].map(index => (index * 274) - 50).slice(1, 4)

  const scrollRef = useRef<ScrollView>(null);
  const dragStartOffset = useRef<number>(0);
  const scrollX = useRef(new Animated.Value(snapOffsets[1])).current;

  const { quipIdx, left, right} = useGameStore()

  function onScrollBeginDrag(e: NativeSyntheticEvent<NativeScrollEvent>) {
    dragStartOffset.current = e.nativeEvent.contentOffset.x;
  }

  function onScrollEndDrag(e: NativeSyntheticEvent<NativeScrollEvent>) {
    //if the drag offset was positive (dragged right) then we want to snap to the next page
    if (dragStartOffset.current - e.nativeEvent.contentOffset.x < -scrollOffset) {
      //if the current page is not the last page
      if (quipIdx < snapOffsets.length - 1) {
        scrollRef.current?.scrollTo({
          x: snapOffsets[quipIdx + 1],
          y: 0,
          animated: true,
        });
        right()
      } else {
        scrollRef.current?.scrollTo({
          x: snapOffsets[quipIdx],
          y: 0,
          animated: true,
        });
      }
    }

    if (dragStartOffset.current - e.nativeEvent.contentOffset.x > scrollOffset) {
      //if the current page is not the first page
      if (quipIdx > 0) {
        scrollRef.current?.scrollTo({
          x: snapOffsets[quipIdx - 1],
          y: 0,
          animated: true,
        });
        left()
      } else {
        scrollRef.current?.scrollTo({
          x: snapOffsets[quipIdx],
          y: 0,
          animated: true,
        });
      }
    }
  }

  const rotateCard1 = scrollX.interpolate({
    inputRange: [0, 224, 1370],
    outputRange: ["20deg", "0deg", "-20deg"]
  })

  const rotateCard2 = scrollX.interpolate({
    inputRange: [0, 498, 1370],
    outputRange: ["20deg", "0deg","-20deg"]
  })

  const rotateCard3 = scrollX.interpolate({
    inputRange: [0, 772, 1370],
    outputRange: ["20deg", "0deg","-20deg"]
  })

  return (
    <View style={[styles.container]} {...props}>
      <Animated.ScrollView
        onContentSizeChange={(width, height) => {
          console.log(width, height)
        }}
        ref={scrollRef}
        horizontal={true}
        decelerationRate={0}
        style={styles.scroller}
        disableIntervalMomentum={true}
        showsHorizontalScrollIndicator={false}
        contentOffset={{x: snapOffsets[1], y: 0}}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        onScroll={Animated.event([
          {
            nativeEvent: {
              contentOffset: {
                x: scrollX,
              },
            },
          },
        ],{useNativeDriver: true})}
        bounces={false}
        scrollEventThrottle={1}
      >
        <View style={{width: 274, height: 300}}/>
        <Animated.View style={[{transform: [{rotateZ: rotateCard1}]}, p('x', 3)]}>
          <Card
            imgSrc={require('../../../../../apps/quip-app/assets/game1.jpg')}
            cardColor={theme.colors.t1}
            cardTitle={"Think"}
            numPlayers={"25.3k Players"}
            isComingSoon={true}
            navigation={props.navigation}
          />
        </Animated.View>
        <Animated.View style={[{transform: [{rotateZ: rotateCard2}]}, p('x', 3)]}>
          <Card
            imgSrc={require('../../../../../apps/quip-app/assets/game1.jpg')}
            cardColor={theme.colors.p2}
            cardTitle={"Race"}
            numPlayers={"25.3k Players"}
            navigation={props.navigation}
          />
        </Animated.View>
        <Animated.View style={[{transform: [{rotateZ: rotateCard3}]}, p('x', 3)]}>
          <Card
            imgSrc={require('../../../../../apps/quip-app/assets/game1.jpg')}
            cardColor={theme.colors.p1}
            cardTitle={"Shoot"}
            numPlayers={"25.3k Players"}
            isComingSoon={true}
            navigation={props.navigation}
          />
        </Animated.View>
        <View style={{width: 274, height: 300}}/>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 304,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },

  scroller: {
    overflow: "visible",
  }
})

export default Slider
