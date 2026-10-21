"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";
import { FadeUp } from "../motion/MotionReveal.js";

export default function FormSection({ content = {}, theme = {}, projectId = "draft" }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [statusMessage, setStatusMessage] = useState("");

  const {
    sectionTitle = "Initiate Collaboration",
    subtitle = "Tell us about your objectives. We will review and provide a structured briefing within 24 hours.",
    tag = "Direct Inquiries",
    layout = "single_column",
    submitButtonText = "Submit Inquiry",
    successMessage = "Thank you. Your request has been received. Our team will review and reply promptly.",
    formAction = "/api/forms/submit",
    fields = [
      { id: "f1", name: "fullName", label: "Full Name", type: "text", placeholder: "Jane Doe", isRequired: true, width: "half" },
      { id: "f2", name: "email", label: "Email Address", type: "email", placeholder: "jane@company.com", isRequired: true, width: "half" },
      { id: "f3", name: "phone", label: "Phone Number", type: "phone", placeholder: "+1 (555) 000-0000", isRequired: false, width: "half" },
      { id: "f4", name: "timeline", label: "Target Timeline", type: "select", isRequired: false, width: "half", options: [{ label: "Immediate (1-2 weeks)", value: "immediate" }, { label: "Next Quarter", value: "quarter" }, { label: "Flexible", value: "flexible" }] },
      { id: "f5", name: "message", label: "Project Brief & Requirements", type: "textarea", placeholder: "Describe your requirements, scope, or questions...", isRequired: true, width: "full" },
    ],
  } = content;

  const handleFieldChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const errs = {};
    for (const f of fields) {
      if (f.type === "hidden") continue;
      const val = formData[f.name];

      if (f.isRequired) {
        if (f.type === "checkbox") {
          if (!val) errs[f.name] = `${f.label} is required`;
        } else if (!val || String(val).trim() === "") {
          errs[f.name] = `${f.label} is required`;
        }
      }

      if (val && f.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(val).trim())) {
          errs[f.name] = "Please enter a valid email address";
        }
      }

      if (val && f.validation) {
        if (f.validation.minLength && String(val).length < f.validation.minLength) {
          errs[f.name] = `Must be at least ${f.validation.minLength} characters`;
        }
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("submitting");
    setStatusMessage("");

    try {
      const res = await fetch(formAction || "/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          formId: content.id || "form-section",
          data: formData,
          _hp_anti_spam: formData._hp_anti_spam || "", // honeypot
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit form");
      }

      setStatus("success");
      setStatusMessage(successMessage || data.message);
    } catch (err) {
      setStatus("error");
      setStatusMessage(err.message || "An unexpected error occurred. Please try again.");
    }
  };

  return (
    <section className="relative w-full py-24 sm:py-32 px-4 sm:px-8 border-b border-[var(--theme-border)] overflow-hidden">
      {/* Ambient background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[140px] pointer-events-none opacity-20"
        style={{ backgroundColor: theme.accent || "var(--theme-accent)" }}
      />

      <div className="relative max-w-4xl mx-auto">
        <FadeUp>
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            {tag && (
              <span
                className="inline-block text-[11px] font-mono tracking-widest uppercase px-3 py-1 rounded-full border mb-4"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  borderColor: "var(--theme-border)",
                  color: "var(--theme-accent)",
                }}
              >
                {tag}
              </span>
            )}
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 text-[var(--theme-text)]">
              {sectionTitle}
            </h2>
            {subtitle && (
              <p className="text-base sm:text-lg text-[var(--theme-muted)] leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </FadeUp>

        <FadeUp delay={0.15}>
          <div
            className="p-6 sm:p-10 rounded-3xl border backdrop-blur-xl relative"
            style={{
              backgroundColor: "var(--theme-surface)",
              borderColor: "var(--theme-border)",
            }}
          >
            {status === "success" ? (
              <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div
                  className="w-16 h-16 rounded-full mx-auto flex items-center justify-center border"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderColor: "var(--theme-accent)",
                    color: "var(--theme-accent)",
                  }}
                >
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--theme-text)]">Submission Received</h3>
                <p className="text-sm sm:text-base text-[var(--theme-muted)] max-w-md mx-auto">
                  {statusMessage}
                </p>
                <button
                  onClick={() => {
                    setFormData({});
                    setStatus("idle");
                  }}
                  className="mt-4 px-6 py-2.5 rounded-full text-xs font-mono font-medium border border-[var(--theme-border)] text-[var(--theme-text)] hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Honeypot field (hidden from real users) */}
                <input
                  type="text"
                  name="_hp_anti_spam"
                  value={formData._hp_anti_spam || ""}
                  onChange={(e) => handleFieldChange("_hp_anti_spam", e.target.value)}
                  style={{ display: "none" }}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                <div
                  className={`grid gap-6 ${
                    layout === "two_column" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2"
                  }`}
                >
                  {fields.map((field) => {
                    const isHalf = field.width === "half";
                    const isColSpan2 = !isHalf || layout === "single_column";
                    const fieldError = errors[field.name];

                    if (field.type === "hidden") return null;

                    return (
                      <div
                        key={field.id}
                        className={`space-y-2 ${isColSpan2 ? "sm:col-span-2" : "sm:col-span-1"}`}
                      >
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor={field.id}
                            className="text-xs font-mono uppercase tracking-wider text-[var(--theme-text)]"
                          >
                            {field.label}
                            {field.isRequired && (
                              <span className="text-[var(--theme-accent)] ml-1">*</span>
                            )}
                          </label>
                          {field.helperText && (
                            <span className="text-[11px] text-[var(--theme-muted)]">
                              {field.helperText}
                            </span>
                          )}
                        </div>

                        {/* Text / Email / Phone / Number / Date / URL */}
                        {["text", "email", "phone", "number", "date", "url"].includes(field.type) && (
                          <input
                            id={field.id}
                            type={field.type === "phone" ? "tel" : field.type}
                            placeholder={field.placeholder || ""}
                            value={formData[field.name] || ""}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border bg-black/20 text-sm text-[var(--theme-text)] placeholder:text-[var(--theme-muted)]/50 focus:outline-none transition-colors ${
                              fieldError
                                ? "border-red-500 focus:border-red-500"
                                : "border-[var(--theme-border)] focus:border-[var(--theme-accent)]"
                            }`}
                          />
                        )}

                        {/* Textarea */}
                        {field.type === "textarea" && (
                          <textarea
                            id={field.id}
                            rows={4}
                            placeholder={field.placeholder || ""}
                            value={formData[field.name] || ""}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border bg-black/20 text-sm text-[var(--theme-text)] placeholder:text-[var(--theme-muted)]/50 focus:outline-none transition-colors resize-y ${
                              fieldError
                                ? "border-red-500 focus:border-red-500"
                                : "border-[var(--theme-border)] focus:border-[var(--theme-accent)]"
                            }`}
                          />
                        )}

                        {/* Select / Dropdown */}
                        {field.type === "select" && (
                          <select
                            id={field.id}
                            value={formData[field.name] || ""}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border bg-[var(--theme-surface)] text-sm text-[var(--theme-text)] focus:outline-none transition-colors ${
                              fieldError
                                ? "border-red-500"
                                : "border-[var(--theme-border)] focus:border-[var(--theme-accent)]"
                            }`}
                          >
                            <option value="">{field.placeholder || "Select an option..."}</option>
                            {(field.options || []).map((opt, i) => (
                              <option key={i} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        )}

                        {/* Radio Group */}
                        {field.type === "radio" && (
                          <div className="flex flex-wrap gap-4 pt-1">
                            {(field.options || []).map((opt, i) => (
                              <label
                                key={i}
                                className="flex items-center gap-2 text-xs font-mono text-[var(--theme-text)] cursor-pointer"
                              >
                                <input
                                  type="radio"
                                  name={field.name}
                                  value={opt.value}
                                  checked={formData[field.name] === opt.value}
                                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                  className="accent-[var(--theme-accent)]"
                                />
                                <span>{opt.label}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {/* Checkbox */}
                        {field.type === "checkbox" && (
                          <label className="flex items-center gap-2.5 pt-1 text-xs text-[var(--theme-muted)] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(formData[field.name])}
                              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                              className="w-4 h-4 rounded border-[var(--theme-border)] accent-[var(--theme-accent)]"
                            />
                            <span className="text-[var(--theme-text)]">
                              {field.placeholder || field.label}
                            </span>
                          </label>
                        )}

                        {fieldError && (
                          <span className="text-[11px] font-mono text-red-400 block">
                            {fieldError}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {status === "error" && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{statusMessage}</span>
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-mono text-xs font-bold transition-all shadow-lg cursor-pointer hover:brightness-110 disabled:opacity-50"
                    style={{
                      backgroundColor: "var(--theme-accent)",
                      color: "var(--theme-bg)",
                    }}
                  >
                    {status === "submitting" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Transmitting Brief...</span>
                      </>
                    ) : (
                      <>
                        <span>{submitButtonText}</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
