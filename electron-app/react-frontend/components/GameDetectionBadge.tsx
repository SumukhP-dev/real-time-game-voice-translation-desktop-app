import React, { useState, useEffect } from "react";
import { useI18n } from "../hooks/useI18n";
import { I18N_KEYS } from "../i18n/keys";

interface GameDetectionBadgeProps {
  onGameDetected?: (gameName: string) => void;
}

const GAME_ICONS: Record<string, string> = {
  "CS:GO 2": "🎮",
  "Counter-Strike 2": "🎮",
  "Valorant": "🔫",
  "Apex Legends": "⚡",
  "Dota 2": "⚔️",
  "League of Legends": "⚔️",
};

export function GameDetectionBadge({ onGameDetected }: GameDetectionBadgeProps) {
  const { t } = useI18n();
  const [detectedGame, setDetectedGame] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Check for running games periodically
    const checkGames = async () => {
      setIsChecking(true);
      try {
        // This would call a Rust command to detect running games
        // For now, we'll simulate detection
        const games = ["CS:GO 2", "Valorant", "Apex Legends", "Dota 2"];
        const runningGames = await detectRunningGames();
        
        if (runningGames.length > 0) {
          const game = runningGames[0];
          setDetectedGame(game);
          onGameDetected?.(game);
        } else {
          setDetectedGame(null);
        }
      } catch (error) {
        console.error("Failed to detect games:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkGames();
    const interval = setInterval(checkGames, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [onGameDetected]);

  const detectRunningGames = async (): Promise<string[]> => {
    // Placeholder - would call Rust backend to detect running games
    // For now, return empty array
    return [];
  };

  if (!detectedGame) {
    return null;
  }

  const gameIcon = GAME_ICONS[detectedGame] || "🎮";

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-900 bg-opacity-50 border border-blue-700 rounded-lg">
      <span className="text-lg">{gameIcon}</span>
      <span className="text-sm font-medium text-blue-200">
        {detectedGame}
      </span>
      <span className="text-xs text-blue-400">Detected</span>
    </div>
  );
}

