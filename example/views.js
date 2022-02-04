import { render, response } from '../lib/views.js'

const indexContext = {
    "title":"zillojs",
    "user":{
        "name":"ali",
        "age":20
    },
    "items":['foo','bar','baz']
}


function indexView(request){
    console.log(request.body)
    return render(request, 'example/template/index.html',indexContext)
    // const json = {
    //     text:"hello World"
    // }
    // return response(request, json, 200)
}

export default indexView