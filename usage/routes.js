/**
 * Add all your app routes here
 * url, (method : GET, POST, PUT, UPDATE, DELETE), and View
 *  
*/
import { Routes, Method } from '../lib/routing.js';
import indexView from './views.js'
export const routes = Routes.getInstance()


// index Route
routes.addRoute('/', Method.GET, indexView)
routes.addRoute('/hello', Method.GET,()=>{console.log("ran....")})

