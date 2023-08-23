/* eslint-disable */
import {
  CallOptions,
  ChannelCredentials,
  Client,
  ClientDuplexStream,
  ClientOptions,
  handleBidiStreamingCall,
  makeGenericClientConstructor,
  Metadata,
  UntypedServiceImplementation,
} from "@grpc/grpc-js";
import _m0 from "protobufjs/minimal";
import { Status } from "../google/rpc/status";
import { GameConfiguration, QueueUpdate, Status as Status1 } from "./messages";

export const protobufPackage = "quip.matchmaker";

export interface Request {
  getStatus?: GetStatus | undefined;
  startQueue?: StartQueue | undefined;
  stopQueue?: StopQueue | undefined;
}

/**
 * GetStatus gets the current status for the player. If in queue or in a match,
 * will also send the corresponding details in a second message.
 */
export interface GetStatus {
}

export interface StartQueue {
  config: GameConfiguration | undefined;
}

export interface StopQueue {
}

export interface Response {
  /** error is sent if any request failed. */
  error?:
    | Status
    | undefined;
  /** Sent as response to GetStatus or whenever friends' status changes. */
  statusUpdate?:
    | StatusUpdate
    | undefined;
  /** Queue changes relevant to the current player */
  queueUpdate?: QueueUpdate | undefined;
}

export interface StatusUpdate {
  player: string;
  status: Status1 | undefined;
}

function createBaseRequest(): Request {
  return { getStatus: undefined, startQueue: undefined, stopQueue: undefined };
}

export const Request = {
  encode(message: Request, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.getStatus !== undefined) {
      GetStatus.encode(message.getStatus, writer.uint32(10).fork()).ldelim();
    }
    if (message.startQueue !== undefined) {
      StartQueue.encode(message.startQueue, writer.uint32(18).fork()).ldelim();
    }
    if (message.stopQueue !== undefined) {
      StopQueue.encode(message.stopQueue, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Request {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.getStatus = GetStatus.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.startQueue = StartQueue.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.stopQueue = StopQueue.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Request {
    return {
      getStatus: isSet(object.getStatus) ? GetStatus.fromJSON(object.getStatus) : undefined,
      startQueue: isSet(object.startQueue) ? StartQueue.fromJSON(object.startQueue) : undefined,
      stopQueue: isSet(object.stopQueue) ? StopQueue.fromJSON(object.stopQueue) : undefined,
    };
  },

  toJSON(message: Request): unknown {
    const obj: any = {};
    if (message.getStatus !== undefined) {
      obj.getStatus = GetStatus.toJSON(message.getStatus);
    }
    if (message.startQueue !== undefined) {
      obj.startQueue = StartQueue.toJSON(message.startQueue);
    }
    if (message.stopQueue !== undefined) {
      obj.stopQueue = StopQueue.toJSON(message.stopQueue);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Request>, I>>(base?: I): Request {
    return Request.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Request>, I>>(object: I): Request {
    const message = createBaseRequest();
    message.getStatus = (object.getStatus !== undefined && object.getStatus !== null)
      ? GetStatus.fromPartial(object.getStatus)
      : undefined;
    message.startQueue = (object.startQueue !== undefined && object.startQueue !== null)
      ? StartQueue.fromPartial(object.startQueue)
      : undefined;
    message.stopQueue = (object.stopQueue !== undefined && object.stopQueue !== null)
      ? StopQueue.fromPartial(object.stopQueue)
      : undefined;
    return message;
  },
};

function createBaseGetStatus(): GetStatus {
  return {};
}

export const GetStatus = {
  encode(_: GetStatus, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetStatus {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetStatus();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): GetStatus {
    return {};
  },

  toJSON(_: GetStatus): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<GetStatus>, I>>(base?: I): GetStatus {
    return GetStatus.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<GetStatus>, I>>(_: I): GetStatus {
    const message = createBaseGetStatus();
    return message;
  },
};

function createBaseStartQueue(): StartQueue {
  return { config: undefined };
}

export const StartQueue = {
  encode(message: StartQueue, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.config !== undefined) {
      GameConfiguration.encode(message.config, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StartQueue {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStartQueue();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.config = GameConfiguration.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): StartQueue {
    return { config: isSet(object.config) ? GameConfiguration.fromJSON(object.config) : undefined };
  },

  toJSON(message: StartQueue): unknown {
    const obj: any = {};
    if (message.config !== undefined) {
      obj.config = GameConfiguration.toJSON(message.config);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<StartQueue>, I>>(base?: I): StartQueue {
    return StartQueue.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<StartQueue>, I>>(object: I): StartQueue {
    const message = createBaseStartQueue();
    message.config = (object.config !== undefined && object.config !== null)
      ? GameConfiguration.fromPartial(object.config)
      : undefined;
    return message;
  },
};

function createBaseStopQueue(): StopQueue {
  return {};
}

export const StopQueue = {
  encode(_: StopQueue, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StopQueue {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStopQueue();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): StopQueue {
    return {};
  },

  toJSON(_: StopQueue): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<StopQueue>, I>>(base?: I): StopQueue {
    return StopQueue.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<StopQueue>, I>>(_: I): StopQueue {
    const message = createBaseStopQueue();
    return message;
  },
};

function createBaseResponse(): Response {
  return { error: undefined, statusUpdate: undefined, queueUpdate: undefined };
}

export const Response = {
  encode(message: Response, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.error !== undefined) {
      Status.encode(message.error, writer.uint32(10).fork()).ldelim();
    }
    if (message.statusUpdate !== undefined) {
      StatusUpdate.encode(message.statusUpdate, writer.uint32(18).fork()).ldelim();
    }
    if (message.queueUpdate !== undefined) {
      QueueUpdate.encode(message.queueUpdate, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Response {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.error = Status.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.statusUpdate = StatusUpdate.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.queueUpdate = QueueUpdate.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Response {
    return {
      error: isSet(object.error) ? Status.fromJSON(object.error) : undefined,
      statusUpdate: isSet(object.statusUpdate) ? StatusUpdate.fromJSON(object.statusUpdate) : undefined,
      queueUpdate: isSet(object.queueUpdate) ? QueueUpdate.fromJSON(object.queueUpdate) : undefined,
    };
  },

  toJSON(message: Response): unknown {
    const obj: any = {};
    if (message.error !== undefined) {
      obj.error = Status.toJSON(message.error);
    }
    if (message.statusUpdate !== undefined) {
      obj.statusUpdate = StatusUpdate.toJSON(message.statusUpdate);
    }
    if (message.queueUpdate !== undefined) {
      obj.queueUpdate = QueueUpdate.toJSON(message.queueUpdate);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Response>, I>>(base?: I): Response {
    return Response.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Response>, I>>(object: I): Response {
    const message = createBaseResponse();
    message.error = (object.error !== undefined && object.error !== null)
      ? Status.fromPartial(object.error)
      : undefined;
    message.statusUpdate = (object.statusUpdate !== undefined && object.statusUpdate !== null)
      ? StatusUpdate.fromPartial(object.statusUpdate)
      : undefined;
    message.queueUpdate = (object.queueUpdate !== undefined && object.queueUpdate !== null)
      ? QueueUpdate.fromPartial(object.queueUpdate)
      : undefined;
    return message;
  },
};

function createBaseStatusUpdate(): StatusUpdate {
  return { player: "", status: undefined };
}

export const StatusUpdate = {
  encode(message: StatusUpdate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.player !== "") {
      writer.uint32(10).string(message.player);
    }
    if (message.status !== undefined) {
      Status1.encode(message.status, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StatusUpdate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStatusUpdate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.player = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.status = Status1.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): StatusUpdate {
    return {
      player: isSet(object.player) ? String(object.player) : "",
      status: isSet(object.status) ? Status1.fromJSON(object.status) : undefined,
    };
  },

  toJSON(message: StatusUpdate): unknown {
    const obj: any = {};
    if (message.player !== "") {
      obj.player = message.player;
    }
    if (message.status !== undefined) {
      obj.status = Status1.toJSON(message.status);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<StatusUpdate>, I>>(base?: I): StatusUpdate {
    return StatusUpdate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<StatusUpdate>, I>>(object: I): StatusUpdate {
    const message = createBaseStatusUpdate();
    message.player = object.player ?? "";
    message.status = (object.status !== undefined && object.status !== null)
      ? Status1.fromPartial(object.status)
      : undefined;
    return message;
  },
};

/** Matchmaker service for end user clients. */
export type QuipFrontendService = typeof QuipFrontendService;
export const QuipFrontendService = {
  /**
   * Connect is a long-lived rpc for clients to send queue actions and
   * receive queue updates.
   */
  connect: {
    path: "/quip.matchmaker.QuipFrontend/Connect",
    requestStream: true,
    responseStream: true,
    requestSerialize: (value: Request) => Buffer.from(Request.encode(value).finish()),
    requestDeserialize: (value: Buffer) => Request.decode(value),
    responseSerialize: (value: Response) => Buffer.from(Response.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Response.decode(value),
  },
} as const;

export interface QuipFrontendServer extends UntypedServiceImplementation {
  /**
   * Connect is a long-lived rpc for clients to send queue actions and
   * receive queue updates.
   */
  connect: handleBidiStreamingCall<Request, Response>;
}

export interface QuipFrontendClient extends Client {
  /**
   * Connect is a long-lived rpc for clients to send queue actions and
   * receive queue updates.
   */
  connect(): ClientDuplexStream<Request, Response>;
  connect(options: Partial<CallOptions>): ClientDuplexStream<Request, Response>;
  connect(metadata: Metadata, options?: Partial<CallOptions>): ClientDuplexStream<Request, Response>;
}

export const QuipFrontendClient = makeGenericClientConstructor(
  QuipFrontendService,
  "quip.matchmaker.QuipFrontend",
) as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): QuipFrontendClient;
  service: typeof QuipFrontendService;
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
