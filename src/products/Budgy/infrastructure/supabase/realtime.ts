import { requireSupabase } from "./client";

const realtimeTables = ["budget_months","income_sources","categories","budget_items","transactions","financial_accounts","savings_goals","scenarios","activity_events"];

export const subscribeToHousehold = (householdId: string, onChange: () => void) => {
  const client = requireSupabase();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const channel = client.channel(`budgy-household-${householdId}`);
  realtimeTables.forEach((table) => channel.on("postgres_changes", { event: "*", schema: "public", table, filter: `household_id=eq.${householdId}` }, () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(onChange, 180);
  }));
  channel.subscribe();
  return () => { if(timer)clearTimeout(timer); void client.removeChannel(channel); };
};
