/**
 * 文字列を大文字に変換します
 */
export function toUpperCase(str: string): string {
  return str.toUpperCase();
}

/**
 * 文字列を小文字に変換します
 */
export function toLowerCase(str: string): string {
  return str.toLowerCase();
}

/**
 * 文字列を逆順にします
 */
export function reverse(str: string): string {
  return str.split("").reverse().join("");
}

/**
 * 文字列が空かどうかを判定します
 */
export function isEmpty(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * 文字列から空白を削除します
 */
export function removeWhitespace(str: string): string {
  return str.replace(/\s+/g, "");
}
