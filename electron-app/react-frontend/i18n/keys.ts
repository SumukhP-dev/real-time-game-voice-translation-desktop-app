// Type-safe translation keys
export const I18N_KEYS = {
  // Common
  COMMON_SAVE: "common.save",
  COMMON_CANCEL: "common.cancel",
  COMMON_CLOSE: "common.close",
  COMMON_ENABLE: "common.enable",
  COMMON_DISABLE: "common.disable",
  COMMON_SETTINGS: "common.settings",
  COMMON_CLEAR: "common.clear",
  
  // Audio Settings
  AUDIO_SETTINGS: "audio.settings",
  AUDIO_DEVICE: "audio.device",
  AUDIO_DEVICE_AUTO_SELECTED: "audio.device_auto_selected",
  AUDIO_START_CAPTURE: "audio.start_capture",
  AUDIO_STOP_CAPTURE: "audio.stop_capture",
  AUDIO_CAPTURING: "audio.capturing",
  AUDIO_CURRENTLY_USING: "audio.currently_using",
  
  // Translation Settings
  TRANSLATION_SETTINGS: "translation.settings",
  TRANSLATION_TARGET_LANGUAGE: "translation.target_language",
  TRANSLATION_ENABLE_OVERLAY: "translation.enable_overlay",
  TRANSLATION_ENABLE_TTS: "translation.enable_tts",
  TRANSLATION_SHOW_SAME_LANGUAGE: "translation.show_same_language",
  TRANSLATION_UI_LANGUAGE: "translation.ui_language",
  
  // Subtitle Settings
  SUBTITLE_SETTINGS: "subtitle.settings",
  SUBTITLE_SIZE: "subtitle.size",
  SUBTITLE_STYLE: "subtitle.style",
  SUBTITLE_POSITION: "subtitle.position",
  SUBTITLE_STYLE_MINIMAL: "subtitle.style_minimal",
  SUBTITLE_STYLE_BOLD: "subtitle.style_bold",
  SUBTITLE_STYLE_OUTLINE: "subtitle.style_outline",
  SUBTITLE_STYLE_SHADOW: "subtitle.style_shadow",
  SUBTITLE_STYLE_GAMING: "subtitle.style_gaming",
  SUBTITLE_STYLE_CLASSIC: "subtitle.style_classic",
  SUBTITLE_POSITION_TOP: "subtitle.position_top",
  SUBTITLE_POSITION_BOTTOM: "subtitle.position_bottom",
  SUBTITLE_POSITION_CENTER: "subtitle.position_center",
  SUBTITLE_POSITION_TOP_LEFT: "subtitle.position_top_left",
  SUBTITLE_POSITION_TOP_RIGHT: "subtitle.position_top_right",
  SUBTITLE_POSITION_BOTTOM_LEFT: "subtitle.position_bottom_left",
  SUBTITLE_POSITION_BOTTOM_RIGHT: "subtitle.position_bottom_right",
  
  // Main Window
  MAIN_TITLE: "main.title",
  MAIN_SUBTITLE: "main.subtitle",
  MAIN_STATUS: "main.status",
  MAIN_SETUP_WIZARD: "main.setup_wizard",
  MAIN_TEST_OVERLAY: "main.test_overlay",
  MAIN_TRANSLATION_LOG: "main.translation_log",
  MAIN_NO_TRANSLATIONS: "main.no_translations",
  
  // Status Messages
  STATUS_INITIALIZING: "status.initializing",
  STATUS_PROCESSING: "status.processing",
  STATUS_CAPTURING: "status.capturing",
  STATUS_TRANSCRIBED: "status.transcribed",
  STATUS_TRANSLATED: "status.translated",
  STATUS_ERROR: "status.error",
  
  // Translation to Team
  TEAM_TRANSLATION: "team.translation",
  TEAM_ENABLE: "team.enable",
  TEAM_LANGUAGE_SELECTION: "team.language_selection",
  TEAM_AUTO_DETECT: "team.auto_detect",
  TEAM_MANUAL: "team.manual",
  TEAM_TARGET_LANGUAGE: "team.target_language",
} as const;

export type I18NKey = typeof I18N_KEYS[keyof typeof I18N_KEYS];

