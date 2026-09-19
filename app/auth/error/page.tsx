"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "Access was denied. You may have canceled the sign-in process.",
  Verification: "The verification link has expired or has already been used.",
  OAuthSignin: "Error starting the OAuth sign-in process.",
  OAuthCallback: "Error in the OAuth callback handler.",
  OAuthCreateAccount: "Could not create OAuth account.",
  EmailCreateAccount: "Could not create email account.",
  Callback: "Error in the OAuth callback handler.",
  OAuthAccountNotLinked: "This email is already associated with another account.",
  EmailSignin: "Error sending the email sign-in link.",
  CredentialsSignin: "Sign in failed. Check your credentials.",
  SessionRequired: "Please sign in to access this page.",
  Default: "An authentication error occurred.",
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Unknown error";
  const message = errorMessages[error] || errorMessages.Default;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-7 w-7 text-destructive" />
        </div>
        <CardTitle className="text-2xl">Authentication Error</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md bg-muted p-3 text-sm font-mono text-muted-foreground">
          Error code: {error}
        </div>
        <div className="flex flex-col gap-2">
          <Button className="w-full gap-2" asChild>
            <Link href="/auth/signin">
              <ArrowLeft className="h-4 w-4" />
              Try Again
            </Link>
          </Button>
          <Button variant="outline" className="w-full gap-2" asChild>
            <Link href="/jobs">
              <ArrowLeft className="h-4 w-4" />
              Back to Jobs
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Suspense fallback={null}>
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}