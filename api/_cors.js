export function cors(req,res){
  const configured=String(process.env.APP_ORIGIN||'').split(',').map(v=>v.trim()).filter(Boolean);
  const origin=req.headers?.origin||'';
  const allowed=!configured.length||configured.includes(origin);
  if(allowed&&origin){
    res.setHeader('Access-Control-Allow-Origin',origin);
    res.setHeader('Access-Control-Allow-Credentials','true');
  }else if(!configured.length){
    res.setHeader('Access-Control-Allow-Origin','*');
  }
  res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');
  res.setHeader('Vary','Origin');
  if(req.method==='OPTIONS'){
    if(!allowed&&configured.length) return res.status(403).end();
    res.status(204).end();
    return true;
  }
  if(!allowed&&configured.length){res.status(403).json({ok:false,error:'origin_not_allowed'});return true;}
  return false;
}
