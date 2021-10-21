# Documentation - Routing
Using Routing you can tell the application which urls are exactable and their requests needs to be processed. 
``` javascript
/**
 * Add all your app routes here
*/
import { path } from 'zillojs/lib/routing.js';
import { indexView, aboutView } from './views.js'

export const urlPatterns = [
    path('/',indexView,"index"),
    path('/about',aboutView,"about"),
]
```
path function will convert the urls into url patterns and create an object that includes ```name```, ```url``` and ```view```

## Url Patterns
you can make a url pattern for routes that have dynamic parts like *id* or *username*
``` javascript
path('/hello',view,name)                // Static
path('/user/$name',view,name)           // Dynamic name
path('/user/$id',view,name)             // Dynamic id
path('/book/$author/$year',view,name)   // Dynamic author and year
```
now you can add as many routes as you like but you still need ```views``` to get the request and render response

***
[Next - Views](./views.md)

[Previous - Getting Started](./application.md)