"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Settings,
  ListPlus,
  CheckCircle2,
  Sliders,
  Sparkles,
} from "lucide-react";

const FIELD_TYPES = [
  { value: "text", label: "Text Field" },
  { value: "email", label: "Email Address" },
  { value: "phone", label: "Phone Number" },
  { value: "textarea", label: "Multi-line Textarea" },
  { value: "select", label: "Dropdown Select" },
  { value: "radio", label: "Radio Selection" },
  { value: "checkbox", label: "Checkboxes / Multi" },
  { value: "number", label: "Number Input" },
  { value: "date", label: "Date Picker" },
  { value: "url", label: "Website URL" },
];

const PRESETS = {
  contact: {
    sectionTitle: "Get in Touch",
    subtitle: "We're here to answer questions, explore collaborations, and bring your vision to life.",
    badge: "Contact",
    submitButtonText: "Send Message",
    successTitle: "Message Received",
    successMessage: "Thank you for reaching out. We will get back to you within 24 hours.",
    fields: [
      { id: "f-name", name: "fullName", label: "Full Name", type: "text", placeholder: "e.g. Elena Vance", required: true, width: "half" },
      { id: "f-email", name: "email", label: "Email Address", type: "email", placeholder: "elena@company.com", required: true, width: "half" },
      { id: "f-subject", name: "subject", label: "Subject", type: "text", placeholder: "How can we assist you?", required: false, width: "full" },
      { id: "f-message", name: "message", label: "Message", type: "textarea", placeholder: "Tell us about your project or inquiry...", required: true, width: "full" },
    ],
  },
  leadCapture: {
    sectionTitle: "Request a Consultation",
    subtitle: "Schedule a dedicated strategy review with our senior architectural team.",
    badge: "Consultation",
    submitButtonText: "Request Briefing",
    successTitle: "Consultation Scheduled",
    successMessage: "Our engineering directors will review your brief and send an invite promptly.",
    fields: [
      { id: "f-name", name: "fullName", label: "Full Name", type: "text", placeholder: "Jane Doe", required: true, width: "half" },
      { id: "f-email", name: "email", label: "Work Email", type: "email", placeholder: "jane@enterprise.com", required: true, width: "half" },
      { id: "f-phone", name: "phone", label: "Phone Number", type: "phone", placeholder: "+1 (555) 000-0000", required: false, width: "half" },
      {
        id: "f-budget",
        name: "budget",
        label: "Expected Timeline",
        type: "select",
        required: true,
        width: "half",
        options: [
          { label: "Immediate (< 1 month)", value: "immediate" },
          { label: "1-3 Months", value: "quarter" },
          { label: "Strategic Planning (> 3 months)", value: "future" },
        ],
      },
      { id: "f-brief", name: "brief", label: "Project Brief", type: "textarea", placeholder: "Key goals, current stack, and scope...", required: true, width: "full" },
    ],
  },
  waitlist: {
    sectionTitle: "Join the Private Beta",
    subtitle: "Gain early access to exclusive deployment releases and prototype pipelines.",
    badge: "Waitlist",
    submitButtonText: "Claim Beta Invitation",
    successTitle: "You're on the list!",
    successMessage: "Invitations are sent weekly in priority batches. Watch your inbox.",
    fields: [
      { id: "f-name", name: "name", label: "Full Name", type: "text", placeholder: "Alex Mercer", required: true, width: "half" },
      { id: "f-email", name: "email", label: "Work Email", type: "email", placeholder: "alex@startup.io", required: true, width: "half" },
      {
        id: "f-role",
        name: "role",
        label: "Your Primary Role",
        type: "select",
        required: false,
        width: "full",
        options: [
          { label: "Founder / Executive", value: "founder" },
          { label: "Engineering Lead", value: "engineer" },
          { label: "Product Designer", value: "designer" },
          { label: "Other", value: "other" },
        ],
      },
    ],
  },
};

export default function FormBuilder({ content, onChange }) {
  const [selectedFieldId, setSelectedFieldId] = useState(content?.fields?.[0]?.id || null);

  const fields = content?.fields || [];

  const updateHeaderField = (key, val) => {
    onChange({
      ...content,
      [key]: val,
    });
  };

  const updateField = (id, updates) => {
    const updated = fields.map((f) => (f.id === id ? { ...f, ...updates } : f));
    onChange({
      ...content,
      fields: updated,
    });
  };

  const addField = (type = "text") => {
    const newId = `field-${Date.now().toString().slice(-5)}`;
    const baseName = `field_${fields.length + 1}`;
    const newField = {
      id: newId,
      name: baseName,
      label: `Field ${fields.length + 1}`,
      type,
      placeholder: "Enter value...",
      required: false,
      width: "full",
      options: ["select", "radio", "checkbox"].includes(type)
        ? [
            { label: "Option 1", value: "option_1" },
            { label: "Option 2", value: "option_2" },
          ]
        : undefined,
    };

    const updated = [...fields, newField];
    onChange({
      ...content,
      fields: updated,
    });
    setSelectedFieldId(newId);
  };

  const duplicateField = (id, e) => {
    e?.stopPropagation();
    const idx = fields.findIndex((f) => f.id === id);
    if (idx === -1) return;
    const original = fields[idx];
    const newId = `field-${Date.now().toString().slice(-5)}`;
    const copy = {
      ...JSON.parse(JSON.stringify(original)),
      id: newId,
      name: `${original.name}_copy`,
      label: `${original.label} (Copy)`,
    };
    const updated = [...fields];
    updated.splice(idx + 1, 0, copy);
    onChange({
      ...content,
      fields: updated,
    });
    setSelectedFieldId(newId);
  };

  const removeField = (id, e) => {
    e?.stopPropagation();
    if (fields.length <= 1) {
      alert("A form must have at least one field.");
      return;
    }
    const updated = fields.filter((f) => f.id !== id);
    onChange({
      ...content,
      fields: updated,
    });
    if (selectedFieldId === id) {
      setSelectedFieldId(updated[0]?.id || null);
    }
  };

  const moveField = (idx, dir, e) => {
    e?.stopPropagation();
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= fields.length) return;
    const updated = [...fields];
    const [moved] = updated.splice(idx, 1);
    updated.splice(targetIdx, 0, moved);
    onChange({
      ...content,
      fields: updated,
    });
  };

  const applyPreset = (presetKey) => {
    const preset = PRESETS[presetKey];
    if (!preset) return;
    onChange({
      ...content,
      ...preset,
    });
    setSelectedFieldId(preset.fields[0]?.id || null);
  };

  const activeField = fields.find((f) => f.id === selectedFieldId) || fields[0];

  return (
    <div className="space-y-6">
      {/* Quick Presets */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-muted">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>Form Presets</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => applyPreset("contact")}
            className="p-2 rounded-lg bg-background border border-border hover:border-accent/50 text-[11px] font-mono text-foreground text-center transition-colors"
          >
            Contact
          </button>
          <button
            type="button"
            onClick={() => applyPreset("leadCapture")}
            className="p-2 rounded-lg bg-background border border-border hover:border-accent/50 text-[11px] font-mono text-foreground text-center transition-colors"
          >
            Inquiry
          </button>
          <button
            type="button"
            onClick={() => applyPreset("waitlist")}
            className="p-2 rounded-lg bg-background border border-border hover:border-accent/50 text-[11px] font-mono text-foreground text-center transition-colors"
          >
            Beta Waitlist
          </button>
        </div>
      </div>

      {/* Form Copy / Titles */}
      <div className="space-y-3 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-muted">
          <Sliders className="w-3.5 h-3.5 text-accent" />
          <span>Form Copy & Action</span>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-mono text-muted uppercase">Badge</label>
          <input
            type="text"
            value={content?.badge || ""}
            onChange={(e) => updateHeaderField("badge", e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-mono text-muted uppercase">Section Title</label>
          <input
            type="text"
            value={content?.sectionTitle || ""}
            onChange={(e) => updateHeaderField("sectionTitle", e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-mono text-muted uppercase">Subtitle</label>
          <textarea
            rows={2}
            value={content?.subtitle || ""}
            onChange={(e) => updateHeaderField("subtitle", e.target.value)}
            className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground focus:outline-none focus:border-accent resize-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-mono text-muted uppercase">Submit Button Text</label>
          <input
            type="text"
            value={content?.submitButtonText || ""}
            onChange={(e) => updateHeaderField("submitButtonText", e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent font-semibold"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-mono text-muted uppercase">Success Message</label>
          <input
            type="text"
            value={content?.successMessage || ""}
            onChange={(e) => updateHeaderField("successMessage", e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Form Fields Manager */}
      <div className="space-y-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-muted">
            <ListPlus className="w-3.5 h-3.5 text-accent" />
            <span>Form Fields ({fields.length})</span>
          </div>
          <button
            type="button"
            onClick={() => addField("text")}
            className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-1 rounded-md bg-accent/15 text-accent hover:bg-accent/25 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Add Field</span>
          </button>
        </div>

        {/* Fields List */}
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {fields.map((f, idx) => {
            const isSelected = f.id === selectedFieldId;
            return (
              <div
                key={f.id}
                onClick={() => setSelectedFieldId(f.id)}
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 cursor-pointer transition-all ${
                  isSelected
                    ? "bg-accent/15 border-accent text-accent font-semibold"
                    : "bg-background border-border text-foreground/80 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-[10px] font-mono opacity-50">0{idx + 1}</span>
                  <span className="truncate">{f.label || f.name}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-muted uppercase">
                    {f.type}
                  </span>
                  {f.required && (
                    <span className="text-accent text-xs font-bold leading-none" title="Required field">*</span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => moveField(idx, -1, e)}
                    disabled={idx === 0}
                    className="p-1 rounded text-muted hover:text-foreground disabled:opacity-20"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => moveField(idx, 1, e)}
                    disabled={idx === fields.length - 1}
                    className="p-1 rounded text-muted hover:text-foreground disabled:opacity-20"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => duplicateField(f.id, e)}
                    className="p-1 rounded text-muted hover:text-foreground"
                    title="Duplicate Field"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => removeField(f.id, e)}
                    className="p-1 rounded text-muted hover:text-red-400"
                    title="Delete Field"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Field Inspector */}
      {activeField && (
        <div className="p-3.5 rounded-2xl bg-background border border-border space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <span className="text-xs font-mono uppercase text-muted font-semibold">
              Edit Field: {activeField.label || activeField.name}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/10 text-accent">
              {activeField.type}
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono text-muted uppercase">Field Label</label>
            <input
              type="text"
              value={activeField.label || ""}
              onChange={(e) => updateField(activeField.id, { label: e.target.value })}
              className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono text-muted uppercase">Field Name (ID)</label>
            <input
              type="text"
              value={activeField.name || ""}
              onChange={(e) => updateField(activeField.id, { name: e.target.value.replace(/[^a-zA-Z0-9_]/g, "") })}
              className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-muted uppercase">Input Type</label>
              <select
                value={activeField.type}
                onChange={(e) => {
                  const newType = e.target.value;
                  const updates = { type: newType };
                  if (["select", "radio", "checkbox"].includes(newType) && !activeField.options?.length) {
                    updates.options = [
                      { label: "Option 1", value: "option_1" },
                      { label: "Option 2", value: "option_2" },
                    ];
                  }
                  updateField(activeField.id, updates);
                }}
                className="w-full bg-surface border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent"
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-muted uppercase">Layout Width</label>
              <select
                value={activeField.width || "full"}
                onChange={(e) => updateField(activeField.id, { width: e.target.value })}
                className="w-full bg-surface border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent"
              >
                <option value="full">Full Width (1 Column)</option>
                <option value="half">Half Width (2 Columns)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono text-muted uppercase">Placeholder Text</label>
            <input
              type="text"
              value={activeField.placeholder || ""}
              onChange={(e) => updateField(activeField.id, { placeholder: e.target.value })}
              className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          {/* Toggle Required */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs font-mono text-muted">Required Field</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={!!activeField.required}
                onChange={(e) => updateField(activeField.id, { required: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-surface border border-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>

          {/* Options editor for select / radio / checkbox */}
          {["select", "radio", "checkbox"].includes(activeField.type) && (
            <div className="pt-2 space-y-2 border-t border-border">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono text-muted uppercase">Options</label>
                <button
                  type="button"
                  onClick={() => {
                    const currentOpts = activeField.options || [];
                    const nextNum = currentOpts.length + 1;
                    updateField(activeField.id, {
                      options: [...currentOpts, { label: `Option ${nextNum}`, value: `opt_${nextNum}` }],
                    });
                  }}
                  className="text-[10px] font-mono text-accent hover:underline"
                >
                  + Add Option
                </button>
              </div>

              <div className="space-y-1.5">
                {(activeField.options || []).map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Label"
                      value={opt.label}
                      onChange={(e) => {
                        const newOpts = [...activeField.options];
                        newOpts[optIdx] = { ...newOpts[optIdx], label: e.target.value };
                        updateField(activeField.id, { options: newOpts });
                      }}
                      className="flex-1 bg-surface border border-border rounded px-2 py-1 text-xs text-foreground"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={opt.value}
                      onChange={(e) => {
                        const newOpts = [...activeField.options];
                        newOpts[optIdx] = { ...newOpts[optIdx], value: e.target.value };
                        updateField(activeField.id, { options: newOpts });
                      }}
                      className="w-24 bg-surface border border-border rounded px-2 py-1 text-xs font-mono text-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newOpts = activeField.options.filter((_, i) => i !== optIdx);
                        updateField(activeField.id, { options: newOpts });
                      }}
                      className="p-1 text-muted hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
