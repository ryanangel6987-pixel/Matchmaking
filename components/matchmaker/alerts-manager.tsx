"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CustomSelect } from "@/components/ui/custom-select";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface AlertsManagerProps {
  clientId: string;
  alerts: any[];
}

const alertTypeOptions = [
  "photo_approval",
  "account_issue",
  "onboarding_incomplete",
  "date_opportunity",
  "action_assigned",
  "system_note",
  "credential_issue",
  "account_verification",
] as const;

const alertTypeIcons: Record<string, string> = {
  photo_approval: "photo_camera",
  account_issue: "warning",
  onboarding_incomplete: "assignment_late",
  date_opportunity: "favorite",
  action_assigned: "task_alt",
  system_note: "info",
  credential_issue: "lock",
  account_verification: "verified_user",
};

const alertTypeColors: Record<string, string> = {
  photo_approval: "text-gold",
  account_issue: "text-error-red",
  onboarding_incomplete: "text-gold",
  date_opportunity: "text-pink-400",
  action_assigned: "text-gold",
  system_note: "text-on-surface-variant",
  credential_issue: "text-error-red",
  account_verification: "text-green-400",
};

export function AlertsManager({
  clientId,
  alerts,
}: AlertsManagerProps) {
  const router = useRouter();
  const supabase = createClient();

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [alertType, setAlertType] = useState<string>("system_note");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const resetForm = () => {
    setAlertType("system_note");
    setTitle("");
    setMessage("");
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: insertError } = await supabase.from("alerts").insert({
      client_id: clientId,
      alert_type: alertType,
      title,
      message: message || null,
      read: false,
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      resetForm();
      setShowForm(false);
      router.refresh();
    }
    setLoading(false);
  };

  const handleToggleRead = async (alertId: string, currentRead: boolean) => {
    await supabase
      .from("alerts")
      .update({ read: !currentRead })
      .eq("id", alertId);
    router.refresh();
  };

  const handleDelete = async (alertId: string) => {
    if (!confirm("Delete this alert? This cannot be undone.")) return;
    await supabase.from("alerts").delete().eq("id", alertId);
    router.refresh();
  };

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined text-2xl text-gold"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            notifications
          </span>
          <h2 className="font-heading text-xl font-bold text-on-surface">
            Alerts
          </h2>
          <span className="text-on-surface-variant text-sm">
            ({alerts.length})
          </span>
          {unreadCount > 0 && (
            <Badge className="bg-gold/20 text-gold border-gold/30 text-[9px] uppercase tracking-widest">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gold-gradient text-on-gold font-semibold rounded-full"
        >
          {showForm ? "Cancel" : "+ Create Alert"}
        </Button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-surface-container-low p-8 rounded-2xl shadow-xl space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gold text-xs uppercase tracking-wider">
                Alert Type *
              </Label>
              <CustomSelect
                value={alertType}
                onChange={(v) => setAlertType(v)}
                options={alertTypeOptions.map((type) => ({ value: type, label: type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) }))}
                className="w-full h-10 rounded-md bg-surface-container border border-outline-variant/20 text-on-surface px-3 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gold text-xs uppercase tracking-wider">
                Title *
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Profile photos need review"
                className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-gold text-xs uppercase tracking-wider">
              Message
            </Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Additional details..."
              rows={2}
              className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline"
            />
          </div>

          {error && <p className="text-error-red text-sm">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full gold-gradient text-on-gold font-semibold rounded-full h-12"
          >
            {loading ? "Creating..." : "Create Alert"}
          </Button>
        </form>
      )}

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="bg-surface-container-low p-8 rounded-2xl text-center">
          <p className="text-on-surface-variant/60 text-sm">
            No alerts yet. Create one to notify the client.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const icon = alertTypeIcons[alert.alert_type] ?? "notifications";
            const iconColor = alertTypeColors[alert.alert_type] ?? "text-gold";
            const isUnread = !alert.read;

            return (
              <div
                key={alert.id}
                className={`bg-surface-container-low p-5 rounded-2xl relative overflow-hidden group transition-all ${
                  isUnread ? "border-l-2 border-l-gold" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <span
                    className={`material-symbols-outlined text-xl mt-0.5 ${iconColor}`}
                    style={{ fontVariationSettings: `'FILL' ${isUnread ? 1 : 0}, 'wght' 300` }}
                  >
                    {icon}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-heading text-sm font-bold ${isUnread ? "text-on-surface" : "text-on-surface-variant"}`}>
                        {alert.title}
                      </h3>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-gold shrink-0" />
                      )}
                    </div>
                    {alert.message && (
                      <p className="text-on-surface-variant text-xs mt-1 leading-relaxed">
                        {alert.message}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <Badge
                        variant="outline"
                        className="text-[9px] uppercase tracking-widest border-outline-variant/20 text-outline"
                      >
                        {alert.alert_type.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-outline text-[10px]">
                        {new Date(alert.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleRead(alert.id, alert.read)}
                      className="text-gold/60 hover:text-gold transition-colors p-1"
                      title={isUnread ? "Mark as read" : "Mark as unread"}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isUnread ? "mark_email_read" : "mark_email_unread"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(alert.id)}
                      className="text-error-red/60 hover:text-error-red transition-colors p-1"
                      title="Delete alert"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
