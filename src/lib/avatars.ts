export const AVATAR_OPTIONS = [
  "🦁", "🐯", "🐻", "🐼", "🦊", "🐨",
  "🐸", "🦄", "🐵", "🦉", "🐙", "🦖",
  "🚀", "⚽", "🎸", "⭐",
] as const;

export const DEFAULT_AVATAR = "🏁";

export function displayAvatar(avatar: string | null | undefined): string {
  return avatar && AVATAR_OPTIONS.includes(avatar as (typeof AVATAR_OPTIONS)[number])
    ? avatar
    : DEFAULT_AVATAR;
}
