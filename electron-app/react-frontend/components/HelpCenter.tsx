import React, { useState } from "react";
import { useI18n } from "../hooks/useI18n";
import { I18N_KEYS } from "../i18n/keys";

interface FAQItem {
  questionKey: string;
  answerKey: string;
  categoryKey: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    categoryKey: "help_center.categories.setup",
    questionKey: "help_center.faq.audio_setup.question",
    answerKey: "help_center.faq.audio_setup.answer",
  },
  {
    categoryKey: "help_center.categories.setup",
    questionKey: "help_center.faq.hear_game_audio.question",
    answerKey: "help_center.faq.hear_game_audio.answer",
  },
  {
    categoryKey: "help_center.categories.translation",
    questionKey: "help_center.faq.no_translations.question",
    answerKey: "help_center.faq.no_translations.answer",
  },
  {
    categoryKey: "help_center.categories.overlay",
    questionKey: "help_center.faq.overlay_missing.question",
    answerKey: "help_center.faq.overlay_missing.answer",
  },
  {
    categoryKey: "help_center.categories.audio",
    questionKey: "help_center.faq.rms_zero.question",
    answerKey: "help_center.faq.rms_zero.answer",
  },
  {
    categoryKey: "help_center.categories.anti_cheat",
    questionKey: "help_center.faq.anti_cheat.question",
    answerKey: "help_center.faq.anti_cheat.answer",
  },
  {
    categoryKey: "help_center.categories.performance",
    questionKey: "help_center.faq.performance.question",
    answerKey: "help_center.faq.performance.answer",
  },
];

export function HelpCenter() {
  const { t } = useI18n();
  const allCategoryKey = "help_center.categories.all";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(allCategoryKey);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const categories = [
    allCategoryKey,
    ...Array.from(new Set(FAQ_DATA.map((item) => item.categoryKey))),
  ];

  const filteredFAQ = FAQ_DATA.filter((item) => {
    const localizedQuestion = t(item.questionKey).toLowerCase();
    const localizedAnswer = t(item.answerKey).toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      localizedQuestion.includes(searchQuery.toLowerCase()) ||
      localizedAnswer.includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === allCategoryKey || item.categoryKey === selectedCategory;
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
      <h2 className="text-xl font-bold mb-4 text-white">
        {t("help_center.title")}
      </h2>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder={t("help_center.search_placeholder")}
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
            {t(category)}
          </button>
        ))}
      </div>

      {/* FAQ Items */}
      <div className="space-y-2">
        {filteredFAQ.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            {t("help_center.no_results")}
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
                <span className="font-medium text-white text-sm">
                  {t(item.questionKey)}
                </span>
                <span className="text-gray-400">
                  {expandedItems.has(index) ? "−" : "+"}
                </span>
              </button>
              {expandedItems.has(index) && (
                <div className="p-3 pt-0 border-t border-gray-700">
                  <p className="text-gray-300 text-sm">{t(item.answerKey)}</p>
                  <span className="text-xs text-gray-500 mt-2 block">
                    {t("help_center.category_prefix")} {t(item.categoryKey)}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Support Contact */}
      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          {t("help_center.support_prefix")}{" "}
          <a
            href="mailto:gaminglivevoicetranslationmod@gmail.com"
            className="text-blue-400 hover:text-blue-300"
          >
            gaminglivevoicetranslationmod@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}

