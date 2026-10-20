# Solar Forecast ML - System Report
> Generated: 2026-10-20 23:30 | System: 18.53 kWp

---

## Panel Geometry (configured)

| Group | Capacity | Tilt | Azimuth | Orientation |
|-------|----------|------|---------|-------------|
| Gruppe 1 | 10.200 kWp | 32.0 deg | 35.0 deg | North-East |
| Gruppe 2 | 7.500 kWp | 32.0 deg | 220.0 deg | South-West |
| Gruppe 3 | 0.830 kWp | 32.0 deg | 220.0 deg | South-West |

**Topology valid from:** 2026-08-04T22:24:38.645628+02:00

---

## Performance

**Record Peak:** 16.40 kW (2026-08-24)

**Total Production:** 6058.9 kWh

**Average Accuracy:** 77.5%

### Seasonal Production

| Season | Best Day | Avg Daily | Total |
|--------|----------|-----------|-------|
| Winter | - | - | - |
| Spring | - | - | - |
| Summer | 103.12 kWh | 76.71 kWh | 3758.7 kWh |
| Autumn | 75.48 kWh | 46.94 kWh | 2300.3 kWh |

---

## Physics calibration telemetry

Diagnosis only. Living correction factors are unchanged.
This section is the support evidence channel for fleet step-3 gates.

**Learning contract:** physics_calibration_raw_forecast_v3 (3 groups)

### GHI sensor geometry (diagnosis a)

Lookback window: 90 days (product constant, not a single-plant history length).
v1 contrast is east azimuth 45-135 vs west 225-315 at the same elevation bin. South-facing obstacles and southern-hemisphere morning/afternoon swap are not scored (those bins stay `other`).
Diagnosis bin floor: 5 samples. A later behavior/mask path (b) is not implemented and must use 12 samples (`CEILING_MIN_BIN_SAMPLES`), never the diagnosis floor.
Headline east/west k_p90 pools raw samples per (elevation, sector); it uses elevation bins 20 and above. Lower overlapping pairs stay in the raw bins and the overlapping count. If those pairs are the only overlap, diagnosis is `contrast_below_headline_elevation` and the headline stays n/a.

| Computed on | Hours | Bins | Overlapping elev | Max east/west k_p90 | Diagnosis |
|-------------|-------|------|------------------|---------------------|-----------|
| 2026-10-20 | 1069 | 48 | 6 | 1.38 | geometry_contrast_recorded |

Headline exclusions:
- elev 0 excluded from headline (elev < 20; east k_p90=0.918 west k_p90=2.283; k_p90 > 1)
- elev 10 excluded from headline (elev < 20; east k_p90=0.774 west k_p90=1.092; k_p90 > 1)

| Elev | Sector | Hours | k_avg | k_p90 | k_max | Headline |
|------|--------|-------|-------|-------|-------|----------|
| 0 | east | 46 | 0.435 | 0.918 | 1.299 | no |
| 0 | west | 45 | 1.134 | 2.283 | 2.805 | no |
| 10 | east | 96 | 0.434 | 0.774 | 1.480 | no |
| 10 | west | 96 | 0.715 | 1.092 | 1.506 | no |
| 20 | east | 86 | 0.517 | 0.913 | 0.962 | yes |
| 20 | west | 82 | 0.781 | 1.224 | 1.454 | yes |
| 30 | east | 63 | 0.632 | 0.855 | 0.960 | yes |
| 30 | west | 54 | 0.931 | 1.181 | 1.478 | yes |
| 40 | east | 33 | 0.793 | 0.947 | 1.135 | yes |
| 40 | west | 34 | 0.967 | 1.161 | 1.184 | yes |
| 50 | east | 11 | 0.776 | 0.933 | 1.018 | yes |
| 50 | west | 12 | 0.993 | 1.140 | 1.148 | yes |

### Hourly physics-factor shape

| Group | Date | Hours | Min factor | Max factor | Spread |
|-------|------|-------|------------|------------|--------|
| Gruppe 1 | 2026-10-20 | 8-18 (11) | 0.725 | 1.385 | 0.660 |
| Gruppe 2 | 2026-10-20 | 8-18 (11) | 0.618 | 1.540 | 0.922 |
| Gruppe 3 | 2026-10-20 | 8-18 (11) | 0.742 | 1.298 | 0.556 |

### Sample ledger

| Physics ref kind | Samples | Ratio clamp hits |
|------------------|---------|------------------|
| forecast_physics | 238 | 14 |
| ghi_scaled_clearsky | 864 | 126 |

| Clamp kind | Hits |
|------------|------|
| bucket_global | 178 |
| bucket_hourly | 316 |
| ratio | 141 |


---

## Message from the Captain's Log

> *"Today is a good day to generate clean energy! - Worf"*

Live long and prosper!

---

*Report by Solar Forecast ML*

*Created with solar power by [Zara-Toorox](https://github.com/Zara-Toorox)*