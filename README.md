[![make.fun](https://make.fun/badge/best-national-statistics-site-20261126-0539.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539)
[![rank](https://make.fun/badge/best-national-statistics-site-20261126-0539/monicazhy949/makefun-stats-site-01/rank.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539)
[![reward](https://make.fun/badge/best-national-statistics-site-20261126-0539/monicazhy949/makefun-stats-site-01/reward.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539)

# Japan in Numbers

A national statistics site about **Japan**: population, economy, health and education, with every figure traced to its source institution and year.

- **Overview** — key indicators at a glance, a population trend chart, and an indicator finder.
- **Population** — census trend 2000–2025, age structure, births and deaths, and a searchable, sortable table of the ten largest prefectures.
- **Economy** — GDP, GDP per capita, inflation, unemployment, GDP by sector, and 2024 trade.
- **Health & Education** — life expectancy, infant mortality, physicians, hospital beds, tertiary education.
- **Charts** — hand-drawn SVG charts (no chart library, no network requests).
- **Sources** — every source institution and the methods used.

## Data sources

Statistics Bureau of Japan (Population Census, Labour Force Survey, Consumer Price Index); Ministry of Health, Labour and Welfare (Vital Statistics 2024); Ministry of Finance (Trade Statistics of Japan, Balance of Payments); World Bank (World Development Indicators); United Nations (World Population Prospects 2024, Human Development Report); OECD (Education at a Glance 2024); Japan National Tourism Organization. See the site's Sources page for the full list.

## Run it locally

```sh
python3 -m http.server 8080 --directory app
```

Then open http://localhost:8080 — it works fully offline; all scripts, styles and data are files under `app/`.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This entry is built for the [make.fun bounty “Make the best national statistics site”](https://make.fun/bounty/best-national-statistics-site-20261126-0539).
