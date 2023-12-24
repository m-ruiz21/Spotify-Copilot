"use server"

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!;

export default class SupaBaseClientSingleton {
  private static instance: SupabaseClient | null = null;

  public static getInstance(): SupabaseClient {
    if (!this.instance) {
      this.instance = createClient(
        SUPABASE_URL, SUPABASE_KEY
      );
    }

    return this.instance;
  }
}