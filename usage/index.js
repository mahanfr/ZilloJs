import {Application} from "../lib/Application.js"
import { routes } from "./routes.js"

const app = new Application();
app.setRoutes(routes);
app.start(8000);