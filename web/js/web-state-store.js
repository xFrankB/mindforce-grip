const WEB_STATE_TABLE = 'web_app_state';

function getWebStateClient() {
  if (typeof supabase === 'undefined') {
    return null;
  }

  const url = window.MIND_FORCE_SUPABASE?.url;
  const anonKey = window.MIND_FORCE_SUPABASE?.anonKey;
  if (!url || !anonKey) {
    return null;
  }

  if (!window.__webStateSupabaseClient) {
    window.__webStateSupabaseClient = supabase.createClient(url, anonKey);
  }

  return window.__webStateSupabaseClient;
}

async function webStateGet(key, fallbackValue) {
  const client = getWebStateClient();
  if (!client) {
    return fallbackValue;
  }

  const { data, error } = await client
    .from(WEB_STATE_TABLE)
    .select('state_value')
    .eq('state_key', key)
    .maybeSingle();

  if (error) {
    console.warn(`No se pudo cargar el estado ${key}:`, error.message);
    return fallbackValue;
  }

  if (!data || data.state_value === null || typeof data.state_value === 'undefined') {
    return fallbackValue;
  }

  return data.state_value;
}

async function webStateSet(key, value) {
  const client = getWebStateClient();
  if (!client) {
    return false;
  }

  const { error } = await client
    .from(WEB_STATE_TABLE)
    .upsert(
      {
        state_key: key,
        state_value: value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'state_key' },
    );

  if (error) {
    console.warn(`No se pudo guardar el estado ${key}:`, error.message);
    return false;
  }

  return true;
}
