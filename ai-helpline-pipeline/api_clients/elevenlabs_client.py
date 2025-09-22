import os
import time
from dataclasses import dataclass
from typing import Optional, Tuple

import requests

from ..config import AppConfig


DEFAULT_TIMEOUT = 30


@dataclass
class STTResult:
	text: str
	confidence: float
	language: str


class ElevenLabsClient:
	def __init__(self, config: AppConfig):
		self._api_key = config.elevenlabs_api_key
		self._base_url = config.endpoints.elevenlabs_base_url.rstrip("/")
		self._min_conf = config.quality.min_stt_confidence
		self._rate_per_min = config.rate_limits.stt_per_minute
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
			"xi-api-key": self._api_key,
		}

	def speech_to_text(self, audio_path: str, source_lang: str = "auto") -> STTResult:
		self._throttle()
		url = f"{self._base_url}/speech-to-text"
		with open(audio_path, "rb") as f:
			files = {"file": (os.path.basename(audio_path), f, "application/octet-stream")}
			data = {"source_lang": source_lang}
			resp = requests.post(url, headers=self._headers(), files=files, data=data, timeout=DEFAULT_TIMEOUT)
			resp.raise_for_status()
			payload = resp.json()
			text = payload.get("text", "").strip()
			confidence = float(payload.get("confidence", 0.0))
			language = payload.get("language", source_lang)
			if not text:
				raise RuntimeError("STT returned empty text")
			if confidence < self._min_conf:
				raise RuntimeError(f"STT confidence below threshold: {confidence:.2f} < {self._min_conf:.2f}")
			return STTResult(text=text, confidence=confidence, language=language)

	def text_to_speech(self, text: str, target_lang: str, voice: Optional[str] = None) -> bytes:
		self._throttle()
		url = f"{self._base_url}/text-to-speech"
		data = {
			"text": text,
			"target_lang": target_lang,
		}
		if voice:
			data["voice"] = voice
		resp = requests.post(url, headers=self._headers(), json=data, timeout=DEFAULT_TIMEOUT)
		resp.raise_for_status()
		return resp.content
