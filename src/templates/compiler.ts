// TODO: Fix the problem with parsing strings that use single quote ('')
import { IBlock, parseTokens } from './parser.js';
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
  const blockList = parseTokens(tokens, context);
  if(blockList[0].referenceFile === ''){
   for(let i in blockList){
    newHtml += blockList[i].data.join('')
   } 
  }
  else{
    let baseBlockList: IBlock[] = []
    try {
      const baseContent = readFileSync(blockList[0].referenceFile).toString();
      const baseTokens = tokenizeHtml(baseContent)
      baseBlockList = parseTokens(baseTokens,context)
    } catch {
      throw new TemplateFileError(
        'no such file or directory ' + '(file:///' + blockList[0].referenceFile + ')',
        );
    }
    newHtml = mergeBlockLists(baseBlockList,blockList);
  }
  newHtml = trimHtml(newHtml)
  return newHtml
}

/**
 * To cleanup generated html by removing empty and useless lines
 * @param html gets generated html using html compiler
 * @returns trimmed version of the same html 
 */
function trimHtml(html: string) {
  let lines = html.split('\n')
  let newHtml : string[] = []
  for(let i in lines){
    let line = lines[i]
    let j = 0
    while (j < line.length){
      if(line[j] === ' '){
        j = 0
        line = line.slice(1)
      }else{
        break
      }
      j++;
    }
    if(line.length>1){
      //console.log(line)
      newHtml[i] = line
    }
  }
  return newHtml.join('')
}

function mergeBlockLists(baseBlockList: IBlock[], blockList: IBlock[]): string {
  let mergedString = ''
  for(let i in baseBlockList){
    const baseBlock = baseBlockList[i];
    const includedBlockIndex = doseTagExists(baseBlock.tag,blockList)
    if(includedBlockIndex < 0){
      mergedString += baseBlock.data.join('')
    }else{
      mergedString += blockList[includedBlockIndex].data.join('')
    }
  }
  return mergedString
}

function doseTagExists(blockTag:string,blockList:IBlock[]):number{
  let i = 0
  while(i<blockList.length){
    if(blockTag === blockList[i].tag){
      return i
    }
    i++
  }
  return -1
}
