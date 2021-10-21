# Documentation - Create an Application
for using library you need to create a new application that holds initial data to start the server and add routes, settings and ext.

Create a new file called ```index.js``` and add the following codes inside it:
``` javascript
import { Application } from "zillojs/lib/Application.js"
import { urlPatterns } from "./routes.js";

const app = new Application();
app.setRoutes(urlPatterns);
app.start(8000);
```
The first line imports application class from zillojs library; now we can use the class by calling ```Application```

***you need to create a single application instance for the whole app. so you need to use const and only reference the app const if needed.***

call start method on app class to listen on a port of your choice:
``` javascript
app.start(3000)
```
you are all set but running this file will result in an error. you need to set up ```routing``` and ```views``` to continue

***
[Next - Routing](./routes.md)

[Previous - Getting Started](./gettingStarted.md)