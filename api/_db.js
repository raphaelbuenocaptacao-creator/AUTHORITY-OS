import postgres from 'postgres';

let client;
export function db(){
  if(!process.env.DATABASE_URL) return null;
  if(!client){
    client=postgres(process.env.DATABASE_URL,{ssl:'require',max:5,idle_timeout:20,connect_timeout:10});
  }
  return client;
}

export function requireDb(res){
  const sql=db();
  if(!sql){
    res.status(503).json({ok:false,error:'database_not_configured'});
    return null;
  }
  return sql;
}
