import { cors } from './_cors.js';
import { requireDb } from './_db.js';
import { requireSession } from './_auth.js';

async function workspaceFor(sql,userId){
  const rows=await sql`select w.id from workspaces w left join workspace_members m on m.workspace_id=w.id where w.owner_user_id=${userId} or m.user_id=${userId} order by w.created_at asc limit 1`;
  return rows[0]?.id||null;
}

export default async function handler(req,res){
  if(cors(req,res)) return;
  const session=await requireSession(req,res); if(!session) return;
  const sql=requireDb(res); if(!sql) return;
  const workspaceId=await workspaceFor(sql,session.sub);
  if(!workspaceId) return res.status(404).json({ok:false,error:'workspace_not_found'});
  if(req.method==='GET'){
    const rows=await sql`select * from brand_profiles where workspace_id=${workspaceId} order by created_at asc limit 1`;
    return res.status(200).json({ok:true,profile:rows[0]||null});
  }
  if(req.method==='PUT'||req.method==='POST'){
    const b=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
    const rows=await sql`select id from brand_profiles where workspace_id=${workspaceId} order by created_at asc limit 1`;
    let out;
    if(rows.length){
      [out]=await sql`update brand_profiles set display_name=${String(b.display_name||b.name||'').trim()}, profession=${b.profession||b.business||null}, city=${b.city||null}, audience=${b.audience||null}, offer=${b.offer||null}, objective=${b.objective||b.goal||null}, tone=${b.tone||null}, instagram_handle=${b.instagram_handle||b.instagram||null}, memory=${sql.json(b.memory||{})}, updated_at=now() where id=${rows[0].id} returning *`;
    }else{
      [out]=await sql`insert into brand_profiles(workspace_id,display_name,profession,city,audience,offer,objective,tone,instagram_handle,memory) values(${workspaceId},${String(b.display_name||b.name||'').trim()||'Perfil'},${b.profession||b.business||null},${b.city||null},${b.audience||null},${b.offer||null},${b.objective||b.goal||null},${b.tone||null},${b.instagram_handle||b.instagram||null},${sql.json(b.memory||{})}) returning *`;
    }
    return res.status(200).json({ok:true,profile:out});
  }
  res.status(405).json({ok:false,error:'method_not_allowed'});
}
