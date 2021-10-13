import { IToken, TokenType } from './lexer.js';

interface IActiveToken {
  type: TokenType;
  index: number;
  cycles: number;
  internalIndex: number;
  list: any;
}

// TODO:  add context for "For Loops"
export function parseTokens(tokens: IToken[], context: any): string[] {
  let parsedTokenList: string[] = [];
  let activeStack: IActiveToken[] = [];
  // TODO: for readability change for to while loop
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];
    if (token.type === TokenType.TEXT) {
      parsedTokenList.push(token.data);
    } else if (token.type === TokenType.VARIABLE) {
      parsedTokenList.push(parseVariables(token, context));
    } else if (token.type === TokenType.FOR) {
      let rawList: any = token.value['items'];
      rawList = transformReferencingToIndexing(rawList);
      const list: any = new Function(
        'context',
        'if(' + rawList + '){return ' + rawList + ';}else{return null;}',
      )(context);
      if (!list) throw new Error(rawList + ' is null');

      activeStack.push({
        type: token.type,
        index: i,
        list: list,
        cycles: list.length - 1,
        internalIndex: 0,
      });
    } else if (token.type === TokenType.ENDFOR) {
      const activeStatement = activeStack.pop();
      // console.log(activeStatement)
      if (!activeStatement) {
        throw new Error('endfor tag without starting tag');
      }

      if (activeStatement.internalIndex === activeStatement.cycles) {
        continue;
      } else if (activeStatement.internalIndex < activeStatement.cycles) {
        activeStatement.internalIndex += 1;
        i = activeStatement.index;
        activeStack.push(activeStatement);
        continue;
      } else if (activeStatement.internalIndex > activeStatement.cycles) {
        throw new Error(
          'Illegal value: internalIndex can not be grater than cycles',
        );
      }
    }
  }
  return parsedTokenList;
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
