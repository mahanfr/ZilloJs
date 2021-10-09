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
  let exprestionStack: string[] = [];
  let line: number = 0;
  let col: number = 0;
  let isBufferActive: Boolean = false;
  let exprestionBuffer: string = '';
  let isHtmlBufferActive: Boolean = true;
  let htmlBuffer: string = '';

  for (let i = 0; i < html.length; i++) {
    col++;
    let htmlChar = html[i];
    if (htmlChar === '{') {
      const val = exprestionStack.pop();
      if (!val) {
        exprestionStack.push('{');
        isBufferActive = false;
      } else {
        if (val === '{') {
          exprestionStack.push('{{');
          isBufferActive = true;
        }
      }
      continue;
    }
    if (htmlChar === '%') {
      const val = exprestionStack.pop();
      if (!val) {
        isBufferActive = false;
        continue;
      }
      if (val === '{') {
        exprestionStack.push('{%');
        isBufferActive = true;
      } else if (val === '{%') {
        exprestionStack.push('{%%');
        isBufferActive = false;
      }
      continue;
    }
    if (htmlChar === '!') {
      const val = exprestionStack.pop();
      if (!val) {
        isBufferActive = false;
        continue;
      }
      if (val === '{') {
        exprestionStack.push('{!');
        isBufferActive = true;
      } else if (val == '{!') {
        exprestionStack.push('{!!');
        isBufferActive = false;
      }
      continue;
    }
    if (htmlChar === '}') {
      const val = exprestionStack.pop();
      if (!val) {
        isBufferActive = false;
        continue;
      }
      if (val === '{{') {
        exprestionStack.push('{{}');
        isBufferActive = false;
      } else if (val == '{%%') {
        let exprestion = '{%' + exprestionBuffer + '%}';
        isBufferActive = false;
        tokenStack.push(
          tokenizeText(
            htmlBuffer.slice(0, htmlBuffer.length - exprestion.length + 4),
          ),
        );
        tokenStack.push(tokenizeLogicalExpretions(exprestion, i, line, col));
        exprestionBuffer = '';
        htmlBuffer = '';
      } else if (val == '{{}') {
        let exprestion = '{{' + exprestionBuffer + '}}';
        isBufferActive = false;
        tokenStack.push(
          tokenizeText(
            htmlBuffer.slice(0, htmlBuffer.length - exprestion.length + 4),
          ),
        );
        tokenStack.push(tokenizeVariableExpretions(exprestion, i, line, col));
        exprestionBuffer = '';
        htmlBuffer = '';
      } else if (val == '{!!') {
        let exprestion = '{!' + exprestionBuffer + '!}';
        isBufferActive = false;
        tokenStack.push(
          tokenizeText(
            htmlBuffer.slice(0, htmlBuffer.length - exprestion.length + 4),
          ),
        );
        exprestionBuffer = '';
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
      exprestionBuffer = exprestionBuffer + htmlChar;
    }
  }
  tokenStack.push(tokenizeText(htmlBuffer));
  return tokenStack
}

function tokenizeLogicalExpretions(
  exprestion: string,
  pos: number,
  line: number,
  col: number,
): IToken {
  if (ifRegex.test(exprestion)) {
    const match = exprestion.match(ifRegex)
    return { type: TokenType.IF, value:match?.groups, data: exprestion, isEndNeeded: true };
  }
  if (forRegex.test(exprestion)) {
    const match = exprestion.match(forRegex)
    return { type: TokenType.FOR, value:match?.groups, data: exprestion, isEndNeeded: true };
  }
  if (loopRegex.test(exprestion)) {
    const match = exprestion.match(loopRegex)
    return { type: TokenType.LOOP, value:match?.groups, data: exprestion, isEndNeeded: true };
  }
  if (blockRegex.test(exprestion)) {
    const match = exprestion.match(blockRegex)
    return { type: TokenType.BLOCK, value:match?.groups, data: exprestion, isEndNeeded: true };
  }
  if (extendsRegex.test(exprestion)) {
    const match = exprestion.match(extendsRegex)
    return { type: TokenType.EXTEND, value:match?.groups, data: exprestion, isEndNeeded: false };
  }
  if (endRegex.test(exprestion)) {
    var token = { type: TokenType.ENDIF, data: exprestion, isEndNeeded: false };
    if (exprestion.includes('endif')) token.type = TokenType.ENDIF;
    else if (exprestion.includes('endfor')) token.type = TokenType.ENDFOR;
    else if (exprestion.includes('endloop')) token.type = TokenType.ENDLOOP;
    else if (exprestion.includes('endblock')) token.type = TokenType.ENDBLOCK;
    else {
      throw new Error(`:${line}:${col} => ${exprestion} : Unexpected end tag`);
    }
    return token;
  }

  throw new Error(`:${line}:${col} => ${exprestion} : Unexpected template token`);
}

function tokenizeText(exprestion: string): IToken {
  return { type: TokenType.TEXT, data: exprestion, isEndNeeded: false };
}

function tokenizeVariableExpretions(
  exprestion: string,
  pos: number,
  line: number,
  col: number,
): IToken {
  if (variableRegex.test(exprestion)) {
    const match = exprestion.match(variableRegex)
    return { type: TokenType.VARIABLE, value:match?.groups, data: exprestion, isEndNeeded: false };
  }
  throw new Error(`:${line}:${col} Unexpected variable format`);
}
