import { render } from '../lib/views.js'

const indexContext = {
    "title":"zillojs",
    "user":{
        "name":"ali",
        "age":20
    }
}


function indexView(request){
    return render(request, 'usage/template/index.html',indexContext)
    // return response(request, json, code)
}

export default indexView