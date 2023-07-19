import Game from "../Game";
import {PerspectiveCamera} from "@react-three/drei/native";
// @ts-ignore
import {Model} from "../../../assets/models/Low_poly_ping_pong_table";

export function PingPong() {
  return (
    <Game>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} />
      <ambientLight intensity={0.1} />
      <directionalLight color="red" position={[0, 0, 5]} />
      <Model />
    </Game>
  )
}
