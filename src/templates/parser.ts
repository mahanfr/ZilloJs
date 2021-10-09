import { tokenizeHtml,IToken,TokenType } from "./lexer.js";

export function parseHtml(html:string):string{
    let newHtml:string = ""
    const tokens:IToken[] = tokenizeHtml(html)
    tokens.reverse()
    while(tokens.length > 0){
        const token:IToken|undefined = tokens.pop()
        if(!token){
            throw new Error('problem resolving tokens')
        }
        if(token.type === TokenType.TEXT){
            newHtml += token.data
        }
    }
    return newHtml
}