export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          phone?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          phone?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          phone?: string;
          created_at?: string;
        };
      };
    };
  };
};
