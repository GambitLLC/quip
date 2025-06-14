/* eslint-disable */
import { ChannelCredentials, Client, makeGenericClientConstructor, Metadata } from "@grpc/grpc-js";
import type {
  CallOptions,
  ClientOptions,
  ClientUnaryCall,
  handleUnaryCall,
  ServiceError,
  UntypedServiceImplementation,
} from "@grpc/grpc-js";
import _m0 from "protobufjs/minimal";
import { Empty } from "../google/protobuf/empty";
import { MatchConfiguration, MatchResults, MatchRoster } from "./messages";

export const protobufPackage = "quip.matchmaker";

export interface CreateMatchRequest {
  matchId: string;
  connection: string;
  config: MatchConfiguration | undefined;
  roster: MatchRoster | undefined;
}

export interface CancelMatchRequest {
  matchId: string;
}

export interface FinishMatchRequest {
  matchId: string;
  results: MatchResults | undefined;
}

function createBaseCreateMatchRequest(): CreateMatchRequest {
  return { matchId: "", connection: "", config: undefined, roster: undefined };
}

export const CreateMatchRequest = {
  encode(message: CreateMatchRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.matchId !== "") {
      writer.uint32(10).string(message.matchId);
    }
    if (message.connection !== "") {
      writer.uint32(18).string(message.connection);
    }
    if (message.config !== undefined) {
      MatchConfiguration.encode(message.config, writer.uint32(26).fork()).ldelim();
    }
    if (message.roster !== undefined) {
      MatchRoster.encode(message.roster, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateMatchRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateMatchRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.matchId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.connection = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.config = MatchConfiguration.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.roster = MatchRoster.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CreateMatchRequest {
    return {
      matchId: isSet(object.matchId) ? globalThis.String(object.matchId) : "",
      connection: isSet(object.connection) ? globalThis.String(object.connection) : "",
      config: isSet(object.config) ? MatchConfiguration.fromJSON(object.config) : undefined,
      roster: isSet(object.roster) ? MatchRoster.fromJSON(object.roster) : undefined,
    };
  },

  toJSON(message: CreateMatchRequest): unknown {
    const obj: any = {};
    if (message.matchId !== "") {
      obj.matchId = message.matchId;
    }
    if (message.connection !== "") {
      obj.connection = message.connection;
    }
    if (message.config !== undefined) {
      obj.config = MatchConfiguration.toJSON(message.config);
    }
    if (message.roster !== undefined) {
      obj.roster = MatchRoster.toJSON(message.roster);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<CreateMatchRequest>, I>>(base?: I): CreateMatchRequest {
    return CreateMatchRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<CreateMatchRequest>, I>>(object: I): CreateMatchRequest {
    const message = createBaseCreateMatchRequest();
    message.matchId = object.matchId ?? "";
    message.connection = object.connection ?? "";
    message.config = (object.config !== undefined && object.config !== null)
      ? MatchConfiguration.fromPartial(object.config)
      : undefined;
    message.roster = (object.roster !== undefined && object.roster !== null)
      ? MatchRoster.fromPartial(object.roster)
      : undefined;
    return message;
  },
};

function createBaseCancelMatchRequest(): CancelMatchRequest {
  return { matchId: "" };
}

export const CancelMatchRequest = {
  encode(message: CancelMatchRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.matchId !== "") {
      writer.uint32(10).string(message.matchId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CancelMatchRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCancelMatchRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.matchId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CancelMatchRequest {
    return { matchId: isSet(object.matchId) ? globalThis.String(object.matchId) : "" };
  },

  toJSON(message: CancelMatchRequest): unknown {
    const obj: any = {};
    if (message.matchId !== "") {
      obj.matchId = message.matchId;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<CancelMatchRequest>, I>>(base?: I): CancelMatchRequest {
    return CancelMatchRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<CancelMatchRequest>, I>>(object: I): CancelMatchRequest {
    const message = createBaseCancelMatchRequest();
    message.matchId = object.matchId ?? "";
    return message;
  },
};

function createBaseFinishMatchRequest(): FinishMatchRequest {
  return { matchId: "", results: undefined };
}

export const FinishMatchRequest = {
  encode(message: FinishMatchRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.matchId !== "") {
      writer.uint32(10).string(message.matchId);
    }
    if (message.results !== undefined) {
      MatchResults.encode(message.results, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FinishMatchRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFinishMatchRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.matchId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.results = MatchResults.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): FinishMatchRequest {
    return {
      matchId: isSet(object.matchId) ? globalThis.String(object.matchId) : "",
      results: isSet(object.results) ? MatchResults.fromJSON(object.results) : undefined,
    };
  },

  toJSON(message: FinishMatchRequest): unknown {
    const obj: any = {};
    if (message.matchId !== "") {
      obj.matchId = message.matchId;
    }
    if (message.results !== undefined) {
      obj.results = MatchResults.toJSON(message.results);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<FinishMatchRequest>, I>>(base?: I): FinishMatchRequest {
    return FinishMatchRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<FinishMatchRequest>, I>>(object: I): FinishMatchRequest {
    const message = createBaseFinishMatchRequest();
    message.matchId = object.matchId ?? "";
    message.results = (object.results !== undefined && object.results !== null)
      ? MatchResults.fromPartial(object.results)
      : undefined;
    return message;
  },
};

/**
 * Manager service to keep track of match details (in-progress and completed).
 * Should only be called by gameservers to update match progress.
 */
export type QuipManagerService = typeof QuipManagerService;
export const QuipManagerService = {
  /**
   * CreateMatch should be called by gameservers when they are allocated. It will attempt
   * to mark all players in the roster as participants in the match.
   */
  createMatch: {
    path: "/quip.matchmaker.QuipManager/CreateMatch",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: CreateMatchRequest) => Buffer.from(CreateMatchRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => CreateMatchRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  /** CancelMatch should be called if gameservers do not start play for any reason. */
  cancelMatch: {
    path: "/quip.matchmaker.QuipManager/CancelMatch",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: CancelMatchRequest) => Buffer.from(CancelMatchRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => CancelMatchRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  /** FinishMatch should be called when gameservers finish play. */
  finishMatch: {
    path: "/quip.matchmaker.QuipManager/FinishMatch",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: FinishMatchRequest) => Buffer.from(FinishMatchRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => FinishMatchRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
} as const;

export interface QuipManagerServer extends UntypedServiceImplementation {
  /**
   * CreateMatch should be called by gameservers when they are allocated. It will attempt
   * to mark all players in the roster as participants in the match.
   */
  createMatch: handleUnaryCall<CreateMatchRequest, Empty>;
  /** CancelMatch should be called if gameservers do not start play for any reason. */
  cancelMatch: handleUnaryCall<CancelMatchRequest, Empty>;
  /** FinishMatch should be called when gameservers finish play. */
  finishMatch: handleUnaryCall<FinishMatchRequest, Empty>;
}

export interface QuipManagerClient extends Client {
  /**
   * CreateMatch should be called by gameservers when they are allocated. It will attempt
   * to mark all players in the roster as participants in the match.
   */
  createMatch(
    request: CreateMatchRequest,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall;
  createMatch(
    request: CreateMatchRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall;
  createMatch(
    request: CreateMatchRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall;
  /** CancelMatch should be called if gameservers do not start play for any reason. */
  cancelMatch(
    request: CancelMatchRequest,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall;
  cancelMatch(
    request: CancelMatchRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall;
  cancelMatch(
    request: CancelMatchRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall;
  /** FinishMatch should be called when gameservers finish play. */
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

export const QuipManagerClient = makeGenericClientConstructor(
  QuipManagerService,
  "quip.matchmaker.QuipManager",
) as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): QuipManagerClient;
  service: typeof QuipManagerService;
  serviceName: string;
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
