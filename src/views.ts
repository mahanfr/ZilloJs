import { compileTemplate } from './templates/compiler.js';
import fs from 'fs';

interface IResponseHelper {
  statusCode: number;
  contentType: string;
  body: string;
  head?: any;
}

/**
 * Renders an Html page by parsing template using given context
 * and it will send a response to user based on the request
 * @example
 * import {render} from './views.js'
 * function indexView(request){
 *   return render(request, './template/index.html',{"title":"my title"})
 * }
 * @param request gets request that got passed by user 
 * @param template location of template
 * @param context data that needs to be inserted inside the template
 * @returns void
 */
function render(
  request: any,
  template: string,
  context?: any,
): IResponseHelper {
  let responseHelper: IResponseHelper = {
    statusCode: 200,
    contentType: 'text/html',
    body: 'hello world',
  };

  // TODO: Fix problems with same error for template and file
  try {
    const data = fs.readFileSync(template);
    if (context) {
      context['request'] = request.method;
    }
    const parseData = compileTemplate(data.toString(), context);
    responseHelper.statusCode = 200;
    responseHelper.body = parseData;
  } catch (e) {
    console.log(e);
    responseHelper.statusCode = 404;
    console.log(responseHelper.statusCode);
    responseHelper.body = '404 Error';
  }

  return responseHelper;
}

export { render };
