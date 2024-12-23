import type { RequestHandler } from '@sveltejs/kit';
import type { ListeningDataReqPerams } from "../../../../../lib/ListeningDataReqPerams";


export const POST: RequestHandler = async ({ locals: { supabase, session }, request }) => {
  let body = (await request.json())
  console.log(body)
  if (session !== null) {
    const reqBody = {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.strinzify(body)
    }
    console.log(reqBody)

    const { data, error } = await supabase.functions.invoke("get-user-data", reqBody);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {})
    }
    return new Response(JSON.stringify(data), {})
  }
  return new Response(JSON.stringify({ error: "User does not have session." }), {})
}