
const SUPABASE_URL = 'ВСТАВЬ_URL_ПРОЕКТА';
const SUPABASE_ANON_KEY = 'ВСТАВЬ_PUBLISHABLE_KEY';

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

async function initAccount() {
    let { data: { session }, error } = await db.auth.getSession();

    if (error) throw error;

    if (!session) {
        const result = await db.auth.signInAnonymously();

        if (result.error) throw result.error;

        session = result.data.session;
    }

    const { data: profile, error: profileError } = await db
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

    if (profileError) throw profileError;

    if (!profile) {
        const { error: insertError } = await db
            .from('profiles')
            .insert({
                id: session.user.id,
                nickname: 'Игрок_' + session.user.id.slice(0, 6),
                balance: 100
            });

        if (insertError) throw insertError;

        return initAccount();
    }

    return profile;
}
