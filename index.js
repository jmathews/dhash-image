var assert = require("assert");
var sharp = require("sharp");

var DEFAULT_HASH_SIZE = 8;

sharp.cache(false);

module.exports = function (path, hashSize, rotation) {
  var height = hashSize || DEFAULT_HASH_SIZE;
  var width = height + 1;

  // Covert to small gray image
  var promise = sharp(path)
    .grayscale()
    .rotate(rotation)
    .resize(width, height, { fit: "fill" })
    .raw()
    .toBuffer()
    .then(function (pixels) {
      // Compare adjacent pixels.
      var difference = "";
      for (var row = 0; row < height; row++) {
        for (var col = 0; col < height; col++) {
          // height is not a mistake here...
          var left = px(pixels, width, col, row);
          var right = px(pixels, width, col + 1, row);
          difference += left < right ? 1 : 0;
        }
      }
      return binaryToHex(difference);
    });

  return promise;
};

// TODO: move to a separate module
function binaryToHex(s) {
  var output = "";
  for (var i = 0; i < s.length; i += 4) {
    var bytes = s.substr(i, 4);
    var decimal = parseInt(bytes, 2);
    var hex = decimal.toString(16);
    output += hex;
  }
  return new Buffer.from(output, "hex");
}

function px(pixels, width, x, y) {
  var pixel = width * y + x;
  // assert(pixel < pixels.length);
  return pixels[pixel];
}
