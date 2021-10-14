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
    } else if(token.type === TokenType.IF){
      if(checkIfCondition(token, context)){
        continue
      }else{
        i = endingTagIndex(tokens,i,TokenType.IF,TokenType.ENDIF)
      }
      continue
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

function endingTagIndex(tokensList: IToken[], currentIndex: number, startingToken:TokenType, endingToken: TokenType): number {
  let i = currentIndex + 1
  let activeTokenFlag:Boolean = false
  while(i<tokensList.length){
    if(tokensList[i].type === startingToken){
      activeTokenFlag = true
    }
    if(tokensList[i].type === endingToken){
      if(activeTokenFlag){
        activeTokenFlag = false
      }else{
        return i
      }
    }
    i += 1;
  }
  throw new Error(tokensList[currentIndex]+" has no ending tag")
}

