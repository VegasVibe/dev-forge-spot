import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { statusLabels, type MissionStatus } from "@/lib/mock-data";

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`glass rounded-2xl ring-1 ring-border p-5 ${className}`}>{children}</div>;
}

export function Label({ children }: { children: ReactNode }) {
  return <span className="label-mono">{children}</span>;
}

const statusClass: Record<MissionStatus, string> = {
  todo: "bg-muted text-muted-foreground ring-border",
  active: "bg-info-soft text-info ring-info/20",
  done: "bg-ok-soft text-ok ring-ok/20",
  paid: "bg-ok-soft text-ok ring-ok/20",
  archived: "bg-arch-soft text-arch ring-border",
};

const statusDot: Record<MissionStatus, string> = {
  todo: "bg-muted-foreground",
  active: "bg-info",
  done: "bg-ok",
  paid: "bg-ok",
  archived: "bg-arch",
};

export function StatusBadge({ status }: { status: MissionStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${statusClass[status]}`}
    >
      <span className={`size-1.5 rounded-full ${statusDot[status]}`} />
      {statusLabels[status]}
    </span>
  );
}

export function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "size-14 text-base rounded-2xl" : size === "sm" ? "size-8 text-[11px] rounded-lg" : "size-10 text-sm rounded-xl";
  return (
    <span
      className={`grid place-items-center ${cls} bg-accent-soft text-accent font-display font-semibold ring-1 ring-accent/20 shrink-0`}
    >
      {initials}
    </span>
  );
}

export function Meter({ value, tone = "accent" }: { value: number; tone?: "accent" | "ok" | "arch" | "faint" }) {
  const bg = tone === "ok" ? "bg-ok" : tone === "arch" ? "bg-arch" : tone === "faint" ? "bg-ink-faint" : "bg-accent";
  return (
    <div className="h-1.5 rounded-full bg-line overflow-hidden">
      <div className={`h-full rounded-full ${bg}`} style={{ width: `${value}%` }} />
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone,
  meter,
}: {
  label: string;
  value: string;
  hint?: ReactNode;
  tone?: "ok" | "warn" | "info";
  meter?: number;
}) {
  const hintClass = tone === "ok" ? "text-ok" : tone === "warn" ? "text-warn" : tone === "info" ? "text-info" : "text-ink-soft";
  return (
    <div className="glass rounded-2xl ring-1 ring-border p-4">
      <Label>{label}</Label>
      <div className="mt-2 font-display font-semibold text-[28px] tracking-tight tabular-nums">{value}</div>
      {hint && <div className={`mt-1 text-xs ${hintClass}`}>{hint}</div>}
      {typeof meter === "number" && (
        <div className="mt-3">
          <Meter value={meter} />
        </div>
      )}
    </div>
  );
}

export function PrimaryButton({ to, children, className = "" }: { to?: string; children: ReactNode; className?: string }) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 transition-colors hover:bg-accent/90 ${className}`;
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  return <button className={cls}>{children}</button>;
}

export function GhostButton({ to, children, className = "" }: { to?: string; children: ReactNode; className?: string }) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-xl glass text-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-border transition-colors hover:bg-card ${className}`;
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  return <button className={cls}>{children}</button>;
}

export function Chip({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs ${
        active ? "bg-ink text-paper font-medium" : "text-ink-soft"
      }`}
    >
      {children}
    </span>
  );
}

export function SkillTag({ children }: { children: ReactNode }) {
  return (
    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-ink-soft">{children}</span>
  );
}

export function SectionTitle({ kicker, title, action }: { kicker?: string; title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div>
        {kicker && <Label>{kicker}</Label>}
        <h2 className="mt-1 font-display font-semibold text-xl tracking-tight">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function BarChart({ data, unit }: { data: { month: string; value: number }[]; unit?: string }) {
  return (
    <div>
      <div className="flex items-end gap-2 h-32">
        {data.map((d, i) => (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            <div
              className="w-full rounded-t bg-accent"
              style={{ height: `${d.value}%`, opacity: 0.3 + (i / data.length) * 0.7 }}
            />
            <span className="text-[9px] font-mono text-ink-faint">{d.month}</span>
          </div>
        ))}
      </div>
      {unit && <div className="mt-3 text-xs text-ink-soft">{unit}</div>}
    </div>
  );
}
