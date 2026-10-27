# Solar Forecast ML - System Report
> Generated: 2026-10-27 23:30 | System: 18.53 kWp

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

**Total Production:** 6217.6 kWh

**Average Accuracy:** 77.7%

### Seasonal Production

| Season | Best Day | Avg Daily | Total |
|--------|----------|-----------|-------|
| Winter | - | - | - |
| Spring | - | - | - |
| Summer | 103.12 kWh | 76.71 kWh | 3758.7 kWh |
| Autumn | 75.48 kWh | 43.91 kWh | 2458.9 kWh |

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
| 2026-10-27 | 1031 | 44 | 5 | 1.38 | geometry_contrast_recorded |

Headline exclusions:
- elev 0 excluded from headline (elev < 20; east k_p90=0.918 west k_p90=1.990; k_p90 > 1)
- elev 10 excluded from headline (elev < 20; east k_p90=0.774 west k_p90=1.021; k_p90 > 1)

| Elev | Sector | Hours | k_avg | k_p90 | k_max | Headline |
|------|--------|-------|-------|-------|-------|----------|
| 0 | east | 42 | 0.448 | 0.918 | 1.299 | no |
| 0 | west | 46 | 0.934 | 1.990 | 2.805 | no |
| 10 | east | 96 | 0.446 | 0.774 | 1.480 | no |
| 10 | west | 96 | 0.688 | 1.021 | 1.506 | no |
| 20 | east | 79 | 0.520 | 0.919 | 0.962 | yes |
| 20 | west | 75 | 0.771 | 1.224 | 1.454 | yes |
| 30 | east | 56 | 0.621 | 0.857 | 0.960 | yes |
| 30 | west | 47 | 0.916 | 1.181 | 1.478 | yes |
| 40 | east | 26 | 0.815 | 0.948 | 1.135 | yes |
| 40 | west | 27 | 0.945 | 1.144 | 1.184 | yes |
| 50 | east | 4 | 0.792 | 0.918 | 0.918 | no |
| 50 | west | 5 | 0.951 | 1.097 | 1.097 | no |

### Hourly physics-factor shape

| Group | Date | Hours | Min factor | Max factor | Spread |
|-------|------|-------|------------|------------|--------|
| Gruppe 1 | 2026-10-27 | 8-18 (11) | 0.725 | 1.335 | 0.610 |
| Gruppe 2 | 2026-10-27 | 8-18 (11) | 0.618 | 1.540 | 0.922 |
| Gruppe 3 | 2026-10-27 | 8-18 (11) | 0.697 | 1.307 | 0.610 |

### Sample ledger

| Physics ref kind | Samples | Ratio clamp hits |
|------------------|---------|------------------|
| forecast_physics | 319 | 17 |
| ghi_scaled_clearsky | 864 | 126 |

| Clamp kind | Hits |
|------------|------|
| bucket_global | 178 |
| bucket_hourly | 316 |
| ratio | 145 |


---

## Message from the Captain's Log

> *"Logic dictates that harvesting solar energy is the most efficient course of action. - Spock"*

Live long and prosper!

---

*Report by Solar Forecast ML*

*Created with solar power by [Zara-Toorox](https://github.com/Zara-Toorox)*