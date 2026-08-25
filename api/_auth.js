import { SignJWT, jwtVerify } from 'jose';

const enc=new TextEncoder();
function secret(){
  const value=process.env.AUTH_SECRET;
  if(!value) return null;
  return enc.encode(value);
}

export async function createSession(user){
  const key=secret();
  if(!key) throw new Error('AUTH_SECRET not configured');
  return new SignJWT({sub:String(user.id),email:user.email,role:user.role||'client'})
    .setProtectedHeader({alg:'HS256'})
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

export function setSessionCookie(res,token){
  const secure=process.env.NODE_ENV==='production';
  res.setHeader('Set-Cookie',`authority_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure?'; Secure':''}`);
}

export function clearSessionCookie(res){
  const secure=process.env.NODE_ENV==='production';
  res.setHeader('Set-Cookie',`authority_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure?'; Secure':''}`);
}

function cookieValue(req,name){
  const raw=req.headers?.cookie||'';
  const found=raw.split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='));
  return found?decodeURIComponent(found.slice(name.length+1)):null;
}

export async function getSession(req){
  const token=cookieValue(req,'authority_session');
  const key=secret();
  if(!token||!key) return null;
  try{
    const {payload}=await jwtVerify(token,key);
    return payload;
  }catch{return null;}
}

export async function requireSession(req,res){
  const session=await getSession(req);
  if(!session){res.status(401).json({ok:false,error:'unauthorized'});return null;}
  return session;
}
