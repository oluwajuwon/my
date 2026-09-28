import { ActivityEventRow } from "../infrastructure/supabase/database.types";
import { requireSupabase } from "../infrastructure/supabase/client";

export interface ActivityEvent {
  id: string; actor: string; eventType: string; entityType: string;
  metadata: Record<string, unknown>; createdAt: string;
}
export const activityRepository = {
  async list(householdId: string, limit = 20): Promise<ActivityEvent[]> {
    const client=requireSupabase();
    const { data, error } = await client.from("activity_events").select("*").eq("household_id",householdId).order("created_at",{ascending:false}).limit(limit);
    if(error)throw error;
    const rows=data as ActivityEventRow[];const ids=Array.from(new Set(rows.flatMap((row)=>row.actor_user_id?[row.actor_user_id]:[])));
    const{data:profiles,error:profilesError}=ids.length?await client.from("profiles").select("id,display_name").in("id",ids):{data:[],error:null};if(profilesError)throw profilesError;
    const names=new Map((profiles as Array<{id:string;display_name:string}>).map((profile)=>[profile.id,profile.display_name]));
    return rows.map((row)=>({id:row.id,actor:names.get(row.actor_user_id??"")??"A household member",eventType:row.event_type,entityType:row.entity_type,metadata:row.metadata,createdAt:row.created_at}));
  },
};
