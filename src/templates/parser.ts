// Template Sintax
/**
 * DATA
 * 
 * dinamic Variables
 * {{user.id}} 
 * 
 * filter
 * {{wallet.amount|toDollar}}
 * 
 * LOGIC
 *  
 * comment
 * {%! comment %} 
 * 
 * extend
 * {% extends base %} 
 * 
 * blocks
 * {% block base %}{% endblock %}
 * 
 * if statment
 * {% if user.lenght == 1 %}{% endif %}
 * 
 * for loops
 * {% for user in users %}{% endfor %}
 * 
 * while loops
 * {% loop 100 %}{% endloop %}
 */

const html = 
`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css" rel="stylesheet"/>
    <title>{{ Index }}</title>
  </head>
  <body>
    <nav class="navbar navbar-light bg-light">
      <div class="container-fluid">
        <a class="navbar-brand" href="#"> ZilloJs </a>
      </div>
    </nav>
    {% for(let a in b) %}
    <h1>Hello World</h1>
    {% end_for %}
    {! hello !}
    <script
      src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/js/bootstrap.bundle.min.js"
      integrity="sha384-/bQdsTh/da6pkI1MST/rWKFNjaCP5gBSY4sEBT38Q/9RBh9AH40zEOg7Hlq2THRZ"
      crossorigin="anonymous"
    ></script>
  </body>
</html>
`

console.time('p')
let tokenList : string[] = []
let exprestionStack : string[] = []
let line : number = 0
let col : number = 0
let isBufferActive : Boolean = false
let exprestionBuffer: string = ''
for(let i=0;i<html.length;i++){
    col++
    html
    if(html[i]==='{'){
        const val = exprestionStack.pop()
        if(!val){
            exprestionStack.push('{')
            isBufferActive = false
        }else{
            if(val === '{'){
                exprestionStack.push('{{')
                isBufferActive = true
            }
        }
        continue
    }
    if(html[i]==='%'){
        const val = exprestionStack.pop()
        if(!val){
            isBufferActive = false
            continue
        }
        if(val === '{'){
            exprestionStack.push('{%')
            isBufferActive = true
        }else if(val === '{%'){
            exprestionStack.push('{%%')
            isBufferActive = false 
        }
        continue
    }
    if(html[i] === '!'){
        const val = exprestionStack.pop()
        if(!val){
            isBufferActive = false
            continue
        }
        if(val === '{'){
            exprestionStack.push('{!')
            isBufferActive = true
        }else if(val == '{!'){
            exprestionStack.push('{!!')
            isBufferActive = false
        }
        continue
    }
    // TODO: Validate and push to stack
    if(html[i] === '}'){
        const val = exprestionStack.pop()
        if(!val){
            isBufferActive = false
            continue
        }
        if(val === '{{'){
            exprestionStack.push('{{}')      
            isBufferActive = false
        }else if(val == '{%%'){
            console.log('{%'+exprestionBuffer+'%}')
            isBufferActive = false
            exprestionBuffer = ''
        }else if(val == '{{}'){
            console.log('{{'+exprestionBuffer+'}}')
            isBufferActive = false
            exprestionBuffer = ''
        }else if(val == '{!!'){
            console.log('{!'+exprestionBuffer+'!}')
            isBufferActive = false
            exprestionBuffer = ''
        }
        continue
    }
    if(html[i]==='\n'){
        line++
        col = 0
        continue
    }
    if(isBufferActive){
        exprestionBuffer = exprestionBuffer + html[i]
    }
    // console.log(html[i]+" line:"+line +" col:"+col)
}
console.timeEnd('p')