var assert = require('assert'),
    BytesHelper = require('../../lib/mysql/bytes_helper'),
    LengthCodedBinary = require('../../lib/mysql/length_coded_binary');

describe("LengthCodedBinary", function() {
  describe("serialization", function() {
    it("serializes correctly when value = null", function() {
      var lcb = new LengthCodedBinary(null);

      // 251
      assert.equal("\xFB", lcb.toBytes());
    });

    it("serializes correctly when value is between 0-250", function() {
      var lcb = new LengthCodedBinary(0);
      assert.equal("\x00", lcb.toBytes());

      lcb = new LengthCodedBinary(100);
      assert.equal("\x64", lcb.toBytes());

      lcb = new LengthCodedBinary(250);
      assert.equal("\xFA", lcb.toBytes());
    });

    it("serializes correctly when value is represented as 2 bytes", function() {
      var lcb = new LengthCodedBinary(65534);

      // 252 followed by a 16-bit word
      assert.equal("\xFC\xFE\xFF", lcb.toBytes());
    });

    it("serializes correctly when value is represented as 3 bytes", function() {
      var lcb = new LengthCodedBinary(16777214);

      // 253 followed by a 24-bit word
      assert.equal("\xFD\xFE\xFF\xFF", lcb.toBytes());
    });

    it("serializes correctly when value is represented as 8 bytes", function() {
      var lcb = new LengthCodedBinary(4294967294);

      // 254 followed by a 24-bit word
      assert.equal("\xFE\x00\x00\x00\x00\xFE\xFF\xFF\xFF", lcb.toBytes());
    });
  });

  describe("deserialization", function() {
    it("deserializes correctly when value = null", function() {
      var lcb = LengthCodedBinary.parse("\xFB");

      assert.equal(null, lcb.getValue());
    });

    it("serializes correctly when value is between 0-250", function() {
      var lcb = LengthCodedBinary.parse("\x00");
      assert.equal(0, lcb.getValue());

      lcb = LengthCodedBinary.parse("\x64");
      assert.equal(100, lcb.getValue());

      lcb = LengthCodedBinary.parse("\xFA");
      assert.equal(250, lcb.getValue());
    });

    it("serializes correctly when value is represented as 2 bytes", function() {
      var lcb = LengthCodedBinary.parse("\xFC\xFE\xFF");

      assert.equal(65534, lcb.getValue());
    });

    it("serializes correctly when value is represented as 3 bytes", function() {
      var lcb = LengthCodedBinary.parse("\xFD\xFE\xFF\xFF");

      // 253 followed by a 24-bit word
      assert.equal(16777214, lcb.getValue());
    });

    it("serializes correctly when value is represented as 8 bytes", function() {
      var lcb = LengthCodedBinary.parse("\xFE\x00\x00\x00\x00\xFF\xFE\xFD\x7C");

      assert.equal(2097020671, lcb.getValue());
    });

    it("does not allow overruns into negative terrority due to the javascript using 32-bit signed integers for bitwise operations", function() {
      var lcb = LengthCodedBinary.parse("\xFE\x00\x00\x00\x00\xFF\xFE\xFD\xFC");

      assert.equal(2097020671, lcb.getValue());
    });
  });
});
