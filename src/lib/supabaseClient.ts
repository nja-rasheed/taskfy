"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// remove Database type for now (optional)
export const supabase = createClientComponentClient();
