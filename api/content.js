import { cors } from './_cors.js';

function parseBody(req){
  if(!req.body) return {};
  if(typeof req.body==='string'){
    try{return JSON.parse(req.body)}catch{return {}}
  }
  return req.body;
}

function demo(input={}){
  const format=input.format||'Reel';
  const theme=input.theme||'autoridade profissional';
  const city=input.city||'sua cidade';
  return {
    ok:true,
    provider:'demo',
    demo:true,
    content:{
      format,
      title:`${theme}: uma visão prática para ${city}`,
      hook:`Se você atua em ${city}, preste atenção nisso antes de tomar sua próxima decisão.`,
      script:`Abra com uma opinião clara sobre ${theme}.\nMostre um exemplo real ou bastidor.\nExplique o que a maioria faz errado.\nEntregue uma orientação simples e aplicável.\nFeche conectando o tema ao seu posicionamento profissional.`,
      caption:`Uma boa presença digital começa quando sua mensagem fica clara. Hoje eu quis trazer uma visão prática sobre ${theme} e como isso impacta quem atua em ${city}.`,
      cta:'Se isso fez sentido, me chama no direct e me conta como você enxerga esse tema.',
      objective:input.objective||'Autoridade'
    }
  };
}

export default async function handler(req,res){
  if(cors(req,res)) return;
  if(req.method!=='POST') return res.status(405).json({ok:false,error:'Method not allowed'});

  const input=parseBody(req);
  if(!process.env.GEMINI_API_KEY) return res.status(200).json(demo(input));

  const model=process.env.GEMINI_MODEL||'gemini-2.5-flash';
  const url=`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
  const prompt=`Você é o Content Studio do Authority OS. Crie conteúdo profissional em português do Brasil.\nNão prometa resultados garantidos. Não use spam ou táticas enganosas.\nUse o contexto do cliente para produzir uma peça específica, clara e pronta para uso.\n\nCONTEXTO:\n${JSON.stringify(input,null,2)}\n\nResponda SOMENTE JSON válido com: format,title,hook,script,caption,cta,objective.`;

  try{
    const response=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{temperature:.72,responseMimeType:'application/json'}})});
    if(!response.ok){
      const errorText=await response.text();
      console.error('Gemini content error',response.status,errorText);
      return res.status(502).json({ok:false,error:'AI provider error'});
    }
    const data=await response.json();
    const text=data?.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('')||'{}';
    let parsed;
    try{parsed=JSON.parse(text)}catch{parsed={script:text}}
    return res.status(200).json({ok:true,provider:'gemini',content:parsed});
  }catch(error){
    console.error(error);
    return res.status(500).json({ok:false,error:'Internal server error'});
  }
}
