var http = require('http');
var fs = require('fs')
var server_port = 1337

var httpServer = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  console.log(`${request.method} from ${request.url}`)
  fs.readFile('./index.html', null, function (error, data) {
    if (error) {
      response.writeHead(404);
      response.write('Whoops! File not found!');
    } else {
      response.write(data);
    }
    response.end();
  });
}
http.createServer(httpServer).listen(server_port, "127.0.0.1");
console.log(`Server running at http://127.0.0.1:${server_port}/`);