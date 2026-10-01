import { describe, expect, it } from "vitest";

import { TenkaTable } from "./element.ts";

describe("the element, where there is no page", () => {
  it("can be imported on a server, and the class is there to extend", () => {
    expect(typeof TenkaTable).toBe("function");
    expect(TenkaTable.observedAttributes).toEqual(["players", "computers", "rounds", "seed", "map", "lang", "record", "delay"]);
  });

  it("is defined by its own entry only where there are custom elements, and does nothing here", async () => {
    expect(typeof customElements).toBe("undefined");
    await expect(import("./element-define.ts")).resolves.toBeDefined();
  });
});
