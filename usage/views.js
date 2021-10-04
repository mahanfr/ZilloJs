import { render } from '../lib/views.js'


function indexView(request){
    return render(request, 'usage/template/index.html')
    // return response(request, json, code)
}

export default indexView