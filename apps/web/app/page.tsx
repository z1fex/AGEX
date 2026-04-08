"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.15 } },
};

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6">
      <motion.div
        className="text-center max-w-2xl"
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        {/* Name */}
        <motion.h1
          className="text-[8rem] sm:text-[12rem] font-black tracking-tighter leading-none text-white glow-text"
          variants={fadeIn}
          transition={{ duration: 1 }}
        >
          AGEX
        </motion.h1>

        {/* Version */}
        <motion.p
          className="mt-2 text-sm tracking-widest uppercase text-[rgb(60,60,60)]"
          variants={fadeIn}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          v1
        </motion.p>

        {/* Tagline */}
        <motion.p
          className="mt-6 text-lg sm:text-xl text-[rgb(116,116,116)] leading-relaxed"
          variants={fadeUp}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Your AI agency. 113 agents. 8 teams.
          <br />
          One conversation.
        </motion.p>

        {/* CTA */}
        <motion.div
          className="mt-16"
          variants={fadeUp}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <motion.button
            onClick={() => router.push("/dashboard/chat")}
            className="group relative inline-flex items-center justify-center rounded-full border border-[rgb(45,45,45)] bg-transparent px-10 py-4 text-sm font-medium tracking-wide text-white cursor-pointer transition-all hover:border-white hover:bg-white hover:text-black"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Start talking
            <span className="ml-3 inline-block transition-transform group-hover:translate-x-1">
              &rarr;
            </span>
          </motion.button>
        </motion.div>

        {/* Stats — minimal */}
        <motion.div
          className="mt-24 flex items-center justify-center gap-12 text-[rgb(116,116,116)]"
          variants={fadeUp}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-white">8</div>
            <div className="mt-1 text-xs uppercase tracking-widest">Teams</div>
          </div>
          <div className="h-8 w-px bg-[rgb(45,45,45)]" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">113+</div>
            <div className="mt-1 text-xs uppercase tracking-widest">Agents</div>
          </div>
          <div className="h-8 w-px bg-[rgb(45,45,45)]" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">9</div>
            <div className="mt-1 text-xs uppercase tracking-widest">Workflows</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
