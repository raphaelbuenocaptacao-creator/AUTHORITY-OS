import { cors } from '../_cors.js';
import { getSession } from '../_auth.js';

export default async function handler(req,res){
  if(cors(req,res)) return;
  if(req.method!=='GET') return res.status(405).json({ok:false,error:'method_not_allowed'});
  const session=await getSession(req);
  if(!session) return res.status(200).json({ok:true,authenticated:false});
  res.status(200).json({ok:true,authenticated:true,user:{id:session.sub,email:session.email,role:session.role}});
}
