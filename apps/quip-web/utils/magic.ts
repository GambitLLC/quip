import {PromiEvent} from "magic-sdk";
import {LoginWithEmailOTPEvents} from "@magic-sdk/types";

const RPC_URL = 'https://api.devnet.solana.com'

type LoginEvent = PromiEvent<string | null, LoginWithEmailOTPEvents & {
  done: (result: string | null) => void;
  error: (reason: any) => void;
  settled: () => void;
}>

export {
  LoginEvent,
  RPC_URL,
}
