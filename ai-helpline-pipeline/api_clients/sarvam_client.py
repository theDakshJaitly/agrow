import time
from dataclasses import dataclass
from typing import Optional

import requests

from ..config import AppConfig


DEFAULT_TIMEOUT = 30


@dataclass
class TranslationResult:
	translated_text: str
	quality_score: float
	source_lang: str
	target_lang: str


class SarvamClient:
	def __init__(self, config: AppConfig):
		self._api_key = config.sarvam_api_key
		self._base_url = config.endpoints.sarvam_base_url.rstrip("/")
		self._min_quality = config.quality.min_translation_quality
		self._rate_per_min = config.rate_limits.translation_per_minute
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

	def translate(self, text: str, source_lang: str, target_lang: str) -> TranslationResult:
		self._throttle()
		url = f"{self._base_url}/translate"
		payload = {
			"text": text,
			"source_lang": source_lang,
			"target_lang": target_lang,
		}
		resp = requests.post(url, headers=self._headers(), json=payload, timeout=DEFAULT_TIMEOUT)
		resp.raise_for_status()
		data = resp.json()
		translated_text = data.get("translated_text", "").strip()
		quality_score = float(data.get("quality_score", 0.0))
		if not translated_text:
			raise RuntimeError("Translation returned empty text")
		if quality_score < self._min_quality:
			raise RuntimeError(f"Translation quality below threshold: {quality_score:.2f} < {self._min_quality:.2f}")
		return TranslationResult(
			translated_text=translated_text,
			quality_score=quality_score,
			source_lang=source_lang,
			target_lang=target_lang,
		)
