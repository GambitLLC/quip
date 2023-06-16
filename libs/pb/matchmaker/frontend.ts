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
import { GameConfiguration, Status } from "./messages";

export const protobufPackage = "quip.matchmaker";

export interface GetStatusRequest {
  target: string;
}

export interface StartQueueRequest {
  config: GameConfiguration | undefined;
}

function createBaseGetStatusRequest(): GetStatusRequest {
  return { target: "" };
}

export const GetStatusRequest = {
  encode(message: GetStatusRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.target !== "") {
      writer.uint32(10).string(message.target);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetStatusRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetStatusRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.target = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GetStatusRequest {
    return { target: isSet(object.target) ? String(object.target) : "" };
  },

  toJSON(message: GetStatusRequest): unknown {
    const obj: any = {};
    message.target !== undefined && (obj.target = message.target);
    return obj;
  },

  create<I extends Exact<DeepPartial<GetStatusRequest>, I>>(base?: I): GetStatusRequest {
    return GetStatusRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<GetStatusRequest>, I>>(object: I): GetStatusRequest {
    const message = createBaseGetStatusRequest();
    message.target = object.target ?? "";
    return message;
  },
};

function createBaseStartQueueRequest(): StartQueueRequest {
  return { config: undefined };
}

export const StartQueueRequest = {
  encode(message: StartQueueRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.config !== undefined) {
      GameConfiguration.encode(message.config, writer.uint32(10).fork()).ldelim();
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
          message.config = GameConfiguration.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): StartQueueRequest {
    return { config: isSet(object.config) ? GameConfiguration.fromJSON(object.config) : undefined };
  },

  toJSON(message: StartQueueRequest): unknown {
    const obj: any = {};
    message.config !== undefined &&
      (obj.config = message.config ? GameConfiguration.toJSON(message.config) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<StartQueueRequest>, I>>(base?: I): StartQueueRequest {
    return StartQueueRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<StartQueueRequest>, I>>(object: I): StartQueueRequest {
    const message = createBaseStartQueueRequest();
    message.config = (object.config !== undefined && object.config !== null)
      ? GameConfiguration.fromPartial(object.config)
      : undefined;
    return message;
  },
};

export type FrontendService = typeof FrontendService;
export const FrontendService = {
  /** GetStatus returns the current status of the specified player. */
  getStatus: {
    path: "/quip.matchmaker.Frontend/GetStatus",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: GetStatusRequest) => Buffer.from(GetStatusRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => GetStatusRequest.decode(value),
    responseSerialize: (value: Status) => Buffer.from(Status.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Status.decode(value),
  },
  /** StartQueue starts searching for a match with the given parameters. */
  startQueue: {
    path: "/quip.matchmaker.Frontend/StartQueue",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: StartQueueRequest) => Buffer.from(StartQueueRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => StartQueueRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  /** StopQueue stops searching for a match. Idempotent. */
  stopQueue: {
    path: "/quip.matchmaker.Frontend/StopQueue",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    requestDeserialize: (value: Buffer) => Empty.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
} as const;

export interface FrontendServer extends UntypedServiceImplementation {
  /** GetStatus returns the current status of the specified player. */
  getStatus: handleUnaryCall<GetStatusRequest, Status>;
  /** StartQueue starts searching for a match with the given parameters. */
  startQueue: handleUnaryCall<StartQueueRequest, Empty>;
  /** StopQueue stops searching for a match. Idempotent. */
  stopQueue: handleUnaryCall<Empty, Empty>;
}

export interface FrontendClient extends Client {
  /** GetStatus returns the current status of the specified player. */
  getStatus(
    request: GetStatusRequest,
    callback: (error: ServiceError | null, response: Status) => void,
  ): ClientUnaryCall;
  getStatus(
    request: GetStatusRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Status) => void,
  ): ClientUnaryCall;
  getStatus(
    request: GetStatusRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Status) => void,
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

export const FrontendClient = makeGenericClientConstructor(FrontendService, "quip.matchmaker.Frontend") as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): FrontendClient;
  service: typeof FrontendService;
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
