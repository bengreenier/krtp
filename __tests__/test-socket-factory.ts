import { EventEmitter } from "events";
import { AddressInfo } from "net";
import { Socket as UDPSocket, createSocket as createUDPSocket } from "dgram";
import {
  AbstractSocketFactory,
  AbstractSocket,
  AbstractSocketEventEmitter,
  AbstractSocketRemoteInfo
} from "../lib/AbstractSocket";

export class TestSocket
  extends (EventEmitter as { new (): AbstractSocketEventEmitter })
  implements AbstractSocket {
  constructor(private udpSocket: UDPSocket) {
    super();

    // don't forget this!
    this.udpSocket.on("message", (msg: Buffer, rinfo: AddressInfo) => {
      this.emit("message", msg, rinfo as AbstractSocketRemoteInfo);
    });
  }

  bind(port: number): void {
    this.udpSocket.bind(port);
  }
  send(
    msg: string | Buffer | Uint8Array,
    port: number,
    address: string,
    cb: (err: Error | null, bytes: number) => void
  ): void;
  send(
    msg: string | Buffer | Uint8Array,
    cb: (err: Error | null, bytes: number) => void
  ): void;
  send(msg: any, port: any, address?: any, cb?: any) {
    this.udpSocket.send(msg, port, address, cb);
  }
  close(): void {
    this.udpSocket.close();
  }
}

export class UDP4TestSocketFactory implements AbstractSocketFactory {
  createSocket(): AbstractSocket {
    return new TestSocket(createUDPSocket("udp4"));
  }
}
