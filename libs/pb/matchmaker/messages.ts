/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { Timestamp } from "../google/protobuf/timestamp";

export const protobufPackage = "quip.matchmaker";

export enum State {
  OFFLINE = 0,
  IDLE = 1,
  SEARCHING = 2,
  PLAYING = 3,
}

export function stateFromJSON(object: any): State {
  switch (object) {
    case 0:
    case "STATE_OFFLINE":
      return State.OFFLINE;
    case 1:
    case "STATE_IDLE":
      return State.IDLE;
    case 2:
    case "STATE_SEARCHING":
      return State.SEARCHING;
    case 3:
    case "STATE_PLAYING":
      return State.PLAYING;
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum State");
  }
}

export function stateToJSON(object: State): string {
  switch (object) {
    case State.OFFLINE:
      return "STATE_OFFLINE";
    case State.IDLE:
      return "STATE_IDLE";
    case State.SEARCHING:
      return "STATE_SEARCHING";
    case State.PLAYING:
      return "STATE_PLAYING";
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum State");
  }
}

export interface GameConfiguration {
  gamemode: string;
}

export interface QueueSearching {
  gamemode: string;
  startTime: Date | undefined;
}

export interface QueueStopped {
  reason?: string | undefined;
}

export interface MatchFound {
  matchId: string;
  connection: string;
}

export interface Status {
  state: State;
  searching?: QueueSearching | undefined;
  stopped?: QueueStopped | undefined;
  matched?: MatchFound | undefined;
}

/** Indicates change in status. */
export interface StatusUpdate {
  targets: string[];
  status: Status | undefined;
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

function createBaseQueueStopped(): QueueStopped {
  return { reason: undefined };
}

export const QueueStopped = {
  encode(message: QueueStopped, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.reason !== undefined) {
      writer.uint32(10).string(message.reason);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueueStopped {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueueStopped();
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

  fromJSON(object: any): QueueStopped {
    return { reason: isSet(object.reason) ? String(object.reason) : undefined };
  },

  toJSON(message: QueueStopped): unknown {
    const obj: any = {};
    message.reason !== undefined && (obj.reason = message.reason);
    return obj;
  },

  create<I extends Exact<DeepPartial<QueueStopped>, I>>(base?: I): QueueStopped {
    return QueueStopped.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<QueueStopped>, I>>(object: I): QueueStopped {
    const message = createBaseQueueStopped();
    message.reason = object.reason ?? undefined;
    return message;
  },
};

function createBaseMatchFound(): MatchFound {
  return { matchId: "", connection: "" };
}

export const MatchFound = {
  encode(message: MatchFound, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.matchId !== "") {
      writer.uint32(10).string(message.matchId);
    }
    if (message.connection !== "") {
      writer.uint32(18).string(message.connection);
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
          message.matchId = reader.string();
          break;
        case 2:
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
    return {
      matchId: isSet(object.matchId) ? String(object.matchId) : "",
      connection: isSet(object.connection) ? String(object.connection) : "",
    };
  },

  toJSON(message: MatchFound): unknown {
    const obj: any = {};
    message.matchId !== undefined && (obj.matchId = message.matchId);
    message.connection !== undefined && (obj.connection = message.connection);
    return obj;
  },

  create<I extends Exact<DeepPartial<MatchFound>, I>>(base?: I): MatchFound {
    return MatchFound.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MatchFound>, I>>(object: I): MatchFound {
    const message = createBaseMatchFound();
    message.matchId = object.matchId ?? "";
    message.connection = object.connection ?? "";
    return message;
  },
};

function createBaseStatus(): Status {
  return { state: 0, searching: undefined, stopped: undefined, matched: undefined };
}

export const Status = {
  encode(message: Status, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.state !== 0) {
      writer.uint32(8).int32(message.state);
    }
    if (message.searching !== undefined) {
      QueueSearching.encode(message.searching, writer.uint32(18).fork()).ldelim();
    }
    if (message.stopped !== undefined) {
      QueueStopped.encode(message.stopped, writer.uint32(26).fork()).ldelim();
    }
    if (message.matched !== undefined) {
      MatchFound.encode(message.matched, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Status {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStatus();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.state = reader.int32() as any;
          break;
        case 2:
          message.searching = QueueSearching.decode(reader, reader.uint32());
          break;
        case 3:
          message.stopped = QueueStopped.decode(reader, reader.uint32());
          break;
        case 4:
          message.matched = MatchFound.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Status {
    return {
      state: isSet(object.state) ? stateFromJSON(object.state) : 0,
      searching: isSet(object.searching) ? QueueSearching.fromJSON(object.searching) : undefined,
      stopped: isSet(object.stopped) ? QueueStopped.fromJSON(object.stopped) : undefined,
      matched: isSet(object.matched) ? MatchFound.fromJSON(object.matched) : undefined,
    };
  },

  toJSON(message: Status): unknown {
    const obj: any = {};
    message.state !== undefined && (obj.state = stateToJSON(message.state));
    message.searching !== undefined &&
      (obj.searching = message.searching ? QueueSearching.toJSON(message.searching) : undefined);
    message.stopped !== undefined && (obj.stopped = message.stopped ? QueueStopped.toJSON(message.stopped) : undefined);
    message.matched !== undefined && (obj.matched = message.matched ? MatchFound.toJSON(message.matched) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<Status>, I>>(base?: I): Status {
    return Status.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Status>, I>>(object: I): Status {
    const message = createBaseStatus();
    message.state = object.state ?? 0;
    message.searching = (object.searching !== undefined && object.searching !== null)
      ? QueueSearching.fromPartial(object.searching)
      : undefined;
    message.stopped = (object.stopped !== undefined && object.stopped !== null)
      ? QueueStopped.fromPartial(object.stopped)
      : undefined;
    message.matched = (object.matched !== undefined && object.matched !== null)
      ? MatchFound.fromPartial(object.matched)
      : undefined;
    return message;
  },
};

function createBaseStatusUpdate(): StatusUpdate {
  return { targets: [], status: undefined };
}

export const StatusUpdate = {
  encode(message: StatusUpdate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.targets) {
      writer.uint32(10).string(v!);
    }
    if (message.status !== undefined) {
      Status.encode(message.status, writer.uint32(18).fork()).ldelim();
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
          message.status = Status.decode(reader, reader.uint32());
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
      status: isSet(object.status) ? Status.fromJSON(object.status) : undefined,
    };
  },

  toJSON(message: StatusUpdate): unknown {
    const obj: any = {};
    if (message.targets) {
      obj.targets = message.targets.map((e) => e);
    } else {
      obj.targets = [];
    }
    message.status !== undefined && (obj.status = message.status ? Status.toJSON(message.status) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<StatusUpdate>, I>>(base?: I): StatusUpdate {
    return StatusUpdate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<StatusUpdate>, I>>(object: I): StatusUpdate {
    const message = createBaseStatusUpdate();
    message.targets = object.targets?.map((e) => e) || [];
    message.status = (object.status !== undefined && object.status !== null)
      ? Status.fromPartial(object.status)
      : undefined;
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
