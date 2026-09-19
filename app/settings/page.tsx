"use client";

import { useTheme } from "@/components/theme-provider";
import { useStore } from "@/lib/store/store-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export default function () {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { clearAll, load, persist, profile, savedJobs, applications, alerts } = useStore();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how GoToJobs looks on your device.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">Choose your preferred color scheme.</p>
            </div>
            <div className="flex gap-2">
              {["light", "dark", "system"].map((t) => (
                <Button
                  key={t}
                  variant={theme === t ? "default" : "outline"}
                  onClick={() => setTheme(t as "light" | "dark" | "system")}
                  className="capitalize"
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Reduced motion</Label>
              <p className="text-sm text-muted-foreground">Minimize animations and transitions.</p>
            </div>
            <Switch id="reduced-motion" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage your notification preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { id: "email-job-alerts", label: "Job alert emails", description: "Receive email when new matching jobs are found." },
            { id: "email-application-updates", label: "Application updates", description: "Get notified when application status changes." },
            { id: "email-weekly-digest", label: "Weekly digest", description: "Summary of new jobs matching your profile." },
            { id: "push-notifications", label: "Push notifications", description: "Browser notifications for important updates." },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor={item.id}>{item.label}</Label>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <Switch id={item.id} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>Irreversible actions. Proceed with caution.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Clear all local data</Label>
              <p className="text-sm text-muted-foreground">Remove all saved jobs, applications, alerts, and profile from this browser. This cannot be undone.</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Clear all data</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your saved jobs, application history, job alerts, and profile data from this browser. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearAll}>Clear all data</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Export data</Label>
              <p className="text-sm text-muted-foreground">Download your profile, saved jobs, and applications as JSON.</p>
            </div>
            <Button variant="outline" onClick={() => {
              const store = { profile, savedJobs, applications, alerts };
              const blob = new Blob([JSON.stringify(store, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `gotojobs-backup-${new Date().toISOString().split("T")[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}>
              Export JSON
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Sync with cloud</Label>
              <p className="text-sm text-muted-foreground">Not available in demo mode. Requires authentication.</p>
            </div>
            <Button variant="outline" disabled>Sync now</Button>
          </div>
</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>GoToJobs v0.1.0 (Demo)</p>
          <p>Built with Next.js 16, TypeScript, Tailwind CSS, shadcn/ui</p>
          <p>Job data: Demo/mock data only</p>
          <p>Matching algorithm: Deterministic, transparent scoring</p>
        </CardContent>
      </Card>
    </div>
  );
}