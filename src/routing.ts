
export interface IRoute {
  urlPattern: RegExp;
  view: Function;
  name?: string;
  helper?: string;
}

export function path(
  urlPattern: string,
  view: Function,
  name?: string,
  helper?: string,
): IRoute {
  return ({
    urlPattern: parseHumanReadableExceptedPatternToRegex(urlPattern),
    view: view,
    name: name,
    helper: helper,
  });
}

// TODO: make list into a hash map
export function checkForRoute(url:string,list:IRoute[]) : IRoute|null{
  for(let i in list){
    const route = list[i] 
    if(isRouteMatchesUrl(route.urlPattern,url)){
      return route
    }
  }
  return null
}

export function parseQuery(url: string) {
  const results = url.match(/\?(?<query>.*)/);
  if (!results) {
    return {};
  }
  const {
    groups: { query },
  }: any = results;

  const pairs = query.match(/(?<param>\w+)=(?<value>\w+)/g);
  if (pairs === null) {
    return {};
  }
  const params = pairs.reduce((acc: any, curr: any) => {
    const [key, value] = curr.split('=');
    acc[key] = value;
    return acc;
  }, {});
  return params;
}

function parseHumanReadableExceptedPatternToRegex(exceptedPattern: string): RegExp {
  let str: string = '';
  for (var i = 0; i < exceptedPattern.length; i++) {
    const c = exceptedPattern.charAt(i);
    if (c === '$') {
      // eat all characters
      let param: string = '';
      for (var j = i + 1; j < exceptedPattern.length; j++) {
        if (/\w/.test(exceptedPattern.charAt(j))) {
          param += exceptedPattern.charAt(j);
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
  return new RegExp(str);
}

export function getPramRouteValues(
  url: string,
  route: RegExp,
): { [key: string]: string } | undefined {
  const regex = route;
  const match = url.match(new RegExp(regex));
  return match?.groups;
}

function isRouteMatchesUrl(route: RegExp, url: string): boolean {
  url = url.split('?')[0];
  var match = url.match(route)
  return match && url === match[0]? true : false;
}
