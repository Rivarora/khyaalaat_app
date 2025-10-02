export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          name: string | null
          photo: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email?: string | null
          name?: string | null
          photo?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          name?: string | null
          photo?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      poetry: {
        Row: {
          id: string
          title: string
          caption: string | null
          poem: string
          genre: 'Love' | 'Sad' | 'Motivational' | 'Nature' | 'Other'
          image_url: string | null
          image_description: string | null
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          caption?: string | null
          poem: string
          genre: 'Love' | 'Sad' | 'Motivational' | 'Nature' | 'Other'
          image_url?: string | null
          image_description?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          caption?: string | null
          poem?: string
          genre?: 'Love' | 'Sad' | 'Motivational' | 'Nature' | 'Other'
          image_url?: string | null
          image_description?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'poetry_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      poetry_likes: {
        Row: {
          id: string
          poetry_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          poetry_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          poetry_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'poetry_likes_poetry_id_fkey'
            columns: ['poetry_id']
            isOneToOne: false
            referencedRelation: 'poetry'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'poetry_likes_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      poetry_comments: {
        Row: {
          id: string
          poetry_id: string
          user_id: string
          text: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          poetry_id: string
          user_id: string
          text: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          poetry_id?: string
          user_id?: string
          text?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'poetry_comments_poetry_id_fkey'
            columns: ['poetry_id']
            isOneToOne: false
            referencedRelation: 'poetry'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'poetry_comments_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      poem_requests: {
        Row: {
          id: string
          name: string
          topic: string
          genre: 'Love' | 'Sad' | 'Motivational' | 'Nature'
          mood: string
          description: string
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          topic: string
          genre: 'Love' | 'Sad' | 'Motivational' | 'Nature'
          mood: string
          description: string
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          topic?: string
          genre?: 'Love' | 'Sad' | 'Motivational' | 'Nature'
          mood?: string
          description?: string
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      genre_type: 'Love' | 'Sad' | 'Motivational' | 'Nature' | 'Other'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never