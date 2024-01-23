/* eslint-disable */
import {
  CallOptions,
  ChannelCredentials,
  Client,
  ClientOptions,
  ClientReadableStream,
  ClientUnaryCall,
  handleServerStreamingCall,
  handleUnaryCall,
  makeGenericClientConstructor,
  Metadata,
  ServiceError,
  UntypedServiceImplementation,
} from "@grpc/grpc-js";
import _m0 from "protobufjs/minimal";
import { Empty } from "../google/protobuf/empty";
import { Player, QueueConfiguration, StatusUpdate } from "./messages";

export const protobufPackage = "quip.matchmaker";

/** GetPlayer gets the details for the currently logged in player. */
export interface GetPlayerRequest {
}

export interface StartQueueRequest {
  config: QueueConfiguration | undefined;
}

export interface StopQueueRequest {
}

export interface PlayerUpdate {
  player: Player | undefined;
  update: StatusUpdate | undefined;
}

function createBaseGetPlayerRequest(): GetPlayerRequest {
  return {};
}

export const GetPlayerRequest = {
  encode(_: GetPlayerRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetPlayerRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetPlayerRequest();
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

  fromJSON(_: any): GetPlayerRequest {
    return {};
  },

  toJSON(_: GetPlayerRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<GetPlayerRequest>, I>>(base?: I): GetPlayerRequest {
    return GetPlayerRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<GetPlayerRequest>, I>>(_: I): GetPlayerRequest {
    const message = createBaseGetPlayerRequest();
    return message;
  },
};

function createBaseStartQueueRequest(): StartQueueRequest {
  return { config: undefined };
}

export const StartQueueRequest = {
  encode(message: StartQueueRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.config !== undefined) {
      QueueConfiguration.encode(message.config, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StartQueueRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStartQueueRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.config = QueueConfiguration.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): StartQueueRequest {
    return { config: isSet(object.config) ? QueueConfiguration.fromJSON(object.config) : undefined };
  },

  toJSON(message: StartQueueRequest): unknown {
    const obj: any = {};
    if (message.config !== undefined) {
      obj.config = QueueConfiguration.toJSON(message.config);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<StartQueueRequest>, I>>(base?: I): StartQueueRequest {
    return StartQueueRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<StartQueueRequest>, I>>(object: I): StartQueueRequest {
    const message = createBaseStartQueueRequest();
    message.config = (object.config !== undefined && object.config !== null)
      ? QueueConfiguration.fromPartial(object.config)
      : undefined;
    return message;
  },
};

function createBaseStopQueueRequest(): StopQueueRequest {
  return {};
}

export const StopQueueRequest = {
  encode(_: StopQueueRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StopQueueRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStopQueueRequest();
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

  fromJSON(_: any): StopQueueRequest {
    return {};
  },

  toJSON(_: StopQueueRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<StopQueueRequest>, I>>(base?: I): StopQueueRequest {
    return StopQueueRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<StopQueueRequest>, I>>(_: I): StopQueueRequest {
    const message = createBaseStopQueueRequest();
    return message;
  },
};

function createBasePlayerUpdate(): PlayerUpdate {
  return { player: undefined, update: undefined };
}

export const PlayerUpdate = {
  encode(message: PlayerUpdate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.player !== undefined) {
      Player.encode(message.player, writer.uint32(10).fork()).ldelim();
    }
    if (message.update !== undefined) {
      StatusUpdate.encode(message.update, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlayerUpdate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlayerUpdate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.player = Player.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.update = StatusUpdate.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PlayerUpdate {
    return {
      player: isSet(object.player) ? Player.fromJSON(object.player) : undefined,
      update: isSet(object.update) ? StatusUpdate.fromJSON(object.update) : undefined,
    };
  },

  toJSON(message: PlayerUpdate): unknown {
    const obj: any = {};
    if (message.player !== undefined) {
      obj.player = Player.toJSON(message.player);
    }
    if (message.update !== undefined) {
      obj.update = StatusUpdate.toJSON(message.update);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<PlayerUpdate>, I>>(base?: I): PlayerUpdate {
    return PlayerUpdate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<PlayerUpdate>, I>>(object: I): PlayerUpdate {
    const message = createBasePlayerUpdate();
    message.player = (object.player !== undefined && object.player !== null)
      ? Player.fromPartial(object.player)
      : undefined;
    message.update = (object.update !== undefined && object.update !== null)
      ? StatusUpdate.fromPartial(object.update)
      : undefined;
    return message;
  },
};

/** Matchmaker service for end user clients. */
export type QuipFrontendService = typeof QuipFrontendService;
export const QuipFrontendService = {
  /**
   * Connect is a long-lived rpc for clients to receive status updates.
   * A client must be connected before any other frontend methods (start queue, etc)
   * may be called.
   */
  connect: {
    path: "/quip.matchmaker.QuipFrontend/Connect",
    requestStream: false,
    responseStream: true,
    requestSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    requestDeserialize: (value: Buffer) => Empty.decode(value),
    responseSerialize: (value: PlayerUpdate) => Buffer.from(PlayerUpdate.encode(value).finish()),
    responseDeserialize: (value: Buffer) => PlayerUpdate.decode(value),
  },
  getPlayer: {
    path: "/quip.matchmaker.QuipFrontend/GetPlayer",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: GetPlayerRequest) => Buffer.from(GetPlayerRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => GetPlayerRequest.decode(value),
    responseSerialize: (value: Player) => Buffer.from(Player.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Player.decode(value),
  },
  startQueue: {
    path: "/quip.matchmaker.QuipFrontend/StartQueue",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: StartQueueRequest) => Buffer.from(StartQueueRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => StartQueueRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  stopQueue: {
    path: "/quip.matchmaker.QuipFrontend/StopQueue",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: StopQueueRequest) => Buffer.from(StopQueueRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => StopQueueRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
} as const;

export interface QuipFrontendServer extends UntypedServiceImplementation {
  /**
   * Connect is a long-lived rpc for clients to receive status updates.
   * A client must be connected before any other frontend methods (start queue, etc)
   * may be called.
   */
  connect: handleServerStreamingCall<Empty, PlayerUpdate>;
  getPlayer: handleUnaryCall<GetPlayerRequest, Player>;
  startQueue: handleUnaryCall<StartQueueRequest, Empty>;
  stopQueue: handleUnaryCall<StopQueueRequest, Empty>;
}

export interface QuipFrontendClient extends Client {
  /**
   * Connect is a long-lived rpc for clients to receive status updates.
   * A client must be connected before any other frontend methods (start queue, etc)
   * may be called.
   */
  connect(request: Empty, options?: Partial<CallOptions>): ClientReadableStream<PlayerUpdate>;
  connect(request: Empty, metadata?: Metadata, options?: Partial<CallOptions>): ClientReadableStream<PlayerUpdate>;
  getPlayer(
    request: GetPlayerRequest,
    callback: (error: ServiceError | null, response: Player) => void,
  ): ClientUnaryCall;
  getPlayer(
    request: GetPlayerRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Player) => void,
  ): ClientUnaryCall;
  getPlayer(
    request: GetPlayerRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Player) => void,
  ): ClientUnaryCall;
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
  stopQueue(
    request: StopQueueRequest,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall;
  stopQueue(
    request: StopQueueRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall;
  stopQueue(
    request: StopQueueRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall;
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
