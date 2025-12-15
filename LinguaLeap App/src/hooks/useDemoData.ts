import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useDemoData() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile && profile.total_conversations === 0) {
      createDemoMatch();
    }
  }, [profile]);

  async function createDemoMatch() {
    if (!profile) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('create_demo_match_for_user', {
        target_user_id: profile.id,
      });

      if (error) {
        console.error('Error creating demo match:', error);
      }
    } catch (err) {
      console.error('Failed to create demo match:', err);
    } finally {
      setLoading(false);
    }
  }

  return { loading, createDemoMatch };
}
