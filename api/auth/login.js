import bcrypt from 'bcryptjs';
import { cors } from '../_cors.js';
import { requireDb } from '../_db.js';
import { createSession,setSessionCookie } from '../_auth.js';

export default async function handler(req,res){
  if(cors(req,res)) return;
  if(req.method!=='POST') return res.status(405).json({ok:false,error:'method_not_allowed'});
  const sql=requireDb(res); if(!sql) return;
  const body=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
  const email=String(body.email||'').trim().toLowerCase();
  const password=String(body.password||'');
  try{
    const rows=await sql`select id,name,email,password_hash,role from users where email=${email} limit 1`;
    const user=rows[0];
    if(!user||!(await bcrypt.compare(password,user.password_hash))) return res.status(401).json({ok:false,error:'invalid_credentials'});
    const token=await createSession(user); setSessionCookie(res,token);
    res.status(200).json({ok:true,user:{id:user.id,name:user.name,email:user.email,role:user.role}});
  }catch(e){console.error(e);res.status(500).json({ok:false,error:'login_failed'});}
}
