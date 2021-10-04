import fs from 'fs'

interface IResponseHelper{
    statusCode : number,
    contentType : string,
    body: string,
    head?: any
}

/**
 * {# for boy in boys #}
 *  <h1>{{ boy.name }}</h1>
 * {# end-for #}
 * 
 * {# if(a === true) #}
 *  <h1>Text</h1>
 * {# end-if #}
*/

// 
// Render function to higher the framework level
// TODO: Add template Engine squirrellyJs
function render(request:any, template:string, context?:JSON) : IResponseHelper{

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