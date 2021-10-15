// TODO: Fix the problem with parsing strings that use single quote ('')
// TODO: Add blocks and extends functionalities
import { parseTokens } from './parser.js';
import { tokenizeHtml, IToken } from './lexer.js';
import { readFileSync } from 'fs';
import { TemplateFileError } from './errors.js';

/**
 * gets html file and returns html string customized using context
 * @param html path to html file
 * @param context data that need to be inserted inside html
 * @returns html formatted text that has been customized using context
 */
export function compileTemplate(
  templateFilePath: string,
  context: any,
): string {
  let newHtml: string = '';
  let htmlContent: string = '';
  try {
    htmlContent = readFileSync(templateFilePath).toString();
  } catch {
    throw new TemplateFileError(
      'no such file or directory ' + '(file:///' + templateFilePath + ')',
    );
  }
  const tokens: IToken[] = tokenizeHtml(htmlContent);
  //tokens.reverse();
  //newHtml = tokenToString(tokens, context);

  const htmlList = parseTokens(tokens, context);
  newHtml = htmlList.join('');

  return newHtml;
}
