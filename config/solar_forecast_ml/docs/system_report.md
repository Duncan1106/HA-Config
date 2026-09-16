# Solar Forecast ML - System Report
> Generated: 2026-09-16 23:30 | System: 18.53 kWp

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

**Total Production:** 4659.6 kWh

**Average Accuracy:** 74.1%

### Seasonal Production

| Season | Best Day | Avg Daily | Total |
|--------|----------|-----------|-------|
| Winter | - | - | - |
| Spring | - | - | - |
| Summer | 103.12 kWh | 76.71 kWh | 3758.7 kWh |
| Autumn | 75.48 kWh | 60.06 kWh | 900.9 kWh |

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
| 2026-09-16 | 835 | 37 | 6 | 1.90 | geometry_contrast_recorded |

Headline exclusions:
- elev 0 excluded from headline (elev < 20; east k_p90=0.345 west k_p90=2.388; k_p90 > 1)
- elev 10 excluded from headline (elev < 20; east k_p90=0.436 west k_p90=1.212; k_p90 > 1)

| Elev | Sector | Hours | k_avg | k_p90 | k_max | Headline |
|------|--------|-------|-------|-------|-------|----------|
| 0 | east | 34 | 0.259 | 0.345 | 0.368 | no |
| 0 | west | 31 | 1.425 | 2.388 | 2.805 | no |
| 10 | east | 66 | 0.310 | 0.436 | 1.085 | no |
| 10 | west | 66 | 0.759 | 1.212 | 1.506 | no |
| 20 | east | 65 | 0.418 | 0.660 | 0.882 | yes |
| 20 | west | 68 | 0.799 | 1.251 | 1.454 | yes |
| 30 | east | 68 | 0.630 | 0.845 | 0.960 | yes |
| 30 | west | 62 | 0.908 | 1.181 | 1.478 | yes |
| 40 | east | 41 | 0.792 | 0.940 | 1.135 | yes |
| 40 | west | 41 | 0.960 | 1.166 | 1.371 | yes |
| 50 | east | 19 | 0.814 | 1.018 | 1.043 | yes |
| 50 | west | 20 | 0.996 | 1.245 | 1.365 | yes |

### Hourly physics-factor shape

| Group | Date | Hours | Min factor | Max factor | Spread |
|-------|------|-------|------------|------------|--------|
| Gruppe 1 | 2026-09-16 | 8-18 (11) | 1.449 | 3.857 | 2.408 |
| Gruppe 2 | 2026-09-16 | 8-18 (11) | 0.910 | 3.998 | 3.088 |
| Gruppe 3 | 2026-09-16 | 8-18 (11) | 0.425 | 3.961 | 3.536 |

### Sample ledger

| Physics ref kind | Samples | Ratio clamp hits |
|------------------|---------|------------------|
| forecast_physics | 11 | 6 |
| ghi_scaled_clearsky | 332 | 42 |

| Clamp kind | Hits |
|------------|------|
| bucket_global | 71 |
| bucket_hourly | 140 |
| ratio | 48 |


---

## Message from the Captain's Log

> *"Today is a good day to generate clean energy! - Worf"*

Live long and prosper!

---

*Report by Solar Forecast ML*

*Created with solar power by [Zara-Toorox](https://github.com/Zara-Toorox)*