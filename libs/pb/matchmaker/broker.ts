/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { MatchCancelled, MatchConnection, MatchDetails, MatchResults, QueueDetails, QueueStopped } from "./messages";

export const protobufPackage = "quip.matchmaker";

/**
 * End user notification message. Needs to be sent as a message
 * for notifying other friends or other party members.
 */
export interface StatusUpdate {
  targets: string[];
}

/**
 * End user notification message. Needs to be sent as a message
 * for notifying other friends or other party members.
 */
export interface QueueUpdate {
  targets: string[];
  queueStarted?: QueueDetails | undefined;
  queueStopped?: QueueStopped | undefined;
  matchFound?: MatchDetails | undefined;
  matchCancelled?: MatchCancelled | undefined;
  matchStarted?: MatchConnection | undefined;
  matchFinished?: MatchResults | undefined;
}

/** Internal broker message. Mainly sent by director or gameservers. */
export interface MatchUpdate {
  matchCancelled?: MatchCancelled | undefined;
  matchStarted?: MatchConnection | undefined;
  matchFinished?: MatchResults | undefined;
}

function createBaseStatusUpdate(): StatusUpdate {
  return { targets: [] };
}

export const StatusUpdate = {
  encode(message: StatusUpdate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.targets) {
      writer.uint32(10).string(v!);
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
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): StatusUpdate {
    return { targets: Array.isArray(object?.targets) ? object.targets.map((e: any) => String(e)) : [] };
  },

  toJSON(message: StatusUpdate): unknown {
    const obj: any = {};
    if (message.targets?.length) {
      obj.targets = message.targets;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<StatusUpdate>, I>>(base?: I): StatusUpdate {
    return StatusUpdate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<StatusUpdate>, I>>(object: I): StatusUpdate {
    const message = createBaseStatusUpdate();
    message.targets = object.targets?.map((e) => e) || [];
    return message;
  },
};

function createBaseQueueUpdate(): QueueUpdate {
  return {
    targets: [],
    queueStarted: undefined,
    queueStopped: undefined,
    matchFound: undefined,
    matchCancelled: undefined,
    matchStarted: undefined,
    matchFinished: undefined,
  };
}

export const QueueUpdate = {
  encode(message: QueueUpdate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.targets) {
      writer.uint32(10).string(v!);
    }
    if (message.queueStarted !== undefined) {
      QueueDetails.encode(message.queueStarted, writer.uint32(18).fork()).ldelim();
    }
    if (message.queueStopped !== undefined) {
      QueueStopped.encode(message.queueStopped, writer.uint32(26).fork()).ldelim();
    }
    if (message.matchFound !== undefined) {
      MatchDetails.encode(message.matchFound, writer.uint32(34).fork()).ldelim();
    }
    if (message.matchCancelled !== undefined) {
      MatchCancelled.encode(message.matchCancelled, writer.uint32(42).fork()).ldelim();
    }
    if (message.matchStarted !== undefined) {
      MatchConnection.encode(message.matchStarted, writer.uint32(50).fork()).ldelim();
    }
    if (message.matchFinished !== undefined) {
      MatchResults.encode(message.matchFinished, writer.uint32(58).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueueUpdate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueueUpdate();
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

          message.queueStarted = QueueDetails.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.queueStopped = QueueStopped.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.matchFound = MatchDetails.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.matchCancelled = MatchCancelled.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.matchStarted = MatchConnection.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 58) {
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

  fromJSON(object: any): QueueUpdate {
    return {
      targets: Array.isArray(object?.targets) ? object.targets.map((e: any) => String(e)) : [],
      queueStarted: isSet(object.queueStarted) ? QueueDetails.fromJSON(object.queueStarted) : undefined,
      queueStopped: isSet(object.queueStopped) ? QueueStopped.fromJSON(object.queueStopped) : undefined,
      matchFound: isSet(object.matchFound) ? MatchDetails.fromJSON(object.matchFound) : undefined,
      matchCancelled: isSet(object.matchCancelled) ? MatchCancelled.fromJSON(object.matchCancelled) : undefined,
      matchStarted: isSet(object.matchStarted) ? MatchConnection.fromJSON(object.matchStarted) : undefined,
      matchFinished: isSet(object.matchFinished) ? MatchResults.fromJSON(object.matchFinished) : undefined,
    };
  },

  toJSON(message: QueueUpdate): unknown {
    const obj: any = {};
    if (message.targets?.length) {
      obj.targets = message.targets;
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

  create<I extends Exact<DeepPartial<QueueUpdate>, I>>(base?: I): QueueUpdate {
    return QueueUpdate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<QueueUpdate>, I>>(object: I): QueueUpdate {
    const message = createBaseQueueUpdate();
    message.targets = object.targets?.map((e) => e) || [];
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

function createBaseMatchUpdate(): MatchUpdate {
  return { matchCancelled: undefined, matchStarted: undefined, matchFinished: undefined };
}

export const MatchUpdate = {
  encode(message: MatchUpdate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
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

  decode(input: _m0.Reader | Uint8Array, length?: number): MatchUpdate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMatchUpdate();
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

  fromJSON(object: any): MatchUpdate {
    return {
      matchCancelled: isSet(object.matchCancelled) ? MatchCancelled.fromJSON(object.matchCancelled) : undefined,
      matchStarted: isSet(object.matchStarted) ? MatchConnection.fromJSON(object.matchStarted) : undefined,
      matchFinished: isSet(object.matchFinished) ? MatchResults.fromJSON(object.matchFinished) : undefined,
    };
  },

  toJSON(message: MatchUpdate): unknown {
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

  create<I extends Exact<DeepPartial<MatchUpdate>, I>>(base?: I): MatchUpdate {
    return MatchUpdate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MatchUpdate>, I>>(object: I): MatchUpdate {
    const message = createBaseMatchUpdate();
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
