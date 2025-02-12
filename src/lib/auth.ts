import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function auth() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookieStore = await Promise.resolve(cookies());
          return cookieStore.get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          const cookieStore = await Promise.resolve(cookies());
          try {
            cookieStore.set(name, value, {
              ...options,
              path: options.path || '/',
            });
          } catch (error) {
            // Ignore cookie errors in middleware
          }
        },
        async remove(name: string, options: CookieOptions) {
          const cookieStore = await Promise.resolve(cookies());
          try {
            cookieStore.delete(name, {
              ...options,
              path: options.path || '/',
            });
          } catch (error) {
            // Ignore cookie errors in middleware
          }
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user || error) {
    return null;
  }

  // Get or create user in our database
  const dbUser = await db.user.upsert({
    where: { email: user.email! },
    create: {
      email: user.email!,
      id: user.id,
      name: user.user_metadata.full_name || null,
    },
    update: {
      name: user.user_metadata.full_name || null,
    },
  });

  return {
    user: {
      ...dbUser,
      email: user.email!,
    },
  };
} 