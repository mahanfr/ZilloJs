/**
 * Add all your app routes here
 * url, (method : GET, POST, PUT, UPDATE, DELETE), and View
 *  
*/
import { path } from '../lib/routing.js';
import indexView from './views.js'

export const urlPatterns = [
    path('/',indexView,"index"),
    path('/hello',()=>{console.log("Hello Route")},"index"),
    path('/user/$id',(request)=>{console.log(request.method)}),
    path('/a',()=>{console.log("Hello Route")},"index"),
]