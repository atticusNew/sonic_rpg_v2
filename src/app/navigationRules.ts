import type { GameStateData, LocationId } from "../types/game";

export function isLocationBlocked(state: GameStateData, target: LocationId): boolean {
  if (target === "frat" && state.world.restrictions.fratBanned) return true;
  return false;
}

export function blockedLocationMessage(target: LocationId): string {
  if (target === "frat") {
    return "Sighting is at Frat, but you're banned there this run. Pivot to another setup route.";
  }
  return `${target.replace(/_/g, " ")} is blocked right now.`;
}
