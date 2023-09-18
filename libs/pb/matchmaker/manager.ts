/* eslint-disable */
import {
  CallOptions,
  ChannelCredentials,
  Client,
  ClientOptions,
  ClientUnaryCall,
  handleUnaryCall,
  makeGenericClientConstructor,
  Metadata,
  ServiceError,
  UntypedServiceImplementation,
} from "@grpc/grpc-js";
import _m0 from "protobufjs/minimal";
import { Empty } from "../google/protobuf/empty";
import { MatchConfiguration, MatchResults, MatchRoster } from "./messages";

export const protobufPackage = "quip.matchmaker";

export interface CreateMatchRequest {
  matchId: string;
  config: MatchConfiguration | undefined;
  roster: MatchRoster | undefined;
}

export interface GetMatchRequest {
  matchId: string;
}

export interface GetMatchResponse {
  config: MatchConfiguration | undefined;
  roster: MatchRoster | undefined;
  results?: MatchResults | undefined;
}

export interface SetMatchResultsRequest {
  matchId: string;
  results: MatchResults | undefined;
}

function createBaseCreateMatchRequest(): CreateMatchRequest {
  return { matchId: "", config: undefined, roster: undefined };
}

export const CreateMatchRequest = {
  encode(message: CreateMatchRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.matchId !== "") {
      writer.uint32(10).string(message.matchId);
    }
    if (message.config !== undefined) {
      MatchConfiguration.encode(message.config, writer.uint32(18).fork()).ldelim();
    }
    if (message.roster !== undefined) {
      MatchRoster.encode(message.roster, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateMatchRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateMatchRequest();
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

          message.config = MatchConfiguration.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
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

  fromJSON(object: any): CreateMatchRequest {
    return {
      matchId: isSet(object.matchId) ? String(object.matchId) : "",
      config: isSet(object.config) ? MatchConfiguration.fromJSON(object.config) : undefined,
      roster: isSet(object.roster) ? MatchRoster.fromJSON(object.roster) : undefined,
    };
  },

  toJSON(message: CreateMatchRequest): unknown {
    const obj: any = {};
    if (message.matchId !== "") {
      obj.matchId = message.matchId;
    }
    if (message.config !== undefined) {
      obj.config = MatchConfiguration.toJSON(message.config);
    }
    if (message.roster !== undefined) {
      obj.roster = MatchRoster.toJSON(message.roster);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<CreateMatchRequest>, I>>(base?: I): CreateMatchRequest {
    return CreateMatchRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<CreateMatchRequest>, I>>(object: I): CreateMatchRequest {
    const message = createBaseCreateMatchRequest();
    message.matchId = object.matchId ?? "";
    message.config = (object.config !== undefined && object.config !== null)
      ? MatchConfiguration.fromPartial(object.config)
      : undefined;
    message.roster = (object.roster !== undefined && object.roster !== null)
      ? MatchRoster.fromPartial(object.roster)
      : undefined;
    return message;
  },
};

function createBaseGetMatchRequest(): GetMatchRequest {
  return { matchId: "" };
}

export const GetMatchRequest = {
  encode(message: GetMatchRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.matchId !== "") {
      writer.uint32(10).string(message.matchId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetMatchRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetMatchRequest();
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

  fromJSON(object: any): GetMatchRequest {
    return { matchId: isSet(object.matchId) ? String(object.matchId) : "" };
  },

  toJSON(message: GetMatchRequest): unknown {
    const obj: any = {};
    if (message.matchId !== "") {
      obj.matchId = message.matchId;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<GetMatchRequest>, I>>(base?: I): GetMatchRequest {
    return GetMatchRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<GetMatchRequest>, I>>(object: I): GetMatchRequest {
    const message = createBaseGetMatchRequest();
    message.matchId = object.matchId ?? "";
    return message;
  },
};

function createBaseGetMatchResponse(): GetMatchResponse {
  return { config: undefined, roster: undefined, results: undefined };
}

export const GetMatchResponse = {
  encode(message: GetMatchResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.config !== undefined) {
      MatchConfiguration.encode(message.config, writer.uint32(10).fork()).ldelim();
    }
    if (message.roster !== undefined) {
      MatchRoster.encode(message.roster, writer.uint32(18).fork()).ldelim();
    }
    if (message.results !== undefined) {
      MatchResults.encode(message.results, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetMatchResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetMatchResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.config = MatchConfiguration.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.roster = MatchRoster.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.results = MatchResults.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GetMatchResponse {
    return {
      config: isSet(object.config) ? MatchConfiguration.fromJSON(object.config) : undefined,
      roster: isSet(object.roster) ? MatchRoster.fromJSON(object.roster) : undefined,
      results: isSet(object.results) ? MatchResults.fromJSON(object.results) : undefined,
    };
  },

  toJSON(message: GetMatchResponse): unknown {
    const obj: any = {};
    if (message.config !== undefined) {
      obj.config = MatchConfiguration.toJSON(message.config);
    }
    if (message.roster !== undefined) {
      obj.roster = MatchRoster.toJSON(message.roster);
    }
    if (message.results !== undefined) {
      obj.results = MatchResults.toJSON(message.results);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<GetMatchResponse>, I>>(base?: I): GetMatchResponse {
    return GetMatchResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<GetMatchResponse>, I>>(object: I): GetMatchResponse {
    const message = createBaseGetMatchResponse();
    message.config = (object.config !== undefined && object.config !== null)
      ? MatchConfiguration.fromPartial(object.config)
      : undefined;
    message.roster = (object.roster !== undefined && object.roster !== null)
      ? MatchRoster.fromPartial(object.roster)
      : undefined;
    message.results = (object.results !== undefined && object.results !== null)
      ? MatchResults.fromPartial(object.results)
      : undefined;
    return message;
  },
};

function createBaseSetMatchResultsRequest(): SetMatchResultsRequest {
  return { matchId: "", results: undefined };
}

export const SetMatchResultsRequest = {
  encode(message: SetMatchResultsRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.matchId !== "") {
      writer.uint32(10).string(message.matchId);
    }
    if (message.results !== undefined) {
      MatchResults.encode(message.results, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SetMatchResultsRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSetMatchResultsRequest();
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

          message.results = MatchResults.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SetMatchResultsRequest {
    return {
      matchId: isSet(object.matchId) ? String(object.matchId) : "",
      results: isSet(object.results) ? MatchResults.fromJSON(object.results) : undefined,
    };
  },

  toJSON(message: SetMatchResultsRequest): unknown {
    const obj: any = {};
    if (message.matchId !== "") {
      obj.matchId = message.matchId;
    }
    if (message.results !== undefined) {
      obj.results = MatchResults.toJSON(message.results);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<SetMatchResultsRequest>, I>>(base?: I): SetMatchResultsRequest {
    return SetMatchResultsRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<SetMatchResultsRequest>, I>>(object: I): SetMatchResultsRequest {
    const message = createBaseSetMatchResultsRequest();
    message.matchId = object.matchId ?? "";
    message.results = (object.results !== undefined && object.results !== null)
      ? MatchResults.fromPartial(object.results)
      : undefined;
    return message;
  },
};

/**
 * Manager service to keep track of match details (in-progress and completed).
 * Should only be used by Director or some subscriber who is listening to
 * messages for when matches begin and finish.
 */
export type QuipManagerService = typeof QuipManagerService;
export const QuipManagerService = {
  createMatch: {
    path: "/quip.matchmaker.QuipManager/CreateMatch",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: CreateMatchRequest) => Buffer.from(CreateMatchRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => CreateMatchRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  getMatch: {
    path: "/quip.matchmaker.QuipManager/GetMatch",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: GetMatchRequest) => Buffer.from(GetMatchRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => GetMatchRequest.decode(value),
    responseSerialize: (value: GetMatchResponse) => Buffer.from(GetMatchResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => GetMatchResponse.decode(value),
  },
  setMatchResults: {
    path: "/quip.matchmaker.QuipManager/SetMatchResults",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: SetMatchResultsRequest) => Buffer.from(SetMatchResultsRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => SetMatchResultsRequest.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
} as const;

export interface QuipManagerServer extends UntypedServiceImplementation {
  createMatch: handleUnaryCall<CreateMatchRequest, Empty>;
  getMatch: handleUnaryCall<GetMatchRequest, GetMatchResponse>;
  setMatchResults: handleUnaryCall<SetMatchResultsRequest, Empty>;
}

export interface QuipManagerClient extends Client {
  createMatch(
    request: CreateMatchRequest,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall;
  createMatch(
    request: CreateMatchRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall;
  createMatch(
    request: CreateMatchRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall;
  getMatch(
    request: GetMatchRequest,
    callback: (error: ServiceError | null, response: GetMatchResponse) => void,
  ): ClientUnaryCall;
  getMatch(
    request: GetMatchRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: GetMatchResponse) => void,
  ): ClientUnaryCall;
  getMatch(
    request: GetMatchRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: GetMatchResponse) => void,
  ): ClientUnaryCall;
  setMatchResults(
    request: SetMatchResultsRequest,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall;
  setMatchResults(
    request: SetMatchResultsRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall;
  setMatchResults(
    request: SetMatchResultsRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Empty) => void,
  ): ClientUnaryCall;
}

export const QuipManagerClient = makeGenericClientConstructor(
  QuipManagerService,
  "quip.matchmaker.QuipManager",
) as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): QuipManagerClient;
  service: typeof QuipManagerService;
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
