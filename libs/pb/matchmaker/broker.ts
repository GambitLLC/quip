/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { MatchCancelled, MatchConnection, MatchResults, QueueUpdate, Status } from "./messages";

export const protobufPackage = "quip.matchmaker";

/**
 * End user notification message. Needs to be sent as a message
 * for notifying other friends or other party members.
 */
export interface StatusUpdateMessage {
  targets: string[];
  update: Status | undefined;
}

/**
 * End user notification message. Needs to be sent as a message
 * for notifying other friends or other party members.
 */
export interface QueueUpdateMessage {
  targets: string[];
  update: QueueUpdate | undefined;
}

/** Internal broker message. Mainly sent by director or gameservers. */
export interface MatchUpdateMessage {
  matchCancelled?: MatchCancelled | undefined;
  matchStarted?: MatchConnection | undefined;
  matchFinished?: MatchResults | undefined;
}

function createBaseStatusUpdateMessage(): StatusUpdateMessage {
  return { targets: [], update: undefined };
}

export const StatusUpdateMessage = {
  encode(message: StatusUpdateMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.targets) {
      writer.uint32(10).string(v!);
    }
    if (message.update !== undefined) {
      Status.encode(message.update, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StatusUpdateMessage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStatusUpdateMessage();
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

          message.update = Status.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): StatusUpdateMessage {
    return {
      targets: Array.isArray(object?.targets) ? object.targets.map((e: any) => String(e)) : [],
      update: isSet(object.update) ? Status.fromJSON(object.update) : undefined,
    };
  },

  toJSON(message: StatusUpdateMessage): unknown {
    const obj: any = {};
    if (message.targets?.length) {
      obj.targets = message.targets;
    }
    if (message.update !== undefined) {
      obj.update = Status.toJSON(message.update);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<StatusUpdateMessage>, I>>(base?: I): StatusUpdateMessage {
    return StatusUpdateMessage.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<StatusUpdateMessage>, I>>(object: I): StatusUpdateMessage {
    const message = createBaseStatusUpdateMessage();
    message.targets = object.targets?.map((e) => e) || [];
    message.update = (object.update !== undefined && object.update !== null)
      ? Status.fromPartial(object.update)
      : undefined;
    return message;
  },
};

function createBaseQueueUpdateMessage(): QueueUpdateMessage {
  return { targets: [], update: undefined };
}

export const QueueUpdateMessage = {
  encode(message: QueueUpdateMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.targets) {
      writer.uint32(10).string(v!);
    }
    if (message.update !== undefined) {
      QueueUpdate.encode(message.update, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueueUpdateMessage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueueUpdateMessage();
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

          message.update = QueueUpdate.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): QueueUpdateMessage {
    return {
      targets: Array.isArray(object?.targets) ? object.targets.map((e: any) => String(e)) : [],
      update: isSet(object.update) ? QueueUpdate.fromJSON(object.update) : undefined,
    };
  },

  toJSON(message: QueueUpdateMessage): unknown {
    const obj: any = {};
    if (message.targets?.length) {
      obj.targets = message.targets;
    }
    if (message.update !== undefined) {
      obj.update = QueueUpdate.toJSON(message.update);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<QueueUpdateMessage>, I>>(base?: I): QueueUpdateMessage {
    return QueueUpdateMessage.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<QueueUpdateMessage>, I>>(object: I): QueueUpdateMessage {
    const message = createBaseQueueUpdateMessage();
    message.targets = object.targets?.map((e) => e) || [];
    message.update = (object.update !== undefined && object.update !== null)
      ? QueueUpdate.fromPartial(object.update)
      : undefined;
    return message;
  },
};

function createBaseMatchUpdateMessage(): MatchUpdateMessage {
  return { matchCancelled: undefined, matchStarted: undefined, matchFinished: undefined };
}

export const MatchUpdateMessage = {
  encode(message: MatchUpdateMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.matchCancelled !== undefined) {
      MatchCancelled.encode(message.matchCancelled, writer.uint32(10).fork()).ldelim();
    }
    if (message.matchStarted !== undefined) {
      MatchConnection.encode(message.matchStarted, writer.uint32(18).fork()).ldelim();
    }
    if (message.matchFinished !== undefined) {
      MatchResults.encode(message.matchFinished, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MatchUpdateMessage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMatchUpdateMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.matchCancelled = MatchCancelled.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.matchStarted = MatchConnection.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
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

  fromJSON(object: any): MatchUpdateMessage {
    return {
      matchCancelled: isSet(object.matchCancelled) ? MatchCancelled.fromJSON(object.matchCancelled) : undefined,
      matchStarted: isSet(object.matchStarted) ? MatchConnection.fromJSON(object.matchStarted) : undefined,
      matchFinished: isSet(object.matchFinished) ? MatchResults.fromJSON(object.matchFinished) : undefined,
    };
  },

  toJSON(message: MatchUpdateMessage): unknown {
    const obj: any = {};
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

  create<I extends Exact<DeepPartial<MatchUpdateMessage>, I>>(base?: I): MatchUpdateMessage {
    return MatchUpdateMessage.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MatchUpdateMessage>, I>>(object: I): MatchUpdateMessage {
    const message = createBaseMatchUpdateMessage();
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
