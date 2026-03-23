import { describe, expect, it } from "vitest";
import { ITEM_HELP, getItemHelpParityReport } from "./itemHelpCatalog";

describe("item help parity", () => {
  it("ensures each listed item is actionable or explicitly hidden", () => {
    const report = getItemHelpParityReport();
    expect(report.missingPolicyKeys).toEqual([]);
    expect(report.overlapKeys).toEqual([]);
    expect(report.actionableMissingHelp).toEqual([]);
    expect(Object.keys(ITEM_HELP).length).toBeGreaterThan(0);
  });
});

