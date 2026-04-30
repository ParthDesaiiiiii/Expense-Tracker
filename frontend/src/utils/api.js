export async function getRecommendations(payload){
  try{
    const res = await fetch('http://localhost:4000/api/recommendations',{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)
    })
    return await res.json()
  }catch(err){
    console.error(err)
    return { error: 'Failed to fetch recommendations' }
  }
}
