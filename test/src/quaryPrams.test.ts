import { parseQuery } from '../../src/queryPrams'

describe('quaryPrams',()=>{
    it('extract data from query',()=>{
        expect(parseQuery('/products/')).toStrictEqual({})
        expect(parseQuery('/products/?q=1')).toStrictEqual({"q": "1"})
        expect(parseQuery('/products/?name=ali&last=jake')).toStrictEqual({"name":"ali","last":"jake"})
        expect(parseQuery('/products/??&&?&asd??&')).toStrictEqual({})
    })
})