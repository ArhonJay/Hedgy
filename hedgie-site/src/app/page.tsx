"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Inter } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import {
  BotMessageSquare,
  Send,
  Wallet,
  Rocket,
  Lock,
  ArrowRight,
  ShieldCheck,
  Search,
  ChevronDown,
} from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

/* -------------------------------------------------------------------------- */
/*                               TYPE DEFINITIONS                             */
/* -------------------------------------------------------------------------- */
type FeatureKey = "register" | "send" | "launch" | "stake";

interface Feature {
  key: FeatureKey;
  label: string;
  title: string;
  desc: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  userLine: string;
  botReply: string;
  accent: string;
}

/* -------------------------------------------------------------------------- */
/*                               FEATURE DATA                                 */
/* -------------------------------------------------------------------------- */
const FEATURES: Feature[] = [
  {
    key: "register",
    label: "/register",
    title: "Create a wallet in chat",
    desc: "Instant self-custodial wallet — no seed phrase.",
    icon: Wallet,
    userLine: "Hey Hedgie, /register me",
    botReply:
      "Wallet created ✅\nAddress: 0x4c…ed9\nNetwork: Hedera\nRecovery options: /settings",
    accent: "#22A6F2",
  },
  {
    key: "send",
    label: "/send",
    title: "Send & receive crypto",
    desc: "Move stablecoins or HBAR with tiny fees.",
    icon: Send,
    userLine: "Send 10 USDC to @mia",
    botReply: "Sent 10 USDC to @mia 💸\nTxn: 0x8f…a21\nView on explorer →",
    accent: "#12B981",
  },
  {
    key: "launch",
    label: "/launchToken",
    title: "Launch community tokens",
    desc: "Create a token for your Telegram group.",
    icon: Rocket,
    userLine: "Launch $VIBES token for our group",
    botReply:
      "$VIBES created 🎉\nSupply: 1,000,000\nTicker: VIBES\nTry /airdrop 100 VIBES",
    accent: "#A855F7",
  },
  {
    key: "stake",
    label: "/stake",
    title: "Stake & earn",
    desc: "Lock assets for transparent, on-chain rewards.",
    icon: Lock,
    userLine: "Stake 250 HBAR",
    botReply: "Staked 250 HBAR 🌱\nAPY: 7.4%\nUnstake: /unstake",
    accent: "#F59E0B",
  },
];

const cx = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */
export default function Page() {
  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--bg", "#0B1020");
    r.setProperty("--surface", "#0F1629");
    r.setProperty("--outline", "#1E2B47");
    r.setProperty("--ink", "#E6F1FF");
    r.setProperty("--text", "#A8B3CF");
    r.setProperty("--tg", "#229ED9");
  }, []);

  return (
    <div
      className={cx(
        inter.className,
        "min-h-screen bg-[color:var(--bg)] text-[color:var(--text)]",
        "bg-[radial-gradient(55%_55%_at_10%_10%,rgba(34,158,217,0.10),transparent),radial-gradient(45%_45%_at_90%_12%,rgba(18,185,129,0.08),transparent)]"
      )}
    >
      <Navbar />
      <Hero />
      <FeaturesSection />
      <HowItWorks />
      <Faq />
      <Footer />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  NAVBAR                                    */
/* -------------------------------------------------------------------------- */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cx(
        "sticky top-0 z-40 w-full transition-all",
        scrolled
          ? "backdrop-blur bg-[rgba(8,12,24,0.7)] border-b border-[color:var(--outline)]"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <a href="#" className="flex items-center gap-3">
          <div className="relative">
            <span
              className="block h-8 w-8 rounded-xl"
              style={{ background: "var(--tg)" }}
            />
            <BotMessageSquare className="absolute -right-2 -top-2 h-4 w-4 text-sky-300" />
          </div>
          <span className="text-lg font-semibold text-[color:var(--ink)]">
            Hedgie
          </span>
        </a>
        <div className="hidden md:flex items-center gap-6 text-sm">
          <a href="#features" className="hover:text-[color:var(--ink)]">
            Features
          </a>
          <a href="#how" className="hover:text-[color:var(--ink)]">
            How it works
          </a>
          <a href="#faq" className="hover:text-[color:var(--ink)]">
            FAQ
          </a>
        </div>
        <a
          href="https://t.me/"
          className="rounded-xl bg-[color:var(--tg)] px-3 py-2 text-sm font-semibold text-white hover:shadow-[0_0_0_3px_rgba(34,158,217,0.25)]"
        >
          Try on Telegram
        </a>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   HERO                                     */
/* -------------------------------------------------------------------------- */
function Hero() {
  return (
    <section className="relative overflow-hidden py-20 text-center">
      <div className="mx-auto flex max-w-5xl flex-col items-center px-4 md:px-6">
        {/* mascot small */}
        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-[color:var(--outline)] bg-[color:var(--surface)] p-1">
          <Image
            src="/hedgie.png"
            alt="Hedgie mascot"
            width={44}
            height={44}
            className="rounded-xl object-contain"
            priority
          />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl text-5xl font-black leading-[1.05] text-[color:var(--ink)] sm:text-6xl lg:text-7xl"
        >
          Meet Hedgie —{" "}
          <span className="block bg-gradient-to-r from-sky-300 to-sky-500 bg-clip-text text-transparent">
            Your Web3 buddy on Telegram
          </span>
        </motion.h1>

        <p className="mt-4 max-w-2xl text-[15px] leading-7">
          Create wallets, send crypto, launch community tokens, gift NFTs, and
          stake to earn — all inside chat. Powered by Hedera for speed, low
          fees, and transparency.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href="https://t.me/"
            className="inline-flex items-center rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
          >
            Try on Telegram <ArrowRight className="ml-2 h-4 w-4" />
          </a>
          <a
            href="#features"
            className="inline-flex items-center rounded-xl border border-[color:var(--outline)] bg-[color:var(--surface)] px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-[#111a31]"
          >
            Explore features
          </a>
        </div>

        {/* Combined demo mock */}
        <div className="mt-12 w-full max-w-[720px]">
          <PhoneMockCombined />
        </div>
      </div>
    </section>
  );
}

function PhoneMockCombined() {
  return (
    <div className="rounded-[2rem] border border-[color:var(--outline)] bg-[color:var(--surface)] p-3 shadow-lg">
      <div className="rounded-[1.4rem] bg-[#0A1224] p-3">
        <div className="rounded-2xl border border-[color:var(--outline)] bg-[#0C1530] p-3">
          <div className="h-[380px] overflow-hidden rounded-xl bg-[#0B142B] p-3 text-left">
            <BotBubble text="Welcome! Try /register, /send, /launchToken, /stake" accent="#67e8f9" />
            <UserBubble text="/register" />
            <BotBubble text="Wallet created ✅  Address: 0x4c…ed9  Network: Hedera" accent="#38bdf8" />
            <UserBubble text="/send 10 USDC to @mia" />
            <BotBubble text="Sent 10 USDC to @mia 💸  Txn: 0x8f…a21" accent="#34d399" />
            <UserBubble text="/launchToken $VIBES" />
            <BotBubble text="$VIBES created 🎉  Supply: 1,000,000" accent="#a78bfa" />
            <UserBubble text="/stake 250 HBAR" />
            <BotBubble text="Staked 250 HBAR 🌱  APY: 7.4%" accent="#fbbf24" />
          </div>
        </div>
      </div>
    </div>
  );
}

function BotBubble({ text, accent }: { text: string; accent: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-[color:var(--tg)]" />
      <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-[color:var(--outline)] bg-[#0F1A36] p-2.5 text-[13px] text-slate-200">
        <pre className="whitespace-pre-wrap font-sans">{text}</pre>
        <div className="mt-1 text-[10px]" style={{ color: accent }}>
          on Hedera
        </div>
      </div>
    </div>
  );
}
function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-sky-600/90 px-3 py-2 text-[13px] text-white shadow">
        {text}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                       INTERACTIVE FEATURES SECTION                         */
/* -------------------------------------------------------------------------- */

function FeaturesSection() {
  const [active, setActive] = useState<FeatureKey>("register");
  const [typing, setTyping] = useState(false);

  const feature = useMemo(
    () => FEATURES.find((f) => f.key === active)!,
    [active]
  );

  // typing animation simulation
  useEffect(() => {
    setTyping(true);
    const t = setTimeout(() => setTyping(false), 1200);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <section id="features" className="py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 md:flex-row md:gap-12">
        {/* Left: Chat Demo */}
        <motion.div
          key={feature.key}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex w-full max-w-md flex-col rounded-[2rem] border border-[color:var(--outline)] bg-[color:var(--surface)] p-3 shadow-lg"
        >
          <div className="rounded-[1.4rem] bg-[#0A1224] p-3">
            <div className="rounded-2xl border border-[color:var(--outline)] bg-[#0C1530] p-3">
              <div className="h-[420px] overflow-hidden rounded-xl bg-[#0B142B] p-3 text-left">
                <BotBubble
                  text="Welcome! Try /register, /send, /launchToken, /stake"
                  accent="#67e8f9"
                />
                <UserBubble text={feature.userLine} />
                <TypingDots visible={typing} />
                {!typing && <BotBubble text={feature.botReply} accent={feature.accent} />}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Feature Details */}
        <div className="mt-10 w-full md:mt-0 md:max-w-md">
          <div className="flex flex-wrap justify-center gap-3 md:justify-start">
            {FEATURES.map((f) => (
              <button
                key={f.key}
                onClick={() => setActive(f.key)}
                className={cx(
                  "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all",
                  active === f.key
                    ? "border-transparent bg-[color:var(--tg)] text-white shadow-md"
                    : "border-[color:var(--outline)] bg-[color:var(--surface)] hover:bg-[#111a31]"
                )}
              >
                <f.icon className="h-4 w-4" />
                {f.label}
              </button>
            ))}
          </div>

          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mt-6"
          >
            <h3 className="text-xl font-bold text-[color:var(--ink)]">
              {feature.title}
            </h3>
            <p className="mt-2 text-[15px] leading-7 text-[color:var(--text)]">
              {feature.desc}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function TypingDots({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-start gap-2"
        >
          <div className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-[color:var(--tg)]" />
          <div className="flex gap-1 rounded-2xl rounded-tl-sm border border-[color:var(--outline)] bg-[#0F1A36] p-2.5 text-[13px] text-slate-200">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-slate-400"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/*                               HOW IT WORKS                                 */
/* -------------------------------------------------------------------------- */
function HowItWorks() {
  const steps = [
    {
      icon: BotMessageSquare,
      title: "Start a chat",
      body: "Open Hedgie on Telegram and say hi.",
    },
    {
      icon: Wallet,
      title: "Get your wallet",
      body: "Hedgie spins a wallet for you with recovery options.",
    },
    {
      icon: Send,
      title: "Move value",
      body: "Send HBAR or stablecoins, launch tokens, or stake.",
    },
  ];

  return (
    <section id="how" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6 text-center">
        <h2 className="text-3xl font-extrabold text-[color:var(--ink)]">
          How it works
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="rounded-2xl border border-[color:var(--outline)] bg-[color:var(--surface)] p-5"
            >
              <s.icon className="mx-auto h-6 w-6 text-sky-300" />
              <h3 className="mt-2 font-semibold text-sky-100">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-300">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    FAQ                                    */
/* -------------------------------------------------------------------------- */
function Faq() {
  const items = [
    {
      q: "Is Hedgie self-custodial?",
      a: "Yes. Keys are created for you with recovery options. You stay in control while enjoying chat-native UX.",
    },
    {
      q: "Which chains are supported?",
      a: "Powered by Hedera for speed, low cost, and transparency.",
    },
    {
      q: "Does this work in groups?",
      a: "Absolutely — tipping, token launches, leaderboards, and quests thrive in Telegram groups.",
    },
  ];
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-16 md:py-24">
      <div className="mx-auto max-w-2xl px-4 md:px-6">
        <h2 className="text-3xl font-extrabold text-[color:var(--ink)] text-center">
          FAQ
        </h2>
        <div className="mt-8 divide-y divide-[color:var(--outline)] rounded-2xl border border-[color:var(--outline)] bg-[color:var(--surface)]">
          {items.map((it, i) => (
            <div key={i} className="p-5">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="text-[15px] font-semibold text-sky-100">
                  {it.q}
                </span>
                <motion.span animate={{ rotate: open === i ? 90 : 0 }}>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden pt-2 text-sm text-slate-300"
                  >
                    {it.a}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   FOOTER                                   */
/* -------------------------------------------------------------------------- */
function Footer() {
  return (
    <footer className="border-t border-[color:var(--outline)] py-10 text-center text-sm text-slate-400">
      © {new Date().getFullYear()} Hedgie — Built with ❤️ on Hedera
    </footer>
  );
}


