import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import theme from "../../theme";
import NavItem from "./NavItem";
import { p } from "../styles/Spacing";
import {
  DefaultNavigatorOptions,
  ParamListBase, TabNavigationState,
  TabRouter,
  useNavigationBuilder,
  TabRouterOptions, createNavigatorFactory, TabActionHelpers, CommonActions,
} from "@react-navigation/native";
import {useTransition, animated, easings} from "@react-spring/native";
import {useMemo} from "react";

type QuipTab = "games" | "wallet" | "settings"
type QuipTabIcon = "gamepad-variant" | "wallet" | "cog"
const tabs: QuipTab[] = ["games", "wallet", "settings"]
const icons = {
  "games": "gamepad-variant",
  "wallet": "wallet",
  "settings": "cog"
}

// Props accepted by the view
type QuipNavigationConfig = {
  quipNavBarStyle: StyleProp<ViewStyle>;
  contentStyle: StyleProp<ViewStyle>;
}

// Supported screen options
type QuipNavigationOptions = {
  title?: string;
}

// Map of event name and the type of data (in event.data)
//
// canPreventDefault: true adds the defaultPrevented property to the
// emitted events.
type QuipNavigationEventMap = {
  tabPress: {
    data: { isAlreadyFocused: boolean };
    canPreventDefault: true;
  };
};

// The props accepted by the component is a combination of 3 things
type QuipNavProps = DefaultNavigatorOptions<
  ParamListBase,
  TabNavigationState<ParamListBase>,
  QuipNavigationOptions,
  QuipNavigationEventMap
> &
  TabRouterOptions &
  QuipNavigationConfig;

export function QuipNavigator({
  initialRouteName,
  children,
  screenOptions,
  quipNavBarStyle,
  contentStyle,
}: QuipNavProps) {
  const { state, navigation, descriptors, NavigationContent } =
    useNavigationBuilder<
      TabNavigationState<ParamListBase>,
      TabRouterOptions,
      TabActionHelpers<ParamListBase>,
      QuipNavigationOptions,
      QuipNavigationEventMap
    >(TabRouter, {
      children,
      screenOptions,
      initialRouteName,
    });

  const transitions = useTransition(state.index, {
    from: {
      opacity: 0,
    },
    enter: {
      opacity: 1,
    },
    leave: {
      opacity: 0,
    },
    exitBeforeEnter: true,
    config: {
      duration: 300,
      easing: easings.easeOutCubic
    }
  })

  const memoKeys = useMemo(() => {
    console.log("memoKey")
    return state.routes.map((e) => e.key)
  }, [])

  const memoRenders = useMemo(() => {
    console.log("memoRender")
    return memoKeys.map(k => descriptors[k].render())
  }, [])

  return (
    <NavigationContent>
      <View style={styles.navContainer}>
        <View style={[{ flex: 1 }, contentStyle]}>
          {
            transitions((style, i) => (
              <animated.View
                key={state.routes[i].key}
                style={[
                  style,
                  StyleSheet.absoluteFill,
                ]}
              >
                {memoRenders[i]}
              </animated.View>
            ))
          }
        </View>
        <View style={[styles.quipNav, p('x', 6), quipNavBarStyle]}>
          {state.routes.map((route, i) => {
            return (<NavItem onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
                data: {
                  isAlreadyFocused: route.key === state.routes[state.index].key,
                },
              });

              if (!event.defaultPrevented) {
                navigation.dispatch({
                  ...CommonActions.navigate(route),
                  target: state.key,
                });
              }
            }} key={i} active={state.routes[state.index].name === route.name} icon={ icons[route.name as QuipTab] } label={route.name}/>)
          })}
        </View>
      </View>
    </NavigationContent>
  )
}

const styles = StyleSheet.create({
  quipNav: {
    height: 100,
    width: "100%",
    backgroundColor: theme.colors.s5,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: "100%",
    backgroundColor: theme.colors.background
  }
})

export const createQuipNavigator = createNavigatorFactory<
  TabNavigationState<ParamListBase>,
  QuipNavigationOptions,
  QuipNavigationEventMap,
  typeof QuipNavigator
>(QuipNavigator);
