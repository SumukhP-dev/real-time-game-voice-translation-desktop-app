import React, { useState } from "react";
import { useI18n } from "../hooks/useI18n";
import { I18N_KEYS } from "../i18n/keys";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    category: "Setup",
    question: "How do I set up VB-Audio Virtual Cable?",
    answer: "Download VB-Audio Virtual Cable from vb-audio.com/Cable/, install it, restart your computer, then set CABLE Input as default playback device in Windows Sound settings.",
  },
  {
    category: "Setup",
    question: "Why can't I hear audio after setting CABLE Input as default?",
    answer: "You need to enable 'Listen to this device' on CABLE Output. Go to Recording tab → CABLE Output Properties → Listen tab → Check 'Listen to this device' and select your headphones.",
  },
  {
    category: "Translation",
    question: "Why are no translations appearing?",
    answer: "Check that: 1) ML service is running, 2) Audio capture is started, 3) Overlay is enabled, 4) Target language is set, 5) Audio is actually playing (check RMS levels in logs).",
  },
  {
    category: "Overlay",
    question: "The overlay is not showing on screen",
    answer: "Verify overlay is enabled in Translation Settings. Try clicking 'Test Overlay' button. Check that overlay position is within screen bounds. Ensure no other application is covering it.",
  },
  {
    category: "Audio",
    question: "Audio capture shows RMS=0.000000",
    answer: "This means no audio is being captured. Verify: 1) CABLE Input is default playback device, 2) 'Listen to this device' is enabled, 3) Audio is actually playing (check Windows volume), 4) Game audio is routed to CABLE Input.",
  },
  {
    category: "Anti-Cheat",
    question: "Is this safe to use with anti-cheat systems?",
    answer: "Yes! The application uses only standard Windows audio APIs and does not access game memory or inject code. It is compatible with VAC, EasyAntiCheat, BattlEye, and Vanguard.",
  },
  {
    category: "Performance",
    question: "Translation is slow or laggy",
    answer: "Try: 1) Use smaller Whisper model (tiny/base), 2) Enable GPU acceleration if available, 3) Reduce audio buffer size, 4) Close other resource-intensive applications.",
  },
];

export function HelpCenter() {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const categories = ["All", ...Array.from(new Set(FAQ_DATA.map((item) => item.category)))];

  const filteredFAQ = FAQ_DATA.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (index: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-white">Help Center</h2>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search for help..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
        />
      </div>

      {/* Category Filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded text-sm ${
              selectedCategory === category
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* FAQ Items */}
      <div className="space-y-2">
        {filteredFAQ.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            No results found. Try a different search term.
          </div>
        ) : (
          filteredFAQ.map((item, index) => (
            <div
              key={index}
              className="bg-gray-900 rounded border border-gray-700"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-800"
              >
                <span className="font-medium text-white text-sm">{item.question}</span>
                <span className="text-gray-400">
                  {expandedItems.has(index) ? "−" : "+"}
                </span>
              </button>
              {expandedItems.has(index) && (
                <div className="p-3 pt-0 border-t border-gray-700">
                  <p className="text-gray-300 text-sm">{item.answer}</p>
                  <span className="text-xs text-gray-500 mt-2 block">
                    Category: {item.category}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Additional Resources */}
      <div className="mt-6 p-4 bg-blue-900 bg-opacity-50 rounded-lg border border-blue-700">
        <h3 className="font-semibold text-white mb-2">Additional Resources</h3>
        <div className="space-y-2 text-sm">
          <a
            href="https://vb-audio.com/Cable/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 hover:text-blue-200 block"
          >
            → Download VB-Audio Virtual Cable
          </a>
          <a
            href="#"
            className="text-blue-300 hover:text-blue-200 block"
          >
            → Video Tutorials (Coming Soon)
          </a>
          <a
            href="#"
            className="text-blue-300 hover:text-blue-200 block"
          >
            → Visual Setup Guide
          </a>
        </div>
      </div>

      {/* Support Contact */}
      <div className="mt-4 text-center">
        <p className="text-gray-400 text-sm">
          Still need help? Contact support:{" "}
          <a
            href="mailto:1-9438889487_112@zohomail.com"
            className="text-blue-400 hover:text-blue-300"
          >
            1-9438889487_112@zohomail.com
          </a>
        </p>
      </div>
    </div>
  );
}

