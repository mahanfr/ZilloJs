// TODO: Fix the problem with parsing strings that use single quote ('')
// TODO: Add blocks and extends functionalities 
import { parseTokens } from './parser.js';
import { tokenizeHtml, IToken } from './lexer.js';

/**
 * gets html file and returns html string customized using context
 * @param html path to html file
 * @param context data that need to be inserted inside html
 * @returns html formatted text that has been customized using context
 */
// TODO: get file instead of contents of the file
export function compileTemplate(html: string, context: any): string {
  let newHtml: string = '';
  const tokens: IToken[] = tokenizeHtml(html);
  //tokens.reverse();
  //newHtml = tokenToString(tokens, context);
  
  const htmlList = parseTokens(tokens,context)
  newHtml = htmlList.join('')

  return newHtml;
}
