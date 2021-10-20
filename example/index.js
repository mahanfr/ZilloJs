import {Application} from "../lib/Application.js"
import { urlPatterns } from "./routes.js";

const app = new Application();
app.setRoutes(urlPatterns);
app.start(8000);