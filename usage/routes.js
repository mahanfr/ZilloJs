/**
 * Add all your app routes here
 * url, (method : GET, POST, PUT, UPDATE, DELETE), and View
 *  
*/
import { Routes, Method } from '../lib/routing.js';
export let routes = Routes.getInstance()


// index Route
routes.addRoute('/', Method.GET)
routes.addRoute('/hello', Method.GET)

