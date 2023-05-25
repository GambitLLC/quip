import {Magic, PromiEvent} from "magic-sdk";
import {SolanaExtension} from "@magic-ext/solana";
import {InstanceWithExtensions, SDKBase} from "@magic-sdk/provider";
import {LoginWithEmailOTPEvents, MagicUserMetadata} from "@magic-sdk/types";
import {useWebSocket} from "@vueuse/core";
import { Connection, PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram } from "@solana/web3.js";

import { Buffer } from 'buffer'
import {Ref} from "vue";
globalThis.Buffer = Buffer

const RPC_URL = 'https://api.devnet.solana.com'

type LoginEvent = PromiEvent<string | null, LoginWithEmailOTPEvents & {
  done: (result: string | null) => void;
  error: (reason: any) => void;
  settled: () => void;
}>

declare module '#app' {
  interface NuxtApp {
    $login (email: string): LoginEvent,
    $logout (): Promise<void>,
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
  connection: Ref<Connection | null>,
  pubKey: Ref<PublicKey | null>,
  balance: Ref<number | null>,
  send: (destinationAddress: string, sol: number) => Promise<string | null>,
  init: () => Promise<void>
}

const useTicker = (): Ticker => {
  const usdPrice = ref<number>(0)
  const interval = ref<NodeJS.Timer | null>(null)
  let isInitialized = false

  async function init() {
    if (isInitialized) return
    isInitialized = true

    //track solana price
    const { status, data, send, open, close } = useWebSocket('wss://ws-api.binance.us:443/ws-api/v3', {
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

const useMagic = (magic: InstanceWithExtensions<SDKBase, SolanaExtension[]>): Crypto => {
  const metadata = ref<MagicUserMetadata | null>(null)
  const connection = ref<Connection | null>(null)
  const pubKey = ref<PublicKey | null>(null)
  const balance = ref<number | null>(null)
  let isInitialized = false

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

  async function init() {
    if (isInitialized) return
    isInitialized = true

    metadata.value = await magic.user.getInfo();
    connection.value = new Connection(RPC_URL);
    pubKey.value = new PublicKey(metadata.value.publicAddress!!);
    balance.value = await getBalance();

    connection.value.onAccountChange(pubKey.value, async (accountInfo) => {
      balance.value = accountInfo.lamports / LAMPORTS_PER_SOL;
    })

    console.log("Initialized Crypto!")
  }

  return {
    magic,
    metadata,
    connection,
    pubKey,
    balance,
    send,
    init
  } as Crypto
}

export default defineNuxtPlugin(nuxtApp => {
  const magic = new Magic('pk_live_79385C11B09DBB96', {
    extensions: [
      new SolanaExtension({
        rpcUrl: RPC_URL,
      }),
    ],
  })

  const ticker = useTicker()
  const crypto = useMagic(magic)

  const login = (email: string) => magic.auth.loginWithEmailOTP({email, showUI: false})
  const logout = async () => { await magic.user.logout() }

  nuxtApp.provide('login', login)
  nuxtApp.provide('logout', logout)
  nuxtApp.provide('ticker', ticker)
  nuxtApp.provide('crypto', crypto)
})

export {
  LoginEvent
}
