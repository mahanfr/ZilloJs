import { IToken, TokenType } from './lexer.js';

interface IActiveToken {
  type: TokenType;
  index: number;
  cycles: number;
  internalIndex: number;
  listItemContextName: string;
  list: any;
}

export interface IBlock{
  tag:string;
  referenceFile: string;
  data: string[]
}

/**
 * transforming list of tokens to a list of strings in order to be
 * inserted into another template or joined to create contents of a web page
 * @param tokens List of all tokens
 * @param context An object used for referencing variables
 * @returns List of parsed strings
 */
export function parseTokens(tokens: IToken[], context: any): IBlock[] {
  // to store the final result
  let parsedTokenList: string[] = [];
  // to store loop tags that need processing
  let activeStack: IActiveToken[] = [];

  let baseFile: string = ''
  let currentBlockTag : string = ''
  let blockList: IBlock[] = []

  let i = 0
  while (i < tokens.length) {
    var token = tokens[i];
    /**
     * TEXT
     * add text items into result without any processing
     * this might happen multiple times for the same value
     **/
    if (token.type === TokenType.TEXT) {
      parsedTokenList.push(token.data);
    } 
    /**
     * VARIABLE
     * add text to result after fetching its content from context
     * it will not show if cant find inside context
     * this might happen multiple times for the same value
     **/
    else if (token.type === TokenType.VARIABLE) {
      const activeContext = activeStack.pop()
      if(activeContext){
        if(activeContext?.type === TokenType.FOR){
          context[activeContext.listItemContextName] = activeContext.list[activeContext.internalIndex]
          activeStack.push(activeContext)
        }else{
          activeStack.push(activeContext)
        }
      }
      parsedTokenList.push(parseVariables(token, context));
    }
    /**
     * FOR
     * for loops will revisit already visited tokens
     * the token itself will not be printed
     * -- index of the main loop might change here --
     **/
    else if (token.type === TokenType.FOR) {
      // getting list name from token ⚠️optional values
      
      let rawList: any = token.value['items'];
      let listItemContextName = token.value['item']
      if(!listItemContextName) throw new Error('No context name provided')
      // transforming itemName to context[itemName] and user.itemName to context[user][itemName]
      rawList = transformReferencingToIndexing(rawList);
      // Getting list of data dynamically
      const list: any = new Function(
        'context',
        'if(' + rawList + '){return ' + rawList + ';}else{return null;}',
      )(context);

      // TODO: Change Error to TemplateError
      if (!list) throw new Error(rawList + ' is null');
      // Ignore process if length of for loop list is less or equal zero
      if (list.length <= 0) {
        // set index to after the end of for loop
        i = endingTagIndex(tokens, i, TokenType.FOR, TokenType.ENDFOR);
      }else{
        // add some information to activeStack to show that current token is open
        activeStack.push({
          type: token.type,
          index: i,
          list: list,
          cycles: list.length - 1,
          listItemContextName: listItemContextName,
          internalIndex: 0,
        });
      }
    } 
    /**
     * EndFor
     * check internal index of for-loop from it's active statement
     * in the active stack and goes back to it's original index
     * the token itself will not be printed
     * -- index of the main loop might change here --
    **/
    else if (token.type === TokenType.ENDFOR) {
      const activeStatement = activeStack.pop();
      // console.log(activeStatement)
      if (!activeStatement) {
        // TODO: Change Error to TemplateError
        throw new Error('endfor tag without starting tag');
      }
      if (activeStatement.type === TokenType.FOR) {
        if (activeStatement.internalIndex === activeStatement.cycles) {
          delete context[activeStatement.listItemContextName]
        } else if (activeStatement.internalIndex < activeStatement.cycles) {
          activeStatement.internalIndex += 1;
          i = activeStatement.index;
          activeStack.push(activeStatement);
        } else if (activeStatement.internalIndex > activeStatement.cycles) {
          // TODO: Change Error to TemplateError
          throw new Error(
            'Illegal value: internalIndex can not be grater than cycles',
          );
        }
      }
    } 
    /**
     * LOOP
     * loop a set of tokens multiple times
     * the token itself will not be printed
     * -- index of the main loop might change here --
    **/
    else if (token.type === TokenType.LOOP) {
      let loopCycles: number = parseInt(token.value['times']);
      if (loopCycles <= 0) {
        i = endingTagIndex(tokens, i, TokenType.LOOP, TokenType.ENDLOOP);
      } else {
        activeStack.push({
          type: token.type,
          index: i,
          list: undefined,
          cycles: loopCycles - 1,
          listItemContextName:'',
          internalIndex: 0,
        });
      }
    } 
    /**
     * EndLoop
     * check internal index of loop from it's active statement
     * in the active stack and goes back to it's original index
     * the token itself will not be printed
     * -- index of the main loop might change here --
    **/
    else if (token.type === TokenType.ENDLOOP) {
      const activeStatement = activeStack.pop();
      // console.log(activeStatement)
      if (!activeStatement) {
        // TODO: Change Error to TemplateError
        throw new Error('endLoop tag without starting tag');
      }
      if (activeStatement.type === TokenType.LOOP) {
        if (activeStatement.internalIndex === activeStatement.cycles) {
          i++
          continue;
        } else if (activeStatement.internalIndex < activeStatement.cycles) {
          activeStatement.internalIndex += 1;
          i = activeStatement.index;
          activeStack.push(activeStatement);
        } else if (activeStatement.internalIndex > activeStatement.cycles) {
          // TODO: Change Error to TemplateError
          throw new Error(
            'Illegal value: internalIndex can not be grater than cycles',
          );
        }
      }
    }
    /**
     * IF
     * shows a set of tokens based on truth of a condition
     * the token itself will not be printed
     * -- index of the main loop might change here --
    **/
    else if (token.type === TokenType.IF) {
      if (!checkIfCondition(token, context)) {
        i = endingTagIndex(tokens, i, TokenType.IF, TokenType.ENDIF);
      }
    }

    else if(token.type === TokenType.EXTEND){
      baseFile = token.value['extend']
      baseFile = baseFile.replace(/['"]+/g, '')
    }

    else if(token.type === TokenType.BLOCK){
      const blockTag = token.value['block']
      if(!blockTag) throw new Error("No Block Tag");
      currentBlockTag = blockTag
      blockList.push({
        tag:'block-' + Math.floor(Math.random()*123456),
        referenceFile: baseFile,
        data: parsedTokenList
      })
      parsedTokenList = []
    }

    else if(token.type === TokenType.ENDBLOCK){
      blockList.push({
        tag: currentBlockTag,
        referenceFile: baseFile,
        data: parsedTokenList
      })
      parsedTokenList = []
    }
    i++; 
  }
  blockList.push({
    tag:'block-' + Math.floor(Math.random()*123456),
    referenceFile: baseFile,
    data: parsedTokenList
  })
  parsedTokenList = []
  // Return the final result
  return blockList;
}

/**
 * Function that transform variable tokens to text by finding the correct
 * reference
 * @param token variable token that needs to be parsed
 * @param context used to reference correct values
 * @returns parse value from a reference to only a string
 */
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
/**
 * Change string that uses "." (dot) to indicate that is referencing the child
 * to ones that use brackets
 * @example
 * string "user.name" to string "context['user']['name']"
 * @param variableString string of the variable used in variable tokens
 * if-conditions and for-loops
 * @param objectString optional string that will be the context object and
 * used for referencing
 * @returns string that includes the transformed version of given variable
 * @todo handel indexing a[b] along side of referencing a.b
 */
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

/**
 * Checking the condition by parsing values and data of the
 * passed token with the type of TokenType.IF
 * @example
 * token.data of "if true" should return true
 * @param token the token that needed to be checked
 * @param context Used to find reference to correct values
 * @returns condition boolean of the given token
 */
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
  let comp1 = token.value['comp1'];
  let comp2 = token.value['comp2'];
  const op = token.value['op'];
  comp1 = comp1.replace(/['"]+/g, '\"')
  comp2 = comp2.replace(/['"]+/g, '\"')
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
    try{
      const result: boolean = new Function(
        'context',
        'return (' + conditionString + ');',
      )(context);
      if (result !== undefined) return result;
    }catch(e){
      throw new Error('condition can not be parsed')
    }
  }

  return false;
}

/**
 * finding the end token of a given token by searching through a
 * list of tokens starting form the given index and finding the endingToken
 * @param tokensList List of all tokens
 * @param currentIndex index of the current token inside the given list
 * @param startingToken Type of the stating token
 * @param endingToken Type of the ending token
 * @returns index of the ending token
 */
function endingTagIndex(
  tokensList: IToken[],
  currentIndex: number,
  startingToken: TokenType,
  endingToken: TokenType,
): number {
  let i = currentIndex + 1;
  let activeTokenFlag: Boolean = false;
  while (i < tokensList.length) {
    if (tokensList[i].type === startingToken) {
      activeTokenFlag = true;
    }
    if (tokensList[i].type === endingToken) {
      if (activeTokenFlag) {
        activeTokenFlag = false;
      } else {
        return i;
      }
    }
    i += 1;
  }
  throw new Error(tokensList[currentIndex] + ' has no ending tag');
}
