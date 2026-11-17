import {
  ValidatorConstraint,
  type ValidationArguments,
  type ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({
  name: "atLeastOneIngredientGroup",
  async: false,
})
export class AtLeastOneIngredientGroupConstraint
  implements ValidatorConstraintInterface
{
  validate(_: unknown, args: ValidationArguments): boolean {
    const obj = args.object as {
      pantryItemIds?: string[];
      customIngredients?: string[];
    };

    const pantryItemFilled =
      Array.isArray(obj.pantryItemIds) && obj.pantryItemIds.length > 0;

    const customIngredientsFilled =
      Array.isArray(obj.customIngredients) &&
      obj.customIngredients.length > 0;

    return pantryItemFilled || customIngredientsFilled;
  }

  defaultMessage(): string {
    return "At least one ingredient group must contain ingredients.";
  }
}
