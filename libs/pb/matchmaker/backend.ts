/* eslint-disable */
import {
  CallOptions,
  ChannelCredentials,
  Client,
  ClientOptions,
  ClientUnaryCall,
  handleUnaryCall,
  makeGenericClientConstructor,
  Metadata,
  ServiceError,
  UntypedServiceImplementation,
} from "@grpc/grpc-js";
import _m0 from "protobufjs/minimal";
import { Empty } from "../google/protobuf/empty";
import { GameConfiguration, MatchDetails } from "./messages";

export const protobufPackage = "quip.matchmaker";

export enum MatchState {
  UNSPECIFIED = 0,
  /** PENDING - Match has been allocated and is waiting for connections. */
  PENDING = 1,
  /** PLAYING - Match is in progress. */
  PLAYING = 2,
  /** FINISHED - Match has completed. */
  FINISHED = 3,
}

export function matchStateFromJSON(object: any): MatchState {
  switch (object) {
    case 0:
    case "MATCH_STATE_UNSPECIFIED":
      return MatchState.UNSPECIFIED;
    case 1:
    case "MATCH_STATE_PENDING":
      return MatchState.PENDING;
    case 2:
    case "MATCH_STATE_PLAYING":
      return MatchState.PLAYING;
    case 3:
    case "MATCH_STATE_FINISHED":
      return MatchState.FINISHED;
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum MatchState");
  }
}

export function matchStateToJSON(object: MatchState): string {
  switch (object) {
    case MatchState.UNSPECIFIED:
      return "MATCH_STATE_UNSPECIFIED";
    case MatchState.PENDING:
      return "MATCH_STATE_PENDING";
    case MatchState.PLAYING:
      return "MATCH_STATE_PLAYING";
    case MatchState.FINISHED:
      return "MATCH_STATE_FINISHED";
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum MatchState");
  }
}

/**
 * MatchRoster specifies the players in a match.
 * TODO: specify teams when team games are supported
 */
export interface MatchRoster {
  players: string[];
}

export interface AllocateMatchRequest {
  matchId: string;
  gameConfig: GameConfiguration | undefined;
  roster: MatchRoster | undefined;
}

export interface FinishMatchRequest {
  matchId: string;
}

function createBaseMatchRoster(): MatchRoster {
  return { players: [] };
}

export const MatchRoster = {
  encode(message: MatchRoster, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.players) {
      writer.uint32(18).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MatchRoster {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMatchRoster();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.players.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MatchRoster {
    return { players: Array.isArray(object?.players) ? object.players.map((e: any) => String(e)) : [] };
  },

  toJSON(message: MatchRoster): unknown {
    const obj: any = {};
    if (message.players) {
      obj.players = message.players.map((e) => e);
    } else {
      obj.players = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MatchRoster>, I>>(base?: I): MatchRoster {
    return MatchRoster.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MatchRoster>, I>>(object: I): MatchRoster {
    const message = createBaseMatchRoster();
    message.players = object.players?.map((e) => e) || [];
    return message;
  },
};

function createBaseAllocateMatchRequest(): AllocateMatchRequest {
  return { matchId: "", gameConfig: undefined, roster: undefined };
}

export const AllocateMatchRequest = {
  encode(message: AllocateMatchRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.matchId !== "") {
      writer.uint32(10).string(message.matchId);
    }
    if (message.gameConfig !== undefined) {
      GameConfiguration.encode(message.gameConfig, writer.uint32(18).fork()).ldelim();
    }
    if (message.roster !== undefined) {
      MatchRoster.encode(message.roster, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AllocateMatchRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAllocateMatchRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.matchId = reader.string();
          break;
        case 2:
          message.gameConfig = GameConfiguration.decode(reader, reader.uint32());
          break;
        case 3:
          message.roster = MatchRoster.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AllocateMatchRequest {
    return {
      matchId: isSet(object.matchId) ? String(object.matchId) : "",
      gameConfig: isSet(object.gameConfig) ? GameConfiguration.fromJSON(object.gameConfig) : undefined,
      roster: isSet(object.roster) ? MatchRoster.fromJSON(object.roster) : undefined,
    };
  },

  toJSON(message: AllocateMatchRequest): unknown {
    const obj: any = {};
    message.matchId !== undefined && (obj.matchId = message.matchId);
    message.gameConfig !== undefined &&
      (obj.gameConfig = message.gameConfig ? GameConfiguration.toJSON(message.gameConfig) : undefined);
    message.roster !== undefined && (obj.roster = message.roster ? MatchRoster.toJSON(message.roster) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<AllocateMatchRequest>, I>>(base?: I): AllocateMatchRequest {
    return AllocateMatchRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<AllocateMatchRequest>, I>>(object: I): AllocateMatchRequest {
    const message = createBaseAllocateMatchRequest();
    message.matchId = object.matchId ?? "";
    message.gameConfig = (object.gameConfig !== undefined && object.gameConfig !== null)
      ? GameConfiguration.fromPartial(object.gameConfig)
      : undefined;
    message.roster = (object.roster !== undefined && object.roster !== null)
      ? MatchRoster.fromPartial(object.roster)
      : undefined;
    return message;
  },
};

function createBaseFinishMatchRequest(): FinishMatchRequest {
  return { matchId: "" };
}

export const FinishMatchRequest = {
  encode(message: FinishMatchRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.matchId !== "") {
      writer.uint32(10).string(message.matchId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FinishMatchRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFinishMatchRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.matchId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): FinishMatchRequest {
    return { matchId: isSet(object.matchId) ? String(object.matchId) : "" };
  },

  toJSON(message: FinishMatchRequest): unknown {
    const obj: any = {};
    message.matchId !== undefined && (obj.matchId = message.matchId);
    return obj;
  },

  create<I extends Exact<DeepPartial<FinishMatchRequest>, I>>(base?: I): FinishMatchRequest {
    return FinishMatchRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<FinishMatchRequest>, I>>(object: I): FinishMatchRequest {
    const message = createBaseFinishMatchRequest();
    message.matchId = object.matchId ?? "";
    return message;
  },
};

export type BackendService = typeof BackendService;
export const BackendService = {
  /** AllocateMatch allocates a gameserver for the specified match. */
  allocateMatch: {
    path: "/quip.matchmaker.Backend/AllocateMatch",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: AllocateMatchRequest) => Buffer.from(AllocateMatchRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => AllocateMatchRequest.decode(value),
    responseSerialize: (value: MatchDetails) => Buffer.from(MatchDetails.encode(value).finish()),
    responseDeserialize: (value: Buffer) => MatchDetails.decode(value),
  },
  /** FinishMatch marks a specified match as completed. */
  finishMatch: {
    path: "/quip.matchmaker.Backend/FinishMatch",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: FinishMatchRequest) => Buffer.from(FinishMatchRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => FinishMatchRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
} as const;

export interface BackendServer extends UntypedServiceImplementation {
  /** AllocateMatch allocates a gameserver for the specified match. */
  allocateMatch: handleUnaryCall<AllocateMatchRequest, MatchDetails>;
  /** FinishMatch marks a specified match as completed. */
  finishMatch: handleUnaryCall<FinishMatchRequest, Empty>;
}

export interface BackendClient extends Client {
  /** AllocateMatch allocates a gameserver for the specified match. */
  allocateMatch(
    request: AllocateMatchRequest,
    callback: (error: ServiceError | null, response: MatchDetails) => void,
  ): ClientUnaryCall;
  allocateMatch(
    request: AllocateMatchRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: MatchDetails) => void,
  ): ClientUnaryCall;
  allocateMatch(
    request: AllocateMatchRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: MatchDetails) => void,
  ): ClientUnaryCall;
  /** FinishMatch marks a specified match as completed. */
  finishMatch(
    request: FinishMatchRequest,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall;
  finishMatch(
    request: FinishMatchRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall;
  finishMatch(
    request: FinishMatchRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall;
}

export const BackendClient = makeGenericClientConstructor(BackendService, "quip.matchmaker.Backend") as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): BackendClient;
  service: typeof BackendService;
};

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var tsProtoGlobalThis: any = (() => {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw "Unable to locate global object";
})();

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
