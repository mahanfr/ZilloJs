import fs from 'fs'

interface IResponseHelper{
    statusCode : number,
    contentType : string,
    body: string,
    head?: any
}


// Write a render function to higher the framework level
function render(request:any, template:string, context?:JSON) : IResponseHelper{
    /**
     ** Needs to return the response **
     * response.writeHead(200, { 'Content-Type': 'text/html' });
     * response.write('<h1>hello World</h1>');
     * response.end();
    */

    let responseHelper: IResponseHelper = {
        statusCode : 200,
        contentType : 'text/html',
        body: 'hello world',
    }
    
    try{
        const data = fs.readFileSync(template)
        responseHelper.statusCode = 200
        responseHelper.body = data.toString()
    }catch(e){
        console.log(e);
        responseHelper.statusCode = 404
        console.log(responseHelper.statusCode)
        responseHelper.body = '404 Error'
    }

    return responseHelper 
}

export { render };