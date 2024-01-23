/* eslint-disable */
import _m0 from "protobufjs/minimal";
import {
  MatchCancelled,
  MatchResults,
  MatchStarted,
  PlayerState,
  playerStateFromJSON,
  playerStateToJSON,
  StatusUpdate,
} from "./messages";

export const protobufPackage = "quip.matchmaker";

/**
 * End user notification message. Needs to be sent as a message
 * for notifying other friends or other party members.
 */
export interface StateUpdateMessage {
  targets: string[];
  state: PlayerState;
}

/**
 * End user notification message. Needs to be sent as a message
 * for notifying other friends or other party members.
 */
export interface StatusUpdateMessage {
  targets: string[];
  update: StatusUpdate | undefined;
}

/**
 * Internal broker message. Mainly sent by director or gameservers.
 * TODO: this may not be necessary? can possibly watch solana transactions
 */
export interface MatchUpdateMessage {
  matchCancelled?: MatchCancelled | undefined;
  matchStarted?: MatchStarted | undefined;
  matchFinished?: MatchResults | undefined;
}

function createBaseStateUpdateMessage(): StateUpdateMessage {
  return { targets: [], state: 0 };
}

export const StateUpdateMessage = {
  encode(message: StateUpdateMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.targets) {
      writer.uint32(10).string(v!);
    }
    if (message.state !== 0) {
      writer.uint32(16).int32(message.state);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StateUpdateMessage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStateUpdateMessage();
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
          if (tag !== 16) {
            break;
          }

          message.state = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): StateUpdateMessage {
    return {
      targets: globalThis.Array.isArray(object?.targets) ? object.targets.map((e: any) => globalThis.String(e)) : [],
      state: isSet(object.state) ? playerStateFromJSON(object.state) : 0,
    };
  },

  toJSON(message: StateUpdateMessage): unknown {
    const obj: any = {};
    if (message.targets?.length) {
      obj.targets = message.targets;
    }
    if (message.state !== 0) {
      obj.state = playerStateToJSON(message.state);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<StateUpdateMessage>, I>>(base?: I): StateUpdateMessage {
    return StateUpdateMessage.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<StateUpdateMessage>, I>>(object: I): StateUpdateMessage {
    const message = createBaseStateUpdateMessage();
    message.targets = object.targets?.map((e) => e) || [];
    message.state = object.state ?? 0;
    return message;
  },
};

function createBaseStatusUpdateMessage(): StatusUpdateMessage {
  return { targets: [], update: undefined };
}

export const StatusUpdateMessage = {
  encode(message: StatusUpdateMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.targets) {
      writer.uint32(10).string(v!);
    }
    if (message.update !== undefined) {
      StatusUpdate.encode(message.update, writer.uint32(18).fork()).ldelim();
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

  fromJSON(object: any): StatusUpdateMessage {
    return {
      targets: globalThis.Array.isArray(object?.targets) ? object.targets.map((e: any) => globalThis.String(e)) : [],
      update: isSet(object.update) ? StatusUpdate.fromJSON(object.update) : undefined,
    };
  },

  toJSON(message: StatusUpdateMessage): unknown {
    const obj: any = {};
    if (message.targets?.length) {
      obj.targets = message.targets;
    }
    if (message.update !== undefined) {
      obj.update = StatusUpdate.toJSON(message.update);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<StatusUpdateMessage>, I>>(base?: I): StatusUpdateMessage {
    return StatusUpdateMessage.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<StatusUpdateMessage>, I>>(object: I): StatusUpdateMessage {
    const message = createBaseStatusUpdateMessage();
    message.targets = object.targets?.map((e) => e) || [];
    message.update = (object.update !== undefined && object.update !== null)
      ? StatusUpdate.fromPartial(object.update)
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
      MatchStarted.encode(message.matchStarted, writer.uint32(18).fork()).ldelim();
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

          message.matchStarted = MatchStarted.decode(reader, reader.uint32());
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
      matchStarted: isSet(object.matchStarted) ? MatchStarted.fromJSON(object.matchStarted) : undefined,
      matchFinished: isSet(object.matchFinished) ? MatchResults.fromJSON(object.matchFinished) : undefined,
    };
  },

  toJSON(message: MatchUpdateMessage): unknown {
    const obj: any = {};
    if (message.matchCancelled !== undefined) {
      obj.matchCancelled = MatchCancelled.toJSON(message.matchCancelled);
    }
    if (message.matchStarted !== undefined) {
      obj.matchStarted = MatchStarted.toJSON(message.matchStarted);
    }
    if (message.matchFinished !== undefined) {
      obj.matchFinished = MatchResults.toJSON(message.matchFinished);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MatchUpdateMessage>, I>>(base?: I): MatchUpdateMessage {
    return MatchUpdateMessage.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MatchUpdateMessage>, I>>(object: I): MatchUpdateMessage {
    const message = createBaseMatchUpdateMessage();
    message.matchCancelled = (object.matchCancelled !== undefined && object.matchCancelled !== null)
      ? MatchCancelled.fromPartial(object.matchCancelled)
      : undefined;
    message.matchStarted = (object.matchStarted !== undefined && object.matchStarted !== null)
      ? MatchStarted.fromPartial(object.matchStarted)
      : undefined;
    message.matchFinished = (object.matchFinished !== undefined && object.matchFinished !== null)
      ? MatchResults.fromPartial(object.matchFinished)
      : undefined;
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
