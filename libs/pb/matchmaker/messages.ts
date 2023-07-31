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

/** GameConfiguration contains information for specifying a desired match. */
export interface GameConfiguration {
  gamemode: string;
}

/** QueueDetails contains information about a currently running queue. */
export interface QueueDetails {
  config: GameConfiguration | undefined;
  startTime: Date | undefined;
}

/** QueueStopped contains information about why a queue has stopped. */
export interface QueueStopped {
  message: string;
}

/** MatchDetails contains necessary match information to identify and connect to a match. */
export interface MatchDetails {
  matchId: string;
  connection: string;
}

/** Status represents the current matchmaking status for any target. */
export interface Status {
  state: State;
  searching?: QueueDetails | undefined;
  stopped?: QueueStopped | undefined;
  matched?: MatchDetails | undefined;
}

/** StatusUpdate indicates a change in status for a set of targets. */
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
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGameConfiguration();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.gamemode = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GameConfiguration {
    return { gamemode: isSet(object.gamemode) ? String(object.gamemode) : "" };
  },

  toJSON(message: GameConfiguration): unknown {
    const obj: any = {};
    if (message.gamemode !== "") {
      obj.gamemode = message.gamemode;
    }
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

function createBaseQueueDetails(): QueueDetails {
  return { config: undefined, startTime: undefined };
}

export const QueueDetails = {
  encode(message: QueueDetails, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.config !== undefined) {
      GameConfiguration.encode(message.config, writer.uint32(10).fork()).ldelim();
    }
    if (message.startTime !== undefined) {
      Timestamp.encode(toTimestamp(message.startTime), writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueueDetails {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueueDetails();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.config = GameConfiguration.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.startTime = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): QueueDetails {
    return {
      config: isSet(object.config) ? GameConfiguration.fromJSON(object.config) : undefined,
      startTime: isSet(object.startTime) ? fromJsonTimestamp(object.startTime) : undefined,
    };
  },

  toJSON(message: QueueDetails): unknown {
    const obj: any = {};
    if (message.config !== undefined) {
      obj.config = GameConfiguration.toJSON(message.config);
    }
    if (message.startTime !== undefined) {
      obj.startTime = message.startTime.toISOString();
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<QueueDetails>, I>>(base?: I): QueueDetails {
    return QueueDetails.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<QueueDetails>, I>>(object: I): QueueDetails {
    const message = createBaseQueueDetails();
    message.config = (object.config !== undefined && object.config !== null)
      ? GameConfiguration.fromPartial(object.config)
      : undefined;
    message.startTime = object.startTime ?? undefined;
    return message;
  },
};

function createBaseQueueStopped(): QueueStopped {
  return { message: "" };
}

export const QueueStopped = {
  encode(message: QueueStopped, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.message !== "") {
      writer.uint32(10).string(message.message);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueueStopped {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueueStopped();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.message = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): QueueStopped {
    return { message: isSet(object.message) ? String(object.message) : "" };
  },

  toJSON(message: QueueStopped): unknown {
    const obj: any = {};
    if (message.message !== "") {
      obj.message = message.message;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<QueueStopped>, I>>(base?: I): QueueStopped {
    return QueueStopped.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<QueueStopped>, I>>(object: I): QueueStopped {
    const message = createBaseQueueStopped();
    message.message = object.message ?? "";
    return message;
  },
};

function createBaseMatchDetails(): MatchDetails {
  return { matchId: "", connection: "" };
}

export const MatchDetails = {
  encode(message: MatchDetails, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.matchId !== "") {
      writer.uint32(10).string(message.matchId);
    }
    if (message.connection !== "") {
      writer.uint32(18).string(message.connection);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MatchDetails {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMatchDetails();
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
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MatchDetails {
    return {
      matchId: isSet(object.matchId) ? String(object.matchId) : "",
      connection: isSet(object.connection) ? String(object.connection) : "",
    };
  },

  toJSON(message: MatchDetails): unknown {
    const obj: any = {};
    if (message.matchId !== "") {
      obj.matchId = message.matchId;
    }
    if (message.connection !== "") {
      obj.connection = message.connection;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MatchDetails>, I>>(base?: I): MatchDetails {
    return MatchDetails.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MatchDetails>, I>>(object: I): MatchDetails {
    const message = createBaseMatchDetails();
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
      QueueDetails.encode(message.searching, writer.uint32(18).fork()).ldelim();
    }
    if (message.stopped !== undefined) {
      QueueStopped.encode(message.stopped, writer.uint32(26).fork()).ldelim();
    }
    if (message.matched !== undefined) {
      MatchDetails.encode(message.matched, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Status {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStatus();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.state = reader.int32() as any;
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.searching = QueueDetails.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.stopped = QueueStopped.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.matched = MatchDetails.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Status {
    return {
      state: isSet(object.state) ? stateFromJSON(object.state) : 0,
      searching: isSet(object.searching) ? QueueDetails.fromJSON(object.searching) : undefined,
      stopped: isSet(object.stopped) ? QueueStopped.fromJSON(object.stopped) : undefined,
      matched: isSet(object.matched) ? MatchDetails.fromJSON(object.matched) : undefined,
    };
  },

  toJSON(message: Status): unknown {
    const obj: any = {};
    if (message.state !== 0) {
      obj.state = stateToJSON(message.state);
    }
    if (message.searching !== undefined) {
      obj.searching = QueueDetails.toJSON(message.searching);
    }
    if (message.stopped !== undefined) {
      obj.stopped = QueueStopped.toJSON(message.stopped);
    }
    if (message.matched !== undefined) {
      obj.matched = MatchDetails.toJSON(message.matched);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Status>, I>>(base?: I): Status {
    return Status.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Status>, I>>(object: I): Status {
    const message = createBaseStatus();
    message.state = object.state ?? 0;
    message.searching = (object.searching !== undefined && object.searching !== null)
      ? QueueDetails.fromPartial(object.searching)
      : undefined;
    message.stopped = (object.stopped !== undefined && object.stopped !== null)
      ? QueueStopped.fromPartial(object.stopped)
      : undefined;
    message.matched = (object.matched !== undefined && object.matched !== null)
      ? MatchDetails.fromPartial(object.matched)
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

          message.targets.push(reader.string());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.status = Status.decode(reader, reader.uint32());
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
      targets: Array.isArray(object?.targets) ? object.targets.map((e: any) => String(e)) : [],
      status: isSet(object.status) ? Status.fromJSON(object.status) : undefined,
    };
  },

  toJSON(message: StatusUpdate): unknown {
    const obj: any = {};
    if (message.targets?.length) {
      obj.targets = message.targets;
    }
    if (message.status !== undefined) {
      obj.status = Status.toJSON(message.status);
    }
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

declare const self: any | undefined;
declare const window: any | undefined;
declare const global: any | undefined;
const tsProtoGlobalThis: any = (() => {
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
  let millis = (t.seconds || 0) * 1_000;
  millis += (t.nanos || 0) / 1_000_000;
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
