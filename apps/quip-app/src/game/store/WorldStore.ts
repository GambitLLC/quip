import { create } from "zustand";
import * as CANNON from "cannon-es";

export interface WorldStore {
  world: CANNON.World,
  bodies: CANNON.Body[],
  addBody: (body: CANNON.Body) => void,
  removeBody: (body: CANNON.Body) => void,
  reset: () => void,
}

const useWorld = create<WorldStore>((set) => ({
  world: new CANNON.World(),
  bodies: [],
  addBody: (body: CANNON.Body) => set((state) => {
    state.world.addBody(body)
    return {
      bodies: [...state.bodies, body]
    }
  }),
  removeBody: (body: CANNON.Body) => set((state) => {
    state.world.removeBody(body)
    return {
      bodies: state.bodies.filter((b) => b !== body)
    }
  }),
  reset: () => set((state) => {
    return {
      world: new CANNON.World(),
      bodies: [],
    }
  }),
}))

export {
  useWorld,
}
