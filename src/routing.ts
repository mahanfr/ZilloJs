
const routeList : string[] = []

function parseToRegex(url:string):string {
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

function getPramRouteValues(url:string,route:string): {[key:string]:string; } | undefined {
  const regex = parseToRegex(route);
  const match = url.match(new RegExp(regex));
  return match?.groups
}

function isRouteMatchsUrl(url:string, route:string): boolean{
  url = url.split('?')[0]
  const regex = new RegExp(parseToRegex(route));
  return regex.test(url)
}

// TEST 
if(isRouteMatchsUrl('/products/hello/','/products/he1llo/')){
  console.log("match")
  //console.log(getPramRoutesMatch('/products/hello/','/products/hello/'))
}
export {parseToRegex, isRouteMatchsUrl, getPramRouteValues};