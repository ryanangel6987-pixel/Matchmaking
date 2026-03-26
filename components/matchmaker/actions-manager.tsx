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
interface ActionsManagerProps {
  clientId: string;
  actions: any[];
  matchmakers: { id: string; full_name: string }[];
}

const priorityOptions = ["low", "medium", "high", "urgent"] as const;
const statusOptions = ["open", "in_progress", "completed", "cancelled"] as const;

const priorityColors: Record<string, string> = {
  urgent: "text-error-red border-error-red/30 bg-error-container/10",
  high: "text-gold border-gold/30 bg-gold/10",
  medium: "text-on-surface-variant border-outline-variant/30",
  low: "text-outline border-outline-variant/20",
};

const statusColors: Record<string, string> = {
  open: "text-gold border-gold/30 bg-gold/10",
  in_progress: "text-on-surface border-outline-variant/30",
  completed: "text-green-400 border-green-400/30 bg-green-400/10",
  cancelled: "text-outline border-outline-variant/20",
};

const statusIcons: Record<string, string> = {
  open: "radio_button_unchecked",
  in_progress: "pending",
  completed: "check_circle",
  cancelled: "cancel",
};

const statusOrder = ["open", "in_progress", "completed", "cancelled"];

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

export function ActionsManager({
  clientId,
  actions,
  matchmakers,
}: ActionsManagerProps) {
  const router = useRouter();
  const supabase = createClient();

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // New action form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>("medium");
  const [status, setStatus] = useState<string>("open");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  // Edit form
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<string>("medium");
  const [editStatus, setEditStatus] = useState<string>("open");
  const [editDueDate, setEditDueDate] = useState("");
  const [editAssignedTo, setEditAssignedTo] = useState("");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setStatus("open");
    setDueDate("");
    setAssignedTo("");
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: insertError } = await supabase.from("actions").insert({
      client_id: clientId,
      title,
      description: description || null,
      priority,
      status,
      due_date: dueDate || null,
      assigned_to: assignedTo || null,
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const startEdit = (action: any) => {
    setEditingId(action.id);
    setEditTitle(action.title ?? "");
    setEditDescription(action.description ?? "");
    setEditPriority(action.priority ?? "medium");
    setEditStatus(action.status ?? "open");
    setEditDueDate(action.due_date ?? "");
    setEditAssignedTo(action.assigned_to ?? "");
  };

  const cancelEdit = () => setEditingId(null);

  const handleSaveEdit = async (actionId: string) => {
    setLoading(true);
    setError("");

    const { error: updateError } = await supabase
      .from("actions")
      .update({
        title: editTitle,
        description: editDescription || null,
        priority: editPriority,
        status: editStatus,
        due_date: editDueDate || null,
        assigned_to: editAssignedTo || null,
      })
      .eq("id", actionId);

    if (updateError) {
      setError(updateError.message);
    } else {
      setEditingId(null);
      router.refresh();
    }
    setLoading(false);
  };

  const handleDelete = async (actionId: string) => {
    if (!confirm("Delete this action? This cannot be undone.")) return;
    await supabase.from("actions").delete().eq("id", actionId);
    router.refresh();
  };

  // Group actions by status, ordered
  const grouped = statusOrder.map((s) => ({
    status: s,
    items: actions.filter((a) => a.status === s),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined text-2xl text-gold"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            task_alt
          </span>
          <h2 className="font-heading text-xl font-bold text-on-surface">
            Actions
          </h2>
          <span className="text-on-surface-variant text-sm">
            ({actions.length})
          </span>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gold-gradient text-on-gold font-semibold rounded-full"
        >
          {showForm ? "Cancel" : "+ Add Action"}
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
                Title *
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Update profile photos"
                className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gold text-xs uppercase tracking-wider">
                Assigned To
              </Label>
              <CustomSelect
                value={assignedTo}
                onChange={(v) => setAssignedTo(v)}
                options={[{ value: "", label: "Unassigned" }, ...matchmakers.map((m) => ({ value: m.id, label: m.full_name }))]}
                placeholder="Unassigned"
                className="w-full h-10 rounded-md bg-surface-container border border-outline-variant/20 text-on-surface px-3 text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-gold text-xs uppercase tracking-wider">
              Description
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details about this action..."
              rows={2}
              className="bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-outline"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gold text-xs uppercase tracking-wider">
                Priority
              </Label>
              <CustomSelect
                value={priority}
                onChange={(v) => setPriority(v)}
                options={priorityOptions.map((p) => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))}
                className="w-full h-10 rounded-md bg-surface-container border border-outline-variant/20 text-on-surface px-3 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gold text-xs uppercase tracking-wider">
                Status
              </Label>
              <CustomSelect
                value={status}
                onChange={(v) => setStatus(v)}
                options={statusOptions.map((s) => ({ value: s, label: s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) }))}
                className="w-full h-10 rounded-md bg-surface-container border border-outline-variant/20 text-on-surface px-3 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gold text-xs uppercase tracking-wider">
                Due Date
              </Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-surface-container border-outline-variant/20 text-on-surface"
              />
            </div>
          </div>

          {error && <p className="text-error-red text-sm">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full gold-gradient text-on-gold font-semibold rounded-full h-12"
          >
            {loading ? "Adding..." : "Add Action"}
          </Button>
        </form>
      )}

      {/* Actions List — grouped by status */}
      {actions.length === 0 ? (
        <div className="bg-surface-container-low p-8 rounded-2xl text-center">
          <p className="text-on-surface-variant/60 text-sm">
            No actions yet. Add one to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <div key={group.status} className="space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-lg text-on-surface-variant"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                >
                  {statusIcons[group.status] ?? "circle"}
                </span>
                <h3 className="text-on-surface-variant text-xs uppercase tracking-widest">
                  {group.status.replace(/_/g, " ")}
                </h3>
                <span className="text-outline text-xs">({group.items.length})</span>
              </div>

              {group.items.map((action) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const assigneeName = (action.assignee as any)?.full_name;
                const overdue = isOverdue(action.due_date) && action.status !== "completed" && action.status !== "cancelled";

                return (
                  <div
                    key={action.id}
                    className="bg-surface-container-low p-5 rounded-2xl space-y-3 relative overflow-hidden group"
                  >
                    <div
                      className={`absolute top-0 left-0 w-1 h-full transition-opacity duration-500 ${
                        action.priority === "urgent"
                          ? "bg-error-red opacity-80"
                          : action.priority === "high"
                            ? "bg-gold opacity-60"
                            : "bg-gold opacity-20 group-hover:opacity-60"
                      }`}
                    />

                    {editingId === action.id ? (
                      /* Inline Edit Form */
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-gold text-xs uppercase tracking-wider">
                              Title *
                            </Label>
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              required
                              className="bg-surface-container border-outline-variant/20 text-on-surface"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gold text-xs uppercase tracking-wider">
                              Assigned To
                            </Label>
                            <CustomSelect
                              value={editAssignedTo}
                              onChange={(v) => setEditAssignedTo(v)}
                              options={[{ value: "", label: "Unassigned" }, ...matchmakers.map((m) => ({ value: m.id, label: m.full_name }))]}
                              placeholder="Unassigned"
                              className="w-full h-10 rounded-md bg-surface-container border border-outline-variant/20 text-on-surface px-3 text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gold text-xs uppercase tracking-wider">
                            Description
                          </Label>
                          <Textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            rows={2}
                            className="bg-surface-container border-outline-variant/20 text-on-surface"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-gold text-xs uppercase tracking-wider">
                              Priority
                            </Label>
                            <CustomSelect
                              value={editPriority}
                              onChange={(v) => setEditPriority(v)}
                              options={priorityOptions.map((p) => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))}
                              className="w-full h-10 rounded-md bg-surface-container border border-outline-variant/20 text-on-surface px-3 text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gold text-xs uppercase tracking-wider">
                              Status
                            </Label>
                            <CustomSelect
                              value={editStatus}
                              onChange={(v) => setEditStatus(v)}
                              options={statusOptions.map((s) => ({ value: s, label: s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) }))}
                              className="w-full h-10 rounded-md bg-surface-container border border-outline-variant/20 text-on-surface px-3 text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gold text-xs uppercase tracking-wider">
                              Due Date
                            </Label>
                            <Input
                              type="date"
                              value={editDueDate}
                              onChange={(e) => setEditDueDate(e.target.value)}
                              className="bg-surface-container border-outline-variant/20 text-on-surface"
                            />
                          </div>
                        </div>
                        {error && <p className="text-error-red text-sm">{error}</p>}
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleSaveEdit(action.id)}
                            disabled={loading}
                            className="gold-gradient text-on-gold font-semibold rounded-full"
                          >
                            {loading ? "Saving..." : "Save"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={cancelEdit}
                            className="rounded-full border-outline-variant/30 text-on-surface-variant"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Display Mode */
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <h3 className="font-heading text-lg font-bold text-on-surface">
                              {action.title}
                            </h3>
                            <Badge
                              variant="outline"
                              className={`text-[9px] uppercase tracking-widest ${
                                priorityColors[action.priority] ?? priorityColors.medium
                              }`}
                            >
                              {action.priority}
                            </Badge>
                          </div>
                          {action.due_date && (
                            <span className={`text-xs ${overdue ? "text-error-red font-semibold" : "text-on-surface-variant"}`}>
                              {overdue && (
                                <span className="material-symbols-outlined text-[14px] align-middle mr-1">
                                  warning
                                </span>
                              )}
                              {new Date(action.due_date + "T00:00:00").toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </div>

                        {action.description && (
                          <p className="text-on-surface-variant text-sm leading-relaxed">
                            {action.description}
                          </p>
                        )}

                        {assigneeName && (
                          <p className="text-on-surface-variant text-xs">
                            <span className="material-symbols-outlined text-[14px] align-middle mr-1">person</span>
                            {assigneeName}
                          </p>
                        )}

                        {/* Actions row */}
                        <div className="flex items-center gap-3 pt-2 border-t border-outline-variant/10">
                          <button
                            type="button"
                            onClick={() => startEdit(action)}
                            className="text-gold/60 hover:text-gold transition-colors flex items-center gap-1 text-xs"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            Edit
                          </button>
                          {action.status === "open" && (
                            <button
                              type="button"
                              onClick={async () => {
                                await supabase.from("actions").update({ status: "in_progress" }).eq("id", action.id);
                                router.refresh();
                              }}
                              className="text-on-surface-variant/60 hover:text-on-surface-variant transition-colors flex items-center gap-1 text-xs"
                            >
                              <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                              Start
                            </button>
                          )}
                          {(action.status === "open" || action.status === "in_progress") && (
                            <button
                              type="button"
                              onClick={async () => {
                                await supabase.from("actions").update({ status: "completed" }).eq("id", action.id);
                                router.refresh();
                              }}
                              className="text-green-400/60 hover:text-green-400 transition-colors flex items-center gap-1 text-xs"
                            >
                              <span className="material-symbols-outlined text-[16px]">check_circle</span>
                              Complete
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(action.id)}
                            className="text-error-red/60 hover:text-error-red transition-colors flex items-center gap-1 text-xs"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
