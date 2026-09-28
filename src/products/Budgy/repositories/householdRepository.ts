import { requireSupabase } from "../infrastructure/supabase/client";
import { HouseholdInviteRow, HouseholdMemberRow, HouseholdRow, ProfileRow } from "../infrastructure/supabase/database.types";

export interface HouseholdMembershipSummary { householdId: string; name: string; role: "owner" | "member"; }
export interface HouseholdMember {
  userId: string; displayName: string; email: string; avatarUrl: string | null;
  role: "owner" | "member"; joinedAt: string;
}

export interface HouseholdSession {
  household: HouseholdRow;
  membership: HouseholdMemberRow;
  members: HouseholdMember[];
}

export const householdRepository = {
  async list(): Promise<HouseholdMembershipSummary[]> {
    const client = requireSupabase();
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw userError;
    if (!userData.user) return [];
    const { data: membershipData, error: membershipError } = await client.from("household_members").select("household_id,user_id,role,joined_at").eq("user_id", userData.user.id);
    if (membershipError) throw membershipError;
    const memberships = membershipData as HouseholdMemberRow[];
    if (!memberships.length) return [];
    const { data: households, error } = await client.from("households").select("*").in("id", memberships.map((row) => row.household_id));
    if (error) throw error;
    return memberships.map((row) => ({ householdId: row.household_id, name: (households as HouseholdRow[]).find((household) => household.id === row.household_id)?.name ?? "Household", role: row.role }));
  },
  async current(preferredHouseholdId?: string): Promise<HouseholdSession | null> {
    const client = requireSupabase();
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw userError;
    if (!userData.user) return null;
    let query = client.from("household_members").select("household_id,user_id,role,joined_at").eq("user_id", userData.user.id);
    if (preferredHouseholdId) query = query.eq("household_id", preferredHouseholdId);
    const { data: membershipData, error: membershipError } = await query.limit(1).maybeSingle();
    if (membershipError) throw membershipError;
    if (!membershipData) return preferredHouseholdId ? this.current() : null;
    const membership = membershipData as HouseholdMemberRow;
    const [{ data: householdData, error: householdError }, { data: membersData, error: membersError }] = await Promise.all([
      client.from("households").select("*").eq("id", membership.household_id).single(),
      client.from("household_members").select("household_id,user_id,role,joined_at").eq("household_id", membership.household_id),
    ]);
    if (householdError) throw householdError;
    if (membersError) throw membersError;
    const memberRows = membersData as HouseholdMemberRow[];
    const { data: profilesData, error: profilesError } = await client.from("profiles").select("id,display_name,email,avatar_url").in("id", memberRows.map((entry) => entry.user_id));
    if (profilesError) throw profilesError;
    const profiles = profilesData as Array<Pick<ProfileRow, "id" | "display_name" | "email" | "avatar_url">>;
    const members = memberRows.map((entry) => { const profile = profiles.find((candidate) => candidate.id === entry.user_id); return { userId: entry.user_id, displayName: profile?.display_name ?? "Household member", email: profile?.email ?? "", avatarUrl: profile?.avatar_url ?? null, role: entry.role, joinedAt: entry.joined_at }; });
    return { household: householdData as HouseholdRow, membership, members };
  },
  async create(name: string, displayName: string): Promise<string> {
    const { data, error } = await requireSupabase().rpc("create_household", { household_name: name, member_display_name: displayName });
    if (error) throw error;
    return data as string;
  },
  async createInvite(householdId: string, email: string, tokenHash: string): Promise<void> {
    const { error } = await requireSupabase().rpc("create_household_invite", { target_household: householdId, invite_email: email.toLowerCase().trim(), invite_token_hash: tokenHash });
    if (error) throw error;
  },
  async acceptInvite(tokenHash: string, displayName: string): Promise<string> {
    const { data, error } = await requireSupabase().rpc("accept_household_invite", { invite_token_hash: tokenHash, member_display_name: displayName });
    if (error) throw error;
    return data as string;
  },
  async rename(householdId: string, name: string): Promise<void> {
    const { error } = await requireSupabase().rpc("rename_household", { target_household: householdId, new_name: name.trim() });
    if (error) throw error;
  },
  async updateProfile(displayName: string, avatarUrl: string | null): Promise<void> {
    const { error } = await requireSupabase().rpc("update_my_profile", { new_display_name: displayName.trim(), new_avatar_url: avatarUrl?.trim() || null });
    if (error) throw error;
  },
  async invitations(householdId: string): Promise<HouseholdInviteRow[]> {
    const { data, error } = await requireSupabase().from("household_invites").select("id,household_id,email,role,expires_at,accepted_at,created_at").eq("household_id", householdId).order("created_at", { ascending: false });
    if (error) throw error;
    return data as HouseholdInviteRow[];
  },
  async cancelInvite(inviteId: string): Promise<void> {
    const { error } = await requireSupabase().rpc("cancel_household_invite", { target_invite: inviteId });
    if (error) throw error;
  },
  async removeMember(householdId: string, userId: string): Promise<void> {
    const { error } = await requireSupabase().rpc("remove_household_member", { target_household: householdId, target_user: userId });
    if (error) throw error;
  },
};
