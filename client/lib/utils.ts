import { v4 as uuidv4 } from "uuid";

export { uuidv4 as generateId };

export function formatDate(date: Date): string {
  const now = new Date();
  const d = new Date(date);

  const isToday = d.toDateString() === now.toDateString();
  const isYesterday =
    d.toDateString() ===
    new Date(now.setDate(now.getDate() - 1)).toDateString();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

export function groupConversationsByDate<
  T extends { updatedAt: Date; createdAt: Date }
>(items: T[]): Record<string, T[]> {
  const groups: Record<string, T[]> = {};

  for (const item of items) {
    const label = formatDate(item.updatedAt ?? item.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  }

  return groups;
}

export function truncateTitle(title: string, max = 40): string {
  return title.length > max ? title.slice(0, max).trimEnd() + "…" : title;
}

export function deriveTitleFromMessage(content: string): string {
  const cleaned = content.trim().replace(/\s+/g, " ");
  return truncateTitle(cleaned, 50) || "New conversation";
}
