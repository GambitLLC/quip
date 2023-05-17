import {PromiEvent} from "magic-sdk";
import {LoginWithEmailOTPEvents, MagicUserMetadata} from "@magic-sdk/types";
import {useWebSocket} from '@vueuse/core'
import * as web3 from "@solana/web3.js";

import { Buffer } from 'buffer'
globalThis.Buffer = Buffer

const RPC_URL = 'https://api.devnet.solana.com'

type LoginEvent = PromiEvent<string | null, LoginWithEmailOTPEvents & {
  done: (result: string | null) => void;
  error: (reason: any) => void;
  settled: () => void;
}>

const useTicker = () => {
  const usdPrice = ref<number>(0)

  const interval = ref<NodeJS.Timer | null>(null)

  onBeforeMount(async () => {
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
  })

  onUnmounted(() => {
    if (interval.value) {
      clearInterval(interval.value)
    }
  })

  return { usdPrice }
}

const useMagic = () => {
  const { $magic } = useNuxtApp()
  const metadata = ref<MagicUserMetadata | null>(null)
  const connection = ref<web3.Connection | null>(null)
  const pubKey = ref<web3.PublicKey | null>(null)
  const balance = ref<number | null>(null)

  async function getBalance(): Promise<number | null> {
    if (!connection.value || !pubKey.value) return null;
    return await connection.value.getBalance(pubKey.value) / web3.LAMPORTS_PER_SOL;
  }

  async function send(destinationAddress: string, sol: number): Promise<string | null> {
    const lamports = sol * web3.LAMPORTS_PER_SOL;
    if (!connection.value || !pubKey.value) return null;

    const recipientPubKey = new web3.PublicKey(destinationAddress);
    const hash = await connection.value.getLatestBlockhash()
    let transactionMagic = new web3.Transaction({
      feePayer: pubKey.value,
      recentBlockhash: hash.blockhash,
    })
    const transaction = web3.SystemProgram.transfer({
      fromPubkey: pubKey.value,
      toPubkey: recipientPubKey,
      lamports,
    })

    transactionMagic.add(...([transaction]))

    const serializeConfig = {
      requireAllSignatures: false,
      verifySignatures: true,
    }

    const signedTransaction = await $magic.solana.signTransaction(transactionMagic, serializeConfig);
    const tx = web3.Transaction.from(signedTransaction.rawTransaction);
    return await connection.value.sendRawTransaction(tx.serialize());
  }

  onBeforeMount(async () => {
    metadata.value = await $magic.user.getInfo();
    connection.value = new web3.Connection(RPC_URL);
    pubKey.value = new web3.PublicKey(metadata.value.publicAddress!!);
    balance.value = await getBalance();

    connection.value.onAccountChange(pubKey.value, async (accountInfo) => {
      balance.value = accountInfo.lamports / web3.LAMPORTS_PER_SOL;
    })
  })

  return {
    metadata,
    connection,
    pubKey,
    balance,
    getBalance,
    send
  }
}

export {
  LoginEvent,
  RPC_URL,
  useMagic,
  useTicker
}
