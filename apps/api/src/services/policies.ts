export function createPolicyService(supabase: any) {
  async function getActivePolicyJson(policyKey: string) {
    const { data, error } = await supabase.rpc('get_active_policy_json', { p_policy_key: policyKey });
    if (error) throw error;
    return data ?? {};
  }

  async function listPolicies() {
    const { data = [] } = await supabase
      .from('policy_configs')
      .select('*')
      .order('updated_at', { ascending: false });
    return data;
  }

  async function getPolicy(policyKey: string) {
    const { data, error } = await supabase
      .from('policy_configs')
      .select('*')
      .eq('policy_key', policyKey)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    const { data: versions = [] } = await supabase
      .from('policy_versions')
      .select('*')
      .eq('policy_id', data.id)
      .order('version', { ascending: false });

    return {
      ...data,
      versions,
    };
  }

  async function savePolicyDraft(input: {
    policyKey: string;
    scope: string;
    title: string;
    description?: string | null;
    data?: Record<string, unknown>;
    note?: string | null;
    actorEmail?: string | null;
  }) {
    const { data, error } = await supabase.rpc('save_policy_config', {
      p_policy_key: input.policyKey,
      p_scope: input.scope,
      p_title: input.title,
      p_description: input.description ?? null,
      p_data: input.data ?? {},
      p_note: input.note ?? null,
      p_actor_email: input.actorEmail ?? null,
      p_publish: false,
    });
    if (error) throw error;
    return data;
  }

  async function publishPolicy(input: {
    policyKey: string;
    scope: string;
    title: string;
    description?: string | null;
    data?: Record<string, unknown>;
    note?: string | null;
    actorEmail?: string | null;
  }) {
    const { data, error } = await supabase.rpc('save_policy_config', {
      p_policy_key: input.policyKey,
      p_scope: input.scope,
      p_title: input.title,
      p_description: input.description ?? null,
      p_data: input.data ?? {},
      p_note: input.note ?? null,
      p_actor_email: input.actorEmail ?? null,
      p_publish: true,
    });
    if (error) throw error;
    return data;
  }

  async function getFeatureFlags() {
    return getActivePolicyJson('feature_flags');
  }

  return { listPolicies, getPolicy, savePolicyDraft, publishPolicy, getActivePolicyJson, getFeatureFlags };
}
