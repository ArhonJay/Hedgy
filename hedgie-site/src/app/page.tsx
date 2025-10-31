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

const THEME = {
  tg: "#229ED9",
  tgDark: "#1B8BBF",
  ink: "#0B1220",
  text: "#556079",
  card: "#FFFFFF",
};

type FeatureKey = "register" | "send" | "launch" | "stake";

type Feature = {
  key: FeatureKey;
  label: string;
  title: string;
  desc: string;
  icon: React.ComponentType<any>;
  userLine: string;
  botReply: string;
  accent: string;
};

const FEATURES: Feature[] = [
  {
    key: "register",
    label: "/register",
    title: "Create a wallet in chat",
    desc: "Start a chat with Hedgie and instantly get a self-custodial wallet — no seed phrase.",
    icon: Wallet,
    userLine: "Hey Hedgie, /register me",
    botReply:
      "Wallet created ✅\nAddress: 0x4c…ed9\nNetwork: Hedera\nRecovery options available in /settings",
    accent: "#22A6F2",
  },
  {
    key: "send",
    label: "/send",
    title: "Send & receive crypto",
    desc: "Move stablecoins or HBAR with low fees and human-readable confirmations.",
    icon: Send,
    userLine: "Send 10 USDC to @mia",
    botReply: "Sent 10 USDC to @mia 💸\nTxn: 0x8f…a21\nView on explorer →",
    accent: "#12B981",
  },
  {
    key: "launch",
    label: "/launchToken",
    title: "Launch community tokens",
    desc: "Spin up a token for your Telegram group and reward members for contributions.",
    icon: Rocket,
    userLine: "Launch $VIBES token for our group",
    botReply:
      "$VIBES created 🎉\nSupply: 1,000,000\nTicker: VIBES\nTry /airdrop 100 VIBES to active members",
    accent: "#A855F7",
  },
  {
    key: "stake",
    label: "/stake",
    title: "Stake & earn",
    desc: "Lock assets to grow your balance with transparent, on-chain rewards.",
    icon: Lock,
    userLine: "Stake 250 HBAR",
    botReply: "Staked 250 HBAR 🌱\nAPY: 7.4%\nUnstake anytime with /unstake",
    accent: "#F59E0B",
  },
];

function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/* --------------------------------- Page --------------------------------- */
export default function Page() {
  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--tg", THEME.tg);
    r.setProperty("--tgDark", THEME.tgDark);
    r.setProperty("--ink", THEME.ink);
    r.setProperty("--body", THEME.text);
  }, []);

  return (
    <div
      className={cx(
        inter.className,
        "min-h-screen bg-[radial-gradient(60%_60%_at_10%_10%,rgba(34,158,217,0.08),transparent),radial-gradient(45%_45%_at_90%_10%,rgba(27,191,122,0.06),transparent)] text-[color:var(--body)]"
      )}
    >
      <Navbar />
      <Hero />
      <FeatureSection />
      <HowItWorks />
      <Faq />
      <Footer />
    </div>
  );
}

/* -------------------------------- Navbar -------------------------------- */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      className={cx(
        "sticky top-0 z-40 w-full transition-all",
        scrolled ? "backdrop-blur bg-white/75 shadow-sm" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <a href="#" className="flex items-center gap-3">
          <div className="relative">
            <span
              className="block h-8 w-8 rounded-xl"
              style={{ background: "var(--tg)" }}
            />
            <BotMessageSquare className="absolute -right-2 -top-2 h-4 w-4 text-sky-400" />
          </div>
          <span className="text-lg font-semibold text-[color:var(--ink)]">
            Hedgie
          </span>
        </a>

        <div className="hidden items-center gap-6 md:flex">
          <a href="#features" className="text-sm hover:text-[color:var(--ink)]">
            Features
          </a>
          <a href="#how" className="text-sm hover:text-[color:var(--ink)]">
            How it works
          </a>
          <a href="#faq" className="text-sm hover:text-[color:var(--ink)]">
            FAQ
          </a>
        </div>

        <a
          href="https://t.me/"
          className="rounded-xl px-3 py-2 text-sm font-semibold text-white shadow transition hover:shadow-md focus:outline-none focus:ring"
          style={{ background: "var(--tg)" }}
        >
          Try on Telegram
        </a>
      </div>
    </div>
  );
}

/* --------------------------------- Hero --------------------------------- */
function Hero() {
  return (
    <section id="home" className="relative overflow-hidden">
      {/* decorative glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -top-56 left-1/2 h-[720px] w-[720px] -translate-x-1/2 rounded-full blur-3xl opacity-80"
          style={{
            background:
              "radial-gradient(closest-side, rgba(34,158,217,.28), transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-40 left-12 h-[520px] w-[520px] rounded-full blur-3xl opacity-70"
          style={{
            background:
              "radial-gradient(closest-side, rgba(18,185,129,.18), transparent 70%)",
          }}
        />
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 md:grid-cols-[1.1fr_.9fr] md:px-6 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            <BotMessageSquare className="h-4 w-4" />
            Telegram-native Web3 assistant
          </span>

          <h1 className="mt-2 text-4xl font-extrabold leading-tight text-[color:var(--ink)] sm:text-5xl">
            Meet Hedgie
            <br />
            <span className="bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">
              Your Web3 buddy on Telegram
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-[15px] leading-7">
            Create wallets, send crypto, launch community tokens, gift NFTs, and
            stake to earn — all inside chat. Powered by Hedera for speed, low
            fees, and transparency.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <a
              href="https://t.me/"
              className="inline-flex items-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
            >
              Try on Telegram <ArrowRight className="ml-2 h-4 w-4" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Explore features
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="grid w-full place-items-center"
        >
          <HeroCard />
        </motion.div>
      </div>
    </section>
  );
}

function HeroCard() {
  return (
    <div className="relative w-full max-w-[360px]">
      {/* mascot */}
      <div className="absolute -left-8 -top-10 hidden rotate-[-8deg] md:block">
        <Image
          src="/hedgie.png"
          alt="Hedgie mascot"
          width={96}
          height={96}
          className="drop-shadow"
          priority
        />
      </div>

      {/* phone demo */}
      <PhoneDemo />
    </div>
  );
}

/* ------------------------------ Phone Demo ------------------------------ */

type Msg = { from: "user" | "bot"; text?: string; typing?: boolean };

function PhoneDemo() {
  const [active, setActive] = useState<Feature>(FEATURES[0]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [query, setQuery] = useState("");
  const timer = useRef<any>(null);

  // start a scripted mini conversation for a feature
  useEffect(() => {
    setMessages([]);
    const run = async () => {
      await pause(250);
      push({ from: "user", text: active.userLine });
      await pause(650);
      push({ from: "bot", typing: true });
      await pause(900);
      push({ from: "bot", text: active.botReply });
    };
    run();
    return () => clearTimeout(timer.current);
  }, [active]);

  function pause(ms: number) {
    return new Promise<void>((res) => (timer.current = setTimeout(res, ms)));
  }
  function push(m: Msg) {
    setMessages((prev) => {
      const next = [...prev];
      if (m.typing) return [...next, m];
      if (next.length && next[next.length - 1].typing) next.pop();
      return [...next, m];
    });
  }

  const filtered = useMemo(() => {
    if (!query.trim()) return FEATURES;
    const q = query.toLowerCase();
    return FEATURES.filter(
      (f) =>
        f.label.toLowerCase().includes(q) ||
        f.title.toLowerCase().includes(q) ||
        f.desc.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="grid gap-4">
      {/* Command palette (search + chips) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a command… (e.g. /send)"
            className="w-full bg-transparent text-[13px] text-slate-700 outline-none"
          />
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {filtered.map((f) => (
            <button
              key={f.key}
              onClick={() => setActive(f)}
              className={cx(
                "rounded-full border px-3 py-1.5 text-sm transition",
                active.key === f.key
                  ? "border-sky-300 bg-sky-50 text-sky-800"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}
              aria-pressed={active.key === f.key}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Phone */}
      <div className="relative mx-auto w-full max-w-[340px]">
        <div
          className="absolute -inset-4 -z-10 rounded-[2rem] opacity-60 blur-2xl"
          style={{
            background: `conic-gradient(from 180deg at 50% 50%, ${active.accent}22, transparent 40%, ${active.accent}33)`,
          }}
        />
        <div className="rounded-[2rem] border border-slate-200 bg-white p-3 shadow-xl">
          <div className="rounded-[1.4rem] bg-gradient-to-b from-slate-50 to-slate-100 p-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-3">
              {/* Header */}
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-6 w-6 rounded-full"
                    style={{ background: "var(--tg)" }}
                  />
                  <div>
                    <p className="text-[13px] font-semibold text-slate-800">
                      Hedgie Bot
                    </p>
                    <p className="text-[10px] text-slate-500">online</p>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500">1:47</div>
              </div>

              {/* Chat area */}
              <div className="h-[430px] space-y-2 overflow-y-auto rounded-xl bg-slate-50 p-3">
                <BotBubble
                  text={`Try ${active.label} to ${
                    active.title
                  }.`.replace(/\.$/, "")}
                />
                <AnimatePresence initial={false}>
                  {messages.map((m, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                    >
                      {m.from === "user" ? (
                        <UserBubble text={m.text!} />
                      ) : m.typing ? (
                        <BotBubble typing />
                      ) : (
                        <BotBubble text={m.text!} accent={active.accent} />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Composer */}
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2">
                <input
                  readOnly
                  value={active.label + " …"}
                  className="w-full bg-transparent text-[13px] text-slate-700 outline-none"
                />
                <button
                  className="grid h-8 w-8 place-content-center rounded-lg text-white"
                  style={{ background: "var(--tg)" }}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Caption */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{active.title}</h3>
        <p className="max-w-[48ch] text-sm text-slate-600">{active.desc}</p>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-sky-400 [animation-delay:-200ms]" />
      <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-sky-400 [animation-delay:-100ms]" />
      <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-sky-400" />
    </div>
  );
}

function BotBubble({
  text,
  typing = false,
  accent = "#229ED9",
}: {
  text?: string;
  typing?: boolean;
  accent?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div
        className="mt-0.5 h-6 w-6 shrink-0 rounded-full"
        style={{ background: "var(--tg)" }}
      />
      <div className="max-w-[76%] rounded-2xl rounded-tl-sm border border-slate-200 bg-white p-2.5 text-[13px] text-slate-700 shadow-sm">
        {typing ? (
          <TypingDots />
        ) : (
          <pre className="whitespace-pre-wrap font-sans" style={{ lineHeight: 1.35 }}>
            {text}
          </pre>
        )}
        {!typing && (
          <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5" style={{ color: accent }} />
            on Hedera
          </div>
        )}
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[76%] rounded-2xl rounded-tr-sm bg-sky-600/90 px-3 py-2 text-[13px] text-white shadow">
        {text}
      </div>
    </div>
  );
}

/* ------------------------------ Features ------------------------------ */
function FeatureSection() {
  return (
    <section id="features" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold text-[color:var(--ink)] sm:text-4xl">
            From sending to staking — Hedgie handles it all
          </h2>
          <p className="mt-3 text-[15px] leading-7">
            Bring the power of Web3 to your Telegram chats. Hedgie helps you
            move value, grow communities, and build savings — one command at a
            time.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.key}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-xl p-2" style={{ background: `${f.accent}22` }}>
                  <f.icon className="h-5 w-5" style={{ color: f.accent }} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{f.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{f.desc}</p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
                    <code className="font-semibold text-slate-800">
                      {f.label}
                    </code>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- How It Works ---------------------------- */
function HowItWorks() {
  const steps = [
    {
      icon: BotMessageSquare,
      title: "Start a chat",
      body: "Open Hedgie on Telegram and say hi. No app installs.",
    },
    {
      icon: Wallet,
      title: "Get your wallet",
      body: "Hedgie spins a wallet for you with recovery options.",
    },
    {
      icon: Send,
      title: "Move value",
      body: "Send HBAR or stablecoins, launch tokens, gift NFTs, or stake.",
    },
  ];
  return (
    <section id="how" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold text-[color:var(--ink)] sm:text-4xl">
            How it works
          </h2>
          <p className="mt-3 text-[15px] leading-7">Three steps and you're in.</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm"
            >
              <div className="mx-auto mb-3 w-fit rounded-xl bg-sky-50 p-3">
                <s.icon className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.body}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href="https://t.me/"
            className="inline-flex items-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
          >
            Try on Telegram <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- FAQ --------------------------------- */
function Faq() {
  const items = [
    {
      q: "Is Hedgie self-custodial?",
      a: "Yes. Hedgie creates keys for you and provides recovery options. You stay in control while enjoying chat-native UX.",
    },
    {
      q: "Which chains are supported?",
      a: "Hedgie is powered by Hedera for speed, low cost, and transparency. Multi-chain bridges are on the roadmap.",
    },
    {
      q: "Does this work in groups?",
      a: "Absolutely. Most features shine in Telegram groups — tipping, token launches, leaderboards, and quests.",
    },
    {
      q: "Fees & limits?",
      a: "Hedera’s fees are measured in fractions of a cent. Hedgie adds zero markup for P2P actions.",
    },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold text-[color:var(--ink)] sm:text-4xl">
            FAQ
          </h2>
        </div>

        <div className="mx-auto mt-8 max-w-2xl divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {items.map((it, idx) => (
            <div key={idx} className="p-5">
              <button
                className="flex w-full items-center justify-between text-left"
                onClick={() => setOpen(open === idx ? -1 : idx)}
              >
                <span className="text-[15px] font-semibold text-slate-900">
                  {it.q}
                </span>
                <motion.span animate={{ rotate: open === idx ? 180 : 0 }}>
                  <ArrowRight className="h-4 w-4 text-slate-500" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open === idx && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden pt-2 text-sm leading-6 text-slate-600"
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

/* -------------------------------- Footer -------------------------------- */
function Footer() {
  return (
    <footer className="border-t border-slate-200 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm md:flex-row md:px-6">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-md"
            style={{ background: "var(--tg)" }}
          />
          <span>© {new Date().getFullYear()} Hedgie</span>
        </div>
        <div className="flex items-center gap-4">
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
      </div>
    </footer>
  );
}
