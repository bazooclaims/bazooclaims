import Image from "next/image";

const scenes = [
  {
    src: "/brand/motor-bmw-bazoo.png",
    alt: "Bazoo-branded executive saloon — representative of our accident management fleet context.",
  },
  {
    src: "/brand/motor-damaged-bmw.png",
    alt: "Example front-end collision damage — illustrative of the vehicles we support through claims.",
    mirror: true,
  },
  {
    src: "/brand/motor-mercedes-bazoo.png",
    alt: "Bazoo accident management branded vehicle — professional UK motor claims service.",
  },
] as const;

export function MotorImageryStrip() {
  return (
    <section
      className="border-y border-[var(--color-surface)]/10 bg-[var(--color-page)] py-10 sm:py-14"
      aria-labelledby="motor-imagery-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2
          id="motor-imagery-heading"
          className="text-lg font-semibold tracking-tight text-[var(--color-ink)] sm:text-xl"
        >
          UK motor claims &amp; fleet presence
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--color-ink-muted)]">
          Bazoo-branded imagery and representative damage context — for marketing and trust only,
          not a depiction of a specific live claim.
        </p>
        <ul className="mt-8 grid list-none gap-4 p-0 sm:grid-cols-3 sm:gap-5">
          {scenes.map((item) => (
            <li
              key={item.src}
              className="overflow-hidden rounded-2xl border border-[var(--color-surface)]/10 bg-[var(--color-page-elevated)] shadow-sm ring-1 ring-black/[0.04]"
            >
              <div className="relative aspect-[4/5] w-full sm:aspect-[3/4]">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className={`object-cover object-center ${"mirror" in item && item.mirror ? "-scale-x-100" : ""}`}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
