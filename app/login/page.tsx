"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const { data: session, status, update } = useSession();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" && session) {
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard/dictate";
      const redirectUrl = callbackUrl.startsWith("http")
        ? callbackUrl
        : `${globalThis.location.origin}${callbackUrl}`;
      globalThis.location.replace(redirectUrl);
    }
  }, [status, session, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard/dictate";
      
      // Use redirect: false to handle errors properly
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        toast({
          title: "Error",
          description: "Invalid email or password",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Update session to ensure it's available
      await update();
      
      // Small delay to ensure cookies are set
      await new Promise((resolve) => setTimeout(resolve, 200));
      
      // Construct absolute URL if callbackUrl is relative
      const redirectUrl = callbackUrl.startsWith("http")
        ? callbackUrl
        : `${globalThis.location.origin}${callbackUrl}`;
      
      // Use replace instead of href to avoid adding to history
      // This ensures a clean redirect in production
      globalThis.location.replace(redirectUrl);
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">Don&apos;t have an account? </span>
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Loading...</CardDescription>
          </CardHeader>
        </Card>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}

