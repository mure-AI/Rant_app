type ProblemCardProps = {
  title: string;
  body: string;
};

export function ProblemCard({ title, body }: ProblemCardProps) {
  return (
    <section className="rounded-lg border border-line bg-white p-4">
      <h2 className="text-lg font-black">{title}</h2>
      <p className="mt-2 leading-7 text-charcoal/75">{body}</p>
    </section>
  );
}
