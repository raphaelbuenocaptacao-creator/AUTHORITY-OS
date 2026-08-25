import { cors } from './_cors.js';

function parseBody(req){
  if(!req.body) return {};
  if(typeof req.body==='string'){
    try{return JSON.parse(req.body)}catch{return {}}
  }
  return req.body;
}

function demo(input={}){
  const score=68;
  return {
    ok:true,
    provider:'demo',
    demo:true,
    audit:{
      score,
      positioning:72,
      clarity:70,
      credibility:64,
      conversion:58,
      consistency:66,
      diagnosis:'A base está boa, mas a proposta de valor e o caminho para iniciar uma conversa ainda podem ficar mais claros.',
      strengths:['Boa oportunidade de posicionamento local','Perfil pode se apoiar mais em opinião própria e prova social'],
      priorities:['Reescrever bio com público + transformação + prova','Fixar 3 conteúdos de autoridade','Adicionar CTA recorrente para conversa'],
      bioSuggestion:`${input.business||'Profissional'} em ${input.city||'sua cidade'} | Ajudo ${input.audience||'meu público'} com clareza, experiência e estratégia. ↓ Fale comigo`,
      nextActions:['Atualizar bio','Criar 1 Reel de posicionamento','Publicar 1 prova social','Medir visitas e directs por 7 dias']
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
  const prompt=`Você é o módulo de auditoria do Authority OS. Analise apenas as informações fornecidas, sem inventar métricas externas.\nAvalie posicionamento, clareza, credibilidade, conversão e consistência de 0 a 100.\nNão prometa crescimento garantido. Gere recomendações específicas e acionáveis.\n\nDADOS:\n${JSON.stringify(input,null,2)}\n\nResponda SOMENTE JSON válido com: score,positioning,clarity,credibility,conversion,consistency,diagnosis,strengths,priorities,bioSuggestion,nextActions.`;

  try{
    const response=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{temperature:.45,responseMimeType:'application/json'}})});
    if(!response.ok){
      const errorText=await response.text();
      console.error('Gemini audit error',response.status,errorText);
      return res.status(502).json({ok:false,error:'AI provider error'});
    }
    const data=await response.json();
    const text=data?.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('')||'{}';
    let parsed;
    try{parsed=JSON.parse(text)}catch{parsed={diagnosis:text}}
    return res.status(200).json({ok:true,provider:'gemini',audit:parsed});
  }catch(error){
    console.error(error);
    return res.status(500).json({ok:false,error:'Internal server error'});
  }
}
