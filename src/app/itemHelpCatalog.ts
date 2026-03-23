export type ItemHelpEntry = {
  desc: string;
  useHint: string;
  targetHint?: string;
  riskHint?: string;
};

export const ITEM_HELP: Record<string, ItemHelpEntry> = {
  "Student ID": { desc: "Campus clearance pass.", useHint: "Needed for key checks and entry." },
  "Dean Whiskey": { desc: "Heavy liquor stash.", useHint: "Use where Sonic is present (Dorm Room gives stronger setup).", targetHint: "Target: Sonic at current location.", riskHint: "Carrying contraband can trigger warnings." },
  Asswine: { desc: "Thunderhead trade reward.", useHint: "Fast drunk boost anywhere Sonic is present.", targetHint: "Target: Sonic at current location.", riskHint: "Trade setup costs time." },
  "Furry Handcuffs": { desc: "High-risk control item.", useHint: "Use on Sonic when setup window is active.", targetHint: "Target: Sonic when escort-ready or distracted.", riskHint: "Wrong target can hard-fail." },
  "Frat Bong": { desc: "High-risk contraband.", useHint: "Offer to Sonic to create a cuff distraction window.", targetHint: "Target: Sonic at current location.", riskHint: "Public stunt can trigger warnings." },
  "Spare Socks": { desc: "Strip poker flavor item.", useHint: "No direct action route right now.", targetHint: "Passive for now.", riskHint: "Can be removed from active loadout if unused." },
  "RA Whistle": { desc: "Fake authority tool.", useHint: "Best in Dorms to reduce Luigi pressure.", targetHint: "Target: Luigi pressure in residential lanes.", riskHint: "Using at Frat escalates fast." },
  "Lace Undies": { desc: "Sorority contraband.", useHint: "Top Thunderhead trade item.", targetHint: "Target: Thunderhead in Tunnel.", riskHint: "Getting caught means a ban." },
  "Sorority Mascara": { desc: "Sorority contraband.", useHint: "Valid Thunderhead trade item.", targetHint: "Target: Thunderhead in Tunnel.", riskHint: "Theft can trigger ejection + ban." },
  "Sorority Composite": { desc: "Sorority contraband.", useHint: "Valid Thunderhead trade item.", targetHint: "Target: Thunderhead in Tunnel.", riskHint: "High social penalty if caught." },
  Hairbrush: { desc: "Low-value filler.", useHint: "Not valid for Thunderhead trade.", riskHint: "Bad trade wastes time." },
  "Warm Beer": { desc: "Mix base item.", useHint: "Use where Sonic is present, or consume it in a mix recipe.", targetHint: "Target: Sonic at current location or mix recipes.", riskHint: "Mixing consumes Warm Beer." },
  "Super Dean Beans": { desc: "Volatile ingredient.", useHint: "Mix with Warm Beer for Turbo Sludge.", targetHint: "Target: mix path in Dorm Room.", riskHint: "Mixing consumes ingredients and can backfire later." },
  "Expired Energy Shot": { desc: "High-variance stim.", useHint: "Use only when gambling.", targetHint: "Target: Sonic at current location.", riskHint: "Can lower progress and raise pressure." },
  "Glitter Flask": { desc: "Mix container.", useHint: "Needed for Glitter Bomb Brew.", targetHint: "Target: mix path.", riskHint: "No direct value alone." },
  "Glitter Bomb Brew": { desc: "Chaotic mixed drink.", useHint: "Use where Sonic is present for swingy gain.", targetHint: "Target: Sonic at current location.", riskHint: "Can spike Dean warning." },
  "Turbo Sludge": { desc: "Heavy mixed brew.", useHint: "Big spike attempt where Sonic is present.", targetHint: "Target: Sonic at current location.", riskHint: "Big backfire risk." },
  "Campus Map": { desc: "Route intel.", useHint: "Use to reveal search lanes.", targetHint: "Target: route planning.", riskHint: "Costs time to use." },
  "Gate Stamp": { desc: "Gate credential.", useHint: "Use at Stadium; better with Student ID.", riskHint: "Without ID, can add Dean warning." },
  "Security Schedule": { desc: "Guard timing intel.", useHint: "Use at Stadium for gate timing or in Dorm Room to sell Sonic a VIP window.", targetHint: "Target: Sonic in Dorm Room or gate timing at Stadium.", riskHint: "Without Student ID, the VIP bluff backfires." },
  "Mystery Meat": { desc: "Cafeteria wildcard.", useHint: "Use on Sonic where present.", riskHint: "Can help or backfire." }
};

export const ITEM_HELP_ACTIONABLE_ITEMS = [
  "Dean Whiskey",
  "Asswine",
  "Furry Handcuffs",
  "Frat Bong",
  "RA Whistle",
  "Warm Beer",
  "Super Dean Beans",
  "Expired Energy Shot",
  "Glitter Flask",
  "Glitter Bomb Brew",
  "Turbo Sludge",
  "Campus Map",
  "Gate Stamp",
  "Security Schedule",
  "Mystery Meat"
] as const;

export const ITEM_HELP_HIDDEN_ITEMS = [
  "Student ID",
  "Spare Socks",
  "Lace Undies",
  "Sorority Mascara",
  "Sorority Composite",
  "Hairbrush"
] as const;

export function getItemHelpParityReport(): {
  missingPolicyKeys: string[];
  overlapKeys: string[];
  actionableMissingHelp: string[];
} {
  const helpKeys = Object.keys(ITEM_HELP);
  const actionable = new Set<string>(ITEM_HELP_ACTIONABLE_ITEMS);
  const hidden = new Set<string>(ITEM_HELP_HIDDEN_ITEMS);
  const covered = new Set<string>([...actionable, ...hidden]);
  const missingPolicyKeys = helpKeys.filter((key) => !covered.has(key));
  const overlapKeys = [...actionable].filter((key) => hidden.has(key));
  const actionableMissingHelp = [...actionable].filter((key) => !(key in ITEM_HELP));
  return {
    missingPolicyKeys,
    overlapKeys,
    actionableMissingHelp
  };
}

