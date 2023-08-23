/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { Timestamp } from "../google/protobuf/timestamp";

export const protobufPackage = "quip.matchmaker";

export enum PlayerState {
  OFFLINE = 0,
  IDLE = 1,
  SEARCHING = 2,
  PLAYING = 3,
}

export function playerStateFromJSON(object: any): PlayerState {
  switch (object) {
    case 0:
    case "PLAYER_STATE_OFFLINE":
      return PlayerState.OFFLINE;
    case 1:
    case "PLAYER_STATE_IDLE":
      return PlayerState.IDLE;
    case 2:
    case "PLAYER_STATE_SEARCHING":
      return PlayerState.SEARCHING;
    case 3:
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

/** GameConfiguration contains information for specifying a desired match. */
export interface GameConfiguration {
  gamemode: string;
}

/**
 * TODO: support teams
 * message Team { repeated string players = 1; }
 * repeated Team teams = 1;
 */
export interface MatchRoster {
  players: string[];
}

/** Status represents the current matchmaking state for a single player. */
export interface Status {
  state: PlayerState;
}

export interface QueueUpdate {
  queueStarted?: QueueDetails | undefined;
  queueStopped?: QueueStopped | undefined;
  matchFound?: MatchDetails | undefined;
  matchCancelled?: MatchCancelled | undefined;
  matchStarted?: MatchConnection | undefined;
  matchFinished?: MatchResults | undefined;
}

/** QueueDetails contains information about a currently running queue. */
export interface QueueDetails {
  config: GameConfiguration | undefined;
  startTime: Date | undefined;
}

/** QueueStopped contains information about why a queue has stopped. */
export interface QueueStopped {
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

function createBaseStatus(): Status {
  return { state: 0 };
}

export const Status = {
  encode(message: Status, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.state !== 0) {
      writer.uint32(8).int32(message.state);
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
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Status {
    return { state: isSet(object.state) ? playerStateFromJSON(object.state) : 0 };
  },

  toJSON(message: Status): unknown {
    const obj: any = {};
    if (message.state !== 0) {
      obj.state = playerStateToJSON(message.state);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Status>, I>>(base?: I): Status {
    return Status.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Status>, I>>(object: I): Status {
    const message = createBaseStatus();
    message.state = object.state ?? 0;
    return message;
  },
};

function createBaseQueueUpdate(): QueueUpdate {
  return {
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
  return { reason: 0, message: undefined };
}

export const QueueStopped = {
  encode(message: QueueStopped, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.reason !== 0) {
      writer.uint32(8).int32(message.reason);
    }
    if (message.message !== undefined) {
      writer.uint32(18).string(message.message);
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
          if (tag !== 8) {
            break;
          }

          message.reason = reader.int32() as any;
          continue;
        case 2:
          if (tag !== 18) {
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
      reason: isSet(object.reason) ? reasonFromJSON(object.reason) : 0,
      message: isSet(object.message) ? String(object.message) : undefined,
    };
  },

  toJSON(message: QueueStopped): unknown {
    const obj: any = {};
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
