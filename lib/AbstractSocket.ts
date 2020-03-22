import { EventEmitter } from "events";
import StrictEventEmitter from "strict-event-emitter-types";

export interface AbstractSocketFactory {
  createSocket(): AbstractSocket;
}

export interface AbstractSocketRemoteInfo {
  address: string;
  family: string;
  port: number;
}

export interface AbstractSocketEvents {
  message: (msg: Buffer, remoteInfo: AbstractSocketRemoteInfo) => void;
}

export type AbstractSocketEventEmitter = StrictEventEmitter<
  EventEmitter,
  AbstractSocketEvents
>;

type AbstractSocketSendCallback = (err: Error | null, bytes: number) => void;

export interface AbstractSocket extends AbstractSocketEventEmitter {
  bind(port: number): void;
  send(
    msg: Buffer | string | Uint8Array,
    port: number,
    address: string,
    cb: AbstractSocketSendCallback
  ): void;
  send(msg: Buffer | string | Uint8Array, cb: AbstractSocketSendCallback): void;
  close(): void;
}
