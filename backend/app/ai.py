from datetime import datetime, timezone
import httpx

from .config import settings
from .models import AdviceRecord


def _prompt(record: AdviceRecord) -> str:
    return f"""
You are a piano education assistant for parents.
Use only the teacher feedback below. Do not invent musical problems.
Tone: warm, practical, encouraging, not stressful.

Student: {record.student.name}
Age: {record.student.age or 'Unknown'}
Level: {record.student.level}
Piece: {record.piece_title}
Teacher: {record.teacher.name}
Teacher feedback:
{record.teacher_feedback}

Write parent advice in this format:
1. Short summary
2. What the child did well
3. Practice focus this week
4. Parent action at home
5. Encouraging sentence to say to the child
""".strip()


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
        advice = (data.get("response") or "").strip()
        if not advice:
            raise RuntimeError("Ollama returned an empty response.")
        return advice


def mark_advice_generated(record: AdviceRecord, advice: str) -> None:
    record.ai_parent_advice = advice
    record.ai_advice_generated_at = datetime.now(timezone.utc)
