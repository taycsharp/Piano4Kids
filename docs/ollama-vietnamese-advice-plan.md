# Ollama Vietnamese Advice Improvement Plan

## Goal

Improve the Ollama AI advice flow so teacher comments written in Vietnamese are handled well.

## Problem

Currently, the AI advice flow is mainly optimized for English teacher comments. In real use, Vietnamese piano teachers may write feedback in Vietnamese, so the app should generate parent-friendly Vietnamese advice.

## Scope

- Support Vietnamese teacher feedback.
- Keep English teacher feedback working.
- If the teacher comment is Vietnamese, generate Vietnamese advice.
- If the teacher comment is English, generate English advice.
- If the teacher comment mixes Vietnamese and English, use the dominant language.
- Keep advice short, warm, practical, and parent-friendly.
- Avoid inventing facts not present in the teacher feedback.

## Vietnamese test example

Teacher comment:

"Minh đã chơi tốt hơn bài luyện ngón, nhưng cần giữ nhịp đều hơn và luyện tay trái chậm lại."

Expected behavior:

The AI advice should be in Vietnamese and easy for parents to understand.
