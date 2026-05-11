import type { GradeOption } from "../types";

export const gradeOptions: GradeOption[] = [
  { label: "10° kyu", value: "10", numericValue: 10 },
  { label: "9° kyu", value: "9", numericValue: 9 },
  { label: "8° kyu", value: "8", numericValue: 8 },
  { label: "7° kyu", value: "7", numericValue: 7 },
  { label: "6° kyu", value: "6", numericValue: 6 },
  { label: "5° kyu", value: "5", numericValue: 5 },
  { label: "4° kyu", value: "4", numericValue: 4 },
  { label: "3° kyu", value: "3", numericValue: 3 },
  { label: "2° kyu", value: "2", numericValue: 2 },
  { label: "1° kyu", value: "1", numericValue: 1 },
  { label: "1° dan", value: "-1", numericValue: -1 },
  { label: "2° dan", value: "-2", numericValue: -2 },
  { label: "3° dan", value: "-3", numericValue: -3 },
  { label: "4° dan o más", value: "-4", numericValue: -4 },
];

export function getGradeOption(value: string) {
  return gradeOptions.find((grade) => grade.value === value);
}
