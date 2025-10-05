/**
 * Use one of the built-in themes.
 *
 * @example
 *
 * ```ts
 * import { THEME_SST } from "@openauthjs/openauth/ui/theme"
 *
 * export default issuer({
 *   theme: THEME_SST,
 *   // ...
 * })
 * ```
 *
 * Or define your own.
 *
 * ```ts
 * import type { Theme } from "@openauthjs/openauth/ui/theme"
 *
 * const MY_THEME: Theme = {
 *   title: "Acne",
 *   radius: "none",
 *   favicon: "https://www.example.com/favicon.svg",
 *   // ...
 * }
 *
 * export default issuer({
 *   theme: MY_THEME,
 *   // ...
 * })
 * ```
 *
 * @packageDocumentation
 */

/**
 * A type to define values for light and dark mode.
 *
 * @example
 * ```ts
 * {
 *   light: "#FFF",
 *   dark: "#000"
 * }
 * ```
 */
export interface ColorScheme {
  /**
   * The value for dark mode.
   */
  dark: string;
  /**
   * The value for light mode.
   */
  light: string;
}

/**
 * A type to define your custom theme.
 */
export interface Theme {
  /**
   * A URL to the favicon of your app.
   *
   * @example
   * ```ts
   * {
   *   favicon: "https://www.example.com/favicon.svg"
   * }
   * ```
   */
  favicon?: string;
}

export default THEME_SUPABASE;
