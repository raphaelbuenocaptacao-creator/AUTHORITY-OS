import bcrypt from 'bcryptjs';
import { cors } from '../_cors.js';
import { requireDb } from '../_db.js';
import { createSession,setSessionCookie } from '../_auth.js';

function slugify(value){return String(value||'workspace').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,36)||'workspace';}

export default async function handler(req,res){
  if(cors(req,res)) return;
  if(req.method!=='POST') return res.status(405).json({ok:false,error:'method_not_allowed'});
  const sql=requireDb(res); if(!sql) return;
  const {name,email,password}=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
  const cleanEmail=String(email||'').trim().toLowerCase();
  const cleanName=String(name||'').trim();
  if(!cleanName||!cleanEmail||String(password||'').length<8) return res.status(400).json({ok:false,error:'invalid_input'});
  try{
    const exists=await sql`select id from users where email=${cleanEmail} limit 1`;
    if(exists.length) return res.status(409).json({ok:false,error:'email_in_use'});
    const hash=await bcrypt.hash(String(password),12);
    const suffix=Math.random().toString(36).slice(2,7);
    const workspaceSlug=`${slugify(cleanName)}-${suffix}`;
    let user,workspace;
    await sql.begin(async tx=>{
      [user]=await tx`insert into users(name,email,password_hash,role) values(${cleanName},${cleanEmail},${hash},'client') returning id,name,email,role`;
      [workspace]=await tx`insert into workspaces(name,slug,owner_user_id) values(${cleanName},${workspaceSlug},${user.id}) returning id,name,slug`;
      await tx`insert into workspace_members(workspace_id,user_id,role) values(${workspace.id},${user.id},'owner')`;
      await tx`insert into brand_profiles(workspace_id,display_name,authority_score) values(${workspace.id},${cleanName},0)`;
    });
    const token=await createSession(user); setSessionCookie(res,token);
    res.status(201).json({ok:true,user,workspace});
  }catch(e){console.error(e);res.status(500).json({ok:false,error:'register_failed'});}
}
