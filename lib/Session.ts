/*
 * +===============================================
 * | Author:        Parham Alvani (parham.alvani@gmail.com)
 * | Modified by:   Ben Greenier (ben@bengreenier.com)
 * |
 * | Creation Date: 01-06-2017
 * |
 * | File Name:     session.ts
 * +===============================================
 */
import { randomBytes } from "crypto";
import { EventEmitter } from "events";
import StrictEventEmitter from "strict-event-emitter-types";

import { Packet } from "./Packet";
import { ControlSR } from "./Control";
import {
  AbstractSocketFactory,
  AbstractSocket,
  AbstractSocketRemoteInfo
} from "./AbstractSocket";

interface SessionEvents {
  message: (pkt: Packet, remoteInfo: AbstractSocketRemoteInfo) => void;
}

type SessionEventEmitter = StrictEventEmitter<EventEmitter, SessionEvents>;

/**
 * RTP session: An association among a set of participants
 * communicating with RTP.
 */
export class Session extends (EventEmitter as {
  new (): SessionEventEmitter;
}) {
  /*
   * The SSRC field identifies
   * the synchronization source
   */
  public readonly ssrc: number;

  public get sequenceNumber(): number {
    return this._sequenceNumber;
  }

  public get packetCount(): number {
    return this._packetCount;
  }

  public get octetCount(): number {
    return this._octetCount;
  }

  private timestamp: number;

  /*
   * The sequence number increments by one for each
   * RTP data packet sent, and may be used by the receiver to detect
   * packet loss and to restore packet sequence.
   */
  private _sequenceNumber: number;

  // The total number of RTP data packets
  private _packetCount: number;

  // The total number of payload octets
  private _octetCount: number;

  // socket for session's data communication
  private socket: AbstractSocket;

  // socket for session's control communication
  private controlSocket: AbstractSocket;

  /**
   * Creates a RTP session
   * @param port - RTP port
   * @param packetType - RTP packet type: This field identifies the format of the RTP
   * payload and determines its interpretation by the application.
   */
  constructor(
    private port: number,
    socketFactory: AbstractSocketFactory,
    private packetType: number = 95
  ) {
    super();

    this.timestamp = (Date.now() / 1000) | 0;

    this._sequenceNumber = randomBytes(2).readUInt16BE(0);

    this.ssrc = randomBytes(4).readUInt32BE(0);

    this._packetCount = 0;

    this._octetCount = 0;

    this.socket = socketFactory.createSocket();

    this.socket.on(
      "message",
      (msg: Buffer, rinfo: AbstractSocketRemoteInfo) => {
        this.emit("message", Packet.deserialize(msg), rinfo);
      }
    );
    this.socket.bind(this.port);

    this.controlSocket = socketFactory.createSocket();
    this.controlSocket.bind(this.port + 1);
  }

  public async sendSR(
    address: string = "127.0.0.1",
    timestamp: number = ((Date.now() / 1000) | 0) - this.timestamp
  ): Promise<void> {
    const packet = new ControlSR(
      this._packetCount,
      this._octetCount,
      this.ssrc,
      timestamp
    );

    return new Promise<void>((resolve, reject) => {
      this.controlSocket.send(
        packet.serialize(),
        this.port + 1,
        address,
        err => {
          if (err) {
            return reject(err);
          }
          return resolve();
        }
      );
    });
  }

  public async send(
    payload: Buffer,
    address: string = "127.0.0.1",
    timestamp: number = ((Date.now() / 1000) | 0) - this.timestamp
  ): Promise<void> {
    const packet = new Packet(
      payload,
      this._sequenceNumber,
      this.ssrc,
      timestamp,
      this.packetType
    );
    this._sequenceNumber = (this._sequenceNumber + 1) % (1 << 16);
    this._packetCount += 1;
    this._octetCount += payload.length;

    return new Promise<void>((resolve, reject) => {
      this.socket.send(packet.serialize(), this.port, address, err => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  }

  public close(): void {
    this.socket.close();
    this.controlSocket.close();
  }
}
