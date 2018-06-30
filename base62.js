const CHARSET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

exports.encode = function encode(int) {
  if (int === 0) {
    return CHARSET[0]
  }

  let str = ""
  while (int > 0) {
    str = CHARSET[int % 62] + str
    int = Math.floor(int / 62)
  }
  return str
}

exports.decode = function decode(str) {
  let int = 0

  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i)

    if (code < 58) { // 0-9
      code = code - 48
    } else if (code < 91) { // A-Z
      code = code - 29
    } else { // a-z
      code = code - 87
    }

    int += code * Math.pow(62, str.length - i - 1)
  }
  return int
}
