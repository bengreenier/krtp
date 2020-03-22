# KRTP

RealTime Protocol implementation based on [RFC 3550](https://tools.ietf.org/html/rfc3550) for JS. It supports RTP and the SR message of RTCP. Custom sockets supported.

## Introduction

Modified from [1995parham/krtp](https://github.com/1995parham/krtp) to remove the dependency on rxjs, and support custom socket implementations.

## Example

> See [`test-socket-factory`](./__tests__/test-socket-factory.ts) for an example socket implementation.

```
import { EventEmitter } from "events";
import { AddressInfo } from "net";
import { Socket as UDPSocket, createSocket as createUDPSocket } from "dgram";
import {
  AbstractSocketFactory,
  AbstractSocket,
  AbstractSocketEventEmitter,
  AbstractSocketRemoteInfo,
  Session
} from "@bengreenier/krtp";

// Build a test socket implementation
export class UDP4Socket
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

// Build a test socket factory implementation
export class UDP4SocketFactory implements AbstractSocketFactory {
  createSocket(): AbstractSocket {
    return new TestSocket(createUDPSocket("udp4"));
  }
}

// Use them to create a session
const sess = new Session(1234, new UDP4SocketFactory(), 95);
s.on('message', (msg) => {
  console.log(msg)
  s.close()
})

s.sendSR('192.168.73.4').catch(err => {
  console.log(err)
})
s.send(Buffer.from('Hello world'))
```

Special thanks to [@1995parham](https://github.com/1995parham) - the creator of [the original krtp](https://github.com/1995parham/krtp) library that this work is derived from.

## FAQ

### Why is the example so long?

Because I didn't include a built-in socket implementation, because this library probably isn't for you, and is instead, tailored to the specific needs of a problem I had. Sorry!

### Can I contribute?

Sure - But this is firmly a side project, my time spent on maintaining it will be severly limited.

### LICENSE

GPL-3.0
