import http from 'http';
import qs from 'querystring'
import { URLSearchParams } from 'url';
import { IRoute,checkForRoute, getPramRouteValues, parseQuery } from './routing.js';

interface IRequest{
  method:string,
  url:string,
  urlParameters: any,
  body:any,
  queries?:any,
  user:any,
}


class Application {
  app: Application;
  port: number;
  server: any;
  routes: IRoute[] = [];

  constructor() {
    this.app = this;
    this.port = 8000;
  }

  public readRequestBody(request: any) {
    return new Promise((resolve, reject) => {
      let body = '';
      request.on('data', (chunk: any) => {
        body += '' + chunk;
      });
      request.on('end', () => {
        resolve(body)
        //return parseQuery('?'+body);
      });
      request.on('error', (err: any) => {
        reject(err);
      });
    });
  }

  public setRoutes(routes: any): void {
    this.routes = routes;
  }

  public start(port: number, host = '127.0.0.1') {
    this.server = http.createServer(async (request: any, response: any) => {
      try{
        request.body = await this.readRequestBody(request);
        const route = checkForRoute(request.url,this.routes)
        if (route !== null) {
          const customRequest:IRequest = {
            method: request.method,
            url: request.url,
            urlParameters: getPramRouteValues(request.url,route.urlPattern),
            body: request.body,
            queries: parseQuery(request.url),
            user: undefined,
          }
          const responseHelper = route.view(customRequest);
          if(!responseHelper) throw new Error("");
          response.writeHead(responseHelper.statusCode, {
            'Content-Type': responseHelper.contentType,
          });
          response.write(responseHelper.body);
          response.end();
        } else {
          response.writeHead(404, { 'Content-Type': 'text/plane' });
          response.write('404 not found');
          response.end();
        }
      }catch{
        response.writeHead(402, { 'Content-Type': 'text/plane' });
        response.write('Bad request');
        response.end();
      }
      console.log(
        `${request.method} from ${request.url} ${response.statusCode}`,
      );
    });
    this.server.listen(port, host);
    console.log(`Server running at http://127.0.0.1:${port}/`);
  }

  public stop() {
    this.server.close();
  }
}

export { Application };
