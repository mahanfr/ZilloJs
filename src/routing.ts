
function parseToRegex(url:string) {
  let str:string = "";

  for (var i =0; i < url.length; i++) {
    const c = url.charAt(i);
    if (c === "$") {
      // eat all characters
      let param:string = "";
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

function getPramRoutesMatch(url:string,route:string): {[key:string]:string; } | undefined {
  const regex = parseToRegex(route);
  const match = url.match(new RegExp(regex));
  return match?.groups
}

function isRouteMatch(url:string, route:string): boolean {
  return (url === route)
}

if(isRouteMatch('/products/id/','/products/id/'))
  console.log("match")

export {parseToRegex , isRouteMatch};