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
import { Empty } from "./google/protobuf/empty";
import { GameConfiguration } from "./quip-messages";

export const protobufPackage = "quip";

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

export interface MatchDetails {
  teams: MatchDetails_Team[];
}

export interface MatchDetails_Team {
  players: string[];
}

export interface CreateMatchRequest {
  matchId: string;
  gameConfig: GameConfiguration | undefined;
  matchDetails: MatchDetails | undefined;
}

export interface CreateMatchResponse {
  connection: string;
}

export interface UpdateMatchStateRequest {
  id: string;
  state: MatchState;
}

function createBaseMatchDetails(): MatchDetails {
  return { teams: [] };
}

export const MatchDetails = {
  encode(message: MatchDetails, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.teams) {
      MatchDetails_Team.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MatchDetails {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMatchDetails();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.teams.push(MatchDetails_Team.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MatchDetails {
    return { teams: Array.isArray(object?.teams) ? object.teams.map((e: any) => MatchDetails_Team.fromJSON(e)) : [] };
  },

  toJSON(message: MatchDetails): unknown {
    const obj: any = {};
    if (message.teams) {
      obj.teams = message.teams.map((e) => e ? MatchDetails_Team.toJSON(e) : undefined);
    } else {
      obj.teams = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MatchDetails>, I>>(base?: I): MatchDetails {
    return MatchDetails.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MatchDetails>, I>>(object: I): MatchDetails {
    const message = createBaseMatchDetails();
    message.teams = object.teams?.map((e) => MatchDetails_Team.fromPartial(e)) || [];
    return message;
  },
};

function createBaseMatchDetails_Team(): MatchDetails_Team {
  return { players: [] };
}

export const MatchDetails_Team = {
  encode(message: MatchDetails_Team, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.players) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MatchDetails_Team {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMatchDetails_Team();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.players.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MatchDetails_Team {
    return { players: Array.isArray(object?.players) ? object.players.map((e: any) => String(e)) : [] };
  },

  toJSON(message: MatchDetails_Team): unknown {
    const obj: any = {};
    if (message.players) {
      obj.players = message.players.map((e) => e);
    } else {
      obj.players = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MatchDetails_Team>, I>>(base?: I): MatchDetails_Team {
    return MatchDetails_Team.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MatchDetails_Team>, I>>(object: I): MatchDetails_Team {
    const message = createBaseMatchDetails_Team();
    message.players = object.players?.map((e) => e) || [];
    return message;
  },
};

function createBaseCreateMatchRequest(): CreateMatchRequest {
  return { matchId: "", gameConfig: undefined, matchDetails: undefined };
}

export const CreateMatchRequest = {
  encode(message: CreateMatchRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.matchId !== "") {
      writer.uint32(10).string(message.matchId);
    }
    if (message.gameConfig !== undefined) {
      GameConfiguration.encode(message.gameConfig, writer.uint32(18).fork()).ldelim();
    }
    if (message.matchDetails !== undefined) {
      MatchDetails.encode(message.matchDetails, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateMatchRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateMatchRequest();
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
          message.matchDetails = MatchDetails.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CreateMatchRequest {
    return {
      matchId: isSet(object.matchId) ? String(object.matchId) : "",
      gameConfig: isSet(object.gameConfig) ? GameConfiguration.fromJSON(object.gameConfig) : undefined,
      matchDetails: isSet(object.matchDetails) ? MatchDetails.fromJSON(object.matchDetails) : undefined,
    };
  },

  toJSON(message: CreateMatchRequest): unknown {
    const obj: any = {};
    message.matchId !== undefined && (obj.matchId = message.matchId);
    message.gameConfig !== undefined &&
      (obj.gameConfig = message.gameConfig ? GameConfiguration.toJSON(message.gameConfig) : undefined);
    message.matchDetails !== undefined &&
      (obj.matchDetails = message.matchDetails ? MatchDetails.toJSON(message.matchDetails) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<CreateMatchRequest>, I>>(base?: I): CreateMatchRequest {
    return CreateMatchRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<CreateMatchRequest>, I>>(object: I): CreateMatchRequest {
    const message = createBaseCreateMatchRequest();
    message.matchId = object.matchId ?? "";
    message.gameConfig = (object.gameConfig !== undefined && object.gameConfig !== null)
      ? GameConfiguration.fromPartial(object.gameConfig)
      : undefined;
    message.matchDetails = (object.matchDetails !== undefined && object.matchDetails !== null)
      ? MatchDetails.fromPartial(object.matchDetails)
      : undefined;
    return message;
  },
};

function createBaseCreateMatchResponse(): CreateMatchResponse {
  return { connection: "" };
}

export const CreateMatchResponse = {
  encode(message: CreateMatchResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.connection !== "") {
      writer.uint32(10).string(message.connection);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateMatchResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateMatchResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.connection = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CreateMatchResponse {
    return { connection: isSet(object.connection) ? String(object.connection) : "" };
  },

  toJSON(message: CreateMatchResponse): unknown {
    const obj: any = {};
    message.connection !== undefined && (obj.connection = message.connection);
    return obj;
  },

  create<I extends Exact<DeepPartial<CreateMatchResponse>, I>>(base?: I): CreateMatchResponse {
    return CreateMatchResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<CreateMatchResponse>, I>>(object: I): CreateMatchResponse {
    const message = createBaseCreateMatchResponse();
    message.connection = object.connection ?? "";
    return message;
  },
};

function createBaseUpdateMatchStateRequest(): UpdateMatchStateRequest {
  return { id: "", state: 0 };
}

export const UpdateMatchStateRequest = {
  encode(message: UpdateMatchStateRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.state !== 0) {
      writer.uint32(16).int32(message.state);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateMatchStateRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateMatchStateRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.state = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UpdateMatchStateRequest {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      state: isSet(object.state) ? matchStateFromJSON(object.state) : 0,
    };
  },

  toJSON(message: UpdateMatchStateRequest): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.state !== undefined && (obj.state = matchStateToJSON(message.state));
    return obj;
  },

  create<I extends Exact<DeepPartial<UpdateMatchStateRequest>, I>>(base?: I): UpdateMatchStateRequest {
    return UpdateMatchStateRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<UpdateMatchStateRequest>, I>>(object: I): UpdateMatchStateRequest {
    const message = createBaseUpdateMatchStateRequest();
    message.id = object.id ?? "";
    message.state = object.state ?? 0;
    return message;
  },
};

export type BackendService = typeof BackendService;
export const BackendService = {
  createMatch: {
    path: "/quip.Backend/CreateMatch",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: CreateMatchRequest) => Buffer.from(CreateMatchRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => CreateMatchRequest.decode(value),
    responseSerialize: (value: CreateMatchResponse) => Buffer.from(CreateMatchResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => CreateMatchResponse.decode(value),
  },
  updateMatchState: {
    path: "/quip.Backend/UpdateMatchState",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: UpdateMatchStateRequest) => Buffer.from(UpdateMatchStateRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => UpdateMatchStateRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
} as const;

export interface BackendServer extends UntypedServiceImplementation {
  createMatch: handleUnaryCall<CreateMatchRequest, CreateMatchResponse>;
  updateMatchState: handleUnaryCall<UpdateMatchStateRequest, Empty>;
}

export interface BackendClient extends Client {
  createMatch(
    request: CreateMatchRequest,
    callback: (error: ServiceError | null, response: CreateMatchResponse) => void,
  ): ClientUnaryCall;
  createMatch(
    request: CreateMatchRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: CreateMatchResponse) => void,
  ): ClientUnaryCall;
  createMatch(
    request: CreateMatchRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: CreateMatchResponse) => void,
  ): ClientUnaryCall;
  updateMatchState(
    request: UpdateMatchStateRequest,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall;
  updateMatchState(
    request: UpdateMatchStateRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall;
  updateMatchState(
    request: UpdateMatchStateRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall;
}

export const BackendClient = makeGenericClientConstructor(BackendService, "quip.Backend") as unknown as {
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
