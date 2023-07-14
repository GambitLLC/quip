import { StyleSheet } from "react-native";
import { SolanaExtension } from "@magic-ext/solana";
import { Extension, Magic, MagicSDKExtensionsOption, MagicUserMetadata } from "@magic-sdk/react-native-expo";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import React, { createContext, useContext, useState } from "react";
import { MagicSDKAdditionalConfiguration } from "@magic-sdk/provider/dist/types/core/sdk";
import { AuthExtension } from "@magic-ext/auth";

const RPC_URL = 'https://api.devnet.solana.com'

const solanaExtension = new SolanaExtension({
  rpcUrl: RPC_URL,
})

const authExtension = new AuthExtension()

export const magic = new Magic("pk_live_79385C11B09DBB96", {
  extensions: [
    authExtension,
    solanaExtension
  ]
} as MagicSDKAdditionalConfiguration)

console.log(solanaExtension instanceof Extension.Internal)

// Define the structure of the Web3 context state
type CryptoContextType = {
  magic: Magic<MagicSDKExtensionsOption<"solana">>,
  metadata: MagicUserMetadata | null,
  isLoggedIn: boolean,
  connection: Connection | null,
  pubKey: PublicKey | null,
  balance: number | null,
  address: string | null,
  shortAddress: string | null
  send: (destinationAddress: string, sol: number) => Promise<string | null>,
  init: () => Promise<void>,
}

// Create the context with default values
const CryptoContext = createContext<CryptoContextType>({
  // @ts-ignore
  magic,
  metadata: null,
  isLoggedIn: false,
  connection: null,
  pubKey: null,
  balance: null,
  address: null,
  shortAddress: null,
  send: async () => { return null },
  init: async () => {},
})

// Custom hook to use the Web3 context
export const useCrypto = () => useContext(CryptoContext)


interface CryptoProviderProps {
  children: React.ReactNode
}

export function CryptoProvider(props: CryptoProviderProps) {
  const [metadata, setMetadata] = useState<MagicUserMetadata | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [connection, setConnection] = useState<Connection | null>(null)
  const [pubKey, setPubKey] = useState<PublicKey | null>(null)
  const [balance, setBalance] = useState<number | null>(null)

  const address = metadata?.publicAddress ?? null
  const shortAddress = address !== null ?
    address.substring(0, 4) + "..." + address.slice(-4)
    : null

  magic.user.isLoggedIn().on("done", (result: boolean) => {
    setIsLoggedIn(result)
  })

  async function getBalance(): Promise<number | null> {
    if (!connection || !pubKey) return null;
    return await connection.getBalance(pubKey) / LAMPORTS_PER_SOL;
  }

  async function send(
    destinationAddress: string,
    sol: number,
  ): Promise<string | null> {
    const lamports = sol * LAMPORTS_PER_SOL;
    if (!connection || !pubKey || !balance) return null;

    const recipientPubKey = new PublicKey(destinationAddress);
    const hash = await connection.getLatestBlockhash()
    let transactionMagic = new Transaction({
      feePayer: pubKey,
      recentBlockhash: hash.blockhash,
    })

    const feeInLamports = (await connection.getFeeForMessage(
      transactionMagic.compileMessage(),
      'confirmed'
    )).value

    //if we coulnt get the fee, return null
    if (!feeInLamports) return null

    //if the fee is greater than the balance, return null
    if (feeInLamports > (balance * LAMPORTS_PER_SOL)) return null

    const transaction = (feeInLamports + lamports) > (balance * LAMPORTS_PER_SOL)
      ? SystemProgram.transfer({
        fromPubkey: pubKey,
        toPubkey: recipientPubKey,
        lamports: lamports - feeInLamports,
      })
      : SystemProgram.transfer({
        fromPubkey: pubKey,
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
    return await connection.sendRawTransaction(tx.serialize());
  }



  async function init() {
    const metadata = (await magic?.user.getInfo()) ?? null
    setMetadata(metadata)
    setConnection(new Connection(RPC_URL))
    setPubKey(new PublicKey(metadata?.publicAddress!!))

    const balance = await getBalance()
    setBalance(balance)

    if (pubKey) connection?.onAccountChange(pubKey, async (accountInfo) => {
      setBalance(accountInfo.lamports / LAMPORTS_PER_SOL)
    })

    console.log("Initialized Crypto!")
  }

  return (
    <CryptoContext.Provider
      value={{
        // @ts-ignore
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
      }}
    >
      {props.children}
    </CryptoContext.Provider>
  )
}

const styles = StyleSheet.create({});

export default CryptoProvider;
