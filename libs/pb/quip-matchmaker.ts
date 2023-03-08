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
import { MatchDetails, Status, statusFromJSON, statusToJSON } from "./quip-messages";

export const protobufPackage = "quip";

export interface StartQueueRequest {
  gamemode: string;
}

export interface StatusResponse {
  status: Status;
  /** Details about the match the user is currently playing in. */
  match?: MatchDetails | undefined;
}

function createBaseStartQueueRequest(): StartQueueRequest {
  return { gamemode: "" };
}

export const StartQueueRequest = {
  encode(message: StartQueueRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.gamemode !== "") {
      writer.uint32(10).string(message.gamemode);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StartQueueRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStartQueueRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.gamemode = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): StartQueueRequest {
    return { gamemode: isSet(object.gamemode) ? String(object.gamemode) : "" };
  },

  toJSON(message: StartQueueRequest): unknown {
    const obj: any = {};
    message.gamemode !== undefined && (obj.gamemode = message.gamemode);
    return obj;
  },

  create<I extends Exact<DeepPartial<StartQueueRequest>, I>>(base?: I): StartQueueRequest {
    return StartQueueRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<StartQueueRequest>, I>>(object: I): StartQueueRequest {
    const message = createBaseStartQueueRequest();
    message.gamemode = object.gamemode ?? "";
    return message;
  },
};

function createBaseStatusResponse(): StatusResponse {
  return { status: 0, match: undefined };
}

export const StatusResponse = {
  encode(message: StatusResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.status !== 0) {
      writer.uint32(8).int32(message.status);
    }
    if (message.match !== undefined) {
      MatchDetails.encode(message.match, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StatusResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStatusResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.status = reader.int32() as any;
          break;
        case 2:
          message.match = MatchDetails.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): StatusResponse {
    return {
      status: isSet(object.status) ? statusFromJSON(object.status) : 0,
      match: isSet(object.match) ? MatchDetails.fromJSON(object.match) : undefined,
    };
  },

  toJSON(message: StatusResponse): unknown {
    const obj: any = {};
    message.status !== undefined && (obj.status = statusToJSON(message.status));
    message.match !== undefined && (obj.match = message.match ? MatchDetails.toJSON(message.match) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<StatusResponse>, I>>(base?: I): StatusResponse {
    return StatusResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<StatusResponse>, I>>(object: I): StatusResponse {
    const message = createBaseStatusResponse();
    message.status = object.status ?? 0;
    message.match = (object.match !== undefined && object.match !== null)
      ? MatchDetails.fromPartial(object.match)
      : undefined;
    return message;
  },
};

export type MatchmakerService = typeof MatchmakerService;
export const MatchmakerService = {
  /** GetStatus returns the current matchmaking status. */
  getStatus: {
    path: "/quip.Matchmaker/GetStatus",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    requestDeserialize: (value: Buffer) => Empty.decode(value),
    responseSerialize: (value: StatusResponse) => Buffer.from(StatusResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => StatusResponse.decode(value),
  },
  /** StartQueue starts searching for a match with the given parameters. */
  startQueue: {
    path: "/quip.Matchmaker/StartQueue",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: StartQueueRequest) => Buffer.from(StartQueueRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => StartQueueRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  /** StopQueue stops searching for a match. Idempotent. */
  stopQueue: {
    path: "/quip.Matchmaker/StopQueue",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    requestDeserialize: (value: Buffer) => Empty.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
} as const;

export interface MatchmakerServer extends UntypedServiceImplementation {
  /** GetStatus returns the current matchmaking status. */
  getStatus: handleUnaryCall<Empty, StatusResponse>;
  /** StartQueue starts searching for a match with the given parameters. */
  startQueue: handleUnaryCall<StartQueueRequest, Empty>;
  /** StopQueue stops searching for a match. Idempotent. */
  stopQueue: handleUnaryCall<Empty, Empty>;
}

export interface MatchmakerClient extends Client {
  /** GetStatus returns the current matchmaking status. */
  getStatus(request: Empty, callback: (error: ServiceError | null, response: StatusResponse) => void): ClientUnaryCall;
  getStatus(
    request: Empty,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: StatusResponse) => void,
  ): ClientUnaryCall;
  getStatus(
    request: Empty,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: StatusResponse) => void,
  ): ClientUnaryCall;
  /** StartQueue starts searching for a match with the given parameters. */
  startQueue(
    request: StartQueueRequest,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall;
  startQueue(
    request: StartQueueRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall;
  startQueue(
    request: StartQueueRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall;
  /** StopQueue stops searching for a match. Idempotent. */
  stopQueue(request: Empty, callback: (error: ServiceError | null, response: Empty) => void): ClientUnaryCall;
  stopQueue(
    request: Empty,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall;
  stopQueue(
    request: Empty,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall;
}

export const MatchmakerClient = makeGenericClientConstructor(MatchmakerService, "quip.Matchmaker") as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): MatchmakerClient;
  service: typeof MatchmakerService;
};

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
