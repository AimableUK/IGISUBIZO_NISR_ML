/** Schematic tile map of Rwanda's 30 districts (north up, not to scale). */
export type Province = "Kigali" | "Southern" | "Western" | "Northern" | "Eastern";
export const PROVINCES: Province[] = ["Kigali", "Northern", "Eastern", "Southern", "Western"];

export const DISTRICT_TILES: Record<string, { col: number; row: number; province: Province }> = {
  Rubavu: { col: 0, row: 0, province: "Western" },
  Musanze: { col: 1, row: 0, province: "Northern" },
  Burera: { col: 2, row: 0, province: "Northern" },
  Gicumbi: { col: 3, row: 0, province: "Northern" },
  Nyagatare: { col: 5, row: 0, province: "Eastern" },
  Nyabihu: { col: 0, row: 1, province: "Western" },
  Gakenke: { col: 1, row: 1, province: "Northern" },
  Rulindo: { col: 2, row: 1, province: "Northern" },
  Gasabo: { col: 3, row: 1, province: "Kigali" },
  Gatsibo: { col: 5, row: 1, province: "Eastern" },
  Rutsiro: { col: 0, row: 2, province: "Western" },
  Ngororero: { col: 1, row: 2, province: "Western" },
  Nyarugenge: { col: 2, row: 2, province: "Kigali" },
  Kicukiro: { col: 3, row: 2, province: "Kigali" },
  Rwamagana: { col: 4, row: 2, province: "Eastern" },
  Kayonza: { col: 5, row: 2, province: "Eastern" },
  Karongi: { col: 0, row: 3, province: "Western" },
  Muhanga: { col: 1, row: 3, province: "Southern" },
  Kamonyi: { col: 2, row: 3, province: "Southern" },
  Bugesera: { col: 4, row: 3, province: "Eastern" },
  Ngoma: { col: 5, row: 3, province: "Eastern" },
  Kirehe: { col: 6, row: 3, province: "Eastern" },
  Nyamasheke: { col: 0, row: 4, province: "Western" },
  Nyamagabe: { col: 1, row: 4, province: "Southern" },
  Ruhango: { col: 2, row: 4, province: "Southern" },
  Nyanza: { col: 3, row: 4, province: "Southern" },
  Rusizi: { col: 0, row: 5, province: "Western" },
  Nyaruguru: { col: 1, row: 5, province: "Southern" },
  Huye: { col: 2, row: 5, province: "Southern" },
  Gisagara: { col: 3, row: 5, province: "Southern" },
};
export const DISTRICTS = Object.keys(DISTRICT_TILES);
