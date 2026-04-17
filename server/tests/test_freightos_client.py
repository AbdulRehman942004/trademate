"""
tests/test_freightos_client.py — Tests for the Freightos live rate client

Runs against:
  - Bad credentials → FreightosUnavailable raised
  - Real credentials → returns FreightosRate with valid min/max

Run from server/ directory:
    .venv\\Scripts\\python -m pytest tests/test_freightos_client.py -v
"""

import os
import pytest

from services.freightos_client import (
    FreightosRate,
    FreightosUnavailable,
    get_rate,
)


# ── Helper ─────────────────────────────────────────────────────────────────────

def _patch_credentials(monkeypatch, api_key: str, api_secret: str):
    """Override Freightos credentials for a single test."""
    import services.freightos_client as fc
    monkeypatch.setattr(fc, "_API_KEY", api_key)
    monkeypatch.setattr(fc, "_API_SECRET", api_secret)


# ── Tests ──────────────────────────────────────────────────────────────────────

class TestFreightosUnavailableScenarios:
    def test_raises_when_no_credentials(self, monkeypatch):
        """Must raise FreightosUnavailable if API key is blank."""
        _patch_credentials(monkeypatch, "", "")
        with pytest.raises(FreightosUnavailable, match="credentials not configured"):
            get_rate(
                origin_port="Karachi (PKKHI)",
                dest_port=["Los Angeles (USLAX)"],
                cargo_type="FCL_20",
            )

    def test_raises_on_bad_credentials(self, monkeypatch):
        """HTTP 401 from Freightos must surface as FreightosUnavailable."""
        _patch_credentials(monkeypatch, "bad-key", "bad-secret")
        with pytest.raises(FreightosUnavailable):
            get_rate(
                origin_port="Karachi (PKKHI)",
                dest_port=["Los Angeles (USLAX)"],
                cargo_type="FCL_20",
            )

    def test_raises_on_unknown_origin_port(self):
        """Unknown port name must raise FreightosUnavailable immediately."""
        with pytest.raises(FreightosUnavailable, match="UNLOCODE mapping for origin"):
            get_rate(
                origin_port="Unknown Port",
                dest_port=["Los Angeles (USLAX)"],
                cargo_type="FCL_20",
            )

    def test_raises_on_unknown_dest_port(self):
        """Unknown destination port must raise FreightosUnavailable immediately."""
        with pytest.raises(FreightosUnavailable, match="UNLOCODE mapping for destination"):
            get_rate(
                origin_port="Karachi (PKKHI)",
                dest_port=["Unknown City (UNKWN)"],
                cargo_type="FCL_20",
            )


class TestFreightosLiveRate:
    """
    Integration test — hits the real Freightos API.
    Skipped automatically if FREIGHTOS_API_KEY is not set in the environment.
    """

    @pytest.mark.skipif(
        not os.environ.get("FREIGHTOS_API_KEY"),
        reason="FREIGHTOS_API_KEY not set — skipping live API test",
    )
    def test_get_rate_fcl20_karachi_to_la(self):
        """Live rate for FCL 20 Karachi→LA: min > 0, max >= min."""
        rate = get_rate(
            origin_port="Karachi (PKKHI)",
            dest_port=["Los Angeles (USLAX)", "Long Beach (USLGB)"],
            cargo_type="FCL_20",
        )
        assert isinstance(rate, FreightosRate)
        assert rate.min_usd > 0, "min_usd must be positive"
        assert rate.max_usd >= rate.min_usd, "max_usd must be >= min_usd"

    @pytest.mark.skipif(
        not os.environ.get("FREIGHTOS_API_KEY"),
        reason="FREIGHTOS_API_KEY not set — skipping live API test",
    )
    def test_get_rate_air_karachi_to_jfk(self):
        """Live rate for Air Karachi→JFK: positive values."""
        rate = get_rate(
            origin_port="Karachi Intl (KHI)",
            dest_port=["New York JFK (JFK)"],
            cargo_type="AIR",
            cargo_weight_kg=500.0,
            chargeable_kg=500.0,
        )
        assert isinstance(rate, FreightosRate)
        assert rate.min_usd > 0
