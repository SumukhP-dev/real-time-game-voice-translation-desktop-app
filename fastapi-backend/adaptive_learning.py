from typing import Optional

# Simple in-memory preference store placeholder
preferences = {}

def learn_preference(context: str, translation: str):
    preferences[context] = translation

def get_personalized_translation(context: str) -> Optional[str]:
    return preferences.get(context)
