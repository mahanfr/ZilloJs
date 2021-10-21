# Documentation - Views

Views are the most important part of a web application. they will get the request and show a response based on the page and functionalities of your application.

To create a view you can create a file that holds all the views like ```views.js``` and import view ```render``` or ```response``` functions

``` javascript
import { render,response } from 'zillojs/lib/views.js'
```
```render``` function is used to create a **html** response using template and context

```response``` function is used to create a **json** response using the given object

you can now make a new function, this function will be passed to routes and needs to have a request as an argument
``` javascript 
function indexView(request){
    const indexContext = {
        "title":"zillojs",
        "user":{
            "name":"user",
            "age":20
        },
        "items":['foo','bar','baz']
    }
    return render(request, './template/index.html',indexContext)
}
```
context is a json variable that holds information we want to pass to template engine

***Make sure that you add request as an argument to view function and pass it to render or response function***

if uou want to create an api using your views you can return response
``` javascript 
function indexView(request){
    const json = {
        text:"hello World"
    }
    return response(request, json, 200)
}
```

now you can run the application by running:
``` bash
node index.js
```

***
[Next - Templates](./templates.md)

[Previous - Routes](./routes.md)