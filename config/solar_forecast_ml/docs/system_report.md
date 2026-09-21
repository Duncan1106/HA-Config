# Solar Forecast ML - System Report
> Generated: 2026-09-21 23:30 | System: 18.53 kWp

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

**Total Production:** 4918.2 kWh

**Average Accuracy:** 75.0%

### Seasonal Production

| Season | Best Day | Avg Daily | Total |
|--------|----------|-----------|-------|
| Winter | - | - | - |
| Spring | - | - | - |
| Summer | 103.12 kWh | 76.71 kWh | 3758.7 kWh |
| Autumn | 75.48 kWh | 57.98 kWh | 1159.6 kWh |

---

## Physics calibration telemetry

Diagnosis only. Living correction factors are unchanged.
This section is the support evidence channel for fleet step-3 gates.

**Learning contract:** physics_calibration_sensor_ghi_v1 (3 groups)

### GHI sensor geometry (diagnosis a)

Lookback window: 90 days (product constant, not a single-plant history length).
v1 contrast is east azimuth 45-135 vs west 225-315 at the same elevation bin. South-facing obstacles and southern-hemisphere morning/afternoon swap are not scored (those bins stay `other`).
Diagnosis bin floor: 5 samples. A later behavior/mask path (b) is not implemented and must use 12 samples (`CEILING_MIN_BIN_SAMPLES`), never the diagnosis floor.
Headline east/west k_p90 pools raw samples per (elevation, sector); it uses elevation bins 20 and above. Lower overlapping pairs stay in the raw bins and the overlapping count. If those pairs are the only overlap, diagnosis is `contrast_below_headline_elevation` and the headline stays n/a.

| Computed on | Hours | Bins | Overlapping elev | Max east/west k_p90 | Diagnosis |
|-------------|-------|------|------------------|---------------------|-----------|
| 2026-09-21 | 890 | 39 | 6 | 1.85 | geometry_contrast_recorded |

Headline exclusions:
- elev 0 excluded from headline (elev < 20; east k_p90=0.345 west k_p90=2.388; k_p90 > 1)
- elev 10 excluded from headline (elev < 20; east k_p90=0.495 west k_p90=1.194; k_p90 > 1)

| Elev | Sector | Hours | k_avg | k_p90 | k_max | Headline |
|------|--------|-------|-------|-------|-------|----------|
| 0 | east | 34 | 0.259 | 0.345 | 0.368 | no |
| 0 | west | 36 | 1.320 | 2.388 | 2.805 | no |
| 10 | east | 71 | 0.321 | 0.495 | 1.085 | no |
| 10 | west | 71 | 0.749 | 1.194 | 1.506 | no |
| 20 | east | 72 | 0.432 | 0.661 | 0.900 | yes |
| 20 | west | 73 | 0.787 | 1.224 | 1.454 | yes |
| 30 | east | 71 | 0.634 | 0.845 | 0.960 | yes |
| 30 | west | 62 | 0.908 | 1.181 | 1.478 | yes |
| 40 | east | 41 | 0.792 | 0.940 | 1.135 | yes |
| 40 | west | 41 | 0.960 | 1.166 | 1.371 | yes |
| 50 | east | 19 | 0.814 | 1.018 | 1.043 | yes |
| 50 | west | 20 | 0.996 | 1.245 | 1.365 | yes |

### Hourly physics-factor shape

| Group | Date | Hours | Min factor | Max factor | Spread |
|-------|------|-------|------------|------------|--------|
| Gruppe 1 | 2026-09-21 | 8-18 (11) | 1.270 | 3.932 | 2.662 |
| Gruppe 2 | 2026-09-21 | 8-18 (11) | 0.925 | 3.999 | 3.074 |
| Gruppe 3 | 2026-09-21 | 8-18 (11) | 0.397 | 3.553 | 3.156 |

### Sample ledger

| Physics ref kind | Samples | Ratio clamp hits |
|------------------|---------|------------------|
| forecast_physics | 17 | 7 |
| ghi_scaled_clearsky | 465 | 62 |

| Clamp kind | Hits |
|------------|------|
| bucket_global | 100 |
| bucket_hourly | 189 |
| ratio | 69 |


---

## Message from the Captain's Log

> *"The needs of the many outweigh the needs of the few... use solar power. - Spock"*

Live long and prosper!

---

*Report by Solar Forecast ML*

*Created with solar power by [Zara-Toorox](https://github.com/Zara-Toorox)*