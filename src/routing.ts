
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

function getPramRoutesMatch(url:string,route:string): {[key:string]:string; } | undefined {
  const regex = parseToRegex(route);
  const match = url.match(new RegExp(regex));
  return match?.groups
}

function isRouteMatch(url:string, route:string): boolean {
  url = url.split('?')[0]
  if (url.endsWith('/'))
    url = url.slice(0,url.length - 1)
  if (route.endsWith('/'))
    route = route.slice(0,route.length - 1)
  return (url === route)
}

function isPramRoutesMatch(url:string, route:string): boolean{
  const regex = new RegExp(parseToRegex(route));
  return regex.test(url)
}

// TEST 
if(isRouteMatch('/products/5/?id=2112','/products/$id/'))
  console.log("match")
if(isPramRoutesMatch('/products/4/2112/','/products/$id/')){
  console.log("match")
  console.log(getPramRoutesMatch('/products/4/2112/','/products/$id/'))
}
export {parseToRegex , isRouteMatch};