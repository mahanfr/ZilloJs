# Documentation - Getting Started
This project currently is in **beta** state and it is **NOT STABLE FOR PRODUCTION** but you can still use in development and for small html projects that want to make advantage of it's template engine

## Requirements
This project is using **ES6** javaScript imports so you need **node js** 14 or higher to run this project without any errors
- **Node js** > v14.18.0
- **npm** > 8.0.0 

## Installation
As of beta version you need to set up your ```package.json``` in a way that makes you use ```.js``` file imports in your project. create a folder inside your directory and initialize npm:
``` bash
mkdir myProject
cd ./myProject
npm init -y
```
after running this commands npm adds a ```package.json``` file inside your project directory. add this line a the bottom of the file before closing cully bracket
``` json
"type":"module"
```

For downloading and installing zillo.js you have to use npm by writing the command bellow inside your favorite command line:

``` bash
npm i zillojs
```
now you can use zillojs library!
</br>

***
[Next - creating the application](./index.md)