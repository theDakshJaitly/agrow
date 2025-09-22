import time
from typing import Dict, List, Optional

import requests

from ..config import AppConfig


DEFAULT_TIMEOUT = 60


class GroqClient:
	def __init__(self, config: AppConfig):
		self._api_key = config.groq_api_key
		self._base_url = config.endpoints.groq_base_url.rstrip("/")
		self._model = config.models.groq_model_name
		self._rate_per_min = config.rate_limits.llm_per_minute
		self._last_ts: float = 0.0

	def _throttle(self) -> None:
		if self._rate_per_min <= 0:
			return
		interval = 60.0 / float(self._rate_per_min)
		delta = time.time() - self._last_ts
		if delta < interval:
			time.sleep(interval - delta)
		self._last_ts = time.time()

	def _headers(self) -> dict:
		return {
			"Authorization": f"Bearer {self._api_key}",
			"Content-Type": "application/json",
		}

	def chat(self, system_prompt: str, user_prompt: str, max_tokens: int = 512, temperature: float = 0.3) -> str:
		self._throttle()
		url = f"{self._base_url}/chat/completions"
		payload = {
			"model": self._model,
			"messages": [
				{"role": "system", "content": system_prompt},
				{"role": "user", "content": user_prompt},
			],
			"max_tokens": max_tokens,
			"temperature": temperature,
		}
		resp = requests.post(url, headers=self._headers(), json=payload, timeout=DEFAULT_TIMEOUT)
		resp.raise_for_status()
		data = resp.json()
		choices = data.get("choices", [])
		if not choices:
			raise RuntimeError("LLM returned no choices")
		content = choices[0].get("message", {}).get("content", "").strip()
		if not content:
			raise RuntimeError("LLM returned empty content")
		return content
