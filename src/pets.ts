import { featured, type Pet } from "./content";
import gen from "./pets.json";

// Все животные приюта: избранные с главной + остальные (scripts/gen-pets.py)
export const allPets: Pet[] = [...featured, ...(gen as Pet[])];
