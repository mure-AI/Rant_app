import type { Resource } from "@/types/resource";

type ResourceListProps = {
  resources: Resource[];
};

export function ResourceList({ resources }: ResourceListProps) {
  if (resources.length === 0) {
    return <p className="text-sm font-bold text-stone-600">No resources in this category yet.</p>;
  }

  return (
    <div className="grid gap-3">
      {resources.map((resource) => (
        <a
          className="focus-ring rounded-lg border border-stone-300 bg-white/80 p-4 transition hover:-translate-y-0.5"
          href={resource.href}
          key={resource.id}
          rel="noreferrer"
          target="_blank"
        >
          <h3 className="font-black">{resource.title}</h3>
          <p className="mt-1 text-sm leading-6 text-stone-600">{resource.description}</p>
        </a>
      ))}
    </div>
  );
}
