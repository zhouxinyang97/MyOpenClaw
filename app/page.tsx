"use client";

import { useEffect, useMemo, useState } from "react";

type Filter = "all" | "active" | "completed";

type Locale = "zh" | "en";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
};

type GoldQuote = {
  price: number;
  currency: string;
  updatedAt: string;
};

const STORAGE_KEY = "focus-todo-items";
const LOCALE_KEY = "focus-todo-locale";

const translations = {
  zh: {
    brand: "Focus Todo",
    title: "今天要完成哪些事？",
    subtitle: "轻量、清爽、专注的待办清单。所有数据保存在浏览器本地。",
    inputPlaceholder: "写下下一件要做的事…",
    add: "添加任务",
    stats: (completed: number, total: number) =>
      `已完成 ${completed} / ${total}`,
    filters: { all: "全部", active: "进行中", completed: "已完成" },
    clearCompleted: "清除已完成",
    empty: "还没有任务，先写下一个吧。",
    remove: "删除",
    footer: "本地存储 · 无需登录 · 现代极简",
    language: "EN",
    goldLabel: "黄金现价",
    goldLoading: "获取中…",
    goldError: "获取失败",
  },
  en: {
    brand: "Focus Todo",
    title: "What do you want to finish today?",
    subtitle: "A clean, focused todo list. Everything stays in your browser.",
    inputPlaceholder: "Write your next task…",
    add: "Add Task",
    stats: (completed: number, total: number) =>
      `Completed ${completed} / ${total}`,
    filters: { all: "All", active: "Active", completed: "Done" },
    clearCompleted: "Clear Completed",
    empty: "No tasks yet. Add your first one.",
    remove: "Remove",
    footer: "Local storage · No login · Minimal & modern",
    language: "中文",
    goldLabel: "Gold",
    goldLoading: "Loading…",
    goldError: "Unavailable",
  },
} as const;

function loadTodos(): Todo[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Todo[];
  } catch {
    return [];
  }
}

function detectLocale(): Locale {
  if (typeof window === "undefined") return "zh";
  const saved = window.localStorage.getItem(LOCALE_KEY) as Locale | null;
  if (saved === "zh" || saved === "en") return saved;
  const browserLang = window.navigator.language.toLowerCase();
  return browserLang.startsWith("zh") ? "zh" : "en";
}

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [locale, setLocale] = useState<Locale>("zh");
  const [gold, setGold] = useState<GoldQuote | null>(null);
  const [goldError, setGoldError] = useState(false);

  useEffect(() => {
    setTodos(loadTodos());
    setLocale(detectLocale());
  }, []);

  useEffect(() => {
    let alive = true;

    const fetchGold = async () => {
      try {
        const res = await fetch("/api/gold");
        if (!res.ok) throw new Error("failed");
        const data = (await res.json()) as GoldQuote;
        if (alive) {
          setGold(data);
          setGoldError(false);
        }
      } catch {
        if (alive) setGoldError(true);
      }
    };

    fetchGold();
    const timer = setInterval(fetchGold, 60000);

    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }
  }, [todos]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCALE_KEY, locale);
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const copy = translations[locale];

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    return { total, completed };
  }, [todos]);

  const filteredTodos = useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.completed);
    if (filter === "completed") return todos.filter((t) => t.completed);
    return todos;
  }, [todos, filter]);

  const addTodo = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const next: Todo = {
      id: crypto.randomUUID(),
      title: trimmed,
      completed: false,
      createdAt: Date.now(),
    };
    setTodos((prev) => [next, ...prev]);
    setTitle("");
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const removeTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  };

  const handleKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") addTodo();
  };

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                {copy.brand}
              </div>
              <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600">
                <span className="font-medium text-slate-700">
                  {copy.goldLabel}:
                </span>{" "}
                {gold ? (
                  <span className="text-slate-800">
                    ${gold.price.toFixed(2)} {gold.currency}
                  </span>
                ) : goldError ? (
                  <span className="text-rose-500">{copy.goldError}</span>
                ) : (
                  <span className="text-slate-400">{copy.goldLoading}</span>
                )}
              </div>
            </div>
            <button
              className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
              onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
            >
              {copy.language}
            </button>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {copy.title}
          </h1>
          <p className="text-slate-600">{copy.subtitle}</p>
        </header>

        <section className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-100">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <input
                className="w-full bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
                placeholder={copy.inputPlaceholder}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onKeyDown={handleKey}
              />
            </div>
            <button
              className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              onClick={addTodo}
            >
              {copy.add}
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
            <span>{copy.stats(stats.completed, stats.total)}</span>
            <div className="flex items-center gap-2">
              {(["all", "active", "completed"] as Filter[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                    filter === item
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {copy.filters[item]}
                </button>
              ))}
            </div>
            <button
              className="text-red-600 transition hover:text-red-700"
              onClick={clearCompleted}
            >
              {copy.clearCompleted}
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {filteredTodos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
                {copy.empty}
              </div>
            ) : (
              filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
                >
                  <label className="flex flex-1 items-center gap-3">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-slate-300 text-red-600 focus:ring-red-500"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                    />
                    <span
                      className={`text-base ${
                        todo.completed
                          ? "text-slate-400 line-through"
                          : "text-slate-800"
                      }`}
                    >
                      {todo.title}
                    </span>
                  </label>
                  <button
                    className="text-slate-400 transition hover:text-rose-500"
                    onClick={() => removeTodo(todo.id)}
                  >
                    {copy.remove}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <footer className="mt-10 text-center text-sm text-slate-400">
          {copy.footer}
        </footer>
      </div>
    </main>
  );
}
