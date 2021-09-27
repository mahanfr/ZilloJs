enum Method {
  GET,
  POST,
  UPDATE,
  DELETE,
}

class Route {
  method : Method;
  helper : string;
  url : string;
  view : Function;

  constructor(url: string, method: Method, view:Function, helper: string = 'text/html') {
    this.url = url;
    this.method = method;
    this.helper = helper;
    this.view = view;
  }
}

const Routes = (function (){
  function Routes() {
    //do stuff
  }
  var instance: _Routes;
  return {
    getInstance: function () {
      if (instance == null) {
        instance = new _Routes();
        // Hide the constructor so the returned object can't be new'd...
      }
      return instance;
    },
  };
})();

export class _Routes {
  routes: { [key: string]: Route };

  constructor() {
    this.routes = {};
  }

  public addRoute(url: string, method: Method, view:Function, helper?: string) {
    let route = new Route(url, method, view, helper);
    this.routes[url] = route;
  }

  public parseQuery(url: string) {
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

  public parseToRegex(url: string): string {
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

  public getPramRouteValues(
    url: string,
    route: string,
  ): { [key: string]: string } | undefined {
    const regex = this.parseToRegex(route);
    const match = url.match(new RegExp(regex));
    return match?.groups;
  }

  public isRouteMatchsUrl(url: string, route: string): boolean {
    url = url.split('?')[0];
    const regex = new RegExp(this.parseToRegex(route));
    return regex.test(url);
  }
}

export { Routes, Route, Method };
