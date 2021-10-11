import { tokenizeHtml, IToken, TokenType } from './lexer.js';

export function parseHtml(html: string, context: any): string {
  let newHtml: string = '';
  const tokens: IToken[] = tokenizeHtml(html);
  tokens.reverse();
  newHtml = tokenToString(tokens,context)
  // while (tokens.length > 0) {
  //   const token: IToken | undefined = tokens.pop();
  //   // This condition checks for tokens to not be null or undefined
  //   if (!token) throw new Error('problem resolving tokens');
  //   // Going throw all types and perform appropriate action
  //   if (token.type === TokenType.TEXT) {
  //     newHtml += token.data;
  //   } else if (token.type === TokenType.VARIABLE) {
  //     newHtml += parseVariables(token,context);
  //   }
  // }
  return newHtml;
}


function tokenToString(tokens:IToken[],context:any):string{
  const token: IToken | undefined = tokens.pop();
  if(!token){
    return ""
  }
  if(tokens.length === 0){
    return token.data
  }
  if(token.type === TokenType.TEXT) {
    return token.data + tokenToString(tokens,context)
  } else if(token.type === TokenType.VARIABLE) {
    return parseVariables(token,context) + tokenToString(tokens,context);
  }else if(token.type === TokenType.IF) {
    let positionalTokens = findTokensInclosed(tokens,TokenType.IF,TokenType.ENDIF)
    if(checkIfCondition(token,context)){
      return tokenToString((positionalTokens.in).reverse(),context) 
        + tokenToString(positionalTokens.out,context)
    }
    return tokenToString(positionalTokens.out,context)
  }else if(token.type === TokenType.LOOP){
    let loopCycles:number = parseInt(token.value['times'])
    let loopResult:string = ''
    var positionalTokens = findTokensInclosed(tokens,TokenType.LOOP,TokenType.ENDLOOP)
    const insideString = tokenToString(positionalTokens.in,context)
    while(loopCycles > 0){
      loopResult += insideString
      loopCycles--;
    }
    return loopResult + tokenToString(positionalTokens.out,context)
  }
  else {
    return tokenToString(tokens,context)
  }
}

function parseVariables(token: IToken,context:any): string {
  let variable;
  // TODO: handel filters
  let filter;
  try {
    const value = token.value['variable'];
    // TODO: handel indexing a[b] along side of referencing a.b
    const values = value.split('.');
    let execString = 'context';
    // user['address']['city']
    for (let i in values) {
      execString += "[\'" + values[i] + "\']";
    }
    variable = new Function('context',"return " + execString)(context);
  } catch (e) {
    throw new Error(
      `${token.value['variable']} was not provided in the context`,
    );
  }
  if (variable) return variable;
  else return '';
}

function checkIfCondition(token: IToken, context: any):Boolean {
  return true
}

interface IPositionalTokens{
  in:IToken[];
  out:IToken[];
}

function findTokensInclosed(tokens: IToken[],startingType:TokenType,endType: TokenType): IPositionalTokens {
  let statementsFlag : Boolean = false
  const tokensStack : IToken[] = [] 

  // [if] <- [end] => [] until [] <- [end] => return
  while(tokens.length > 0){
    const token = tokens.pop()
    if (token?.type === startingType) {
      statementsFlag = true
      tokensStack.push(token)
      continue
    }
    if(token?.type === endType){
      if(statementsFlag === false){
        return {in:tokensStack,out:tokens}
      }else{// If statementsFlag is true
        statementsFlag = false
        tokensStack.push(token)
      }
      continue
    }
    if(token)
      tokensStack.push(token)
  }

  return {in:[],out:tokens}
}
