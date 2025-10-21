import { supaAdmin } from "../lib/supabaseClient.js";

interface TicketPayload {
  organization_id: string;
  customer_number: string;
  last_message: string;
}

export async function createOrFindOpenTicket(payload: TicketPayload) {
  const { organization_id, customer_number, last_message } = payload;

  // 1) verifica se já existe ticket aberto
  const { data: existing } = await supaAdmin
    .from("tickets")
    .select("*")
    .eq("organization_id", organization_id)
    .eq("customer_number", customer_number)
    .in("status", ["waiting", "in_progress"])
    .maybeSingle();

  // 2) se existir → atualiza last_message e retorna
  if (existing) {
    await supaAdmin
      .from("tickets")
      .update({ last_message })
      .eq("id", existing.id);

    return { ...existing, last_message };
  }

  // 3) se não existir → cria novo ticket com status `waiting`
  const { data: inserted } = await supaAdmin
    .from("tickets")
    .insert({
      organization_id,
      customer_number,
      status: "waiting",
      last_message,
      assigned_to: null,
    })
    .select()
    .single();

  return inserted!;
}
