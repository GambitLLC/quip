import { create } from "zustand";
import { ColorValue } from "react-native";
import { theme } from "../../theme"

interface Quip {
  name: string,
  description: string,
  color: ColorValue,
  imageSrc: string,
  bgColor: ColorValue,
}

const quips: Quip[] = [
  {
    name: "think",
    description: "Enjoy fun physics-based games from your favorite creators.",
    color: theme.colors.t1,
    imageSrc: "",
    bgColor: "#EEFDFF",
  },
  {
    name: "race",
    description: "Enjoy fun physics-based games from your favorite creators.",
    color: theme.colors.p2,
    imageSrc: "",
    bgColor: theme.colors.s6,
  },
  {
    name: "shoot",
    description: "Enjoy fun physics-based games from your favorite creators.",
    color: theme.colors.p1,
    imageSrc: "",
    bgColor: theme.colors.s5,
  },
]

interface GameStore {
  quipIdx: number,
  quip: Quip,
  left: () => void,
  right: () => void,
}

const useGameStore = create<GameStore>((set) => ({
  quipIdx: 1,
  quip: quips[1],
  left: () => set((state) => (
    {
      quipIdx: state.quipIdx > 0 ? state.quipIdx - 1 : state.quipIdx,
      quip: quips[state.quipIdx > 0 ? state.quipIdx - 1 : state.quipIdx]
    }
  )),
  right: () => set((state) => (
    {
      quipIdx: state.quipIdx < quips.length - 1 ? state.quipIdx + 1 : state.quipIdx,
      quip: quips[state.quipIdx < quips.length - 1 ? state.quipIdx + 1 : state.quipIdx]
    }
  ))
}))

export {
  useGameStore,
  quips
}
