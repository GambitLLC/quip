import {Magic} from "magic-sdk";
import {SolanaExtension} from "@magic-ext/solana";
import { RPC_URL } from "~/utils/magic";
import { LoginEvent } from "~/utils/magic";
import {InstanceWithExtensions, SDKBase} from "@magic-sdk/provider";

declare module '#app' {
  interface NuxtApp {
    $magic: InstanceWithExtensions<SDKBase, SolanaExtension[]>,
    $login (email: string): LoginEvent,
    $logout (): Promise<void>,
  }
}

export default defineNuxtPlugin(nuxtApp => {
  const magic = new Magic('pk_live_79385C11B09DBB96', {
    extensions: [
      new SolanaExtension({
        rpcUrl: RPC_URL,
      }),
    ],
  })

  const login = (email: string) => {
    return magic.auth.loginWithEmailOTP({email, showUI: false})
  }

  const logout = async () => {
    await magic.user.logout()
  }

  nuxtApp.provide('magic', magic)
  nuxtApp.provide('login', login)
  nuxtApp.provide('logout', logout)
})
