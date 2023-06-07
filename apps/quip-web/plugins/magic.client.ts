import {Magic, PromiEvent} from "magic-sdk";
import {SolanaExtension} from "@magic-ext/solana";
import {InstanceWithExtensions, SDKBase} from "@magic-sdk/provider";
import {LoginWithEmailOTPEvents, MagicUserMetadata} from "@magic-sdk/types";
import {useWebSocket} from "@vueuse/core";
import { Connection, PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram } from "@solana/web3.js";

import { Buffer } from 'buffer'
import { ComputedRef, Ref } from "vue";
globalThis.Buffer = Buffer

type LoginEvent = PromiEvent<string | null, LoginWithEmailOTPEvents & {
  done: (result: string | null) => void;
  error: (reason: any) => void;
  settled: () => void;
}>

type LogoutEvent = PromiEvent<boolean, {
  done: (result: boolean) => void;
  error: (reason: any) => void;
  settled: () => void;
}>

declare module '#app' {
  interface NuxtApp {
    $login (email: string): LoginEvent,
    $logout (): LogoutEvent,
    $ticker: Ticker,
    $crypto: Crypto,
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $login (email: string): LoginEvent,
    $logout (): LogoutEvent,
    $ticker: Ticker,
    $crypto: Crypto,
  }
}

interface Ticker {
  usdPrice: Ref<number>,
  init: () => Promise<void>
}

interface Crypto {
  magic: InstanceWithExtensions<SDKBase, SolanaExtension[]>,
  metadata: Ref<MagicUserMetadata | null>,
  isLoggedIn: Ref<boolean>,
  connection: Ref<Connection | null>,
  pubKey: Ref<PublicKey | null>,
  balance: Ref<number | null>,
  address: ComputedRef<string | null>,
  shortAddress: ComputedRef<string | null>
  send: (destinationAddress: string, sol: number) => Promise<string | null>,
  init: () => Promise<void>,
}

const _useTicker = (): Ticker => {
  const usdPrice = ref<number>(0)
  const interval = ref<NodeJS.Timer | null>(null)
  let isInitialized = false

  async function init() {
    if (isInitialized) return
    isInitialized = true

    const runtimeConfig = useRuntimeConfig()
    const { WSS_BINANCE} = runtimeConfig.public

    //track solana price
    const { status, data, send, open, close } = useWebSocket(WSS_BINANCE, {
      autoReconnect: true,
      onConnected: () => {
        send(JSON.stringify({
          "id": `${Date.now()}`,
          "method": "avgPrice",
          "params": {
            "symbol": "SOLUSD"
          }
        }))
      },
    })

    interval.value = setInterval(() => {
      send(JSON.stringify({
        "id": `${Date.now()}`,
        "method": "avgPrice",
        "params": {
          "symbol": "SOLUSD"
        }
      }))
    }, 1000 * 60)

    watch(data, (newData) => {
      const response = JSON.parse(newData)
      if (response.status === 200) {
        usdPrice.value = response.result.price
      }
    })

    console.log("Initialized Ticker!")
  }

  return { usdPrice, init }
}

const _useMagic = (magic: InstanceWithExtensions<SDKBase, SolanaExtension[]>): Crypto => {
  const metadata = ref<MagicUserMetadata | null>(null)
  const isLoggedIn = ref(false)
  const connection = ref<Connection | null>(null)
  const pubKey = ref<PublicKey | null>(null)
  const balance = ref<number | null>(null)
  const address = computed(() => metadata.value?.publicAddress ?? null)
  const shortAddress = computed(
    () =>
      address.value !== null ?
        address.value.substring(0, 4) + "..." + address.value.slice(-4)
        : null
  )

  magic.user.isLoggedIn().on("done", (result: boolean) => {
    isLoggedIn.value = result
  })

  async function getBalance(): Promise<number | null> {
    if (!connection.value || !pubKey.value) return null;
    return await connection.value.getBalance(pubKey.value) / LAMPORTS_PER_SOL;
  }

  async function send(destinationAddress: string, sol: number): Promise<string | null> {
    const lamports = sol * LAMPORTS_PER_SOL;
    if (!connection.value || !pubKey.value || !balance.value) return null;

    const recipientPubKey = new PublicKey(destinationAddress);
    const hash = await connection.value.getLatestBlockhash()
    let transactionMagic = new Transaction({
      feePayer: pubKey.value,
      recentBlockhash: hash.blockhash,
    })

    const feeInLamports = (await connection.value.getFeeForMessage(
      transactionMagic.compileMessage(),
      'confirmed'
    )).value

    //if we coulnt get the fee, return null
    if (!feeInLamports) return null

    //if the fee is greater than the balance, return null
    if (feeInLamports > (balance.value * LAMPORTS_PER_SOL)) return null

    const transaction = (feeInLamports + lamports) > (balance.value * LAMPORTS_PER_SOL)
      ? SystemProgram.transfer({
        fromPubkey: pubKey.value,
        toPubkey: recipientPubKey,
        lamports: lamports - feeInLamports,
      })
      : SystemProgram.transfer({
        fromPubkey: pubKey.value,
        toPubkey: recipientPubKey,
        lamports,
      })

    transactionMagic.add(...([transaction]))

    const serializeConfig = {
      requireAllSignatures: false,
      verifySignatures: true,
    }

    console.log(`Destination: ${destinationAddress} | SOL: ${sol} | Fee: ${feeInLamports / LAMPORTS_PER_SOL}`)

    const signedTransaction = await magic.solana.signTransaction(transactionMagic, serializeConfig);
    const tx = Transaction.from(signedTransaction.rawTransaction);
    return await connection.value.sendRawTransaction(tx.serialize());
  }

  let isInitialized = false

  async function init() {
    if (isInitialized) return
    isInitialized = true

    const runtimeConfig = useRuntimeConfig()
    const { RPC_URL} = runtimeConfig.public

    metadata.value = await magic.user.getInfo();
    connection.value = new Connection(RPC_URL);
    pubKey.value = new PublicKey(metadata.value.publicAddress!!);
    balance.value = await getBalance();

    connection.value.onAccountChange(pubKey.value, async (accountInfo) => {
      balance.value = accountInfo.lamports / LAMPORTS_PER_SOL;
    })

    if (process.client) {
      window.addEventListener('focus', async () => {
        balance.value = await getBalance();
      })
    }

    console.log("Initialized Crypto!")
  }

  return {
    magic,
    metadata,
    isLoggedIn,
    connection,
    pubKey,
    balance,
    address,
    shortAddress,
    send,
    init
  } as Crypto
}

export default defineNuxtPlugin(nuxtApp => {
  const runtimeConfig = useRuntimeConfig()
  const { RPC_URL, PK_MAGIC} = runtimeConfig.public

  const magic = new Magic(PK_MAGIC, {
    extensions: [
      new SolanaExtension({
        rpcUrl: RPC_URL,
      }),
    ],
  })

  const ticker = _useTicker()
  const crypto = _useMagic(magic)

  const login = (email: string): LoginEvent => magic.auth.loginWithEmailOTP({email, showUI: false})
  const logout = (): LogoutEvent => magic.user.logout()

  nuxtApp.provide('login', login)
  nuxtApp.provide('logout', logout)
  nuxtApp.provide('ticker', ticker)
  nuxtApp.provide('crypto', crypto)
})

export {
  LoginEvent,
  LogoutEvent,
  Crypto,
  Ticker
}
