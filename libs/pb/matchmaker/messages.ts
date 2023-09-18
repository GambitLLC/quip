/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { Timestamp } from "../google/protobuf/timestamp";

export const protobufPackage = "quip.matchmaker";

export enum PlayerState {
  OFFLINE = 0,
  ONLINE = 1,
  IDLE = 2,
  SEARCHING = 3,
  PLAYING = 4,
}

export function playerStateFromJSON(object: any): PlayerState {
  switch (object) {
    case 0:
    case "PLAYER_STATE_OFFLINE":
      return PlayerState.OFFLINE;
    case 1:
    case "PLAYER_STATE_ONLINE":
      return PlayerState.ONLINE;
    case 2:
    case "PLAYER_STATE_IDLE":
      return PlayerState.IDLE;
    case 3:
    case "PLAYER_STATE_SEARCHING":
      return PlayerState.SEARCHING;
    case 4:
    case "PLAYER_STATE_PLAYING":
      return PlayerState.PLAYING;
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum PlayerState");
  }
}

export function playerStateToJSON(object: PlayerState): string {
  switch (object) {
    case PlayerState.OFFLINE:
      return "PLAYER_STATE_OFFLINE";
    case PlayerState.ONLINE:
      return "PLAYER_STATE_ONLINE";
    case PlayerState.IDLE:
      return "PLAYER_STATE_IDLE";
    case PlayerState.SEARCHING:
      return "PLAYER_STATE_SEARCHING";
    case PlayerState.PLAYING:
      return "PLAYER_STATE_PLAYING";
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum PlayerState");
  }
}

export enum Reason {
  UNSPECIFIED = 0,
  PLAYER = 1,
}

export function reasonFromJSON(object: any): Reason {
  switch (object) {
    case 0:
    case "REASON_UNSPECIFIED":
      return Reason.UNSPECIFIED;
    case 1:
    case "REASON_PLAYER":
      return Reason.PLAYER;
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum Reason");
  }
}

export function reasonToJSON(object: Reason): string {
  switch (object) {
    case Reason.UNSPECIFIED:
      return "REASON_UNSPECIFIED";
    case Reason.PLAYER:
      return "REASON_PLAYER";
    default:
      throw new tsProtoGlobalThis.Error("Unrecognized enum value " + object + " for enum Reason");
  }
}

export interface Player {
  /** Id represents the player identifier. */
  id: string;
  /**
   * State is a simple enum representing whether the player is currently
   * online, idle, in queue, or in a game.
   */
  state: PlayerState;
  queueAssignment?: QueueAssignment | undefined;
  matchAssignment?: MatchAssignment | undefined;
}

export interface QueueAssignment {
  /** Queue identifier to determine which queue has updated. */
  id: string;
  /** Config represents information about the desired game. */
  config:
    | QueueConfiguration
    | undefined;
  /** Start time is the time the queue began. */
  startTime: Date | undefined;
}

export interface QueueConfiguration {
  gamemode: string;
}

export interface MatchAssignment {
  /** Id represents the auto-generated match id. */
  id: string;
  /** Connection information for this match. */
  connection: string;
}

export interface StatusUpdate {
  queueStarted?: QueueAssignment | undefined;
  queueStopped?: QueueStopped | undefined;
  matchFound?: MatchDetails | undefined;
  matchCancelled?: MatchCancelled | undefined;
  matchStarted?: MatchConnection | undefined;
  matchFinished?: MatchResults | undefined;
}

/** QueueStopped contains information about why a queue has stopped. */
export interface QueueStopped {
  id: string;
  reason: Reason;
  message?: string | undefined;
}

/**
 * MatchDetails contains information about a potential match that was found.
 * Sent as intermediate step for players to accept (send match wager) match before
 * allocating a server.
 */
export interface MatchDetails {
  matchId: string;
  time: Date | undefined;
}

export interface MatchCancelled {
  matchId: string;
  reason: Reason;
}

/** MatchConnection contains necessary match information to identify and connect to a match. */
export interface MatchConnection {
  matchId: string;
  connection: string;
}

export interface MatchResults {
  matchId: string;
}

/** MatchRoster contains necessary information for a gameserver to setup. */
export interface MatchRoster {
  players: string[];
}

function createBasePlayer(): Player {
  return { id: "", state: 0, queueAssignment: undefined, matchAssignment: undefined };
}

export const Player = {
  encode(message: Player, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.state !== 0) {
      writer.uint32(16).int32(message.state);
    }
    if (message.queueAssignment !== undefined) {
      QueueAssignment.encode(message.queueAssignment, writer.uint32(26).fork()).ldelim();
    }
    if (message.matchAssignment !== undefined) {
      MatchAssignment.encode(message.matchAssignment, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Player {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlayer();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.state = reader.int32() as any;
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.queueAssignment = QueueAssignment.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.matchAssignment = MatchAssignment.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Player {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      state: isSet(object.state) ? playerStateFromJSON(object.state) : 0,
      queueAssignment: isSet(object.queueAssignment) ? QueueAssignment.fromJSON(object.queueAssignment) : undefined,
      matchAssignment: isSet(object.matchAssignment) ? MatchAssignment.fromJSON(object.matchAssignment) : undefined,
    };
  },

  toJSON(message: Player): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.state !== 0) {
      obj.state = playerStateToJSON(message.state);
    }
    if (message.queueAssignment !== undefined) {
      obj.queueAssignment = QueueAssignment.toJSON(message.queueAssignment);
    }
    if (message.matchAssignment !== undefined) {
      obj.matchAssignment = MatchAssignment.toJSON(message.matchAssignment);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Player>, I>>(base?: I): Player {
    return Player.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Player>, I>>(object: I): Player {
    const message = createBasePlayer();
    message.id = object.id ?? "";
    message.state = object.state ?? 0;
    message.queueAssignment = (object.queueAssignment !== undefined && object.queueAssignment !== null)
      ? QueueAssignment.fromPartial(object.queueAssignment)
      : undefined;
    message.matchAssignment = (object.matchAssignment !== undefined && object.matchAssignment !== null)
      ? MatchAssignment.fromPartial(object.matchAssignment)
      : undefined;
    return message;
  },
};

function createBaseQueueAssignment(): QueueAssignment {
  return { id: "", config: undefined, startTime: undefined };
}

export const QueueAssignment = {
  encode(message: QueueAssignment, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.config !== undefined) {
      QueueConfiguration.encode(message.config, writer.uint32(18).fork()).ldelim();
    }
    if (message.startTime !== undefined) {
      Timestamp.encode(toTimestamp(message.startTime), writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueueAssignment {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueueAssignment();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.config = QueueConfiguration.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
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

  fromJSON(object: any): QueueAssignment {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      config: isSet(object.config) ? QueueConfiguration.fromJSON(object.config) : undefined,
      startTime: isSet(object.startTime) ? fromJsonTimestamp(object.startTime) : undefined,
    };
  },

  toJSON(message: QueueAssignment): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.config !== undefined) {
      obj.config = QueueConfiguration.toJSON(message.config);
    }
    if (message.startTime !== undefined) {
      obj.startTime = message.startTime.toISOString();
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<QueueAssignment>, I>>(base?: I): QueueAssignment {
    return QueueAssignment.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<QueueAssignment>, I>>(object: I): QueueAssignment {
    const message = createBaseQueueAssignment();
    message.id = object.id ?? "";
    message.config = (object.config !== undefined && object.config !== null)
      ? QueueConfiguration.fromPartial(object.config)
      : undefined;
    message.startTime = object.startTime ?? undefined;
    return message;
  },
};

function createBaseQueueConfiguration(): QueueConfiguration {
  return { gamemode: "" };
}

export const QueueConfiguration = {
  encode(message: QueueConfiguration, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.gamemode !== "") {
      writer.uint32(10).string(message.gamemode);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueueConfiguration {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueueConfiguration();
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

  fromJSON(object: any): QueueConfiguration {
    return { gamemode: isSet(object.gamemode) ? String(object.gamemode) : "" };
  },

  toJSON(message: QueueConfiguration): unknown {
    const obj: any = {};
    if (message.gamemode !== "") {
      obj.gamemode = message.gamemode;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<QueueConfiguration>, I>>(base?: I): QueueConfiguration {
    return QueueConfiguration.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<QueueConfiguration>, I>>(object: I): QueueConfiguration {
    const message = createBaseQueueConfiguration();
    message.gamemode = object.gamemode ?? "";
    return message;
  },
};

function createBaseMatchAssignment(): MatchAssignment {
  return { id: "", connection: "" };
}

export const MatchAssignment = {
  encode(message: MatchAssignment, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.connection !== "") {
      writer.uint32(18).string(message.connection);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MatchAssignment {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMatchAssignment();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
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

  fromJSON(object: any): MatchAssignment {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      connection: isSet(object.connection) ? String(object.connection) : "",
    };
  },

  toJSON(message: MatchAssignment): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.connection !== "") {
      obj.connection = message.connection;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MatchAssignment>, I>>(base?: I): MatchAssignment {
    return MatchAssignment.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MatchAssignment>, I>>(object: I): MatchAssignment {
    const message = createBaseMatchAssignment();
    message.id = object.id ?? "";
    message.connection = object.connection ?? "";
    return message;
  },
};

function createBaseStatusUpdate(): StatusUpdate {
  return {
    queueStarted: undefined,
    queueStopped: undefined,
    matchFound: undefined,
    matchCancelled: undefined,
    matchStarted: undefined,
    matchFinished: undefined,
  };
}

export const StatusUpdate = {
  encode(message: StatusUpdate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.queueStarted !== undefined) {
      QueueAssignment.encode(message.queueStarted, writer.uint32(18).fork()).ldelim();
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

  decode(input: _m0.Reader | Uint8Array, length?: number): StatusUpdate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStatusUpdate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          if (tag !== 18) {
            break;
          }

          message.queueStarted = QueueAssignment.decode(reader, reader.uint32());
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

  fromJSON(object: any): StatusUpdate {
    return {
      queueStarted: isSet(object.queueStarted) ? QueueAssignment.fromJSON(object.queueStarted) : undefined,
      queueStopped: isSet(object.queueStopped) ? QueueStopped.fromJSON(object.queueStopped) : undefined,
      matchFound: isSet(object.matchFound) ? MatchDetails.fromJSON(object.matchFound) : undefined,
      matchCancelled: isSet(object.matchCancelled) ? MatchCancelled.fromJSON(object.matchCancelled) : undefined,
      matchStarted: isSet(object.matchStarted) ? MatchConnection.fromJSON(object.matchStarted) : undefined,
      matchFinished: isSet(object.matchFinished) ? MatchResults.fromJSON(object.matchFinished) : undefined,
    };
  },

  toJSON(message: StatusUpdate): unknown {
    const obj: any = {};
    if (message.queueStarted !== undefined) {
      obj.queueStarted = QueueAssignment.toJSON(message.queueStarted);
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

  create<I extends Exact<DeepPartial<StatusUpdate>, I>>(base?: I): StatusUpdate {
    return StatusUpdate.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<StatusUpdate>, I>>(object: I): StatusUpdate {
    const message = createBaseStatusUpdate();
    message.queueStarted = (object.queueStarted !== undefined && object.queueStarted !== null)
      ? QueueAssignment.fromPartial(object.queueStarted)
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

function createBaseQueueStopped(): QueueStopped {
  return { id: "", reason: 0, message: undefined };
}

export const QueueStopped = {
  encode(message: QueueStopped, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.reason !== 0) {
      writer.uint32(16).int32(message.reason);
    }
    if (message.message !== undefined) {
      writer.uint32(26).string(message.message);
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

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.reason = reader.int32() as any;
          continue;
        case 3:
          if (tag !== 26) {
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
    return {
      id: isSet(object.id) ? String(object.id) : "",
      reason: isSet(object.reason) ? reasonFromJSON(object.reason) : 0,
      message: isSet(object.message) ? String(object.message) : undefined,
    };
  },

  toJSON(message: QueueStopped): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.reason !== 0) {
      obj.reason = reasonToJSON(message.reason);
    }
    if (message.message !== undefined) {
      obj.message = message.message;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<QueueStopped>, I>>(base?: I): QueueStopped {
    return QueueStopped.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<QueueStopped>, I>>(object: I): QueueStopped {
    const message = createBaseQueueStopped();
    message.id = object.id ?? "";
    message.reason = object.reason ?? 0;
    message.message = object.message ?? undefined;
    return message;
  },
};

function createBaseMatchDetails(): MatchDetails {
  return { matchId: "", time: undefined };
}

export const MatchDetails = {
  encode(message: MatchDetails, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.matchId !== "") {
      writer.uint32(10).string(message.matchId);
    }
    if (message.time !== undefined) {
      Timestamp.encode(toTimestamp(message.time), writer.uint32(18).fork()).ldelim();
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

          message.time = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
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
      time: isSet(object.time) ? fromJsonTimestamp(object.time) : undefined,
    };
  },

  toJSON(message: MatchDetails): unknown {
    const obj: any = {};
    if (message.matchId !== "") {
      obj.matchId = message.matchId;
    }
    if (message.time !== undefined) {
      obj.time = message.time.toISOString();
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MatchDetails>, I>>(base?: I): MatchDetails {
    return MatchDetails.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MatchDetails>, I>>(object: I): MatchDetails {
    const message = createBaseMatchDetails();
    message.matchId = object.matchId ?? "";
    message.time = object.time ?? undefined;
    return message;
  },
};

function createBaseMatchCancelled(): MatchCancelled {
  return { matchId: "", reason: 0 };
}

export const MatchCancelled = {
  encode(message: MatchCancelled, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.matchId !== "") {
      writer.uint32(10).string(message.matchId);
    }
    if (message.reason !== 0) {
      writer.uint32(16).int32(message.reason);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MatchCancelled {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMatchCancelled();
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
          if (tag !== 16) {
            break;
          }

          message.reason = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MatchCancelled {
    return {
      matchId: isSet(object.matchId) ? String(object.matchId) : "",
      reason: isSet(object.reason) ? reasonFromJSON(object.reason) : 0,
    };
  },

  toJSON(message: MatchCancelled): unknown {
    const obj: any = {};
    if (message.matchId !== "") {
      obj.matchId = message.matchId;
    }
    if (message.reason !== 0) {
      obj.reason = reasonToJSON(message.reason);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MatchCancelled>, I>>(base?: I): MatchCancelled {
    return MatchCancelled.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MatchCancelled>, I>>(object: I): MatchCancelled {
    const message = createBaseMatchCancelled();
    message.matchId = object.matchId ?? "";
    message.reason = object.reason ?? 0;
    return message;
  },
};

function createBaseMatchConnection(): MatchConnection {
  return { matchId: "", connection: "" };
}

export const MatchConnection = {
  encode(message: MatchConnection, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.matchId !== "") {
      writer.uint32(10).string(message.matchId);
    }
    if (message.connection !== "") {
      writer.uint32(18).string(message.connection);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MatchConnection {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMatchConnection();
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

  fromJSON(object: any): MatchConnection {
    return {
      matchId: isSet(object.matchId) ? String(object.matchId) : "",
      connection: isSet(object.connection) ? String(object.connection) : "",
    };
  },

  toJSON(message: MatchConnection): unknown {
    const obj: any = {};
    if (message.matchId !== "") {
      obj.matchId = message.matchId;
    }
    if (message.connection !== "") {
      obj.connection = message.connection;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MatchConnection>, I>>(base?: I): MatchConnection {
    return MatchConnection.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MatchConnection>, I>>(object: I): MatchConnection {
    const message = createBaseMatchConnection();
    message.matchId = object.matchId ?? "";
    message.connection = object.connection ?? "";
    return message;
  },
};

function createBaseMatchResults(): MatchResults {
  return { matchId: "" };
}

export const MatchResults = {
  encode(message: MatchResults, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.matchId !== "") {
      writer.uint32(10).string(message.matchId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MatchResults {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMatchResults();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.matchId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MatchResults {
    return { matchId: isSet(object.matchId) ? String(object.matchId) : "" };
  },

  toJSON(message: MatchResults): unknown {
    const obj: any = {};
    if (message.matchId !== "") {
      obj.matchId = message.matchId;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MatchResults>, I>>(base?: I): MatchResults {
    return MatchResults.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MatchResults>, I>>(object: I): MatchResults {
    const message = createBaseMatchResults();
    message.matchId = object.matchId ?? "";
    return message;
  },
};

function createBaseMatchRoster(): MatchRoster {
  return { players: [] };
}

export const MatchRoster = {
  encode(message: MatchRoster, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.players) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MatchRoster {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMatchRoster();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.players.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MatchRoster {
    return { players: Array.isArray(object?.players) ? object.players.map((e: any) => String(e)) : [] };
  },

  toJSON(message: MatchRoster): unknown {
    const obj: any = {};
    if (message.players?.length) {
      obj.players = message.players;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MatchRoster>, I>>(base?: I): MatchRoster {
    return MatchRoster.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MatchRoster>, I>>(object: I): MatchRoster {
    const message = createBaseMatchRoster();
    message.players = object.players?.map((e) => e) || [];
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
