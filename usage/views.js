
function indexView(response,request){
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write('<h1>hello World</h1>');
    response.end();
}

export default indexView