/* eslint-disable */
import * as _m0 from "protobufjs/minimal";

export const protobufPackage = "quip";

export enum Status {
  OFFLINE = 0,
  IDLE = 1,
  SEARCHING = 2,
  PLAYING = 3,
  UNRECOGNIZED = -1,
}

export function statusFromJSON(object: any): Status {
  switch (object) {
    case 0:
    case "OFFLINE":
      return Status.OFFLINE;
    case 1:
    case "IDLE":
      return Status.IDLE;
    case 2:
    case "SEARCHING":
      return Status.SEARCHING;
    case 3:
    case "PLAYING":
      return Status.PLAYING;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Status.UNRECOGNIZED;
  }
}

export function statusToJSON(object: Status): string {
  switch (object) {
    case Status.OFFLINE:
      return "OFFLINE";
    case Status.IDLE:
      return "IDLE";
    case Status.SEARCHING:
      return "SEARCHING";
    case Status.PLAYING:
      return "PLAYING";
    case Status.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

/** Indicates change in queue status. */
export interface QueueUpdate {
  /** Identifies the entities whose queue has received an update. */
  targets: string[];
  stopped?: string | undefined;
  found?: MatchDetails | undefined;
}

export interface MatchDetails {
  connection: string;
}

/** Indicates change in status. */
export interface StatusUpdate {
  targets: string[];
  status: Status;
}

function createBaseQueueUpdate(): QueueUpdate {
  return { targets: [], stopped: undefined, found: undefined };
}

export const QueueUpdate = {
  encode(message: QueueUpdate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.targets) {
      writer.uint32(10).string(v!);
    }
    if (message.stopped !== undefined) {
      writer.uint32(18).string(message.stopped);
    }
    if (message.found !== undefined) {
      MatchDetails.encode(message.found, writer.uint32(26).fork()).ldelim();
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
          message.stopped = reader.string();
          break;
        case 3:
          message.found = MatchDetails.decode(reader, reader.uint32());
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
      stopped: isSet(object.stopped) ? String(object.stopped) : undefined,
      found: isSet(object.found) ? MatchDetails.fromJSON(object.found) : undefined,
    };
  },

  toJSON(message: QueueUpdate): unknown {
    const obj: any = {};
    if (message.targets) {
      obj.targets = message.targets.map((e) => e);
    } else {
      obj.targets = [];
    }
    message.stopped !== undefined && (obj.stopped = message.stopped);
    message.found !== undefined && (obj.found = message.found ? MatchDetails.toJSON(message.found) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<QueueUpdate>, I>>(base?: I): QueueUpdate {
    return QueueUpdate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<QueueUpdate>, I>>(object: I): QueueUpdate {
    const message = createBaseQueueUpdate();
    message.targets = object.targets?.map((e) => e) || [];
    message.stopped = object.stopped ?? undefined;
    message.found = (object.found !== undefined && object.found !== null)
      ? MatchDetails.fromPartial(object.found)
      : undefined;
    return message;
  },
};

function createBaseMatchDetails(): MatchDetails {
  return { connection: "" };
}

export const MatchDetails = {
  encode(message: MatchDetails, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.connection !== "") {
      writer.uint32(10).string(message.connection);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MatchDetails {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMatchDetails();
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

  fromJSON(object: any): MatchDetails {
    return { connection: isSet(object.connection) ? String(object.connection) : "" };
  },

  toJSON(message: MatchDetails): unknown {
    const obj: any = {};
    message.connection !== undefined && (obj.connection = message.connection);
    return obj;
  },

  create<I extends Exact<DeepPartial<MatchDetails>, I>>(base?: I): MatchDetails {
    return MatchDetails.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MatchDetails>, I>>(object: I): MatchDetails {
    const message = createBaseMatchDetails();
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
