// Template Sintax
// VARIABLE Syntax => {{ user.name }} or {{ user.birthday | year }}
// Variables Regex => /{{[\s]*(?<variable>[\w_\.]+)[\s]*(\|)?[\s]*(?<filter>[\w_\.]*)[\s]*}}/

// FOR Syntax => {% for user in users %}
// FOR Regex => /{%[\s]*for[\s]+(?<item>[\w_\.]+)[\s]+in[\s]+(?<items>[\w_\.]+)[\s]*%}/
// END FOR Syntax => {% endfor %}
// End FOR Regex => /{%[\s]*endfor[\s]*%}/

// IF Syntax => {% if user %} or {% if user.age <==> 13 %}
// IF Regex => /{%[\s]*if[\s]+(?<condition>.+)[\s]*%}/
// END IF Syntax => {% endif %}
// END IF Regex => /{%[\s]*endif[\s]*%}/

// LOOP Syntax => {% loop 5 %}
// LOOP Regex => /{%[\s]*loop[\s]+(?<times>[0-9]+)[\s]*%}/
// END LOOP Syntax => {% endloop %}
// END LOOP Regex => /{%[\s]*endloop[\s]*%}/

// COMMENT Syntax => {! comment !}
// COMMENT Regex => /{\!.*\!}/

// BLOCK Syntax => {% block base %}
// BLOCK Regex => /{%[\s]*block[\s]+(?<block>[\w_]+)[\s]*%}/
// END BLOCK Syntax => {% endblock %}
// END LOOP Regex => /{%[\s]*endblock[\s]*%}/

// EXTEND Syntax => {% extends base %}
// BLOCK Regex => /{%[\s]*extends[\s]+(?<extend>[\w_]+)[\s]*%}/

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
    {% for a in b %}
        <h1> hello to peopele that name ali </h1>
        {% if a == 'ali' %}
            <h1>Hello World</h1>
        {% endif %}
    {% endfor %}
    {! hello !}
    <script
      src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/js/bootstrap.bundle.min.js"
      integrity="sha384-/bQdsTh/da6pkI1MST/rWKFNjaCP5gBSY4sEBT38Q/9RBh9AH40zEOg7Hlq2THRZ"
      crossorigin="anonymous"
    ></script>
  </body>
</html>
`
// TODO: fix if regex
const ifRegex = /{%[\s]*if[\s]+(?<condition>.+)[\s]*%}/
const forRegex = /{%[\s]*for[\s]+(?<item>[\w_\.]+)[\s]+in[\s]+(?<items>[\w_\.]+)[\s]*%}/
const loopRegex = /{%[\s]*loop[\s]+(?<times>[0-9]+)[\s]*%}/
const blockRegex = /{%[\s]*block[\s]+(?<block>[\w_]+)[\s]*%}/
const extendsRegex = /{%[\s]*extends[\s]+(?<extend>[\w_]+)[\s]*%}/
const endRegex = /{%[\s]*endfor[\s]*%}|{%[\s]*endif[\s]*%}|{%[\s]*endloop[\s]*%}|{%[\s]*endblock[\s]*%}/


enum TokenType{
    FOR,IF,TEXT,VARIABLE,COMMENT,EXTEND,BLOCK,LOOP,
    ENDFOR,ENDIF,ENDBLOCK,ENDLOOP
}


interface IToken{
    type: TokenType,
    data: string,
    isEndNeeded: Boolean,
}

// TODO: Make every thing into a function

let tokenStack : IToken[] = []
let exprestionStack : string[] = []
let line : number = 0
let col : number = 0
let isBufferActive : Boolean = false
let exprestionBuffer: string = ''
let isHtmlBufferActive : Boolean = true
let htmlBuffer: string = ''

// Going throw each char one by one
// and tokenizing every section using stacks
for(let i=0;i<html.length;i++){
    col++
    let htmlChar = html[i]
    if(htmlChar==='{'){
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
    if(htmlChar === '%'){
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
    if(htmlChar === '!'){
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
    if(htmlChar === '}'){
        const val = exprestionStack.pop()
        if(!val){
            isBufferActive = false
            continue
        }
        if(val === '{{'){
            exprestionStack.push('{{}')      
            isBufferActive = false
        }else if(val == '{%%'){
            let exprestion = '{%'+exprestionBuffer+'%}'
            isBufferActive = false
            tokenStack.push(tokenizeText(htmlBuffer.slice(0,(htmlBuffer.length - exprestion.length)+4)))
            tokenStack.push(tokenizeLogicalExpretions(exprestion,i,line,col))
            exprestionBuffer = ''
            htmlBuffer = ''
        }else if(val == '{{}'){
            let exprestion = '{{'+exprestionBuffer+'}}'
            isBufferActive = false
            tokenStack.push(tokenizeText(htmlBuffer.slice(0,(htmlBuffer.length - exprestion.length)+4)))
            tokenStack.push(tokenizeVariableExpretions(exprestion,i,line,col))
            exprestionBuffer = ''
            htmlBuffer = ''
        }else if(val == '{!!'){
            let exprestion = '{!'+exprestionBuffer+'!}'
            isBufferActive = false
            tokenStack.push(tokenizeText(htmlBuffer.slice(0,(htmlBuffer.length - exprestion.length)+4)))
            exprestionBuffer = ''
            htmlBuffer = ''
        }
        continue
    }
    
    htmlBuffer += htmlChar
    
    if(htmlChar==='\n'){
        line++
        col = 0
        continue
    }
    if(isBufferActive){
        exprestionBuffer = exprestionBuffer + htmlChar
    }
}
tokenStack.push(tokenizeText(htmlBuffer))


// TODO: use match insted of test to extract different parts of statemets
function tokenizeLogicalExpretions(exprestion: string,pos:number,line:number,col:number): IToken{
    
    if(ifRegex.test(exprestion)){
        return {type:TokenType.IF,data:exprestion,isEndNeeded:true}
    }
    if(forRegex.test(exprestion)){
        return {type:TokenType.FOR,data:exprestion,isEndNeeded:true}
    }
    if(loopRegex.test(exprestion)){
        return {type:TokenType.LOOP,data:exprestion,isEndNeeded:true}
    }
    if(blockRegex.test(exprestion)){
        return {type:TokenType.BLOCK,data:exprestion,isEndNeeded:true}
    }
    if(extendsRegex.test(exprestion)){
        return {type:TokenType.EXTEND,data:exprestion,isEndNeeded:false}
    }
    if(endRegex.test(exprestion)){
        var token = {type:TokenType.ENDIF,data:exprestion,isEndNeeded:false}
        if(exprestion.includes('endif'))
            token.type = TokenType.ENDIF
        else if(exprestion.includes('endfor'))
            token.type = TokenType.ENDFOR
        else if(exprestion.includes('endloop'))
            token.type = TokenType.ENDLOOP
        else if(exprestion.includes('endblock'))
            token.type = TokenType.ENDBLOCK
        else{
            throw new Error(`:${line}:${col} Unexpected end tag`)
        }
        return token
    }

    throw new Error(`:${line}:${col} Unexpected template token`)
}
function tokenizeText(exprestion: string):IToken {
    return {type:TokenType.TEXT,data:exprestion,isEndNeeded:false}
}
function tokenizeVariableExpretions(exprestion:string,pos:number,line:number,col:number): IToken{
    const variableRegex = /{{[\s]*(?<variable>[\w_\.]+)[\s]*(\|)?[\s]*(?<filter>[\w_\.]*)[\s]*}}/
    if(variableRegex.test(exprestion)){
        return {type:TokenType.VARIABLE,data:exprestion,isEndNeeded:false}
    }
    throw new Error(`:${line}:${col} Unexpected variable format`)
}

