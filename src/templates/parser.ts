import { tokenizeHtml, IToken, TokenType } from './lexer.js';

export function parseHtml(html: string, context: any): string {
  let newHtml: string = '';
  const tokens: IToken[] = tokenizeHtml(html);
  tokens.reverse();
  while (tokens.length > 0) {
    const token: IToken | undefined = tokens.pop();
    // This condition checks for tokens to not be null or undefined
    if (!token) throw new Error('problem resolving tokens');
    // Going throw all types and perform appropriate action
    if (token.type === TokenType.TEXT) {
      newHtml += token.data;
    } else if (token.type === TokenType.VARIABLE) {
      newHtml += parseVariables(token,context);
    }
  }
  return newHtml;
}

function parseVariables(token: IToken,context:JSON): string {
  let variable;
  // TODO: handel filters
  let filter;
  try {
    const value = token.value['variable'];
    // TODO: handel indexing a[b] along side of referencing a.b
    const values = value.split('.');
    let execString = 'context';
    for (let i in values) {
      execString += "[\'" + values[i] + "\']";
    }
    // TODO: Change this to Function cause eval is bad practice
    variable = eval(execString);
  } catch (e) {
    throw new Error(
      `${token.value['variable']} was not provided in the context`,
    );
  }
  if (variable) return variable;
  else return '';
}
