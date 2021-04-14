function nOccurrence(arr, elem_to_count) {
  n = 0;
  for (const item of arr) {
    if (item === elem_to_count) {
      n += 1;
    }
  }
  return n;
}

function makeID(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var characters_length = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * characters_length));
   }
   return result;
}

function getTimestamp() {
  return Number(new Date());
}

exports.nOccurrence = nOccurrence;
exports.makeID = makeID;
exports.getTimestamp = getTimestamp;
