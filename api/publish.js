import { cors } from './_cors.js';

function parseBody(req){
  if(!req.body) return {};
  if(typeof req.body==='string'){
    try{return JSON.parse(req.body)}catch{return {}}
  }
  return req.body;
}

export default async function handler(req,res){
  if(cors(req,res)) return;
  if(req.method!=='POST') return res.status(405).json({ok:false,error:'Method not allowed'});

  const body=parseBody(req);
  const {approved,channels=[],content,scheduledFor=null}=body;

  if(!approved){
    return res.status(400).json({ok:false,error:'Human approval required'});
  }
  if(!content){
    return res.status(400).json({ok:false,error:'Content required'});
  }
  if(!Array.isArray(channels)||channels.length===0){
    return res.status(400).json({ok:false,error:'At least one channel is required'});
  }

  if(!process.env.N8N_WEBHOOK_URL){
    return res.status(200).json({
      ok:true,
      demo:true,
      status:'approved-demo',
      channels,
      scheduledFor,
      message:'Conteúdo aprovado. Configure N8N_WEBHOOK_URL para publicar de verdade.'
    });
  }

  try{
    const response=await fetch(process.env.N8N_WEBHOOK_URL,{
      method:'POST',
      headers:{
        'content-type':'application/json',
        ...(process.env.N8N_WEBHOOK_TOKEN?{authorization:`Bearer ${process.env.N8N_WEBHOOK_TOKEN}`}:{})
      },
      body:JSON.stringify({
        source:'authority-os',
        action:'publish-approved-content',
        receivedAt:new Date().toISOString(),
        channels,
        scheduledFor,
        content
      })
    });

    const text=await response.text();
    let data;
    try{data=JSON.parse(text)}catch{data={message:text}}
    return res.status(response.ok?200:502).json({ok:response.ok,upstreamStatus:response.status,data});
  }catch(error){
    console.error(error);
    return res.status(500).json({ok:false,error:'Publishing gateway error'});
  }
}
