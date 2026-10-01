/**
 * Defines the `<tenka-table>` element on the page. Import it for its effect:
 *
 * ```html
 * <script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/tenka@1/dist/element-define.js"></script>
 * <tenka-table players="You, Kaze, Yama" rounds="10"></tenka-table>
 * ```
 *
 * A tag already defined is left as it is, and on a server, where there is no page, nothing happens.
 */
import { TenkaTable } from "./element.ts";

if (typeof customElements !== "undefined" && customElements.get("tenka-table") === undefined) customElements.define("tenka-table", TenkaTable);
