import { connectDatabase, db } from "./db.ts";
import ingredientsJson from "./data/ingredients.json" with { type: "json" };

type IngredientSeed = (typeof ingredientsJson)[number];
type IngredientInput = Parameters<typeof db.orm.public.Ingredient.create>[0];

const dec = (v: number | null, scale = 2) => (v === null ? null : v.toFixed(scale));

function toInput(i: IngredientSeed): IngredientInput {
  return {
    name: i.name,
    slug: i.slug,
    aliases: i.aliases,
    category: i.category,
    source: i.source,
    externalCode: i.externalCode,
    energyKcal: dec(i.energyKcal),
    proteinG: dec(i.proteinG),
    carbsG: dec(i.carbsG),
    fatG: dec(i.fatG),
    saturatedFatG: dec(i.saturatedFatG),
    fiberG: dec(i.fiberG),
    sugarsG: dec(i.sugarsG),
    sodiumMg: dec(i.sodiumMg),
    glycemicIndex: i.glycemicIndex,
    gramsPerUnit: dec(i.gramsPerUnit),
    gramsPerMl: dec(i.gramsPerMl, 3),
    allergens: i.allergens,
  } as unknown as IngredientInput;
}

async function main() {
  await connectDatabase();

  let created = 0;
  let skipped = 0;

  for (const ingredient of ingredientsJson) {
    const exists = await db.orm.public.Ingredient.where({ slug: ingredient.slug }).first();
    if (exists) {
      skipped++;
      continue;
    }
    await db.orm.public.Ingredient.create(toInput(ingredient));
    created++;
  }

  console.log(`✔ Ingredientes TACO: ${created} criados, ${skipped} já existiam (total ${ingredientsJson.length}).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.close());
