"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link as LinkIcon } from "lucide-react";

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/jobs";
  const error = searchParams.get("error");

  const handleSignIn = async () => {
    await signIn("linkedin", { callbackUrl });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <LinkIcon className="h-7 w-7 text-primary" />
        </div>
        <CardTitle className="text-2xl">Sign in to GoToJobs</CardTitle>
        <CardDescription>
          Connect with LinkedIn to access personalized job recommendations and save your favorite positions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error === "Callback" ? "Authentication failed. Please try again." : `Error: ${error}`}
          </div>
        )}
        <Button
          className="w-full gap-2"
          onClick={handleSignIn}
          disabled={!!error}
        >
          <LinkIcon className="h-5 w-5" />
          Continue with LinkedIn
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center text-xs text-muted-foreground">
        <span>No account? </span>
        <a href="https://www.linkedin.com/signup" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          Join LinkedIn
        </a>
      </CardFooter>
    </Card>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Suspense fallback={null}>
        <SignInContent />
      </Suspense>
    </div>
  );
}