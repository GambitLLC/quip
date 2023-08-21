/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "quip.matchmaker";

export interface OMTicketExtension {
}

export interface OMProfileExtension {
}

export interface OMMatchExtension {
}

export interface AgonesAnnotation {
}

function createBaseOMTicketExtension(): OMTicketExtension {
  return {};
}

export const OMTicketExtension = {
  encode(_: OMTicketExtension, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): OMTicketExtension {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOMTicketExtension();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): OMTicketExtension {
    return {};
  },

  toJSON(_: OMTicketExtension): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<OMTicketExtension>, I>>(base?: I): OMTicketExtension {
    return OMTicketExtension.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<OMTicketExtension>, I>>(_: I): OMTicketExtension {
    const message = createBaseOMTicketExtension();
    return message;
  },
};

function createBaseOMProfileExtension(): OMProfileExtension {
  return {};
}

export const OMProfileExtension = {
  encode(_: OMProfileExtension, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): OMProfileExtension {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOMProfileExtension();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): OMProfileExtension {
    return {};
  },

  toJSON(_: OMProfileExtension): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<OMProfileExtension>, I>>(base?: I): OMProfileExtension {
    return OMProfileExtension.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<OMProfileExtension>, I>>(_: I): OMProfileExtension {
    const message = createBaseOMProfileExtension();
    return message;
  },
};

function createBaseOMMatchExtension(): OMMatchExtension {
  return {};
}

export const OMMatchExtension = {
  encode(_: OMMatchExtension, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): OMMatchExtension {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOMMatchExtension();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): OMMatchExtension {
    return {};
  },

  toJSON(_: OMMatchExtension): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<OMMatchExtension>, I>>(base?: I): OMMatchExtension {
    return OMMatchExtension.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<OMMatchExtension>, I>>(_: I): OMMatchExtension {
    const message = createBaseOMMatchExtension();
    return message;
  },
};

function createBaseAgonesAnnotation(): AgonesAnnotation {
  return {};
}

export const AgonesAnnotation = {
  encode(_: AgonesAnnotation, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AgonesAnnotation {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAgonesAnnotation();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): AgonesAnnotation {
    return {};
  },

  toJSON(_: AgonesAnnotation): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<AgonesAnnotation>, I>>(base?: I): AgonesAnnotation {
    return AgonesAnnotation.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<AgonesAnnotation>, I>>(_: I): AgonesAnnotation {
    const message = createBaseAgonesAnnotation();
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
