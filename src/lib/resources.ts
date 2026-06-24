import type { Resource } from "@/types/resource";

export const starterResources: Resource[] = [
  {
    id: "988",
    title: "988 Suicide & Crisis Lifeline",
    description: "Call or text 988 in the U.S. for immediate crisis support.",
    href: "https://988lifeline.org/",
    type: "person",
    problemTypes: ["stress", "burnout", "overwhelm", "unclear"]
  },
  {
    id: "crisis-text-line",
    title: "Crisis Text Line",
    description: "Text HOME to 741741 in the U.S. to connect with a trained crisis counselor.",
    href: "https://www.crisistextline.org/",
    type: "person",
    problemTypes: ["stress", "overwhelm", "unclear"]
  },
  {
    id: "todoist-priority",
    title: "Todoist Priority Method",
    description: "A simple tool-based way to turn mental clutter into a short task list.",
    href: "https://todoist.com/productivity-methods",
    type: "tool",
    problemTypes: ["overwhelm", "procrastination", "decision_fatigue"]
  }
];
