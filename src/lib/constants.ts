export const BELTS = [
  'White',
  'Yellow',
  'Orange',
  'Green',
  'Blue',
  'Brown',
  'Black Belt',
] as const;

export type BeltType = typeof BELTS[number];

export function calculateAgeAndCategory(birthYear: number): { age: number; category: string } {
  const currentYear = 2026;
  const age = Math.max(0, currentYear - birthYear);
  let category = '';

  if (age < 6) {
    category = 'Under 6';
  } else if (age < 8) {
    category = 'Under 8';
  } else if (age < 10) {
    category = 'Under 10';
  } else if (age < 12) {
    category = 'Under 12';
  } else if (age < 18) {
    category = 'Teens';
  } else {
    category = 'Adults';
  }

  return { age, category };
}
