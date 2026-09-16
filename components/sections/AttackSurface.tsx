import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { AttackSurfaceMap } from "@/components/map/AttackSurfaceMap";

export function AttackSurface() {
  return (
    <section id="attack-surface" className="relative z-10 border-t border-border bg-bg py-24 md:py-32">
      <div className="bg-grid mask-fade-y pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="container-x relative flex flex-col gap-14">
        <SectionHeader
          index="02"
          eyebrow="Attack surface"
          heading={
            <>
              A threat model you can <span className="serif-italic text-accent">poke at</span>.
            </>
          }
          intro="The auth and realtime layer of PairCode, laid out by trust zone. Attacker view shows what crosses each boundary; defender view shows what stops it. Drag things around."
        />
        <Reveal y={40} start="top 80%">
          <AttackSurfaceMap />
        </Reveal>
      </div>
    </section>
  );
}
