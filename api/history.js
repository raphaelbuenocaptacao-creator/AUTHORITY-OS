import { cors } from './_cors.js';
import { requireDb } from './_db.js';
import { requireSession } from './_auth.js';

async function workspaceFor(sql,userId){
  const rows=await sql`select w.id from workspaces w join workspace_members m on m.workspace_id=w.id where m.user_id=${userId} order by w.created_at asc limit 1`;
  return rows[0]?.id||null;
}

export default async function handler(req,res){
  if(cors(req,res)) return;
  const session=await requireSession(req,res); if(!session) return;
  const sql=requireDb(res); if(!sql) return;
  const workspaceId=await workspaceFor(sql,session.sub);
  if(!workspaceId) return res.status(404).json({ok:false,error:'workspace_not_found'});

  if(req.method==='GET'){
    const rows=await sql`select id,goal,provider,authority_score,payload,created_at from strategies where workspace_id=${workspaceId} order by created_at desc limit 30`;
    return res.status(200).json({ok:true,items:rows});
  }
  if(req.method==='POST'){
    const b=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
    const [row]=await sql`insert into strategies(workspace_id,goal,provider,authority_score,payload) values(${workspaceId},${b.goal||null},${b.provider||null},${Number.isFinite(Number(b.authorityScore))?Number(b.authorityScore):null},${sql.json(b.payload||b)}) returning id,goal,provider,authority_score,created_at`;
    return res.status(201).json({ok:true,item:row});
  }
  res.status(405).json({ok:false,error:'method_not_allowed'});
}
