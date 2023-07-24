/* eslint-disable */
import {
  CallOptions,
  ChannelCredentials,
  Client,
  ClientDuplexStream,
  ClientOptions,
  ClientUnaryCall,
  handleBidiStreamingCall,
  handleUnaryCall,
  makeGenericClientConstructor,
  Metadata,
  ServiceError,
  UntypedServiceImplementation,
} from "@grpc/grpc-js";
import _m0 from "protobufjs/minimal";
import { Empty } from "../google/protobuf/empty";
import { Status } from "../google/rpc/status";
import { GameConfiguration, Status as Status1 } from "./messages";

export const protobufPackage = "quip.matchmaker";

export interface GetStatusRequest {
  target: string;
}

export interface StartQueueRequest {
  config: GameConfiguration | undefined;
}

/** TODO: keepalive? */
export interface StreamRequest {
  getStatus?: GetStatusRequest | undefined;
  startQueue?: StartQueueRequest | undefined;
  stopQueue?: Empty | undefined;
}

export interface StreamResponse {
  /** error is sent whenever some stream request failed */
  error?: Status | undefined;
  statusUpdate?: Status1 | undefined;
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

function createBaseStreamRequest(): StreamRequest {
  return { getStatus: undefined, startQueue: undefined, stopQueue: undefined };
}

export const StreamRequest = {
  encode(message: StreamRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.getStatus !== undefined) {
      GetStatusRequest.encode(message.getStatus, writer.uint32(10).fork()).ldelim();
    }
    if (message.startQueue !== undefined) {
      StartQueueRequest.encode(message.startQueue, writer.uint32(18).fork()).ldelim();
    }
    if (message.stopQueue !== undefined) {
      Empty.encode(message.stopQueue, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StreamRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStreamRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.getStatus = GetStatusRequest.decode(reader, reader.uint32());
          break;
        case 2:
          message.startQueue = StartQueueRequest.decode(reader, reader.uint32());
          break;
        case 3:
          message.stopQueue = Empty.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): StreamRequest {
    return {
      getStatus: isSet(object.getStatus) ? GetStatusRequest.fromJSON(object.getStatus) : undefined,
      startQueue: isSet(object.startQueue) ? StartQueueRequest.fromJSON(object.startQueue) : undefined,
      stopQueue: isSet(object.stopQueue) ? Empty.fromJSON(object.stopQueue) : undefined,
    };
  },

  toJSON(message: StreamRequest): unknown {
    const obj: any = {};
    message.getStatus !== undefined &&
      (obj.getStatus = message.getStatus ? GetStatusRequest.toJSON(message.getStatus) : undefined);
    message.startQueue !== undefined &&
      (obj.startQueue = message.startQueue ? StartQueueRequest.toJSON(message.startQueue) : undefined);
    message.stopQueue !== undefined &&
      (obj.stopQueue = message.stopQueue ? Empty.toJSON(message.stopQueue) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<StreamRequest>, I>>(base?: I): StreamRequest {
    return StreamRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<StreamRequest>, I>>(object: I): StreamRequest {
    const message = createBaseStreamRequest();
    message.getStatus = (object.getStatus !== undefined && object.getStatus !== null)
      ? GetStatusRequest.fromPartial(object.getStatus)
      : undefined;
    message.startQueue = (object.startQueue !== undefined && object.startQueue !== null)
      ? StartQueueRequest.fromPartial(object.startQueue)
      : undefined;
    message.stopQueue = (object.stopQueue !== undefined && object.stopQueue !== null)
      ? Empty.fromPartial(object.stopQueue)
      : undefined;
    return message;
  },
};

function createBaseStreamResponse(): StreamResponse {
  return { error: undefined, statusUpdate: undefined };
}

export const StreamResponse = {
  encode(message: StreamResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.error !== undefined) {
      Status.encode(message.error, writer.uint32(10).fork()).ldelim();
    }
    if (message.statusUpdate !== undefined) {
      Status1.encode(message.statusUpdate, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StreamResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStreamResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.error = Status.decode(reader, reader.uint32());
          break;
        case 2:
          message.statusUpdate = Status1.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): StreamResponse {
    return {
      error: isSet(object.error) ? Status.fromJSON(object.error) : undefined,
      statusUpdate: isSet(object.statusUpdate) ? Status1.fromJSON(object.statusUpdate) : undefined,
    };
  },

  toJSON(message: StreamResponse): unknown {
    const obj: any = {};
    message.error !== undefined && (obj.error = message.error ? Status.toJSON(message.error) : undefined);
    message.statusUpdate !== undefined &&
      (obj.statusUpdate = message.statusUpdate ? Status1.toJSON(message.statusUpdate) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<StreamResponse>, I>>(base?: I): StreamResponse {
    return StreamResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<StreamResponse>, I>>(object: I): StreamResponse {
    const message = createBaseStreamResponse();
    message.error = (object.error !== undefined && object.error !== null)
      ? Status.fromPartial(object.error)
      : undefined;
    message.statusUpdate = (object.statusUpdate !== undefined && object.statusUpdate !== null)
      ? Status1.fromPartial(object.statusUpdate)
      : undefined;
    return message;
  },
};

export type DeprecatedFrontendService = typeof DeprecatedFrontendService;
export const DeprecatedFrontendService = {
  /** GetStatus returns the current status of the specified player. */
  getStatus: {
    path: "/quip.matchmaker.DeprecatedFrontend/GetStatus",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: GetStatusRequest) => Buffer.from(GetStatusRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => GetStatusRequest.decode(value),
    responseSerialize: (value: Status1) => Buffer.from(Status1.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Status1.decode(value),
  },
  /** StartQueue starts searching for a match with the given parameters. */
  startQueue: {
    path: "/quip.matchmaker.DeprecatedFrontend/StartQueue",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: StartQueueRequest) => Buffer.from(StartQueueRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => StartQueueRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  /** StopQueue stops searching for a match. Idempotent. */
  stopQueue: {
    path: "/quip.matchmaker.DeprecatedFrontend/StopQueue",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    requestDeserialize: (value: Buffer) => Empty.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
} as const;

export interface DeprecatedFrontendServer extends UntypedServiceImplementation {
  /** GetStatus returns the current status of the specified player. */
  getStatus: handleUnaryCall<GetStatusRequest, Status1>;
  /** StartQueue starts searching for a match with the given parameters. */
  startQueue: handleUnaryCall<StartQueueRequest, Empty>;
  /** StopQueue stops searching for a match. Idempotent. */
  stopQueue: handleUnaryCall<Empty, Empty>;
}

export interface DeprecatedFrontendClient extends Client {
  /** GetStatus returns the current status of the specified player. */
  getStatus(
    request: GetStatusRequest,
    callback: (error: ServiceError | null, response: Status1) => void,
  ): ClientUnaryCall;
  getStatus(
    request: GetStatusRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Status1) => void,
  ): ClientUnaryCall;
  getStatus(
    request: GetStatusRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Status1) => void,
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

export const DeprecatedFrontendClient = makeGenericClientConstructor(
  DeprecatedFrontendService,
  "quip.matchmaker.DeprecatedFrontend",
) as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): DeprecatedFrontendClient;
  service: typeof DeprecatedFrontendService;
};

export type FrontendService = typeof FrontendService;
export const FrontendService = {
  stream: {
    path: "/quip.matchmaker.Frontend/Stream",
    requestStream: true,
    responseStream: true,
    requestSerialize: (value: StreamRequest) => Buffer.from(StreamRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => StreamRequest.decode(value),
    responseSerialize: (value: StreamResponse) => Buffer.from(StreamResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => StreamResponse.decode(value),
  },
} as const;

export interface FrontendServer extends UntypedServiceImplementation {
  stream: handleBidiStreamingCall<StreamRequest, StreamResponse>;
}

export interface FrontendClient extends Client {
  stream(): ClientDuplexStream<StreamRequest, StreamResponse>;
  stream(options: Partial<CallOptions>): ClientDuplexStream<StreamRequest, StreamResponse>;
  stream(metadata: Metadata, options?: Partial<CallOptions>): ClientDuplexStream<StreamRequest, StreamResponse>;
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
