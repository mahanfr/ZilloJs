// TODO: Fix the problem with parsing strings that use single quote ('')

import { parseTokens } from './compiler.js';
import { tokenizeHtml, IToken, TokenType } from './lexer.js';

export function parseHtml(html: string, context: any): string {
  let newHtml: string = '';
  const tokens: IToken[] = tokenizeHtml(html);
  //tokens.reverse();
  //newHtml = tokenToString(tokens, context);
  
  const htmlList = parseTokens(tokens,context)
  newHtml = htmlList.join('')

  return newHtml;
}

function tokenToString(tokens: IToken[], context: any): string {
  const token: IToken | undefined = tokens.pop();
  if (!token) {
    return '';
  }
  if (tokens.length === 0) {
    return token.data;
  }
  if (token.type === TokenType.TEXT) {
    return token.data + tokenToString(tokens, context);
  } else if (token.type === TokenType.VARIABLE) {
    return parseVariables(token, context) + tokenToString(tokens, context);
  } else if (token.type === TokenType.IF) {
    let positionalTokens = findTokensInclosed(
      tokens,
      TokenType.IF,
      TokenType.ENDIF,
    );
    if (checkIfCondition(token, context)) {
      return (
        tokenToString(positionalTokens.in, context) +
        tokenToString(positionalTokens.out, context)
      );
    }
    return tokenToString(positionalTokens.out, context);
  } else if (token.type === TokenType.LOOP) {
    let loopCycles: number = parseInt(token.value['times']);
    let loopResult: string = '';
    var positionalTokens = findTokensInclosed(
      tokens,
      TokenType.LOOP,
      TokenType.ENDLOOP,
    );
    const insideString = tokenToString(positionalTokens.in, context);
    while (loopCycles > 0) {
      loopResult += insideString;
      loopCycles--;
    }
    return loopResult + tokenToString(positionalTokens.out, context);
  } else {
    return tokenToString(tokens, context);
  }
}

function parseVariables(token: IToken, context: any): string {
  let variable;
  try {
    const value: string = token.value['variable'];
    const execString = transformReferencingToIndexing(value);
    variable = new Function('context', 'return ' + execString)(context);
  } catch (e) {
    throw new Error(
      `${token.value['variable']} was not provided in the context`,
    );
  }
  if (variable) return variable;
  else return '';
}

function checkIfCondition(token: IToken, context: any): Boolean {
  const condition = token.value['condition'];
  if (condition) {
    if (condition === 'true' || condition === 'false') {
      let result = new Function('return (' + condition + ')? true : false;')();
      if (result !== undefined) return result;
      else
        throw new Error(
          'Error parsing ' + token + ':' + condition + ' is not a valid syntax',
        );
    } else {
      const phrase = transformReferencingToIndexing(condition);
      let result = new Function(
        'context',
        'return (' + phrase + ')? true : false;',
      )(context);
      if (result !== undefined) return result;
      else
        throw new Error(
          'Error parsing ' +
            token +
            ':' +
            condition +
            ' is not available in context',
        );
    }
  }
  const comp1 = token.value['comp1'];
  const comp2 = token.value['comp2'];
  const op = token.value['op'];
  if (comp1 && comp2 && op) {
    let conditionString: string = '';
    const indexedComp1: string = transformReferencingToIndexing(comp1);
    const indexedComp2: string = transformReferencingToIndexing(comp2);
    const isIndexedComp1Exist: boolean = new Function(
      'context',
      'return ' + indexedComp1 + '? true: false;',
    )(context);
    const isIndexedComp2Exist: boolean = new Function(
      'context',
      'return ' + indexedComp2 + '? true: false;',
    )(context);
    if (isIndexedComp1Exist) {
      conditionString += indexedComp1;
    } else {
      conditionString += comp1;
    }
    conditionString += ' ' + op + ' ';
    if (isIndexedComp2Exist) {
      conditionString += indexedComp2;
    } else {
      conditionString += comp2;
    }
    const result: boolean = new Function(
      'context',
      'return (' + conditionString + ');',
    )(context);
    if (result !== undefined) return result;
    else {
      throw new Error(
        conditionString + ' ' + result + ' condition can not be parsed',
      );
    }
  }

  return false;
}

interface IPositionalTokens {
  in: IToken[];
  out: IToken[];
}

function findTokensInclosed(
  tokens: IToken[],
  startingType: TokenType,
  endType: TokenType,
): IPositionalTokens {
  let statementsFlag: Boolean = false;
  const tokensStack: IToken[] = [];
  /**
   * [if] <- [end] => [] until [] <- [end] => return
   * if an opening Token pops then the flags become true and
   * when seen a ending Token it becomes false
   * if ending token comes up and the flag is false then function returns
   */
  while (tokens.length > 0) {
    const token = tokens.pop();
    if (token?.type === startingType) {
      statementsFlag = true;
      tokensStack.push(token);
      continue;
    }
    if (token?.type === endType) {
      if (statementsFlag === false) {
        return { in: tokensStack.reverse(), out: tokens };
      } else {
        // If statementsFlag is true
        statementsFlag = false;
        tokensStack.push(token);
      }
      continue;
    }
    if (token) tokensStack.push(token);
  }

  return { in: [], out: tokens };
}

// TODO: handel indexing a[b] along side of referencing a.b
function transformReferencingToIndexing(
  variableString: string,
  objectString = 'context',
): string {
  const values = variableString.split('.');
  let execString = objectString;
  // user['address']['city']
  for (let i in values) {
    execString += "['" + values[i] + "']";
  }
  return execString;
}
