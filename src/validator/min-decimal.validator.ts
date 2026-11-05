import {
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'minDecimal', async: false })
export class MinDecimalValidator implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    const numericValue = Number(value);

    return Number.isFinite(numericValue) && numericValue >= 0.01;
  }

  defaultMessage(): string {
    return 'Quantity must be greater than or equal to 0.01.';
  }
}
