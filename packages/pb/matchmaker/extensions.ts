/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { MatchConfiguration, MatchRoster, QueueConfiguration } from "./messages";

export const protobufPackage = "quip.matchmaker";

export interface TicketDetails {
  playerId: string;
  config: QueueConfiguration | undefined;
}

export interface ProfileDetails {
  /** Name of the current gamemode. */
  gamemode: string;
  /** Number of teams in the match. */
  teams: number;
  /** Number of players per team. */
  players: number;
}

/**
 * Extension holding details about an ongoing match.
 * Placed in OpenMatch Match extension, Agones Allocation metadata, and statestore.
 */
export interface MatchDetails {
  matchId: string;
  connection: string;
  config: MatchConfiguration | undefined;
  roster: MatchRoster | undefined;
}

function createBaseTicketDetails(): TicketDetails {
  return { playerId: "", config: undefined };
}

export const TicketDetails = {
  encode(message: TicketDetails, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.playerId !== "") {
      writer.uint32(10).string(message.playerId);
    }
    if (message.config !== undefined) {
      QueueConfiguration.encode(message.config, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TicketDetails {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTicketDetails();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.playerId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
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

  fromJSON(object: any): TicketDetails {
    return {
      playerId: isSet(object.playerId) ? globalThis.String(object.playerId) : "",
      config: isSet(object.config) ? QueueConfiguration.fromJSON(object.config) : undefined,
    };
  },

  toJSON(message: TicketDetails): unknown {
    const obj: any = {};
    if (message.playerId !== "") {
      obj.playerId = message.playerId;
    }
    if (message.config !== undefined) {
      obj.config = QueueConfiguration.toJSON(message.config);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<TicketDetails>, I>>(base?: I): TicketDetails {
    return TicketDetails.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<TicketDetails>, I>>(object: I): TicketDetails {
    const message = createBaseTicketDetails();
    message.playerId = object.playerId ?? "";
    message.config = (object.config !== undefined && object.config !== null)
      ? QueueConfiguration.fromPartial(object.config)
      : undefined;
    return message;
  },
};

function createBaseProfileDetails(): ProfileDetails {
  return { gamemode: "", teams: 0, players: 0 };
}

export const ProfileDetails = {
  encode(message: ProfileDetails, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.gamemode !== "") {
      writer.uint32(10).string(message.gamemode);
    }
    if (message.teams !== 0) {
      writer.uint32(16).uint32(message.teams);
    }
    if (message.players !== 0) {
      writer.uint32(24).uint32(message.players);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProfileDetails {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProfileDetails();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.gamemode = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.teams = reader.uint32();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.players = reader.uint32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ProfileDetails {
    return {
      gamemode: isSet(object.gamemode) ? globalThis.String(object.gamemode) : "",
      teams: isSet(object.teams) ? globalThis.Number(object.teams) : 0,
      players: isSet(object.players) ? globalThis.Number(object.players) : 0,
    };
  },

  toJSON(message: ProfileDetails): unknown {
    const obj: any = {};
    if (message.gamemode !== "") {
      obj.gamemode = message.gamemode;
    }
    if (message.teams !== 0) {
      obj.teams = Math.round(message.teams);
    }
    if (message.players !== 0) {
      obj.players = Math.round(message.players);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<ProfileDetails>, I>>(base?: I): ProfileDetails {
    return ProfileDetails.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<ProfileDetails>, I>>(object: I): ProfileDetails {
    const message = createBaseProfileDetails();
    message.gamemode = object.gamemode ?? "";
    message.teams = object.teams ?? 0;
    message.players = object.players ?? 0;
    return message;
  },
};

function createBaseMatchDetails(): MatchDetails {
  return { matchId: "", connection: "", config: undefined, roster: undefined };
}

export const MatchDetails = {
  encode(message: MatchDetails, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.matchId !== "") {
      writer.uint32(10).string(message.matchId);
    }
    if (message.connection !== "") {
      writer.uint32(18).string(message.connection);
    }
    if (message.config !== undefined) {
      MatchConfiguration.encode(message.config, writer.uint32(26).fork()).ldelim();
    }
    if (message.roster !== undefined) {
      MatchRoster.encode(message.roster, writer.uint32(34).fork()).ldelim();
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
        case 3:
          if (tag !== 26) {
            break;
          }

          message.config = MatchConfiguration.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.roster = MatchRoster.decode(reader, reader.uint32());
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
      matchId: isSet(object.matchId) ? globalThis.String(object.matchId) : "",
      connection: isSet(object.connection) ? globalThis.String(object.connection) : "",
      config: isSet(object.config) ? MatchConfiguration.fromJSON(object.config) : undefined,
      roster: isSet(object.roster) ? MatchRoster.fromJSON(object.roster) : undefined,
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
    if (message.config !== undefined) {
      obj.config = MatchConfiguration.toJSON(message.config);
    }
    if (message.roster !== undefined) {
      obj.roster = MatchRoster.toJSON(message.roster);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MatchDetails>, I>>(base?: I): MatchDetails {
    return MatchDetails.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MatchDetails>, I>>(object: I): MatchDetails {
    const message = createBaseMatchDetails();
    message.matchId = object.matchId ?? "";
    message.connection = object.connection ?? "";
    message.config = (object.config !== undefined && object.config !== null)
      ? MatchConfiguration.fromPartial(object.config)
      : undefined;
    message.roster = (object.roster !== undefined && object.roster !== null)
      ? MatchRoster.fromPartial(object.roster)
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
