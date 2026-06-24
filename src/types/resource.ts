import type { ProblemType, ResourceType } from "./analysis";

export type Resource = {
  id: string;
  title: string;
  description: string;
  href: string;
  type: Exclude<ResourceType, "none">;
  problemTypes: ProblemType[];
};
