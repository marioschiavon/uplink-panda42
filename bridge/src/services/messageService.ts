import { supaAdmin } from "../lib/supabaseClient.js";

interface MessagePayload {
  ticket_id: string;
  organization_id: string;
  text: string;
}

export async function createCustomerMessage(payload: MessagePayload) {
  const { ticket_id, organization_id, text } = payload;

  const { data: inserted } = await supaAdmin
    .from("messages")
    .insert({
      ticket_id,
      organization_id,
      sender: "customer",
      text,
    })
    .select()
    .single();

  return inserted!;
}
