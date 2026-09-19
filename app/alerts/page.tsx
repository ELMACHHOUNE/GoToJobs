"use client";

import { useState } from "react";
import { PlusIcon, Trash2Icon, BellIcon, BellOffIcon, Edit2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/empty-state";
import { useStore } from "@/lib/store/store-provider";
import type { JobAlert } from "@/lib/store/schema";
import { cn } from "@/lib/utils";

export default function AlertsPage() {
  const { alerts, createAlert, updateAlert, removeAlert } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<JobAlert | null>(null);
  const [form, setForm] = useState({
    name: "",
    keywords: "",
    location: "",
    minMatchPercent: 75,
    frequency: "daily" as "daily" | "weekly",
    enabled: true,
  });

  const resetForm = () => {
    setForm({ name: "", keywords: "", location: "", minMatchPercent: 75, frequency: "daily", enabled: true });
    setEditing(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const keywords = form.keywords.split(",").map((k) => k.trim()).filter(Boolean);
    if (editing) {
      updateAlert(editing.id, { ...form, keywords, updatedAt: new Date().toISOString() });
    } else {
      createAlert({ ...form, keywords });
    }
    resetForm();
    setOpen(false);
  };

  const handleEdit = (alert: JobAlert) => {
    setEditing(alert);
    setForm({
      name: alert.name,
      keywords: alert.keywords.join(", "),
      location: alert.location,
      minMatchPercent: alert.minMatchPercent,
      frequency: alert.frequency,
      enabled: alert.enabled,
    });
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this alert?")) removeAlert(id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BellIcon className="h-6 w-6" />
          Job Alerts
        </h1>
        <Button onClick={() => { resetForm(); setOpen(true); }}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create alert
        </Button>
      </div>

      {alerts.length === 0 ? (
        <EmptyState
          title="No alerts configured"
          description="Create an alert to monitor new opportunities matching your criteria."
          variant="alerts"
        />
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{alert.name}</CardTitle>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {alert.keywords.length > 0 && (
                        <Badge variant="outline">Keywords: {alert.keywords.join(", ")}</Badge>
                      )}
                      {alert.location && <Badge variant="secondary">Location: {alert.location}</Badge>}
                      <Badge variant={alert.minMatchPercent >= 80 ? "default" : "outline"}>
                        Min match: {alert.minMatchPercent}%
                      </Badge>
                      <Badge variant="outline">{alert.frequency}</Badge>
                      <Badge variant={alert.enabled ? "default" : "secondary"} className={cn(alert.enabled ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "")}>
                        {alert.enabled ? <BellIcon className="mr-1 h-3 w-3" /> : <BellOffIcon className="mr-1 h-3 w-3" />}
                        {alert.enabled ? "Active" : "Paused"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(alert)}>
                  <Edit2Icon className="mr-1 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => updateAlert(alert.id, { enabled: !alert.enabled })}>
                  {alert.enabled ? "Pause" : "Resume"}
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(alert.id)}>
                  <Trash2Icon className="mr-1 h-4 w-4" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit alert" : "Create new alert"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Alert name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Frontend Remote Jobs" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                <Input id="keywords" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="React, Next.js, TypeScript" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Remote, Morocco, Casablanca" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="minMatchPercent">Minimum match %</Label>
                <Input id="minMatchPercent" type="number" min="0" max="100" value={form.minMatchPercent} onChange={(e) => setForm({ ...form, minMatchPercent: parseInt(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Frequency</Label>
                <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v as "daily" | "weekly" })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="enabled">Enabled</Label>
                <Switch id="enabled" checked={form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button type="submit">{editing ? "Save changes" : "Create alert"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}