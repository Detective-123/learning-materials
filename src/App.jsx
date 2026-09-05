import React, { useState, useEffect } from "react";
import { supabase } from "./utils/supabase";

// Initial Seed Data (Java, Spring, GitHub)
const initialData = [
  {
    id: "sec-java",
    title: "Java Platform",
    description: "Language references, JVM specifications, and core tutorials",
    cards: [
      {
        id: "card-1",
        title: "Java SE Documentation (Oracle)",
        url: "https://docs.oracle.com/en/java/javase/21/",
        description:
          "Official API specification and documentation for Java Standard Edition 21 LTS.",
        tags: ["Official", "Docs", "Java21"],
      },
      {
        id: "card-2",
        title: "Baeldung Java Tutorials",
        url: "https://www.baeldung.com/category/java/",
        description:
          "In-depth, code-driven tutorials covering core Java features and modern APIs.",
        tags: ["Tutorials", "Guide", "BestPractices"],
      },
      {
        id: "card-3",
        title: "OpenJDK GitHub Repository",
        url: "https://github.com/openjdk/jdk",
        description:
          "Official repository containing the source code for OpenJDK.",
        tags: ["GitHub", "SourceCode", "JVM"],
      },
    ],
  },
  {
    id: "sec-spring",
    title: "Spring Framework",
    description: "Spring Boot, Data, Security, and Microservice ecosystem",
    cards: [
      {
        id: "card-4",
        title: "Spring Boot Documentation",
        url: "https://docs.spring.io/spring-boot/docs/current/reference/html/",
        description:
          "Comprehensive guide to building production-ready applications with Spring Boot.",
        tags: ["Spring", "Docs", "Backend"],
      },
      {
        id: "card-5",
        title: "Spring Initializr",
        url: "https://start.spring.io/",
        description:
          "Quick-start generator tool for bootstrapping new Spring Boot projects.",
        tags: ["Tooling", "Generator"],
      },
      {
        id: "card-6",
        title: "Spring Framework Core GitHub",
        url: "https://github.com/spring-projects/spring-framework",
        description:
          "Source code for the core Spring Framework, IOC Container, and Web MVC.",
        tags: ["GitHub", "Framework"],
      },
    ],
  },
  {
    id: "sec-github",
    title: "GitHub & Git",
    description:
      "Version control specs, CLI utilities, and repository management",
    cards: [
      {
        id: "card-7",
        title: "GitHub Documentation",
        url: "https://docs.github.com/",
        description:
          "Help articles, API guides, Actions workflows, and GitHub ecosystem details.",
        tags: ["Docs", "Git", "CI/CD"],
      },
      {
        id: "card-8",
        title: "Pro Git Book (Free)",
        url: "https://git-scm.com/book/en/v2",
        description:
          "The definitive book on Git version control written by Scott Chacon and Ben Straub.",
        tags: ["Book", "Guide", "Git"],
      },
      {
        id: "card-9",
        title: "GitHub CLI Docs",
        url: "https://cli.github.com/manual/",
        description:
          "Command line tool manuals for managing GitHub PRs, issues, and repositories from the terminal.",
        tags: ["CLI", "Tooling"],
      },
    ],
  },
];

export default function App() {
  // Persistence state
  const [data, setData] = useState([]);

  const fetchData = async () => {
    const { data, error } = await supabase.from("sections").select(`
            id,
            title,
            description,
            resources (
                id,
                title,
                url,
                description,
                tags
            )
        `);

    if (error) {
      console.error(error);
      return;
    }

    const formattedData = data.map((section) => ({
      id: section.id,
      title: section.title,
      description: section.description || "",
      cards: section.resources || [],
    }));

    setData(formattedData);
  };

  const [darkMode, setDarkMode] = useState(() => {
    try {
      return (
        localStorage.getItem("theme") === "dark" ||
        (!("theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    } catch {
      return false;
    }
  });

  // UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);

  // Modal States
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);

  // Form States
  const [cardForm, setCardForm] = useState({
    sectionId: "",
    title: "",
    url: "",
    description: "",
    tags: "",
  });

  const [sectionForm, setSectionForm] = useState({
    title: "",
    description: "",
  });

  // Local Storage synchronization
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Toast Helper
  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  // Helper Utilities
  const getDomain = (urlStr) => {
    try {
      const url = new URL(urlStr);
      return url.hostname.replace("www.", "");
    } catch {
      return urlStr;
    }
  };

  const getFavicon = (urlStr) => {
    try {
      const url = new URL(urlStr);
      return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
    } catch {
      return "";
    }
  };

  const copyToClipboard = (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    showToast("Link copied to clipboard!", "success");
  };

  const scrollToSection = (id) => {
    if (id === "all") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -100;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Modal Handlers
  const openCardModal = (sectionId = null, cardId = null) => {
    setEditingCardId(cardId);

    if (cardId) {
      let targetCard = null;
      let parentSecId = sectionId;

      data.forEach((sec) => {
        const found = sec.cards.find((c) => c.id === cardId);
        if (found) {
          targetCard = found;
          parentSecId = sec.id;
        }
      });

      if (targetCard) {
        setCardForm({
          sectionId: parentSecId || data[0]?.id || "",
          title: targetCard.title,
          url: targetCard.url,
          description: targetCard.description || "",
          tags: (targetCard.tags || []).join(", "),
        });
      }
    } else {
      setCardForm({
        sectionId: sectionId || data[0]?.id || "",
        title: "",
        url: "",
        description: "",
        tags: "",
      });
    }

    setIsCardModalOpen(true);
  };

  const closeModals = () => {
    setIsCardModalOpen(false);
    setIsSectionModalOpen(false);
    setEditingCardId(null);
  };

  // Submit Handlers
  const handleCardSubmit = async (e) => {
    e.preventDefault();

    const { sectionId, title, url, description, tags } = cardForm;

    const tagArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingCardId) {
      const { error } = await supabase
        .from("resources")
        .update({
          section_id: sectionId,
          title: title.trim(),
          url: url.trim(),
          description: description.trim(),
          tags: tagArray,
        })
        .eq("id", editingCardId);

      if (error) {
        console.error(error);
        showToast("Failed to update resource", "error");
        return;
      }

      showToast("Resource updated successfully", "success");
    } else {
      const newResource = {
        id: "card-" + Date.now(),
        section_id: sectionId,
        title: title.trim(),
        url: url.trim(),
        description: description.trim(),
        tags: tagArray,
      };

      const { error } = await supabase.from("resources").insert(newResource);

      if (error) {
        console.error(error);
        showToast("Failed to add resource", "error");
        return;
      }

      showToast("Resource added successfully", "success");
    }

    await fetchData();
    closeModals();
  };

  const handleSectionSubmit = (e) => {
    e.preventDefault();
    const newSec = {
      id: "sec-" + Date.now(),
      title: sectionForm.title.trim(),
      description: sectionForm.description.trim(),
      cards: [],
    };

    setData((prev) => [...prev, newSec]);
    setSectionForm({ title: "", description: "" });
    closeModals();
    showToast("Section created successfully", "success");
  };

  const deleteCard = (sectionId, cardId) => {
    if (window.confirm("Are you sure you want to remove this resource card?")) {
      setData((prev) =>
        prev.map((sec) => {
          if (sec.id === sectionId) {
            return { ...sec, cards: sec.cards.filter((c) => c.id !== cardId) };
          }
          return sec;
        }),
      );
      showToast("Resource removed");
    }
  };

  const deleteSection = (sectionId) => {
    const sec = data.find((s) => s.id === sectionId);
    if (!sec) return;

    if (
      window.confirm(
        `Delete section "${sec.title}" and all its ${sec.cards.length} cards?`,
      )
    ) {
      setData((prev) => prev.filter((s) => s.id !== sectionId));
      showToast("Section deleted");
    }
  };

  // Filter Cards based on query
  const query = searchQuery.toLowerCase().trim();
  let totalVisibleCards = 0;

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen font-sans antialiased transition-colors duration-200">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 pointer-events-none">
          <div
            className={`px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium flex items-center gap-2 transition-all duration-300 ${
              toast.type === "success"
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-white"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold text-lg">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white text-base leading-none">
                Dev Hub
              </h1>
              <span class="text-xs text-slate-500 dark:text-slate-400">
                Learning Knowledge Base
              </span>
            </div>
          </div>

          {/* Search Field */}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <svg
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search links, tags, or sections..."
                className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
              />
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSectionModalOpen(true)}
              className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Section</span>
            </button>

            <button
              onClick={() => openCardModal()}
              className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors flex items-center gap-1.5"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Add Resource</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Dark Mode"
            >
              {darkMode ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="px-4 pb-3 sm:hidden">
          <div className="relative">
            <svg
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search links..."
              className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      </header>

      {/* Navigation Bar / Category Pills */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-2.5 overflow-x-auto">
        <div className="flex items-center gap-2 max-w-7xl mx-auto min-w-max">
          <button
            onClick={() => scrollToSection("all")}
            className="px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            All Sections
          </button>
          {data.map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {sec.title}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12">
          {data.map((sec) => {
            const filteredCards = sec.cards.filter(
              (card) =>
                card.title.toLowerCase().includes(query) ||
                card.description.toLowerCase().includes(query) ||
                card.tags.some((t) => t.toLowerCase().includes(query)) ||
                sec.title.toLowerCase().includes(query),
            );

            if (filteredCards.length === 0 && query !== "") return null;
            totalVisibleCards += filteredCards.length;

            return (
              <section
                key={sec.id}
                id={sec.id}
                className="space-y-4 scroll-mt-24"
              >
                {/* Section Header */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {sec.title}
                      </h2>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                        {sec.cards.length} resources
                      </span>
                    </div>
                    {sec.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {sec.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openCardModal(sec.id)}
                      title={`Add link to ${sec.title}`}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteSection(sec.id)}
                      title="Delete section"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCards.map((card) => (
                    <div
                      key={card.id}
                      className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Domain Favicon & Actions Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <img
                              src={getFavicon(card.url)}
                              onError={(e) => {
                                e.target.src =
                                  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🌐</text></svg>';
                              }}
                              className="w-4 h-4 rounded shrink-0"
                              alt=""
                            />
                            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate">
                              {getDomain(card.url)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => copyToClipboard(card.url)}
                              title="Copy URL"
                              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => openCardModal(sec.id, card.id)}
                              title="Edit"
                              className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteCard(sec.id, card.id)}
                              title="Delete"
                              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1">
                          <a
                            href={card.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5"
                          >
                            {card.title}
                            <svg
                              className="w-3.5 h-3.5 text-slate-400 shrink-0 inline"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        </h3>

                        {/* Description */}
                        {card.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                            {card.description}
                          </p>
                        )}
                      </div>

                      {/* Footer Tags */}
                      {card.tags && card.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                          {card.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Empty State */}
        {totalVisibleCards === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
              No resources found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Try adjusting your search query or add a new resource card.
            </p>
          </div>
        )}
      </main>

      {/* MODAL: Add / Edit Card */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {editingCardId ? "Edit Resource" : "Add New Resource"}
              </h3>
              <button
                onClick={closeModals}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCardSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Target Section
                </label>
                <select
                  value={cardForm.sectionId}
                  onChange={(e) =>
                    setCardForm({ ...cardForm, sectionId: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500"
                >
                  {data.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={cardForm.title}
                  onChange={(e) =>
                    setCardForm({ ...cardForm, title: e.target.value })
                  }
                  required
                  placeholder="e.g. Spring Boot Official Docs"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  URL / Link
                </label>
                <input
                  type="url"
                  value={cardForm.url}
                  onChange={(e) =>
                    setCardForm({ ...cardForm, url: e.target.value })
                  }
                  required
                  placeholder="https://spring.io/projects/spring-boot"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={cardForm.description}
                  onChange={(e) =>
                    setCardForm({ ...cardForm, description: e.target.value })
                  }
                  placeholder="Brief note or summary about this documentation..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={cardForm.tags}
                  onChange={(e) =>
                    setCardForm({ ...cardForm, tags: e.target.value })
                  }
                  placeholder="Documentation, Java, Guide"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Section */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Add New Section
              </h3>
              <button
                onClick={closeModals}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSectionSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  value={sectionForm.title}
                  onChange={(e) =>
                    setSectionForm({ ...sectionForm, title: e.target.value })
                  }
                  required
                  placeholder="e.g. React & Frontend"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Section Description
                </label>
                <input
                  type="text"
                  value={sectionForm.description}
                  onChange={(e) =>
                    setSectionForm({
                      ...sectionForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="e.g. Core libraries, UI frameworks & tooling"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Create Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
