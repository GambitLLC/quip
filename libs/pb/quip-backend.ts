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

export interface UpdateMatchRequest {
  id: string;
  state: MatchState;
}

function createBaseUpdateMatchRequest(): UpdateMatchRequest {
  return { id: "", state: 0 };
}

export const UpdateMatchRequest = {
  encode(message: UpdateMatchRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.state !== 0) {
      writer.uint32(16).int32(message.state);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateMatchRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateMatchRequest();
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

  fromJSON(object: any): UpdateMatchRequest {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      state: isSet(object.state) ? matchStateFromJSON(object.state) : 0,
    };
  },

  toJSON(message: UpdateMatchRequest): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.state !== undefined && (obj.state = matchStateToJSON(message.state));
    return obj;
  },

  create<I extends Exact<DeepPartial<UpdateMatchRequest>, I>>(base?: I): UpdateMatchRequest {
    return UpdateMatchRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<UpdateMatchRequest>, I>>(object: I): UpdateMatchRequest {
    const message = createBaseUpdateMatchRequest();
    message.id = object.id ?? "";
    message.state = object.state ?? 0;
    return message;
  },
};

export type BackendService = typeof BackendService;
export const BackendService = {
  updateMatch: {
    path: "/quip.Backend/UpdateMatch",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: UpdateMatchRequest) => Buffer.from(UpdateMatchRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => UpdateMatchRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
} as const;

export interface BackendServer extends UntypedServiceImplementation {
  updateMatch: handleUnaryCall<UpdateMatchRequest, Empty>;
}

export interface BackendClient extends Client {
  updateMatch(
    request: UpdateMatchRequest,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall;
  updateMatch(
    request: UpdateMatchRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall;
  updateMatch(
    request: UpdateMatchRequest,
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
