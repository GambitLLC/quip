import {defineStore} from "pinia";
import {Magic, PromiEvent} from 'magic-sdk';
import { InstanceWithExtensions, SDKBase } from '@magic-sdk/provider';
import { SolanaExtension } from '@magic-ext/solana';
import {LoginWithEmailOTPEvents} from "@magic-sdk/types";

const RPC_URL = 'https://api.devnet.solana.com'

interface AuthStore {
  magic: InstanceWithExtensions<SDKBase, SolanaExtension[]>,
}

type LoginEvent = PromiEvent<string | null, LoginWithEmailOTPEvents & {
  done: (result: string | null) => void;
  error: (reason: any) => void;
  settled: () => void;
}>

const useAuth = defineStore('auth', {
  state: (): AuthStore => {
    return {
      magic: new Magic('pk_live_79385C11B09DBB96', {
        extensions: [
          new SolanaExtension({
            rpcUrl: RPC_URL,
          }),
        ],
      }),
    }
  },

  actions: {
    login(email: string) {
      return this.magic.auth.loginWithEmailOTP({email, showUI: false})
    },

    async logout() {
      await this.magic.user.logout()
    }
  }
})

export {
  useAuth,
  LoginEvent,
}

