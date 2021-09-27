/**
 * Add all your app routes here
 * url, (method : GET, POST, PUT, UPDATE, DELETE), and View
 *  
*/
import { Routes, Method } from '../lib/routing.js';
export const routes = Routes.getInstance()


// index Route
routes.addRoute('/', Method.GET,()=>{console.log("ran....")})
routes.addRoute('/hello', Method.GET,()=>{console.log("ran....")})

