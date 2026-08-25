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
    const rows=await sql`select platform,captured_on,followers,reach,profile_visits,conversations,opportunities,payload from metric_snapshots where workspace_id=${workspaceId} order by captured_on desc limit 90`;
    return res.status(200).json({ok:true,items:rows});
  }
  if(req.method==='POST'){
    const b=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
    const platform=String(b.platform||'instagram').toLowerCase();
    const capturedOn=b.captured_on||new Date().toISOString().slice(0,10);
    const [row]=await sql`
      insert into metric_snapshots(workspace_id,platform,captured_on,followers,reach,profile_visits,conversations,opportunities,payload)
      values(${workspaceId},${platform},${capturedOn},${b.followers??null},${b.reach??null},${b.profile_visits??b.visits??null},${b.conversations??b.talks??null},${b.opportunities??b.opps??null},${sql.json(b.payload||{})})
      on conflict(workspace_id,platform,captured_on) do update set
        followers=excluded.followers,
        reach=excluded.reach,
        profile_visits=excluded.profile_visits,
        conversations=excluded.conversations,
        opportunities=excluded.opportunities,
        payload=excluded.payload
      returning *`;
    return res.status(200).json({ok:true,item:row});
  }
  res.status(405).json({ok:false,error:'method_not_allowed'});
}
