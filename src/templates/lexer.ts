// Template Syntax
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

const ifRegex =
  /{%[\s]*if[\s]+(?<condition>[\w\d_\.\'\"\(\)\[\]]+)[\s]*%}|{%[\s]*if[\s]+(?<comp1>[\w\d_\.\'\"\(\)\[\]]+)[\s]*(?<op>(==|===|\<|\>|\<=|\>=))[\s]*(?<comp2>[\w\d_\.\'\"\(\)\[\]]+)[\s]*%}/;
const forRegex =
  /{%[\s]*for[\s]+(?<item>[\w\d_\.]+)[\s]+in[\s]+(?<items>[\w\d_\.]+)[\s]*%}/;
const loopRegex = /{%[\s]*loop[\s]+(?<times>[0-9]+)[\s]*%}/;
const blockRegex = /{%[\s]*block[\s]+(?<block>[\w_]+)[\s]*%}/;
const extendsRegex = /{%[\s]*extends[\s]+(?<extend>[\w_]+)[\s]*%}/;
const endRegex =
  /{%[\s]*endfor[\s]*%}|{%[\s]*endif[\s]*%}|{%[\s]*endloop[\s]*%}|{%[\s]*endblock[\s]*%}/;
const variableRegex =
  /{{[\s]*(?<variable>[\w\d_\.]+)[\s]*(\|)?[\s]*(?<filter>[\w\d_\.]*)[\s]*}}/;

export enum TokenType {
  FOR,
  IF,
  TEXT,
  VARIABLE,
  COMMENT,
  EXTEND,
  BLOCK,
  LOOP,
  ENDFOR,
  ENDIF,
  ENDBLOCK,
  ENDLOOP,
}

export interface IToken {
  type: TokenType;
  data: string;
  value?: any;
  isEndNeeded: Boolean;
}

// Going throw each char one by one
// and tokenizing every section using stacks
export function tokenizeHtml(html:string):IToken[] {
  let tokenStack: IToken[] = [];
  let expressionStack: string[] = [];
  let line: number = 0;
  let col: number = 0;
  let isBufferActive: Boolean = false;
  let expressionBuffer: string = '';
  let isHtmlBufferActive: Boolean = true;
  let htmlBuffer: string = '';

  for (let i = 0; i < html.length; i++) {
    col++;
    let htmlChar = html[i];
    if (htmlChar === '{') {
      const val = expressionStack.pop();
      if (!val) {
        expressionStack.push('{');
        isBufferActive = false;
      } else {
        if (val === '{') {
          expressionStack.push('{{');
          isBufferActive = true;
        }
      }
      continue;
    }
    if (htmlChar === '%') {
      const val = expressionStack.pop();
      if (!val) {
        isBufferActive = false;
        continue;
      }
      if (val === '{') {
        expressionStack.push('{%');
        isBufferActive = true;
      } else if (val === '{%') {
        expressionStack.push('{%%');
        isBufferActive = false;
      }
      continue;
    }
    if (htmlChar === '!') {
      const val = expressionStack.pop();
      if (!val) {
        isBufferActive = false;
        continue;
      }
      if (val === '{') {
        expressionStack.push('{!');
        isBufferActive = true;
      } else if (val == '{!') {
        expressionStack.push('{!!');
        isBufferActive = false;
      }
      continue;
    }
    if (htmlChar === '}') {
      const val = expressionStack.pop();
      if (!val) {
        isBufferActive = false;
        continue;
      }
      if (val === '{{') {
        expressionStack.push('{{}');
        isBufferActive = false;
      } else if (val == '{%%') {
        let expression = '{%' + expressionBuffer + '%}';
        isBufferActive = false;
        tokenStack.push(
          tokenizeText(
            htmlBuffer.slice(0, htmlBuffer.length - expression.length + 4),
          ),
        );
        tokenStack.push(tokenizeLogicalExpressions(expression, i, line, col));
        expressionBuffer = '';
        htmlBuffer = '';
      } else if (val == '{{}') {
        let expression = '{{' + expressionBuffer + '}}';
        isBufferActive = false;
        tokenStack.push(
          tokenizeText(
            htmlBuffer.slice(0, htmlBuffer.length - expression.length + 4),
          ),
        );
        tokenStack.push(tokenizeVariableExpressions(expression, i, line, col));
        expressionBuffer = '';
        htmlBuffer = '';
      } else if (val == '{!!') {
        let expression = '{!' + expressionBuffer + '!}';
        isBufferActive = false;
        tokenStack.push(
          tokenizeText(
            htmlBuffer.slice(0, htmlBuffer.length - expression.length + 4),
          ),
        );
        expressionBuffer = '';
        htmlBuffer = '';
      }
      continue;
    }
  
    htmlBuffer += htmlChar;
  
    if (htmlChar === '\n') {
      line++;
      col = 0;
      continue;
    }
    if (isBufferActive) {
      expressionBuffer = expressionBuffer + htmlChar;
    }
  }
  tokenStack.push(tokenizeText(htmlBuffer));
  return tokenStack
}

function tokenizeLogicalExpressions(
  expression: string,
  pos: number,
  line: number,
  col: number,
): IToken {
  if (ifRegex.test(expression)) {
    const match = expression.match(ifRegex)
    return { type: TokenType.IF, value:match?.groups, data: expression, isEndNeeded: true };
  }
  if (forRegex.test(expression)) {
    const match = expression.match(forRegex)
    return { type: TokenType.FOR, value:match?.groups, data: expression, isEndNeeded: true };
  }
  if (loopRegex.test(expression)) {
    const match = expression.match(loopRegex)
    return { type: TokenType.LOOP, value:match?.groups, data: expression, isEndNeeded: true };
  }
  if (blockRegex.test(expression)) {
    const match = expression.match(blockRegex)
    return { type: TokenType.BLOCK, value:match?.groups, data: expression, isEndNeeded: true };
  }
  if (extendsRegex.test(expression)) {
    const match = expression.match(extendsRegex)
    return { type: TokenType.EXTEND, value:match?.groups, data: expression, isEndNeeded: false };
  }
  if (endRegex.test(expression)) {
    var token = { type: TokenType.ENDIF, data: expression, isEndNeeded: false };
    if (expression.includes('endif')) token.type = TokenType.ENDIF;
    else if (expression.includes('endfor')) token.type = TokenType.ENDFOR;
    else if (expression.includes('endloop')) token.type = TokenType.ENDLOOP;
    else if (expression.includes('endblock')) token.type = TokenType.ENDBLOCK;
    else {
      throw new Error(`:${line}:${col} => ${expression} : Unexpected end tag`);
    }
    return token;
  }

  throw new Error(`:${line}:${col} => ${expression} : Unexpected template token`);
}

function tokenizeText(expression: string): IToken {
  return { type: TokenType.TEXT, data: expression, isEndNeeded: false };
}

function tokenizeVariableExpressions(
  expression: string,
  pos: number,
  line: number,
  col: number,
): IToken {
  if (variableRegex.test(expression)) {
    const match = expression.match(variableRegex)
    return { type: TokenType.VARIABLE, value:match?.groups, data: expression, isEndNeeded: false };
  }
  throw new Error(`:${line}:${col} Unexpected variable format`);
}
