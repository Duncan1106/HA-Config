<<<<<<< system
# HA-Config

This repository contains configuration files and resources for a Home Assistant (HA) setup, including automation scripts, dashboard layouts, ESPHome device configurations, and more. It is organized to help manage and extend a smart home system using Home Assistant.

---

## Repository Structure

```text
HA-Config/
├── addons/
│   └── [repositories.yaml](https://github.com/Duncan1106/HA-Config/blob/main/addons/repositories.yaml)
├── config/
│   ├── [Ffmpeg_timeplase.sh](https://github.com/Duncan1106/HA-Config/blob/main/config/Ffmpeg_timeplase.sh)
│   ├── [README.md](https://github.com/Duncan1106/HA-Config/blob/main/config/README.md)
│   ├── [automations.yaml](https://github.com/Duncan1106/HA-Config/blob/main/config/automations.yaml)
│   ├── [configuration.yaml](https://github.com/Duncan1106/HA-Config/blob/main/config/configuration.yaml)
│   ├── [frigate.yml](https://github.com/Duncan1106/HA-Config/blob/main/config/frigate.yml)
│   ├── [go2rtc-1.9.4](https://github.com/Duncan1106/HA-Config/blob/main/config/go2rtc-1.9.4)
│   ├── [go2rtc.yaml](https://github.com/Duncan1106/HA-Config/blob/main/config/go2rtc.yaml)
│   ├── [scenes.yaml](https://github.com/Duncan1106/HA-Config/blob/main/config/scenes.yaml)
│   ├── [scripts.yaml](https://github.com/Duncan1106/HA-Config/blob/main/config/scripts.yaml)
│   ├── [secrets.yaml](https://github.com/Duncan1106/HA-Config/blob/main/config/secrets.yaml)
│   ├── [addons_autoscripts/](https://github.com/Duncan1106/HA-Config/tree/main/config/addons_autoscripts)
│   ├── [blueprints/](https://github.com/Duncan1106/HA-Config/tree/main/config/blueprints)
│   ├── [image/](https://github.com/Duncan1106/HA-Config/tree/main/config/image)
│   ├── [multiscrape/](https://github.com/Duncan1106/HA-Config/tree/main/config/multiscrape)
│   └── [www/](https://github.com/Duncan1106/HA-Config/tree/main/config/www)
├── esphome/
│   ├── [.gitignore](https://github.com/Duncan1106/HA-Config/blob/main/esphome/.gitignore)
│   ├── [archive/](https://github.com/Duncan1106/HA-Config/tree/main/esphome/archive)
│   ├── [az-envy-1.yaml](https://github.com/Duncan1106/HA-Config/blob/main/esphome/az-envy-1.yaml)
│   ├── [az-envy-uno-3d-printer.yaml](https://github.com/Duncan1106/HA-Config/blob/main/esphome/az-envy-uno-3d-printer.yaml)
│   ├── [az-envy-uno-gartenhaus.yaml](https://github.com/Duncan1106/HA-Config/blob/main/esphome/az-envy-uno-gartenhaus.yaml)
│   ├── [bms-test.yaml](https://github.com/Duncan1106/HA-Config/blob/main/esphome/bms-test.yaml)
│   ├── [esp32-c3-mini--bett-nachtlicht.yaml](https://github.com/Duncan1106/HA-Config/blob/main/esphome/esp32-c3-mini--bett-nachtlicht.yaml)
│   ├── [esp32-c3-mini--goe11-controll.yaml](https://github.com/Duncan1106/HA-Config/blob/main/esphome/esp32-c3-mini--goe11-controll.yaml)
│   ├── [esp32-c3-mini--goe22-controll.yaml](https://github.com/Duncan1106/HA-Config/blob/main/esphome/esp32-c3-mini--goe22-controll.yaml)
│   ├── [esp32-c3-mini--kallax-light.yaml](https://github.com/Duncan1106/HA-Config/blob/main/esphome/esp32-c3-mini--kallax-light.yaml)
│   └── ... *(many more, [view all](https://github.com/Duncan1106/HA-Config/tree/main/esphome))*
├── lovelace/
│   ├── [lovelace.dashboard_analysis.yaml](https://github.com/Duncan1106/HA-Config/blob/main/lovelace/lovelace.dashboard_analysis.yaml)
│   ├── [lovelace.dashboard_analytics.yaml](https://github.com/Duncan1106/HA-Config/blob/main/lovelace/lovelace.dashboard_analytics.yaml)
│   ├── [lovelace.dashboard_openspeedtest.yaml](https://github.com/Duncan1106/HA-Config/blob/main/lovelace/lovelace.dashboard_openspeedtest.yaml)
│   ├── [lovelace.dashboard_scheduler.yaml](https://github.com/Duncan1106/HA-Config/blob/main/lovelace/lovelace.dashboard_scheduler.yaml)
│   ├── [lovelace.fire_hd_8.yaml](https://github.com/Duncan1106/HA-Config/blob/main/lovelace/lovelace.fire_hd_8.yaml)
│   ├── [lovelace.map.yaml](https://github.com/Duncan1106/HA-Config/blob/main/lovelace/lovelace.map.yaml)
│   ├── [lovelace.test_sankey.yaml](https://github.com/Duncan1106/HA-Config/blob/main/lovelace/lovelace.test_sankey.yaml)
│   ├── [lovelace.yaml](https://github.com/Duncan1106/HA-Config/blob/main/lovelace/lovelace.yaml)
│   ├── [lovelace_dashboards.yaml](https://github.com/Duncan1106/HA-Config/blob/main/lovelace/lovelace_dashboards.yaml)
│   └── [lovelace_resources.yaml](https://github.com/Duncan1106/HA-Config/blob/main/lovelace/lovelace_resources.yaml)
│   └── ... *(more, [view all](https://github.com/Duncan1106/HA-Config/tree/main/lovelace))*
└── [README.md](https://github.com/Duncan1106/HA-Config/blob/main/README.md)
```

> **Note:** The lists above are incomplete due to API limits.  
> - [Browse the full `config` directory](https://github.com/Duncan1106/HA-Config/tree/main/config)  
> - [Browse the full `esphome` directory](https://github.com/Duncan1106/HA-Config/tree/main/esphome)  
> - [Browse the full `lovelace` directory](https://github.com/Duncan1106/HA-Config/tree/main/lovelace)
> - [Browse the full `addons` directory](https://github.com/Duncan1106/HA-Config/tree/main/addons)

---

## Directory Overview

- **addons/**: Contains custom Home Assistant add-on repositories and configuration.
- **config/**: Main Home Assistant configuration, automations, scripts, secrets, blueprints, backup data, and other resources.
- **esphome/**: ESPHome YAML configurations for a large number of ESP-based smart devices used in this HA setup.
- **lovelace/**: Dashboard configuration files for Home Assistant's Lovelace UI, including multiple dashboards and resources.

---

## Usage

1. Clone the repository:
   ```sh
   git clone https://github.com/Duncan1106/HA-Config.git
   ```
2. Review the `config/README.md` for setup and customization details.
3. Copy relevant configuration files to your Home Assistant instance or use as a reference for your own setup.

---

## Contributing

Contributions are welcome! Please open issues or submit pull requests with improvements or fixes.

---


*This README was generated automatically and may not reflect the very latest directory contents. Please browse the repository for up-to-date details.*
=======

## Credits

* [Home Assistant](https://www.home-assistant.io/)
* The authors of the custom components I use.

## License

MIT License

Copyright (c) 2025 @Duncan1106

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
