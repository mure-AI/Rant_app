type ProblemCardProps = {
  title: string;
  body: string;
};

export function ProblemCard({ title, body }: ProblemCardProps) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white/80 p-4">
      <h2 className="text-lg font-black">{title}</h2>
      <p className="mt-2 leading-7 text-stone-700">{body}</p>
    </section>
  );
}
