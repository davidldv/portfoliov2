import { Hero } from "@/components/hero/Hero";
import { Proof } from "@/components/sections/Proof";
import { Work } from "@/components/sections/Work";
import { AttackSurface } from "@/components/sections/AttackSurface";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { Timeline } from "@/components/sections/Timeline";
import { Writing } from "@/components/sections/Writing";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <Proof />
      <Work />
      <AttackSurface />
      <About />
      <Skills />
      <Timeline />
      <Writing />
      <Contact />
    </>
  );
}
