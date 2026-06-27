import type { Resource } from "@/types/resource";

type ResourceListProps = {
  resources: Resource[];
};

export function ResourceList({ resources }: ResourceListProps) {
  if (resources.length === 0) {
    return <p className="text-sm font-bold text-muted">No resources in this category yet.</p>;
  }

  return (
    <div className="grid gap-3">
      {resources.map((resource) => (
        <a
          className="focus-ring rounded-xl border border-line bg-white p-4 transition hover:border-tide"
          href={resource.href}
          key={resource.id}
          rel="noreferrer"
          target="_blank"
        >
          <h3 className="font-semibold tracking-tight">{resource.title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted">{resource.description}</p>
        </a>
      ))}
    </div>
  );
}
