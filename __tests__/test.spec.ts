/*
 * +===============================================
 * | Author:        Parham Alvani (parham.alvani@gmail.com)
 * |
 * | Creation Date: 02-06-2017
 * |
 * | File Name:     test.js
 * +===============================================
 */
/* eslint-env mocha */

import * as assert from "assert";

import { Session } from "../lib/Session";
import { UDP4TestSocketFactory } from "./test-socket-factory";

describe("RTPSession", () => {
  test("packet send-recieve serialize-deserialize", done => {
    const s = new Session(1373, new UDP4TestSocketFactory());
    s.on("message", msg => {
      assert.equal(s.sequenceNumber, msg.sequenceNumber + 1);
      assert.equal(s.ssrc, msg.ssrc);
      assert.equal("Hello world", msg.payload.toString());
      s.close();
      done();
    });
    s.send(Buffer.from("Hello world")).catch(err => {
      done(err);
    });
  });
});
