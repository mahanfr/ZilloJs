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

import { TemplateTokenError } from "./errors.js";

const ifRegex =
  /{%[\s]*if[\s]+(?<condition>[\w\d_\.\'\"\(\)\[\]]+)[\s]*%}|{%[\s]*if[\s]+(?<comp1>[\w\d_\.\'\"\(\)\[\]]+)[\s]*(?<op>(==|===|\<|\>|\<=|\>=))[\s]*(?<comp2>[\w\d_\.\'\"\(\)\[\]]+)[\s]*%}/;
  const forRegex =
  /{%[\s]*for[\s]+(?<item>[\w\d_\.]+)[\s]+in[\s]+(?<items>[\w\d_\.]+)[\s]*%}/;
const loopRegex = /{%[\s]*loop[\s]+(?<times>[0-9]+)[\s]*%}/;
const blockRegex = /{%[\s]*block[\s]+(?<block>[\w_]+)[\s]*%}/;
const extendsRegex = /{%[\s]*extends[\s]+(?<extend>[\w\d\"\/\'_\.]+)[\s]*%}/;
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
  line: number;
  col:number;
  isEndNeeded: Boolean;
}

// Going throw each char one by one
// and tokenizing every section using stacks
export function tokenizeHtml(html: string,filePath:string): IToken[] {
  let tokenStack: IToken[] = [];
  let expressionStack: string[] = [];
  let line: number = 1;
  let col: number = 1;
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
            filePath,
            line,
            col,
          ),
        );
        tokenStack.push(tokenizeLogicalExpressions(expression, filePath, line, col));
        expressionBuffer = '';
        htmlBuffer = '';
      } else if (val == '{{}') {
        let expression = '{{' + expressionBuffer + '}}';
        isBufferActive = false;
        tokenStack.push(
          tokenizeText(
            htmlBuffer.slice(0, htmlBuffer.length - expression.length + 4),
            filePath,
            line,
            col,
          ),
        );
        tokenStack.push(tokenizeVariableExpressions(expression, filePath, line, col));
        expressionBuffer = '';
        htmlBuffer = '';
      } else if (val == '{!!') {
        let expression = '{!' + expressionBuffer + '!}';
        isBufferActive = false;
        tokenStack.push(
          tokenizeText(
            htmlBuffer.slice(0, htmlBuffer.length - expression.length + 4),
            filePath,
            line,
            col,
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
  tokenStack.push(tokenizeText(htmlBuffer,filePath,line,col));
  return tokenStack;
}

function tokenizeLogicalExpressions(
  expression: string,
  filePath: string,
  line: number,
  col: number,
): IToken {
  if (ifRegex.test(expression)) {
    const match = expression.match(ifRegex);
    return {
      type: TokenType.IF,
      value: match?.groups,
      data: expression,
      col:col,
      line:line,
      isEndNeeded: true,
    };
  }
  if (forRegex.test(expression)) {
    const match = expression.match(forRegex);
    return {
      type: TokenType.FOR,
      value: match?.groups,
      col:col,
      line:line,
      data: expression,
      isEndNeeded: true,
    };
  }
  if (loopRegex.test(expression)) {
    const match = expression.match(loopRegex);
    return {
      type: TokenType.LOOP,
      value: match?.groups,
      col:col,
      line:line,
      data: expression,
      isEndNeeded: true,
    };
  }
  if (blockRegex.test(expression)) {
    const match = expression.match(blockRegex);
    return {
      type: TokenType.BLOCK,
      value: match?.groups,
      data: expression,
      col:col,
      line:line,
      isEndNeeded: true,
    };
  }
  if (extendsRegex.test(expression)) {
    const match = expression.match(extendsRegex);
    return {
      type: TokenType.EXTEND,
      value: match?.groups,
      data: expression,
      col:col,
      line:line,
      isEndNeeded: false,
    };
  }
  if (endRegex.test(expression)) {
    var token = { type: TokenType.ENDIF, col:col, line:line, data: expression, isEndNeeded: false };
    if (expression.includes('endif')) token.type = TokenType.ENDIF;
    else if (expression.includes('endfor')) token.type = TokenType.ENDFOR;
    else if (expression.includes('endloop')) token.type = TokenType.ENDLOOP;
    else if (expression.includes('endblock')) token.type = TokenType.ENDBLOCK;
    else {
      throw new TemplateTokenError(`${expression}: Unexpected template syntax (${filePath}:${line}:1)`);
    }
    return token;
  }

  throw new TemplateTokenError(
    `${expression}: Unexpected template syntax (${filePath}:${line}:1)`,
  );
}

function tokenizeText(expression: string,filePath:string,line:number,col:number): IToken {
  return { type: TokenType.TEXT,col:col,line:line, data: expression, isEndNeeded: false };
}

function tokenizeVariableExpressions(
  expression: string,
  filePath: string,
  line: number,
  col: number,
): IToken {
  if (variableRegex.test(expression)) {
    const match = expression.match(variableRegex);
    return {
      type: TokenType.VARIABLE,
      value: match?.groups,
      col:col,
      line:line,
      data: expression,
      isEndNeeded: false,
    };
  }
  throw new TemplateTokenError(`${expression}: Unexpected variable format (${filePath}:${line}:1)`);
}
