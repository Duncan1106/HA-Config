# Solar Forecast ML - System Report
> Generated: 2026-11-15 23:30 | System: 17.7 kWp

---

## Panel Geometry (configured)

| Group | Capacity | Tilt | Azimuth | Orientation |
|-------|----------|------|---------|-------------|
| Gruppe 1 | 10.200 kWp | 32.0 deg | 35.0 deg | North-East |
| Gruppe 2 | 7.500 kWp | 32.0 deg | 220.0 deg | South-West |

**Topology valid from:** 2026-10-30T16:40:26.269268+01:00

---

## Performance

**Record Peak:** 16.40 kW (2026-08-24)

**Total Production:** 6586.4 kWh

**Average Accuracy:** 77.7%

### Seasonal Production

| Season | Best Day | Avg Daily | Total |
|--------|----------|-----------|-------|
| Winter | - | - | - |
| Spring | - | - | - |
| Summer | 103.12 kWh | 76.71 kWh | 3758.7 kWh |
| Autumn | 75.48 kWh | 37.70 kWh | 2827.8 kWh |

---

## Physics calibration telemetry

Diagnosis only. Living correction factors are unchanged.
This section is the support evidence channel for fleet step-3 gates.

**Learning contract:** physics_calibration_raw_forecast_v4 (2 groups)

### GHI sensor geometry (diagnosis a)

Lookback window: 90 days (product constant, not a single-plant history length).
v1 contrast is east azimuth 45-135 vs west 225-315 at the same elevation bin. South-facing obstacles and southern-hemisphere morning/afternoon swap are not scored (those bins stay `other`).
Diagnosis bin floor: 5 samples. A later behavior/mask path (b) is not implemented and must use 12 samples (`CEILING_MIN_BIN_SAMPLES`), never the diagnosis floor.
Headline east/west k_p90 pools raw samples per (elevation, sector); it uses elevation bins 20 and above. Lower overlapping pairs stay in the raw bins and the overlapping count. If those pairs are the only overlap, diagnosis is `contrast_below_headline_elevation` and the headline stays n/a.

| Computed on | Hours | Bins | Overlapping elev | Max east/west k_p90 | Diagnosis |
|-------------|-------|------|------------------|---------------------|-----------|
| 2026-11-15 | 938 | 39 | 4 | 1.43 | geometry_contrast_recorded |

Headline exclusions:
- elev 0 excluded from headline (elev < 20; east k_p90=0.918 west k_p90=1.466; k_p90 > 1)
- elev 10 excluded from headline (elev < 20; east k_p90=0.815 west k_p90=0.996)

| Elev | Sector | Hours | k_avg | k_p90 | k_max | Headline |
|------|--------|-------|-------|-------|-------|----------|
| 0 | east | 56 | 0.478 | 0.918 | 1.299 | no |
| 0 | west | 52 | 0.896 | 1.466 | 2.805 | no |
| 10 | east | 81 | 0.481 | 0.815 | 1.480 | no |
| 10 | west | 90 | 0.662 | 0.996 | 1.506 | no |
| 20 | east | 59 | 0.575 | 0.928 | 0.962 | yes |
| 20 | west | 55 | 0.732 | 1.224 | 1.454 | yes |
| 30 | east | 33 | 0.586 | 0.859 | 0.960 | yes |
| 30 | west | 25 | 0.870 | 1.231 | 1.361 | yes |

### Hourly physics-factor shape

| Group | Date | Hours | Min factor | Max factor | Spread |
|-------|------|-------|------------|------------|--------|
| Gruppe 1 | 2026-11-10 | 8-18 (11) | 0.667 | 1.277 | 0.610 |
| Gruppe 2 | 2026-11-10 | 8-18 (11) | 0.589 | 1.540 | 0.951 |
| Gruppe 3 | 2026-10-29 | 8-18 (11) | 0.606 | 1.302 | 0.697 |

### Sample ledger

| Physics ref kind | Samples | Ratio clamp hits |
|------------------|---------|------------------|
| forecast_physics | 514 | 24 |
| ghi_scaled_clearsky | 864 | 126 |

| Clamp kind | Hits |
|------------|------|
| bucket_global | 178 |
| bucket_hourly | 316 |
| ratio | 158 |


---

## Message from the Captain's Log

> *"Engage... maximum solar absorption! - Captain Picard"*

Live long and prosper!

---

*Report by Solar Forecast ML*

*Created with solar power by [Zara-Toorox](https://github.com/Zara-Toorox)*