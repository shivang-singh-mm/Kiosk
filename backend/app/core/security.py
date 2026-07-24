import re

def clean_phone_number(phone: str) -> str:
    """Utility to clean and format telephone numbers."""
    cleaned = re.sub(r'[^\d+]', '', phone)
    return cleaned
