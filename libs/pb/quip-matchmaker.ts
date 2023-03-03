/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { Empty } from "./google/protobuf/empty";
import { MatchDetails, Status, statusFromJSON, statusToJSON } from "./quip-messages";

export const protobufPackage = "quip";

export interface StartQueueRequest {
  gamemode: string;
}

export interface StatusResponse {
  status: Status;
  /** Details about the match the user is currently playing in. */
  match?: MatchDetails | undefined;
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
      status: isSet(object.status) ? statusFromJSON(object.status) : 0,
      match: isSet(object.match) ? MatchDetails.fromJSON(object.match) : undefined,
    };
  },

  toJSON(message: StatusResponse): unknown {
    const obj: any = {};
    message.status !== undefined && (obj.status = statusToJSON(message.status));
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
    this.service = opts?.service || "quip.Matchmaker";
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
