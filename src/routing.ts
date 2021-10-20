
export interface IRoute {
  urlPattern: string;
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
    urlPattern: parseToRegex(urlPattern),
    view: view,
    name: name,
    helper: helper,
  });
}

// TODO: make list into a hash map
export function checkForRoute(url:string,list:IRoute[]) : IRoute|null{
  for(let i in list){
    const route = list[i] 
    if(route.urlPattern === url){
      return route
    }
  }
  return null
}

function parseQuery(url: string) {
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

function parseToRegex(url: string): string {
  let str: string = '';

  for (var i = 0; i < url.length; i++) {
    const c = url.charAt(i);
    if (c === '$') {
      // eat all characters
      let param: string = '';
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

function getPramRouteValues(
  url: string,
  route: string,
): { [key: string]: string } | undefined {
  const regex = parseToRegex(route);
  const match = url.match(new RegExp(regex));
  return match?.groups;
}

function isRouteMatchesUrl(url: string, route: string): boolean {
  url = url.split('?')[0];
  const regex = new RegExp(parseToRegex(route));
  return regex.test(url);
}
