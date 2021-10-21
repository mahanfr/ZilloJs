# Documentation - Templates

Templates are used to bring logic inside html files. because in most frameworks html files need to read from file and then get send to response, a template engine can search this files for special characters and phrases and replace them.

Zillojs has it's own template engine that can do following tasks:

## Variables
variables are used to get dynamically replaced using context that passed to render function inside view
### Syntax
``` html
{{ variableName }}
```
### example
when this is passed to view as context:
``` javascript
const context = {
    "hello" : "Hello World"
}
```
you can add this line to your template
``` html
<h1>{{ hello }}</h1>
```
and this will create the html code bellow after getting parsed by template engine:
``` html
<h1>Hello World</h1>
```
if you pass an object as a variable you can only reference it using ```.``` like ```user.name```

## If Statements
If statements give you the ability to add login inside your html templates
### Syntax
``` html
{% if true %} <!-- true/false/null -->
<p>You should see this text</p>
{% endif %}

{% if user.age < 20 %} <!-- <==> / === / !== -->
<p>You should see this text</p>
{% endif %}
```
### example
``` html
<p>You can see this every time</p>
{% if true %}
<p>You should see this if true</p>
{% endif %}
{% if false %}
<p>You should see this if true</p>
{% endif %}
```
and this code will generate the html text bellow:
``` html
<p>You can see this every time</p>
<p>You should see this if true</p>
```

## Loops
Some times you might need a loop to show a part of your html file multiple times. This might be good for mocking or testing looks of your project without writing the same thing over and over again.

### Syntax
``` html 
{% loop <Cycles> %}
{% endloop %}
```

### example
if you use loop in your template like the code bellow:
``` html
<p>You see this one time</p>
{% loop 3 %}
<p>You see this 3 times</p>
{% endloop %}
```
will generate this:
``` html 
<p>You see this one time</p>
<p>You see this 3 times</p>
<p>You see this 3 times</p>
<p>You see this 3 times</p>
```

## For Loops
For loops let you create a loop but it also allows you to iterate in a list of contents

### Syntax
``` html
{% for a in b %}
{% endfor %}
```
### example
if you imagine ``` ['foo','bar','baz'] ``` was given to context you can write:
``` html 
<p>You see this one time</p>
{% for name in list %}
<p>my name is {{name}}</p>
{% endfor %}
```
this will generate this:
``` html 
<p>You see this one time</p>
<p>my name is foo</p>
<p>my name is bar</p>
<p>my name is baz</p>
```
you can also use ``` user.name ``` for objects

## Blocks and extends
Zillojs templates have the ability to extend from another template. you can just add the extends tag at the top of the file with the location and then each block tag that has the same name as the extended file gets replaced

### Syntax
``` html
{% extends "file location" %}
{% block <name> %}
{% endblock %}
```

### example
inside your template, if you add the lines before when there is another template file in the same directory named ```base.html``` 
``` html
{% extends "./base.html" %}
{% block body %}
<p>this is in original template file</p>
{% endblock %}
```
and if this is the content of the base file:
``` html
<p>This is in base file</p>
{% block body %}{% endblock %}
```
the output will be something like this:
``` html
<p>This is in base file</p>
<p>this is in original template file</p>
```

## Comments
you can add comments to your template. and they will not show up at the end

### Syntax
``` html
{! this is comment !}
```

****
[Previous - views](./views.md)