
function parseToRegex(url) {
  let str = "";

  for (var i =0; i < url.length; i++) {
    const c = url.charAt(i);
    if (c === "$") {
      // eat all characters
      let param = "";
      for (var j = i + 1; j < url.length; j++) {
        if (/\w/.test(url.charAt(j))) {
          param += url.charAt(j);
        } else {
          break;
        }
      }
      str += `(?<${param}>\\w+)`;
      i = j - 1;
    } else {
      str += c;
    }
  }
  return str;
}

const regex = parseToRegex("/products/$id/$str");
const match = "/products/44/abc".match(new RegExp(regex));
console.log(match.groups)

module.export = parseToRegex;