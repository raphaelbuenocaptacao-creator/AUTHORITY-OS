import bcrypt from 'bcryptjs';
import { cors } from '../_cors.js';
import { requireDb } from '../_db.js';
import { createSession,setSessionCookie } from '../_auth.js';

export default async function handler(req,res){
  if(cors(req,res)) return;
  if(req.method!=='POST') return res.status(405).json({ok:false,error:'method_not_allowed'});
  const sql=requireDb(res); if(!sql) return;
  const {name,email,password}=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
  const cleanEmail=String(email||'').trim().toLowerCase();
  if(!name||!cleanEmail||String(password||'').length<8) return res.status(400).json({ok:false,error:'invalid_input'});
  try{
    const exists=await sql`select id from users where email=${cleanEmail} limit 1`;
    if(exists.length) return res.status(409).json({ok:false,error:'email_in_use'});
    const hash=await bcrypt.hash(String(password),12);
    const rows=await sql`insert into users(name,email,password_hash,role) values(${String(name).trim()},${cleanEmail},${hash},'client') returning id,name,email,role`;
    const user=rows[0];
    const token=await createSession(user); setSessionCookie(res,token);
    res.status(201).json({ok:true,user});
  }catch(e){console.error(e);res.status(500).json({ok:false,error:'register_failed'});}
}
