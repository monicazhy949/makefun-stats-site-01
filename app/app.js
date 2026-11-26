// Japan in Numbers — router, pages and controls. Data lives in data/*.json
// and is fetched from this same site; every figure is shown with its source.
(function () {
  'use strict';

  var main = document.getElementById('main');
  var cache = {};
  var esc = window.JinCharts.esc;
  var fmtInt = function (n) { return n.toLocaleString('en-US'); };

  function load(name) {
    if (cache[name]) return Promise.resolve(cache[name]);
    return fetch('data/' + name + '.json').then(function (r) {
      if (!r.ok) throw new Error('Could not load ' + name);
      return r.json();
    }).then(function (d) { cache[name] = d; return d; });
  }

  function loadAll(names) { return Promise.all(names.map(load)); }

  function srcLine(text) { return '<p class="src-note">Source: ' + esc(text) + '</p>'; }

  function kpi(label, value, unit, source) {
    return '<div class="kpi"><p class="label">' + esc(label) + '</p>' +
      '<p class="value">' + value + (unit ? ' <span class="unit">' + esc(unit) + '</span>' : '') + '</p>' +
      '<p class="src">' + esc(source) + '</p></div>';
  }

  function setActive(route) {
    document.querySelectorAll('.main-nav a').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-route') === route);
    });
  }

  function barRows(items, max) {
    return items.map(function (it) {
      var pct = Math.round((it.share / max) * 100);
      return '<div class="bar-row"><span>' + esc(it.group) + '</span>' +
        '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%;background:' + (it.color || '#1e325e') + '"></div></div>' +
        '<span class="bar-val">' + it.share + '%</span></div>';
    }).join('');
  }

  function prefectureRows(list) {
    return list.map(function (p) {
      return '<tr><td>' + esc(p.name) + '</td><td>' + esc(p.capital) + '</td><td>' + esc(p.region) + '</td>' +
        '<td class="num">' + fmtInt(p.population) + '</td></tr>';
    }).join('');
  }

  // ---------- Overview ----------
  function renderOverview() {
    return loadAll(['population', 'economy', 'living']).then(function (d) {
      var pop = d[0], eco = d[1], liv = d[2];
      var items = [
        { title: 'Population — 123.05 million (2025)', text: 'Total residents counted in the 2025 Population Census, down 2.5% from 2020.', href: '#/population' },
        { title: 'GDP — $4.02 trillion (2024)', text: 'Nominal GDP, 4th largest in the world (World Bank).', href: '#/economy' },
        { title: 'Unemployment — 2.5% (2025)', text: 'Annual average from the Labour Force Survey; 1.76 million people unemployed.', href: '#/economy' },
        { title: 'Life expectancy — 84.0 years (2024)', text: '87.9 years for women, 81.8 for men (World Bank / UN).', href: '#/living' },
        { title: 'Fertility rate — 1.15 (2024)', text: 'Record low; 686,061 births against 1,605,298 deaths.', href: '#/population' },
        { title: 'Inflation (CPI) — 2.7% (2024)', text: 'Third straight year above 2% (Statistics Bureau).', href: '#/economy' },
        { title: 'Share aged 65+ — 29.4% (2025)', text: '36.14 million people, the highest share of any large country.', href: '#/population' },
        { title: 'Exports — ¥107.9 trillion (2024)', text: 'Record goods exports; a ¥5.3 trillion trade deficit (Ministry of Finance).', href: '#/economy' }
      ];
      var trend = pop.censusTrend.map(function (p) { return { year: p.year, value: p.population }; });
      main.innerHTML =
        '<p class="eyebrow">Japan · 47 prefectures · Capital Tokyo</p>' +
        '<h1>Japan in Numbers</h1>' +
        '<p class="lede">The essential statistics of Japan in one place — population, economy, health and education — with every figure traced to its source institution and year.</p>' +
        '<div class="kpi-grid">' +
        kpi('Population', '123.05', 'million', 'Statistics Bureau, 2025 Census') +
        kpi('GDP (nominal)', '$4.02', 'trillion', 'World Bank, 2024') +
        kpi('GDP per capita', '$32,465', '', 'World Bank, 2024') +
        kpi('Unemployment', '2.5', '%', 'Statistics Bureau, 2025') +
        kpi('Inflation (CPI)', '2.7', '%', 'Statistics Bureau, 2024') +
        kpi('Life expectancy', '84.0', 'years', 'World Bank, 2024') +
        kpi('Fertility rate', '1.15', '', 'MHLW, 2024') +
        kpi('Aged 65+', '29.4', '%', 'Statistics Bureau, 2025 Census') +
        '</div>' +
        '<div class="chart-box"><p class="chart-title">Population is shrinking — and shrinking faster</p>' +
        '<p class="chart-sub">Census population, millions. Japan peaked at 128.06 million in 2010.</p>' +
        window.JinCharts.lineChart(trend, { label: 'Japan census population 2000 to 2025', format: function (v) { return v + 'm'; }, valueLabel: function (v) { return v.toFixed(2) + 'm'; } }) +
        srcLine(pop.censusTrendSource) + '</div>' +
        '<h2>Three things the numbers say</h2>' +
        '<ul class="story">' +
        '<li><b>Japan is the world&rsquo;s oldest large country.</b> Almost three in ten residents are 65 or older (29.4% in the 2025 census), and the median age is 49.4 — the highest of any major economy.</li>' +
        '<li><b>Births fell below 700,000 for the first time in 2024.</b> With 686,061 births and 1,605,298 deaths, the natural decrease of 919,237 was the largest ever recorded.</li>' +
        '<li><b>The economy is big, but the yen is weak.</b> Nominal GDP of $4.02 trillion in 2024 is down from $5.05 trillion in 2020 almost entirely because of yen depreciation; in yen terms the economy kept growing.</li>' +
        '</ul>' +
        '<div class="finder"><h2>Find an indicator</h2>' +
        '<input type="search" id="finder" placeholder="Try “unemployment”, “exports” or “life expectancy”…" aria-label="Search indicators">' +
        '<ul id="finder-list">' + items.map(function (it) {
          return '<li data-text="' + esc(it.title + ' ' + it.text) + '"><a href="' + it.href + '"><b>' + esc(it.title) + '</b><small>' + esc(it.text) + '</small></a></li>';
        }).join('') + '</ul></div>' +
        '<div class="callout"><strong>How to read this site:</strong> every number carries its source and year. Figures in dollars move with the yen; figures in yen do not. Census figures are counts, survey figures are estimates.</div>';
      var input = document.getElementById('finder');
      input.addEventListener('input', function () {
        var q = input.value.trim().toLowerCase();
        document.querySelectorAll('#finder-list li').forEach(function (li) {
          li.style.display = !q || li.getAttribute('data-text').toLowerCase().indexOf(q) !== -1 ? '' : 'none';
        });
      });
    });
  }

  // ---------- Population ----------
  function renderPopulation() {
    return load('population').then(function (pop) {
      var trend = pop.censusTrend.map(function (p) { return { year: p.year, value: p.population }; });
      var change = pop.censusTrend.slice(1).map(function (p, i) {
        return { year: p.year, value: Math.round((p.population - pop.censusTrend[i].population) * 100) / 100 };
      });
      main.innerHTML =
        '<p class="eyebrow">People</p><h1>Population</h1>' +
        '<p class="lede">Japan counted 123.05 million residents in the 2025 census — 3.10 million fewer than in 2020, the fastest five-year fall on record.</p>' +
        '<div class="kpi-grid">' +
        kpi('Total population', '123.05', 'million', 'Statistics Bureau, 2025 Census') +
        kpi('Median age', '49.4', 'years', 'UN World Population Prospects, 2024') +
        kpi('Foreign residents', '3.84', 'million', 'Statistics Bureau, 2025 Census') +
        kpi('Households', '57.13', 'million', 'Statistics Bureau, 2025 Census') +
        '</div>' +
        '<div class="chart-box"><p class="chart-title">Census population, 2000–2025</p>' +
        '<p class="chart-sub">Switch between the total and the change since the previous census.</p>' +
        '<div class="toolbar"><button class="btn" id="trend-total" aria-pressed="true">Total (millions)</button>' +
        '<button class="btn" id="trend-change" aria-pressed="false">Change since last census</button></div>' +
        '<div id="trend-chart"></div>' + srcLine(pop.censusTrendSource) + '</div>' +
        '<div class="two-col"><div class="card"><h3>Age structure, 2025 census</h3>' +
        barRows([
          { group: 'Ages 0–14', share: 11.4, color: '#2563eb' },
          { group: 'Ages 15–64', share: 59.2, color: '#1e325e' },
          { group: 'Ages 65+', share: 29.4, color: '#bc002d' }
        ], 59.2) + srcLine(pop.ageStructureSource) + '</div>' +
        '<div class="card"><h3>Births and deaths, 2024</h3>' +
        '<p><b>686,061</b> births — the first year below 700,000 since records began in 1899.</p>' +
        '<p><b>1,605,298</b> deaths — the highest in the post-war period.</p>' +
        '<p><b>−919,237</b> natural change, the 18th straight year of decline.</p>' +
        '<p><b>1.15</b> total fertility rate, a record low.</p>' +
        srcLine('Ministry of Health, Labour and Welfare, Vital Statistics 2024') + '</div></div>' +
        '<h2>Largest prefectures</h2>' +
        '<p class="lede">Only Tokyo grew between the 2020 and 2025 censuses; every other prefecture shrank. The ten largest prefectures below are from the 2020 census.</p>' +
        '<div class="toolbar"><input type="search" id="pref-search" placeholder="Search a prefecture…" aria-label="Search prefectures">' +
        '<button class="btn" id="sort-desc" aria-pressed="true">Largest first</button>' +
        '<button class="btn" id="sort-asc" aria-pressed="false">Smallest first</button>' +
        '<button class="btn" id="sort-name" aria-pressed="false">A–Z</button></div>' +
        '<div class="table-wrap"><table id="pref-table"><thead><tr><th>Prefecture</th><th>Capital</th><th>Region</th><th class="num">Population</th></tr></thead>' +
        '<tbody id="pref-body"></tbody></table></div>' + srcLine(pop.prefecturesSource);
      var chartBox = document.getElementById('trend-chart');
      var showTotal = function () {
        chartBox.innerHTML = window.JinCharts.lineChart(trend, { label: 'Japan census population', format: function (v) { return v + 'm'; }, valueLabel: function (v) { return v.toFixed(2) + 'm'; } });
        document.getElementById('trend-total').setAttribute('aria-pressed', 'true');
        document.getElementById('trend-change').setAttribute('aria-pressed', 'false');
      };
      var showChange = function () {
        chartBox.innerHTML = window.JinCharts.barChart(change, { label: 'Change in census population', color: '#bc002d', valueLabel: function (v) { return (v > 0 ? '+' : '') + v.toFixed(2) + 'm'; } });
        document.getElementById('trend-change').setAttribute('aria-pressed', 'true');
        document.getElementById('trend-total').setAttribute('aria-pressed', 'false');
      };
      document.getElementById('trend-total').addEventListener('click', showTotal);
      document.getElementById('trend-change').addEventListener('click', showChange);
      showTotal();
      var rows = pop.prefectures.slice();
      var body = document.getElementById('pref-body');
      var draw = function (list) { body.innerHTML = prefectureRows(list); };
      var applyFilter = function () {
        var q = document.getElementById('pref-search').value.trim().toLowerCase();
        draw(rows.filter(function (p) { return !q || p.name.toLowerCase().indexOf(q) !== -1 || p.capital.toLowerCase().indexOf(q) !== -1 || p.region.toLowerCase().indexOf(q) !== -1; }));
      };
      document.getElementById('pref-search').addEventListener('input', applyFilter);
      var setSort = function (mode, btn) {
        document.querySelectorAll('#sort-desc,#sort-asc,#sort-name').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        btn.setAttribute('aria-pressed', 'true');
        if (mode === 'desc') rows.sort(function (a, b) { return b.population - a.population; });
        if (mode === 'asc') rows.sort(function (a, b) { return a.population - b.population; });
        if (mode === 'name') rows.sort(function (a, b) { return a.name.localeCompare(b.name); });
        applyFilter();
      };
      document.getElementById('sort-desc').addEventListener('click', function (e) { setSort('desc', e.currentTarget); });
      document.getElementById('sort-asc').addEventListener('click', function (e) { setSort('asc', e.currentTarget); });
      document.getElementById('sort-name').addEventListener('click', function (e) { setSort('name', e.currentTarget); });
      draw(rows);
    });
  }

  // ---------- Economy ----------
  function renderEconomy() {
    return load('economy').then(function (eco) {
      var gdp = eco.gdpNominalSeries.map(function (p) { return { year: p.year, value: p.value }; });
      var cpi = eco.cpi.map(function (p) { return { year: p.year, value: p.value }; });
      var unemp = eco.unemployment.map(function (p) { return { year: p.year, value: p.value }; });
      main.innerHTML =
        '<p class="eyebrow">Money</p><h1>Economy</h1>' +
        '<p class="lede">The world&rsquo;s 4th largest economy, with prices rising again after decades of deflation and unemployment stuck near 2.5%.</p>' +
        '<div class="kpi-grid">' +
        kpi('GDP (nominal)', '$4.02', 'trillion', 'World Bank, 2024') +
        kpi('GDP (PPP)', '$6.49', 'trillion', 'World Bank, 2024') +
        kpi('GDP per capita', '$32,465', '', 'World Bank, 2024') +
        kpi('Real GDP growth', '−0.1', '%', 'World Bank, 2024') +
        kpi('Unemployment', '2.5', '%', 'Statistics Bureau, 2025') +
        kpi('Inflation (CPI)', '2.7', '%', 'Statistics Bureau, 2024') +
        kpi('Goods exports', '¥107.9', 'trillion', 'Ministry of Finance, 2024') +
        kpi('Trade balance', '−¥5.3', 'trillion', 'Ministry of Finance, 2024') +
        '</div>' +
        '<div class="chart-box"><p class="chart-title">Nominal GDP, 2020–2024</p>' +
        '<p class="chart-sub">US$ trillion. The dollar figure fell as the yen weakened — it averaged about ¥151 per dollar in 2024 — while the economy kept growing in yen terms.</p>' +
        window.JinCharts.barChart(gdp, { label: 'Japan nominal GDP 2020 to 2024', color: '#1e325e', format: function (v) { return '$' + v + 'T'; }, valueLabel: function (v) { return '$' + v.toFixed(2) + 'T'; } }) +
        srcLine(eco.gdpSeriesSource) + '</div>' +
        '<div class="two-col"><div class="chart-box" style="margin:0"><p class="chart-title">What Japan produces</p>' +
        '<p class="chart-sub">Share of GDP by sector, 2023.</p>' +
        window.JinCharts.donutChart([
          { label: 'Services', value: 69.3, color: '#1e325e' },
          { label: 'Industry', value: 29.0, color: '#bc002d' },
          { label: 'Agriculture', value: 1.0, color: '#b45309' }
        ], { label: 'GDP by sector', center: 'Services', centerSub: '69.3% of GDP' }) +
        '<p><span class="pill">Services 69.3%</span> <span class="pill">Industry 29.0%</span> <span class="pill">Agriculture 1.0%</span></p>' +
        srcLine(eco.compositionSource) + '</div>' +
        '<div class="chart-box" style="margin:0"><p class="chart-title">Prices and jobs</p>' +
        '<p class="chart-sub">Switch between consumer-price inflation and the unemployment rate.</p>' +
        '<div class="toolbar"><button class="btn" id="show-cpi" aria-pressed="true">Inflation (CPI %)</button>' +
        '<button class="btn" id="show-unemp" aria-pressed="false">Unemployment (%)</button></div>' +
        '<div id="pj-chart"></div>' + srcLine('Statistics Bureau of Japan, Consumer Price Index and Labour Force Survey') + '</div></div>' +
        '<h2>Trade in 2024</h2>' +
        '<div class="table-wrap"><table><thead><tr><th>Flow</th><th class="num">Value</th><th>Source</th></tr></thead><tbody>' +
        '<tr><td>Goods exports</td><td class="num">¥107.9 trillion (record high)</td><td>Ministry of Finance</td></tr>' +
        '<tr><td>Goods imports</td><td class="num">¥113.2 trillion</td><td>Ministry of Finance</td></tr>' +
        '<tr><td>Trade balance</td><td class="num">−¥5.3 trillion (deficit)</td><td>Ministry of Finance</td></tr>' +
        '<tr><td>Exports of goods and services</td><td class="num">22.0% of GDP</td><td>World Bank</td></tr>' +
        '<tr><td>Current-account surplus (FY2024)</td><td class="num">¥30.38 trillion (record high)</td><td>Ministry of Finance</td></tr>' +
        '</tbody></table></div>' +
        '<p class="src-note">Strong exports of vehicles, semiconductors and machinery were outweighed by energy import costs, leaving a goods deficit — while investment income kept the current account in a record surplus.</p>';
      var box = document.getElementById('pj-chart');
      var showCpi = function () {
        box.innerHTML = window.JinCharts.barChart(cpi, { label: 'Japan CPI inflation', color: '#bc002d', valueLabel: function (v) { return v.toFixed(1) + '%'; } });
        document.getElementById('show-cpi').setAttribute('aria-pressed', 'true');
        document.getElementById('show-unemp').setAttribute('aria-pressed', 'false');
      };
      var showUnemp = function () {
        box.innerHTML = window.JinCharts.barChart(unemp, { label: 'Japan unemployment rate', color: '#0f766e', valueLabel: function (v) { return v.toFixed(1) + '%'; } });
        document.getElementById('show-unemp').setAttribute('aria-pressed', 'true');
        document.getElementById('show-cpi').setAttribute('aria-pressed', 'false');
      };
      document.getElementById('show-cpi').addEventListener('click', showCpi);
      document.getElementById('show-unemp').addEventListener('click', showUnemp);
      showCpi();
    });
  }

  // ---------- Living ----------
  function renderLiving() {
    return load('living').then(function (liv) {
      main.innerHTML =
        '<p class="eyebrow">People&rsquo;s lives</p><h1>Health &amp; Education</h1>' +
        '<p class="lede">Japan lives the longest of any large country, with near-universal literacy, high tertiary education and one of the world&rsquo;s lowest infant mortality rates.</p>' +
        '<div class="kpi-grid">' +
        kpi('Life expectancy', '84.0', 'years', 'World Bank, 2024') +
        kpi('Infant mortality', '1.8', 'per 1,000 births', 'World Bank, 2024') +
        kpi('Tertiary education (25–34)', '65', '%', 'OECD, 2024') +
        kpi('Human Development Index', '0.925', '', 'UNDP, 2023') +
        '</div>' +
        '<div class="chart-box"><p class="chart-title">Life expectancy at birth, 2024</p>' +
        '<p class="chart-sub">Years. Japanese women live longer than women anywhere else.</p>' +
        barRows([
          { group: 'Women', share: 87.9, color: '#bc002d' },
          { group: 'All people', share: 84.0, color: '#1e325e' },
          { group: 'Men', share: 81.8, color: '#2563eb' }
        ], 87.9) + srcLine('World Bank, World Development Indicators; United Nations, World Population Prospects 2024') + '</div>' +
        '<div class="two-col"><div class="card"><h3>Health system</h3>' +
        '<p><b>2.65</b> physicians per 1,000 people (World Bank, 2022).</p>' +
        '<p><b>12.6</b> hospital beds per 1,000 people (World Bank, 2022) — among the highest in the OECD.</p>' +
        '<p><b>10.7%</b> of GDP spent on health (World Bank, 2023).</p>' +
        '<p><b>2.4</b> deaths before age 5 per 1,000 live births (World Bank, 2024).</p></div>' +
        '<div class="card"><h3>Education and society</h3>' +
        '<p><b>65%</b> of people aged 25–34 hold a tertiary degree (OECD, Education at a Glance 2024).</p>' +
        '<p><b>485,063</b> marriages in 2024 (MHLW Vital Statistics).</p>' +
        '<p><b>92.3%</b> of people live in urban areas (UN, 2025).</p>' +
        '<p><b>93.0%</b> of people use the internet (World Bank, 2023).</p></div></div>' +
        '<h2>Visitors</h2><p>In fiscal 2024 Japan welcomed a record <b>38.85 million</b> international visitors (Japan National Tourism Organization), and the travel surplus reached ¥6.69 trillion.</p>';
    });
  }

  // ---------- Charts ----------
  function renderCharts() {
    return loadAll(['population', 'economy']).then(function (d) {
      var pop = d[0], eco = d[1];
      var trend = pop.censusTrend.map(function (p) { return { year: p.year, value: p.population }; });
      var cpi = eco.cpi.map(function (p) { return { year: p.year, value: p.value }; });
      var unemp = eco.unemployment.map(function (p) { return { year: p.year, value: p.value }; });
      main.innerHTML =
        '<p class="eyebrow">All charts</p><h1>Charts</h1>' +
        '<p class="lede">Every chart on this page is drawn from the data files — no chart library, no images, no network requests. Use the switches to change what each chart shows.</p>' +
        '<div class="chart-box"><p class="chart-title">Population trend — census counts</p>' +
        '<p class="chart-sub">Millions of residents, 2000–2025.</p>' +
        window.JinCharts.lineChart(trend, { label: 'Japan census population 2000 to 2025', format: function (v) { return v + 'm'; }, valueLabel: function (v) { return v.toFixed(2) + 'm'; } }) +
        srcLine(pop.censusTrendSource) + '</div>' +
        '<div class="two-col"><div class="chart-box" style="margin:0"><p class="chart-title">GDP by sector, 2023</p>' +
        '<p class="chart-sub">Share of GDP.</p>' +
        window.JinCharts.donutChart([
          { label: 'Services', value: 69.3, color: '#1e325e' },
          { label: 'Industry', value: 29.0, color: '#bc002d' },
          { label: 'Agriculture', value: 1.0, color: '#b45309' }
        ], { label: 'GDP by sector', center: 'Services', centerSub: '69.3% of GDP' }) +
        srcLine(eco.compositionSource) + '</div>' +
        '<div class="chart-box" style="margin:0"><p class="chart-title">Prices vs jobs</p>' +
        '<p class="chart-sub">Annual averages, %.</p>' +
        '<div class="toolbar"><button class="btn" id="c-cpi" aria-pressed="true">Inflation</button>' +
        '<button class="btn" id="c-unemp" aria-pressed="false">Unemployment</button></div>' +
        '<div id="c-chart"></div>' + srcLine('Statistics Bureau of Japan, Consumer Price Index and Labour Force Survey') + '</div></div>';
      var box = document.getElementById('c-chart');
      var showCpi = function () {
        box.innerHTML = window.JinCharts.barChart(cpi, { label: 'Japan CPI inflation', color: '#bc002d', valueLabel: function (v) { return v.toFixed(1) + '%'; } });
        document.getElementById('c-cpi').setAttribute('aria-pressed', 'true');
        document.getElementById('c-unemp').setAttribute('aria-pressed', 'false');
      };
      var showUnemp = function () {
        box.innerHTML = window.JinCharts.barChart(unemp, { label: 'Japan unemployment rate', color: '#0f766e', valueLabel: function (v) { return v.toFixed(1) + '%'; } });
        document.getElementById('c-unemp').setAttribute('aria-pressed', 'true');
        document.getElementById('c-cpi').setAttribute('aria-pressed', 'false');
      };
      document.getElementById('c-cpi').addEventListener('click', showCpi);
      document.getElementById('c-unemp').addEventListener('click', showUnemp);
      showCpi();
    });
  }

  // ---------- Sources ----------
  function renderSources() {
    return load('meta').then(function (meta) {
      main.innerHTML =
        '<p class="eyebrow">Transparency</p><h1>Sources &amp; methods</h1>' +
        '<p class="lede">Every figure on this site comes from one of the institutions below. Where two sources disagree — for example the World Bank and IMF on dollar GDP — this site uses the World Bank series and says so.</p>' +
        '<div class="table-wrap"><table><thead><tr><th>Institution</th><th>What it covers here</th><th>Note</th></tr></thead><tbody>' +
        meta.sources.map(function (s) {
          return '<tr><td><b>' + esc(s.institution) + '</b></td><td>' + esc(s.covers) + '</td><td>' + esc(s.note) + '</td></tr>';
        }).join('') + '</tbody></table></div>' +
        '<h2>Methods</h2><ul class="story">' +
        meta.methods.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') +
        '</ul><p class="src-note">Data last checked 26 November 2026. Figures are reproduced for reference; the source institutions are authoritative.</p>';
    });
  }

  var routes = {
    '': renderOverview, population: renderPopulation, economy: renderEconomy,
    living: renderLiving, charts: renderCharts, sources: renderSources
  };

  function route() {
    var hash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
    var fn = routes[hash] || routes[''];
    setActive(routes[hash] ? hash : '');
    main.innerHTML = '<p class="loading">Loading statistics…</p>';
    fn().catch(function (err) {
      main.innerHTML = '<h1>Could not load the data</h1><p>The statistics files could not be read (' + esc(err.message) + '). Please serve this site over HTTP and try again.</p>';
    });
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', route);
  route();
})();
