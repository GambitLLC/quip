import {defineStore} from "pinia";
import { Magic } from 'magic-sdk';
import { InstanceWithExtensions, SDKBase } from '@magic-sdk/provider';
import { SolanaExtension } from '@magic-ext/solana';

const RPC_URL = 'https://api.devnet.solana.com'

interface AuthStore {
  magic: InstanceWithExtensions<SDKBase, SolanaExtension[]>,
}

const useAuth = defineStore('auth', {
  state: (): AuthStore => {
    return {
      magic: new Magic('pk_live_8618D6B0D8F04F08', {
        extensions: [
          new SolanaExtension({
            rpcUrl: RPC_URL,
          }),
        ],
      }),
    }
  },

  actions: {
    async login(email: string) {
      await this.magic.auth.loginWithEmailOTP({email})
    },

    async logout() {
      await this.magic.user.logout()
    }
  }
})

export {
  useAuth
}

