import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password?: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, userData: Partial<Profile>) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('mock_user');
    const storedProfile = localStorage.getItem('mock_profile');

    if (storedUser && storedProfile) {
      setUser(JSON.parse(storedUser));
      setProfile(JSON.parse(storedProfile));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password?: string) => {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (existingProfile) {
        const mockUser = {
          id: existingProfile.id,
          email,
          created_at: existingProfile.created_at,
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
        } as User;

        setUser(mockUser);
        setProfile(existingProfile);
        localStorage.setItem('mock_user', JSON.stringify(mockUser));
        localStorage.setItem('mock_profile', JSON.stringify(existingProfile));
      } else {
        const emailUsername = email.split('@')[0];
        const displayName = emailUsername
          .split(/[._-]/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        const newUserId = crypto.randomUUID();

        const newProfile = {
          id: newUserId,
          email,
          full_name: displayName,
          university: 'Demo University',
          target_language: 'English',
          native_language: 'Spanish',
          created_at: new Date().toISOString(),
        };

        const { error: profileError } = await supabase.from('profiles').insert(newProfile);

        if (profileError) return { error: profileError as Error };

        const mockUser = {
          id: newUserId,
          email,
          created_at: new Date().toISOString(),
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
        } as User;

        setUser(mockUser);
        setProfile(newProfile as Profile);
        localStorage.setItem('mock_user', JSON.stringify(mockUser));
        localStorage.setItem('mock_profile', JSON.stringify(newProfile));
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<Profile>) => {
    try {
      const newUserId = crypto.randomUUID();

      const newProfile = {
        id: newUserId,
        email,
        ...userData,
        created_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabase.from('profiles').insert(newProfile);

      if (profileError) return { error: profileError as Error };

      const mockUser = {
        id: newUserId,
        email,
        created_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
      } as User;

      setUser(mockUser);
      setProfile(newProfile as Profile);
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      localStorage.setItem('mock_profile', JSON.stringify(newProfile));

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('mock_user');
    localStorage.removeItem('mock_profile');
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
