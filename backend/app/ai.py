from datetime import datetime, timezone
import re
import httpx

from .config import settings
from .models import AdviceRecord


def _prompt(record: AdviceRecord) -> str:
    language_hint = _dominant_language_hint(record.teacher_feedback)
    return f"""
You are a piano education assistant for parents.
Use only the teacher feedback below. Do not invent musical problems.
Tone: warm, practical, encouraging, not stressful.
Language rule: {language_hint}

Keep the response short and parent-friendly. Avoid academic wording.
If details are missing in teacher feedback, say it simply instead of inventing.

Student: {record.student.name}
Age: {record.student.age or 'Unknown'}
Level: {record.student.level}
Piece: {record.piece_title}
Teacher: {record.teacher.name}
Teacher feedback:
{record.teacher_feedback}

Output requirements:
- Return plain text only (no markdown, no **bold**, no headings in another language).
- Keep each line short and clear for parents.

Write exactly 4 short labeled lines in the same language as the teacher feedback.
Do not use markdown symbols, bullets, or numbering.

If Vietnamese:
Tóm tắt: ...
Phụ huynh nên khuyến khích: ...
Gợi ý luyện tập tại nhà: ...
Lời động viên cho bé: ...

If English:
Summary: ...
Parent encouragement: ...
Home practice suggestion: ...
Positive sentence for the child: ...

Length target:
- Vietnamese total about 80-140 words
- English total about 60-120 words
""".strip()


def _dominant_language_hint(text: str) -> str:
    vietnamese_chars = len(re.findall(r"[ăâđêôơưĂÂĐÊÔƠƯáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]", text))
    latin_words = len(re.findall(r"[A-Za-z]+", text))
    if vietnamese_chars > 0 and vietnamese_chars >= max(2, latin_words // 3):
        return "If teacher feedback is mostly Vietnamese, write all advice in Vietnamese for parents."
    if vietnamese_chars > 0:
        return "The teacher feedback is mixed Vietnamese/English. Write advice in the dominant language used in the teacher feedback."
    return "If teacher feedback is mostly English, write all advice in English for parents."


async def check_ollama_status() -> dict:
    url = settings.ollama_base_url.rstrip("/")
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(f"{url}/api/tags")
            response.raise_for_status()
            data = response.json()
            names = [m.get("name") for m in data.get("models", [])]
            model_available = settings.ollama_model in names
            return {
                "ok": True,
                "configured_model": settings.ollama_model,
                "model_available": model_available,
                "base_url": url,
                "message": None if model_available else f"Model not found. Run: ollama pull {settings.ollama_model}",
            }
    except Exception as exc:
        return {
            "ok": False,
            "configured_model": settings.ollama_model,
            "model_available": False,
            "base_url": url,
            "message": str(exc),
        }


async def generate_parent_advice_once(record: AdviceRecord) -> str:
    if record.ai_parent_advice or record.ai_advice_generated_at:
        return record.ai_parent_advice or ""

    url = settings.ollama_base_url.rstrip("/")
    payload = {
        "model": settings.ollama_model,
        "prompt": _prompt(record),
        "stream": False,
        "options": {"temperature": 0.3, "num_predict": 420},
    }
    async with httpx.AsyncClient(timeout=settings.ollama_timeout_seconds) as client:
        response = await client.post(f"{url}/api/generate", json=payload)
        response.raise_for_status()
        data = response.json()
        advice = _normalize_advice((data.get("response") or "").strip(), record.teacher_feedback)
        if not advice:
            raise RuntimeError("Ollama returned an empty response.")
        return advice


def _normalize_advice(advice: str, teacher_feedback: str) -> str:
    text = advice.replace("**", "").strip()
    text = re.sub(r"^[\-•*]\s*", "", text, flags=re.MULTILINE)
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    if len(lines) == 1:
        parts = re.split(r"\s(?=\d+[\).])", lines[0])
        if len(parts) > 1:
            lines = [p.strip() for p in parts if p.strip()]

    is_vi = "Vietnamese" in _dominant_language_hint(teacher_feedback)
    labels = [
        "Tóm tắt",
        "Phụ huynh nên khuyến khích",
        "Gợi ý luyện tập tại nhà",
        "Lời động viên cho bé",
    ] if is_vi else [
        "Summary",
        "Parent encouragement",
        "Home practice suggestion",
        "Positive sentence for the child",
    ]

    cleaned_items = []
    for ln in lines:
        content = re.sub(r"^\d+[\).]\s*", "", ln)
        content = re.sub(r"^(Short Summary|Summary|What Parent Should Encourage At Home|Parent encouragement|Simple Practice Suggestion This Week|Home practice suggestion|Practice suggestion this week|Positive Sentence For The Child|Positive sentence for the child|Tóm tắt|Phụ huynh nên khuyến khích|Gợi ý luyện tập (tuần này|tại nhà)|Lời động viên cho bé)\s*:\s*", "", content, flags=re.IGNORECASE)
        if content:
            cleaned_items.append(content)

    if not cleaned_items:
        return text

    out=[]
    for idx,label in enumerate(labels):
        value = cleaned_items[idx] if idx < len(cleaned_items) else ""
        if value:
            out.append(f"{label}: {value}")
    return "\n".join(out).strip()


def mark_advice_generated(record: AdviceRecord, advice: str) -> None:
    record.ai_parent_advice = advice
    record.ai_advice_generated_at = datetime.now(timezone.utc)
