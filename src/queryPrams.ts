

function parseQuery(url:string) {
  const results = url.match(/\?(?<query>.*)/);
  if (!results) {
    return {};
  }
  const { groups: { query } } : any = results;

  const pairs = query.match(/(?<param>\w+)=(?<value>\w+)/g);
  if(pairs === null){
    return {};
  }
  const params = pairs.reduce((acc:any, curr:any) => {
    const [key, value] = curr.split(("="));
    acc[key] = value;
    return acc;
  }, {});
  return params;
}

export {parseQuery}