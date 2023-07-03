import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native';
import React, {useRef, useState} from 'react';

const scrollOffset = 0

export function Slider(props: ViewProps) {
  const snapOffsets =
    React.Children.map(props.children, (child, index) => {
      return (index * 274) - 50;
    })?.filter((_, index) => index).slice(0, 3) ?? [];

  const scrollRef = useRef<ScrollView>(null);
  const dragStartOffset = useRef<number>(0);

  const [currentPage, setCurrentPage] = useState<number>(1);

  function onScrollBeginDrag(e: NativeSyntheticEvent<NativeScrollEvent>) {
    console.log("drag start")
    dragStartOffset.current = e.nativeEvent.contentOffset.x;
  }

  function onScrollEndDrag(e: NativeSyntheticEvent<NativeScrollEvent>) {
    e.preventDefault()
    console.log("drag end", dragStartOffset.current - e.nativeEvent.contentOffset.x)

    //if the drag offset was positive (dragged right) then we want to snap to the next page
    if (dragStartOffset.current - e.nativeEvent.contentOffset.x < -scrollOffset) {
      //if the current page is not the last page
      if (currentPage < snapOffsets.length - 1) {
        scrollRef.current?.scrollTo({
          x: snapOffsets[currentPage + 1],
          y: 0,
          animated: true,
        });
        setCurrentPage(currentPage + 1);
      } else {
        scrollRef.current?.scrollTo({
          x: snapOffsets[currentPage],
          y: 0,
          animated: true,
        });
      }
    }

    if (dragStartOffset.current - e.nativeEvent.contentOffset.x > scrollOffset) {
      //if the current page is not the first page
      if (currentPage > 0) {
        scrollRef.current?.scrollTo({
          x: snapOffsets[currentPage - 1],
          y: 0,
          animated: true,
        });
        setCurrentPage(currentPage - 1);
      } else {
        scrollRef.current?.scrollTo({
          x: snapOffsets[currentPage],
          y: 0,
          animated: true,
        });
      }
    }
  }

  return (
    <View style={[styles.container]} {...props}>
      <ScrollView
        ref={scrollRef}
        horizontal={true}
        decelerationRate={0}
        style={styles.scroller}
        disableIntervalMomentum={true}
        showsHorizontalScrollIndicator={false}
        contentOffset={{x: snapOffsets[1], y: 0}}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        bounces={false}
      >
        {props.children}
      </ScrollView>
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
  },

  scroller: {

  }
})

export default Slider
