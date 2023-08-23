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
import {
  GameConfiguration,
  MatchCancelled,
  MatchConnection,
  MatchDetails,
  MatchResults,
  QueueDetails,
  QueueStopped,
  Status as Status1,
} from "./messages";

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
  /** Sent as response to GetStatus or whenever status changes. */
  status?:
    | Status
    | undefined;
  /** Queue changes relevant to the current player */
  queueStarted?: QueueDetails | undefined;
  queueStopped?: QueueStopped | undefined;
  matchFound?: MatchDetails | undefined;
  matchCancelled?: MatchCancelled | undefined;
  matchStarted?: MatchConnection | undefined;
  matchFinished?: MatchResults | undefined;
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
  return {
    error: undefined,
    status: undefined,
    queueStarted: undefined,
    queueStopped: undefined,
    matchFound: undefined,
    matchCancelled: undefined,
    matchStarted: undefined,
    matchFinished: undefined,
  };
}

export const Response = {
  encode(message: Response, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.error !== undefined) {
      Status.encode(message.error, writer.uint32(10).fork()).ldelim();
    }
    if (message.status !== undefined) {
      Status1.encode(message.status, writer.uint32(18).fork()).ldelim();
    }
    if (message.queueStarted !== undefined) {
      QueueDetails.encode(message.queueStarted, writer.uint32(26).fork()).ldelim();
    }
    if (message.queueStopped !== undefined) {
      QueueStopped.encode(message.queueStopped, writer.uint32(34).fork()).ldelim();
    }
    if (message.matchFound !== undefined) {
      MatchDetails.encode(message.matchFound, writer.uint32(42).fork()).ldelim();
    }
    if (message.matchCancelled !== undefined) {
      MatchCancelled.encode(message.matchCancelled, writer.uint32(50).fork()).ldelim();
    }
    if (message.matchStarted !== undefined) {
      MatchConnection.encode(message.matchStarted, writer.uint32(58).fork()).ldelim();
    }
    if (message.matchFinished !== undefined) {
      MatchResults.encode(message.matchFinished, writer.uint32(66).fork()).ldelim();
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

          message.status = Status1.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.queueStarted = QueueDetails.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.queueStopped = QueueStopped.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.matchFound = MatchDetails.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.matchCancelled = MatchCancelled.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.matchStarted = MatchConnection.decode(reader, reader.uint32());
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.matchFinished = MatchResults.decode(reader, reader.uint32());
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
      status: isSet(object.status) ? Status1.fromJSON(object.status) : undefined,
      queueStarted: isSet(object.queueStarted) ? QueueDetails.fromJSON(object.queueStarted) : undefined,
      queueStopped: isSet(object.queueStopped) ? QueueStopped.fromJSON(object.queueStopped) : undefined,
      matchFound: isSet(object.matchFound) ? MatchDetails.fromJSON(object.matchFound) : undefined,
      matchCancelled: isSet(object.matchCancelled) ? MatchCancelled.fromJSON(object.matchCancelled) : undefined,
      matchStarted: isSet(object.matchStarted) ? MatchConnection.fromJSON(object.matchStarted) : undefined,
      matchFinished: isSet(object.matchFinished) ? MatchResults.fromJSON(object.matchFinished) : undefined,
    };
  },

  toJSON(message: Response): unknown {
    const obj: any = {};
    if (message.error !== undefined) {
      obj.error = Status.toJSON(message.error);
    }
    if (message.status !== undefined) {
      obj.status = Status1.toJSON(message.status);
    }
    if (message.queueStarted !== undefined) {
      obj.queueStarted = QueueDetails.toJSON(message.queueStarted);
    }
    if (message.queueStopped !== undefined) {
      obj.queueStopped = QueueStopped.toJSON(message.queueStopped);
    }
    if (message.matchFound !== undefined) {
      obj.matchFound = MatchDetails.toJSON(message.matchFound);
    }
    if (message.matchCancelled !== undefined) {
      obj.matchCancelled = MatchCancelled.toJSON(message.matchCancelled);
    }
    if (message.matchStarted !== undefined) {
      obj.matchStarted = MatchConnection.toJSON(message.matchStarted);
    }
    if (message.matchFinished !== undefined) {
      obj.matchFinished = MatchResults.toJSON(message.matchFinished);
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
    message.status = (object.status !== undefined && object.status !== null)
      ? Status1.fromPartial(object.status)
      : undefined;
    message.queueStarted = (object.queueStarted !== undefined && object.queueStarted !== null)
      ? QueueDetails.fromPartial(object.queueStarted)
      : undefined;
    message.queueStopped = (object.queueStopped !== undefined && object.queueStopped !== null)
      ? QueueStopped.fromPartial(object.queueStopped)
      : undefined;
    message.matchFound = (object.matchFound !== undefined && object.matchFound !== null)
      ? MatchDetails.fromPartial(object.matchFound)
      : undefined;
    message.matchCancelled = (object.matchCancelled !== undefined && object.matchCancelled !== null)
      ? MatchCancelled.fromPartial(object.matchCancelled)
      : undefined;
    message.matchStarted = (object.matchStarted !== undefined && object.matchStarted !== null)
      ? MatchConnection.fromPartial(object.matchStarted)
      : undefined;
    message.matchFinished = (object.matchFinished !== undefined && object.matchFinished !== null)
      ? MatchResults.fromPartial(object.matchFinished)
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
