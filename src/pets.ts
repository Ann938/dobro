import { featured, type Pet } from "./content";
import gen from "./pets.json";
import { nbDeep } from "./lib/typo";

// Все животные приюта: избранные с главной + остальные (scripts/gen-pets.py)
export const allPets: Pet[] = [...featured, ...nbDeep(gen as Pet[])];
