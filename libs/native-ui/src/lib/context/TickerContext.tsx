import { View, StyleSheet } from "react-native";
import React, {createContext, useContext, useMemo, useState} from "react";

const WSS_BINANCE = 'wss://ws-api.binance.us:443/ws-api/v3'

interface Kline {
  openTime: number,
  openPrice: number,
  highPrice: number,
  lowPrice: number,
  closePrice: number,
  volume: number,
  klineCloseTime: number,
  quoteAssetVolume: number,
  numberOfTrades: number,
  takerBuyBaseAssetVolume: number,
  takerBuyQuoteAssetVolume: number,
}

type TickerContextType = {
  usdPrice: number,
  klines: Kline[]
}

const TickerContext = createContext<TickerContextType>({
  usdPrice: 0,
  klines: [],
})

export const useTicker = () => useContext(TickerContext)

interface TickerProviderProps {
  children: React.ReactNode
}

export function TickerProvider(props: TickerProviderProps) {
  const [usdPrice, setUsdPrice] = useState<number>(0)
  const [klines, setKlines] = useState<Kline[]>([])

  const websocket = useMemo(() => new WebSocket(WSS_BINANCE), [])

  const interval = useMemo(() => setInterval(async () => {
    websocket.send(JSON.stringify({
      "id": `price`,
      "method": "avgPrice",
      "params": {
        "symbol": "SOLUSD"
      }
    }))

    websocket.send(JSON.stringify({
      "id": `klines`,
      "method": "uiKlines",
      "params": {
        "symbol": "SOLUSD",
        "interval": "15m",
        "limit": 96,
      }
    }))
  }, 1000), [])

  websocket.onopen = () => {
    websocket.send(JSON.stringify({
      "id": `price`,
      "method": "avgPrice",
      "params": {
        "symbol": "SOLUSD"
      }
    }))

    websocket.send(JSON.stringify({
      "id": `klines`,
      "method": "uiKlines",
      "params": {
        "symbol": "SOLUSD",
        "interval": "15m",
        "limit": 96,
      }
    }))
  }

  websocket.onmessage = (event) => {
    const response = JSON.parse(event.data)

    if (response.status === 200) {
      switch (response.id) {
        case "price":
          setUsdPrice(Number(response.result.price))
          break
        case "klines":
          setKlines(response.result.map((kline: number[]) => {
            const [
              openTime,
              openPrice,
              highPrice,
              lowPrice,
              closePrice,
              volume,
              klineCloseTime,
              quoteAssetVolume,
              numberOfTrades,
              takerBuyBaseAssetVolume,
              takerBuyQuoteAssetVolume,
              _
            ] = kline.map((value) => Number(value))

            return {
              openTime,
              openPrice,
              highPrice,
              lowPrice,
              closePrice,
              volume,
              klineCloseTime,
              quoteAssetVolume,
              numberOfTrades,
              takerBuyBaseAssetVolume,
              takerBuyQuoteAssetVolume,
            } as Kline
          }))
      }
    }
  }

  return (
    <TickerContext.Provider
      value={{
        usdPrice,
        klines,
      }}
    >
      {props.children}
    </TickerContext.Provider>
  );
}

const styles = StyleSheet.create({});

export default TickerContext;
