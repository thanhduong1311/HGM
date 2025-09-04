import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database.types";

type SignInCredentials = {
  emailOrPhone: string;
  password: string;
};

type SignUpCredentials = {
  email: string;
  phone?: string;
  password: string;
  fullName: string;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async ({ emailOrPhone, password }: SignInCredentials) => {
    try {
      // Check if input is email or phone
      const isEmail = emailOrPhone.includes("@");

      const credentials = isEmail
        ? { email: emailOrPhone, password }
        : { phone: emailOrPhone, password };

      const { data, error } = await supabase.auth.signInWithPassword(
        credentials
      );

      if (error) {
        if (error.message === "Email not confirmed") {
          throw new Error(
            "Please check your email for the confirmation link before logging in."
          );
        } else if (error.message === "Invalid login credentials") {
          throw new Error("The email or password you entered is incorrect.");
        }
        throw error;
      }

      // Set the session immediately after successful login
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
      }
    } catch (error) {
      throw error;
    }
  };

  const signUp = async ({
    email,
    phone,
    password,
    fullName,
  }: SignUpCredentials) => {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email,
        phone,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      }
    );

    if (signUpError) {
      console.error("Sign up error:", signUpError);
      throw signUpError;
    }

    // Check if email confirmation is required
    if (!signUpData?.session) {
      throw new Error(
        "Please check your email for the confirmation link to complete your registration."
      );
    }

    // Create profile after successful signup
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      // Create profile after successful signup
      const timestamp = new Date().toISOString();
      const profileData: Database["public"]["Tables"]["profiles"]["Insert"] = {
        id: user.id,
        email,
        phone,
        full_name: fullName,
        created_at: timestamp,
        updated_at: timestamp,
        avatar_url: null,
      };
      const { error: profileError } = await supabase
        .from("profiles")
        .insert(profileData);
      if (profileError) throw profileError;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
