const formatNumber = (value) => new Intl.NumberFormat('es-ES').format(value);

const renderSummary = (summary) => {
  const cards = [
    ['Días', summary.days],
    ['Pasos totales', formatNumber(summary.total_steps)],
    ['FC promedio', `${summary.avg_heart_rate} bpm`],
    ['Calorías totales', formatNumber(summary.total_calories)],
    ['Sueño promedio', `${summary.avg_sleep_hours} h`],
  ];

  const container = document.getElementById('summary-cards');
  container.innerHTML = cards
    .map(([label, value]) => `<article class="card"><h3>${label}</h3><p>${value}</p></article>`)
    .join('');
};

const metricConfigs = [
  { key: 'steps', label: 'Pasos por día', color: '#63e6be', format: (v) => formatNumber(v) },
  { key: 'avg_heart_rate', label: 'Frecuencia cardíaca promedio', color: '#ff8787', format: (v) => `${v} bpm` },
  { key: 'sleep_hours', label: 'Horas de sueño por día', color: '#74c0fc', format: (v) => `${v} h` },
];

const renderBars = (daily) => {
  const container = document.getElementById('charts-container');

  const sections = metricConfigs.map((metric) => {
    const maxValue = Math.max(...daily.map((d) => Number(d[metric.key] || 0)), 1);

    const rows = daily
      .map((d) => {
        const value = Number(d[metric.key] || 0);
        const width = Math.max(2, Math.round((value / maxValue) * 100));
        return `
          <div class="bar-row">
            <span class="bar-label">${d.date}</span>
            <div class="bar-track">
              <div class="bar-fill" style="--w:${width}%; --c:${metric.color}"></div>
            </div>
            <span class="bar-value">${metric.format(value)}</span>
          </div>
        `;
      })
      .join('');

    return `<article class="chart-card"><h2>${metric.label}</h2>${rows}</article>`;
  });

  container.innerHTML = sections.join('');
};

const init = async () => {
  const [summaryRes, dailyRes] = await Promise.all([
    fetch('/api/summary'),
    fetch('/api/daily'),
  ]);

  if (!summaryRes.ok || !dailyRes.ok) {
    throw new Error('Error consultando la API');
  }

  const summary = await summaryRes.json();
  const daily = await dailyRes.json();

  renderSummary(summary);
  renderBars(daily);
};

init().catch((error) => {
  console.error('No se pudo cargar el dashboard', error);
  document.getElementById('charts-container').innerHTML =
    '<article class="chart-card"><h2>Error</h2><p>No se pudo cargar la vista previa. Revisa que el servidor esté activo.</p></article>';
});
