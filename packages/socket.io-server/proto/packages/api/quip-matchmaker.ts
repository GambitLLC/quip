/* eslint-disable */
import * as _m0 from "protobufjs/minimal";
import { Empty } from "../../google/protobuf/empty";

export const protobufPackage = "quip.matchmaker";

export interface StartQueueRequest {
  gamemode: string;
}

/** Event message indicating change in queue status. */
export interface QueueUpdate {
  /** Identifies the entities whose queue has received an update. */
  targets: string[];
  stopped?: string | undefined;
  found?: MatchDetails | undefined;
}

export interface MatchDetails {
  connection: string;
}

export interface StatusResponse {
  status: StatusResponse_Status;
  /** Details about the match the user is currently playing in. */
  match?: MatchDetails | undefined;
}

export enum StatusResponse_Status {
  IDLE = 0,
  SEARCHING = 1,
  PLAYING = 2,
  UNRECOGNIZED = -1,
}

export function statusResponse_StatusFromJSON(object: any): StatusResponse_Status {
  switch (object) {
    case 0:
    case "IDLE":
      return StatusResponse_Status.IDLE;
    case 1:
    case "SEARCHING":
      return StatusResponse_Status.SEARCHING;
    case 2:
    case "PLAYING":
      return StatusResponse_Status.PLAYING;
    case -1:
    case "UNRECOGNIZED":
    default:
      return StatusResponse_Status.UNRECOGNIZED;
  }
}

export function statusResponse_StatusToJSON(object: StatusResponse_Status): string {
  switch (object) {
    case StatusResponse_Status.IDLE:
      return "IDLE";
    case StatusResponse_Status.SEARCHING:
      return "SEARCHING";
    case StatusResponse_Status.PLAYING:
      return "PLAYING";
    case StatusResponse_Status.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

function createBaseStartQueueRequest(): StartQueueRequest {
  return { gamemode: "" };
}

export const StartQueueRequest = {
  encode(message: StartQueueRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.gamemode !== "") {
      writer.uint32(10).string(message.gamemode);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StartQueueRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStartQueueRequest();
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

  fromJSON(object: any): StartQueueRequest {
    return { gamemode: isSet(object.gamemode) ? String(object.gamemode) : "" };
  },

  toJSON(message: StartQueueRequest): unknown {
    const obj: any = {};
    message.gamemode !== undefined && (obj.gamemode = message.gamemode);
    return obj;
  },

  create<I extends Exact<DeepPartial<StartQueueRequest>, I>>(base?: I): StartQueueRequest {
    return StartQueueRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<StartQueueRequest>, I>>(object: I): StartQueueRequest {
    const message = createBaseStartQueueRequest();
    message.gamemode = object.gamemode ?? "";
    return message;
  },
};

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

function createBaseStatusResponse(): StatusResponse {
  return { status: 0, match: undefined };
}

export const StatusResponse = {
  encode(message: StatusResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.status !== 0) {
      writer.uint32(8).int32(message.status);
    }
    if (message.match !== undefined) {
      MatchDetails.encode(message.match, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StatusResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStatusResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.status = reader.int32() as any;
          break;
        case 2:
          message.match = MatchDetails.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): StatusResponse {
    return {
      status: isSet(object.status) ? statusResponse_StatusFromJSON(object.status) : 0,
      match: isSet(object.match) ? MatchDetails.fromJSON(object.match) : undefined,
    };
  },

  toJSON(message: StatusResponse): unknown {
    const obj: any = {};
    message.status !== undefined && (obj.status = statusResponse_StatusToJSON(message.status));
    message.match !== undefined && (obj.match = message.match ? MatchDetails.toJSON(message.match) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<StatusResponse>, I>>(base?: I): StatusResponse {
    return StatusResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<StatusResponse>, I>>(object: I): StatusResponse {
    const message = createBaseStatusResponse();
    message.status = object.status ?? 0;
    message.match = (object.match !== undefined && object.match !== null)
      ? MatchDetails.fromPartial(object.match)
      : undefined;
    return message;
  },
};

export interface Matchmaker {
  /** GetStatus returns the current matchmaking status. */
  GetStatus(request: Empty): Promise<StatusResponse>;
  /** StartQueue starts searching for a match with the given parameters. */
  StartQueue(request: StartQueueRequest): Promise<Empty>;
  /** StopQueue stops searching for a match. Idempotent. */
  StopQueue(request: Empty): Promise<Empty>;
}

export class MatchmakerClientImpl implements Matchmaker {
  private readonly rpc: Rpc;
  private readonly service: string;
  constructor(rpc: Rpc, opts?: { service?: string }) {
    this.service = opts?.service || "quip.matchmaker.Matchmaker";
    this.rpc = rpc;
    this.GetStatus = this.GetStatus.bind(this);
    this.StartQueue = this.StartQueue.bind(this);
    this.StopQueue = this.StopQueue.bind(this);
  }
  GetStatus(request: Empty): Promise<StatusResponse> {
    const data = Empty.encode(request).finish();
    const promise = this.rpc.request(this.service, "GetStatus", data);
    return promise.then((data) => StatusResponse.decode(new _m0.Reader(data)));
  }

  StartQueue(request: StartQueueRequest): Promise<Empty> {
    const data = StartQueueRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "StartQueue", data);
    return promise.then((data) => Empty.decode(new _m0.Reader(data)));
  }

  StopQueue(request: Empty): Promise<Empty> {
    const data = Empty.encode(request).finish();
    const promise = this.rpc.request(this.service, "StopQueue", data);
    return promise.then((data) => Empty.decode(new _m0.Reader(data)));
  }
}

interface Rpc {
  request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
}

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
