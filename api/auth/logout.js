import { cors } from '../_cors.js';
import { clearSessionCookie } from '../_auth.js';

export default async function handler(req,res){
  if(cors(req,res)) return;
  if(req.method!=='POST') return res.status(405).json({ok:false,error:'method_not_allowed'});
  clearSessionCookie(res);
  res.status(200).json({ok:true});
}
