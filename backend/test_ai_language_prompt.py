import unittest
from types import SimpleNamespace

from app.ai import _dominant_language_hint, _normalize_advice, _prompt


class AILanguagePromptTests(unittest.TestCase):
    def _build_record(self, teacher_feedback: str):
        return SimpleNamespace(
            student=SimpleNamespace(name='Minh', age=7, level='Beginner'),
            teacher=SimpleNamespace(name='Teacher Linh'),
            piece_title='Finger Exercise No.1',
            teacher_feedback=teacher_feedback,
        )

    def test_prompt_prefers_vietnamese_output_for_vietnamese_feedback(self):
        feedback = 'Minh đã chơi tốt hơn bài luyện ngón, nhưng cần giữ nhịp đều hơn và luyện tay trái chậm lại.'
        prompt = _prompt(self._build_record(feedback))
        self.assertIn('write all advice in Vietnamese', prompt)

    def test_prompt_prefers_english_output_for_english_feedback(self):
        feedback = 'Minh improved finger control but needs more steady rhythm with left hand practice.'
        prompt = _prompt(self._build_record(feedback))
        self.assertIn('write all advice in English', prompt)

    def test_prompt_uses_dominant_language_for_mixed_feedback(self):
        hint = _dominant_language_hint('Minh giữ nhịp tốt hơn this week but left hand still rushed.')
        self.assertIn('mixed Vietnamese/English', hint)

    def test_normalize_advice_removes_markdown_and_english_section_labels(self):
        raw = '1. **Short Summary:** Minh needs steadier rhythm. 2. **What Parent Should Encourage At Home:** Encourage slow left-hand practice. 3. **Simple Practice Suggestion This Week:** Practice 5 minutes with metronome. 4. **Positive Sentence For The Child:** Minh con làm tốt lắm!'
        cleaned = _normalize_advice(raw, 'Minh cần giữ nhịp đều hơn.')
        self.assertNotIn('**', cleaned)
        self.assertNotIn('Short Summary', cleaned)
        self.assertIn('1. Minh needs steadier rhythm.', cleaned)
        self.assertIn('4. Minh con làm tốt lắm!', cleaned)


if __name__ == '__main__':
    unittest.main()
