import type { GameStateData, LocationId, NpcId } from "../types/game";

type PresenceMap = Record<LocationId, NpcId[]>;

function emptyPresence(): PresenceMap {
  return {
    dean_office: [],
    quad: [],
    eggman_classroom: [],
    frat: [],
    sorority: [],
    tunnel: [],
    cafeteria: [],
    dorms: [],
    dorm_room: [],
    stadium: []
  };
}

export class NPCPresenceSystem {
  private hash(input: string): number {
    let value = 2166136261 >>> 0;
    for (let i = 0; i < input.length; i += 1) {
      value ^= input.charCodeAt(i);
      value = Math.imul(value, 16777619);
    }
    return value >>> 0;
  }

  private pushWithCap(map: PresenceMap, location: LocationId, npc: NpcId, cap = 2): void {
    if (map[location].includes(npc)) return;
    if (map[location].length >= cap) return;
    map[location].push(npc);
  }

  private shouldSpawnLuigiEvent(state: GameStateData): boolean {
    const nearObjective = state.sonic.following
      || state.sonic.drunkLevel >= 2
      || state.player.inventory.includes("Dean Whiskey")
      || state.player.inventory.includes("Asswine")
      || state.player.inventory.includes("Frat Bong")
      || state.fail.warnings.luigi > 0
      || state.routes.routeA.complete
      || state.routes.routeB.complete
      || state.routes.routeC.complete;
    if (!nearObjective) return false;
    if (
      state.player.location === "stadium"
      && (state.sonic.following || state.fail.warnings.luigi > 0 || state.player.inventory.includes("Frat Bong"))
    ) {
      return true;
    }
    const cycle = state.timer.remainingSec < 240 ? 140 : state.timer.remainingSec < 480 ? 165 : 185;
    const center = Math.floor(cycle / 2);
    const pulse = Math.abs((state.timer.remainingSec % cycle) - center);
    const pulseWindow = state.sonic.following
      ? 20
      : state.timer.remainingSec < 240
        ? 16
        : 12;
    return pulse <= pulseWindow;
  }

  private placeRotatingRoster(state: GameStateData, p: PresenceMap): void {
    const socialLocations: LocationId[] = ["quad", "cafeteria", "dorms", "dorm_room"];
    const rotatingNpcs: NpcId[] = ["tails", "earthworm_jim", "knuckles"];
    const tick = Math.floor((900 - state.timer.remainingSec) / 45);
    const visitMix = (state.world.visitCounts.quad ?? 0)
      + (state.world.visitCounts.cafeteria ?? 0)
      + (state.world.visitCounts.dorms ?? 0)
      + (state.world.visitCounts.dorm_room ?? 0);
    const base = (this.hash(`${state.meta.seed}:${tick}:${visitMix}`) % socialLocations.length);

    rotatingNpcs.forEach((npc, idx) => {
      for (let attempt = 0; attempt < socialLocations.length; attempt += 1) {
        const candidate = socialLocations[(base + idx + attempt) % socialLocations.length];
        if (p[candidate].length < 2) {
          this.pushWithCap(p, candidate, npc, 2);
          break;
        }
      }
    });
  }

  private placeSonic(state: GameStateData, p: PresenceMap): void {
    if (state.sonic.cooldownMoves > 0) return;
    if (state.sonic.following) {
      // Keep escorting Sonic mostly in mission status so scene NPCs still rotate.
      if (state.player.location === "stadium") {
        this.pushWithCap(p, "stadium", "sonic", 2);
      }
      return;
    }

    const clueContacts = ["tails", "eggman", "frat_boys", "thunderhead"]
      .filter((npc) => state.dialogue.greetedNpcIds.includes(npc as NpcId)).length;
    const hasProgressSignal = clueContacts >= 2
      || state.routes.routeA.progress > 0
      || state.routes.routeB.progress > 0
      || state.routes.routeC.progress > 0
      || state.player.inventory.includes("Campus Map");
    if (!hasProgressSignal) {
      return;
    }

    // Sonic is never at Frat until the player challenges him.
    if (state.world.actionUnlocks.beerPongSonic || state.sonic.location === "frat") {
      this.pushWithCap(p, "frat", "sonic", 2);
      return;
    }

    const sonicCircuit: LocationId[] = ["dorm_room", "dorms", "cafeteria", "quad"];
    const circuitTick = Math.floor((900 - state.timer.remainingSec) / 60);
    const offset = this.hash(`${state.meta.seed}:sonic:${circuitTick}`) % sonicCircuit.length;
    const location = sonicCircuit[offset];
    this.pushWithCap(p, location, "sonic", 2);
  }

  private npcPriority(state: GameStateData, location: LocationId, npc: NpcId): number {
    if (npc === "dean_cain") {
      return state.dialogue.deanStage === "name_pending" || state.dialogue.deanStage === "intro_pending" ? 120 : 90;
    }
    if (npc === "sonic") return 110;
    if (npc === "luigi") return state.sonic.following ? 118 : 108;
    if (npc === "thunderhead") return 96;
    if (npc === "tails") return 94;
    if (npc === "eggman") return 92;
    if (npc === "frat_boys") return location === "frat" ? 91 : 86;
    if (npc === "sorority_girls") return location === "sorority" ? 90 : 85;
    if (npc === "earthworm_jim") return 82;
    return 80;
  }

  private pickPrimaryNpc(state: GameStateData, location: LocationId, npcs: NpcId[]): NpcId {
    const ranked = [...npcs].sort((left, right) => {
      const scoreDelta = this.npcPriority(state, location, right) - this.npcPriority(state, location, left);
      if (scoreDelta !== 0) return scoreDelta;
      const leftTie = this.hash(`${state.meta.seed}:${state.timer.remainingSec}:${location}:${left}`) % 11;
      const rightTie = this.hash(`${state.meta.seed}:${state.timer.remainingSec}:${location}:${right}`) % 11;
      return rightTie - leftTie;
    });
    return ranked[0];
  }

  private applyOneNpcPerSceneMode(state: GameStateData, presence: PresenceMap): PresenceMap {
    if (!state.world.settings?.oneNpcPerScene) return presence;
    const reduced = emptyPresence();
    for (const location of Object.keys(reduced) as LocationId[]) {
      const npcs = presence[location] ?? [];
      if (npcs.length === 0) continue;
      reduced[location] = [this.pickPrimaryNpc(state, location, npcs)];
    }
    return reduced;
  }

  resolve(state: GameStateData): PresenceMap {
    const p = emptyPresence();
    const deanLockedToOffice = state.dialogue.deanStage === "intro_pending" || state.dialogue.deanStage === "name_pending";
    const deanTick = Math.floor((900 - state.timer.remainingSec) / 40);
    if (deanLockedToOffice || deanTick % 3 !== 1) {
      p.dean_office.push("dean_cain");
    } else {
      this.pushWithCap(p, "quad", "dean_cain", 2);
    }

    const fratTick = Math.floor((900 - state.timer.remainingSec) / 45);
    if (state.world.restrictions.fratChallengeForced || fratTick % 3 !== 2) {
      p.frat.push("frat_boys");
    } else {
      this.pushWithCap(p, "quad", "frat_boys", 2);
    }

    const sororityTick = Math.floor((900 - state.timer.remainingSec) / 50);
    if (state.world.minigames.stripPokerTableLocked || sororityTick % 3 !== 1) {
      p.sorority.push("sorority_girls");
    } else {
      this.pushWithCap(p, "cafeteria", "sorority_girls", 2);
    }

    p.tunnel.push("thunderhead");
    p.eggman_classroom.push("eggman");

    // Rotating campus cast with light occupancy caps.
    this.placeRotatingRoster(state, p);
    this.placeSonic(state, p);

    const luigiEvent = this.shouldSpawnLuigiEvent(state);
    if (luigiEvent) {
      const eventLocation: LocationId =
        state.player.location === "stadium" || state.player.location === "dorms" || state.player.location === "quad"
          ? state.player.location
          : "quad";
      p[eventLocation] = ["luigi"];
      return this.applyOneNpcPerSceneMode(state, p);
    }

    return this.applyOneNpcPerSceneMode(state, p);
  }
}
