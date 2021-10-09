import { parseHtml } from './templates/parser.js'
import fs from 'fs'

interface IResponseHelper{
    statusCode : number,
    contentType : string,
    body: string,
    head?: any
}

// Render function to higher the framework level
function render(request:any, template:string, context?:any) : IResponseHelper{

    let responseHelper: IResponseHelper = {
        statusCode : 200,
        contentType : 'text/html',
        body: 'hello world',
    }
    
    // TODO: Fix problems with same error for template and file
    try{
        
        const data = fs.readFileSync(template)
        if(context){
            context['request'] = request.method
        }
        const parseData = parseHtml(data.toString(),context)
        responseHelper.statusCode = 200
        responseHelper.body = parseData
    }catch(e){
        console.log(e);
        responseHelper.statusCode = 404
        console.log(responseHelper.statusCode)
        responseHelper.body = '404 Error'
    }

    return responseHelper 
}

export { render };