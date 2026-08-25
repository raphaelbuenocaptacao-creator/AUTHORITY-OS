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
    const rows=await sql`select id,platform,format,title,hook,body,cta,objective,status,scheduled_for,published_at,metrics,created_at from content_items where workspace_id=${workspaceId} order by created_at desc limit 100`;
    return res.status(200).json({ok:true,items:rows});
  }
  if(req.method==='POST'){
    const b=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
    const [row]=await sql`insert into content_items(workspace_id,platform,format,title,hook,body,cta,objective,status,scheduled_for,metrics) values(${workspaceId},${b.platform||null},${b.format||b.type||null},${String(b.title||b.theme||'Conteúdo').trim()},${b.hook||null},${b.body||b.copy||null},${b.cta||null},${b.objective||null},${b.status||'draft'},${b.scheduled_for||null},${sql.json(b.metrics||{})}) returning *`;
    return res.status(201).json({ok:true,item:row});
  }
  res.status(405).json({ok:false,error:'method_not_allowed'});
}
