import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.url(),
  
  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.url(),
  
  // OpenAI
  OPENAI_API_KEY: z.string().min(1),
  
  // Environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

let env: Env | null = null;

export function getEnv(): Env {
  if (env) return env;
  
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    throw new Error(
      `Invalid environment variables: ${parsed.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`).join(", ")}`
    );
  }
  
  env = parsed.data;
  return env;
}

