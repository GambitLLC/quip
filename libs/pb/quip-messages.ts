/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { Timestamp } from "./google/protobuf/timestamp";

export const protobufPackage = "quip";

export enum Status {
  OFFLINE = 0,
  IDLE = 1,
  SEARCHING = 2,
  PLAYING = 3,
}

export function statusFromJSON(object: any): Status {
  switch (object) {
    case 0:
    case "STATUS_OFFLINE":
      return Status.OFFLINE;
    case 1:
    case "STATUS_IDLE":
      return Status.IDLE;
    case 2:
    case "STATUS_SEARCHING":
      return Status.SEARCHING;
    case 3:
    case "STATUS_PLAYING":
      return Status.PLAYING;
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum Status");
  }
}

export function statusToJSON(object: Status): string {
  switch (object) {
    case Status.OFFLINE:
      return "STATUS_OFFLINE";
    case Status.IDLE:
      return "STATUS_IDLE";
    case Status.SEARCHING:
      return "STATUS_SEARCHING";
    case Status.PLAYING:
      return "STATUS_PLAYING";
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum Status");
  }
}

export interface GameConfiguration {
  gamemode: string;
}

/** Indicates change in queue status. */
export interface QueueUpdate {
  /** Identifies the entities whose queue has received an update. */
  targets: string[];
  /** Currently searching for a match. */
  started?:
    | QueueSearching
    | undefined;
  /** Stopped searching for a match or a match has completed. */
  finished?:
    | QueueFinished
    | undefined;
  /** Found a match. */
  found?: MatchFound | undefined;
}

export interface QueueSearching {
  gamemode: string;
  startTime: Date | undefined;
}

export interface QueueFinished {
  reason?: string | undefined;
}

export interface MatchFound {
  connection: string;
}

/** Indicates change in status. */
export interface StatusUpdate {
  targets: string[];
  status: Status;
}

function createBaseGameConfiguration(): GameConfiguration {
  return { gamemode: "" };
}

export const GameConfiguration = {
  encode(message: GameConfiguration, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.gamemode !== "") {
      writer.uint32(10).string(message.gamemode);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GameConfiguration {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGameConfiguration();
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

  fromJSON(object: any): GameConfiguration {
    return { gamemode: isSet(object.gamemode) ? String(object.gamemode) : "" };
  },

  toJSON(message: GameConfiguration): unknown {
    const obj: any = {};
    message.gamemode !== undefined && (obj.gamemode = message.gamemode);
    return obj;
  },

  create<I extends Exact<DeepPartial<GameConfiguration>, I>>(base?: I): GameConfiguration {
    return GameConfiguration.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<GameConfiguration>, I>>(object: I): GameConfiguration {
    const message = createBaseGameConfiguration();
    message.gamemode = object.gamemode ?? "";
    return message;
  },
};

function createBaseQueueUpdate(): QueueUpdate {
  return { targets: [], started: undefined, finished: undefined, found: undefined };
}

export const QueueUpdate = {
  encode(message: QueueUpdate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.targets) {
      writer.uint32(10).string(v!);
    }
    if (message.started !== undefined) {
      QueueSearching.encode(message.started, writer.uint32(18).fork()).ldelim();
    }
    if (message.finished !== undefined) {
      QueueFinished.encode(message.finished, writer.uint32(26).fork()).ldelim();
    }
    if (message.found !== undefined) {
      MatchFound.encode(message.found, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueueUpdate {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueueUpdate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.targets.push(reader.string());
          break;
        case 2:
          message.started = QueueSearching.decode(reader, reader.uint32());
          break;
        case 3:
          message.finished = QueueFinished.decode(reader, reader.uint32());
          break;
        case 4:
          message.found = MatchFound.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueueUpdate {
    return {
      targets: Array.isArray(object?.targets) ? object.targets.map((e: any) => String(e)) : [],
      started: isSet(object.started) ? QueueSearching.fromJSON(object.started) : undefined,
      finished: isSet(object.finished) ? QueueFinished.fromJSON(object.finished) : undefined,
      found: isSet(object.found) ? MatchFound.fromJSON(object.found) : undefined,
    };
  },

  toJSON(message: QueueUpdate): unknown {
    const obj: any = {};
    if (message.targets) {
      obj.targets = message.targets.map((e) => e);
    } else {
      obj.targets = [];
    }
    message.started !== undefined &&
      (obj.started = message.started ? QueueSearching.toJSON(message.started) : undefined);
    message.finished !== undefined &&
      (obj.finished = message.finished ? QueueFinished.toJSON(message.finished) : undefined);
    message.found !== undefined && (obj.found = message.found ? MatchFound.toJSON(message.found) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<QueueUpdate>, I>>(base?: I): QueueUpdate {
    return QueueUpdate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<QueueUpdate>, I>>(object: I): QueueUpdate {
    const message = createBaseQueueUpdate();
    message.targets = object.targets?.map((e) => e) || [];
    message.started = (object.started !== undefined && object.started !== null)
      ? QueueSearching.fromPartial(object.started)
      : undefined;
    message.finished = (object.finished !== undefined && object.finished !== null)
      ? QueueFinished.fromPartial(object.finished)
      : undefined;
    message.found = (object.found !== undefined && object.found !== null)
      ? MatchFound.fromPartial(object.found)
      : undefined;
    return message;
  },
};

function createBaseQueueSearching(): QueueSearching {
  return { gamemode: "", startTime: undefined };
}

export const QueueSearching = {
  encode(message: QueueSearching, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.gamemode !== "") {
      writer.uint32(10).string(message.gamemode);
    }
    if (message.startTime !== undefined) {
      Timestamp.encode(toTimestamp(message.startTime), writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueueSearching {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueueSearching();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.gamemode = reader.string();
          break;
        case 2:
          message.startTime = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueueSearching {
    return {
      gamemode: isSet(object.gamemode) ? String(object.gamemode) : "",
      startTime: isSet(object.startTime) ? fromJsonTimestamp(object.startTime) : undefined,
    };
  },

  toJSON(message: QueueSearching): unknown {
    const obj: any = {};
    message.gamemode !== undefined && (obj.gamemode = message.gamemode);
    message.startTime !== undefined && (obj.startTime = message.startTime.toISOString());
    return obj;
  },

  create<I extends Exact<DeepPartial<QueueSearching>, I>>(base?: I): QueueSearching {
    return QueueSearching.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<QueueSearching>, I>>(object: I): QueueSearching {
    const message = createBaseQueueSearching();
    message.gamemode = object.gamemode ?? "";
    message.startTime = object.startTime ?? undefined;
    return message;
  },
};

function createBaseQueueFinished(): QueueFinished {
  return { reason: undefined };
}

export const QueueFinished = {
  encode(message: QueueFinished, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.reason !== undefined) {
      writer.uint32(10).string(message.reason);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueueFinished {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueueFinished();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.reason = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueueFinished {
    return { reason: isSet(object.reason) ? String(object.reason) : undefined };
  },

  toJSON(message: QueueFinished): unknown {
    const obj: any = {};
    message.reason !== undefined && (obj.reason = message.reason);
    return obj;
  },

  create<I extends Exact<DeepPartial<QueueFinished>, I>>(base?: I): QueueFinished {
    return QueueFinished.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<QueueFinished>, I>>(object: I): QueueFinished {
    const message = createBaseQueueFinished();
    message.reason = object.reason ?? undefined;
    return message;
  },
};

function createBaseMatchFound(): MatchFound {
  return { connection: "" };
}

export const MatchFound = {
  encode(message: MatchFound, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.connection !== "") {
      writer.uint32(10).string(message.connection);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MatchFound {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMatchFound();
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

  fromJSON(object: any): MatchFound {
    return { connection: isSet(object.connection) ? String(object.connection) : "" };
  },

  toJSON(message: MatchFound): unknown {
    const obj: any = {};
    message.connection !== undefined && (obj.connection = message.connection);
    return obj;
  },

  create<I extends Exact<DeepPartial<MatchFound>, I>>(base?: I): MatchFound {
    return MatchFound.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MatchFound>, I>>(object: I): MatchFound {
    const message = createBaseMatchFound();
    message.connection = object.connection ?? "";
    return message;
  },
};

function createBaseStatusUpdate(): StatusUpdate {
  return { targets: [], status: 0 };
}

export const StatusUpdate = {
  encode(message: StatusUpdate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.targets) {
      writer.uint32(10).string(v!);
    }
    if (message.status !== 0) {
      writer.uint32(16).int32(message.status);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StatusUpdate {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStatusUpdate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.targets.push(reader.string());
          break;
        case 2:
          message.status = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): StatusUpdate {
    return {
      targets: Array.isArray(object?.targets) ? object.targets.map((e: any) => String(e)) : [],
      status: isSet(object.status) ? statusFromJSON(object.status) : 0,
    };
  },

  toJSON(message: StatusUpdate): unknown {
    const obj: any = {};
    if (message.targets) {
      obj.targets = message.targets.map((e) => e);
    } else {
      obj.targets = [];
    }
    message.status !== undefined && (obj.status = statusToJSON(message.status));
    return obj;
  },

  create<I extends Exact<DeepPartial<StatusUpdate>, I>>(base?: I): StatusUpdate {
    return StatusUpdate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<StatusUpdate>, I>>(object: I): StatusUpdate {
    const message = createBaseStatusUpdate();
    message.targets = object.targets?.map((e) => e) || [];
    message.status = object.status ?? 0;
    return message;
  },
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

function toTimestamp(date: Date): Timestamp {
  const seconds = date.getTime() / 1_000;
  const nanos = (date.getTime() % 1_000) * 1_000_000;
  return { seconds, nanos };
}

function fromTimestamp(t: Timestamp): Date {
  let millis = t.seconds * 1_000;
  millis += t.nanos / 1_000_000;
  return new Date(millis);
}

function fromJsonTimestamp(o: any): Date {
  if (o instanceof Date) {
    return o;
  } else if (typeof o === "string") {
    return new Date(o);
  } else {
    return fromTimestamp(Timestamp.fromJSON(o));
  }
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
