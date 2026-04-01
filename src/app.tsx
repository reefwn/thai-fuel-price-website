import { signal, computed } from '@preact/signals'
import priceData from '../data/prices.json'
import { PriceChart } from './PriceChart'
import { t, locale, toggleLocale } from './i18n'
import './app.css'

const FUEL_KEYS = ['gasoline_95', 'gasohol_95', 'gasohol_91', 'gasohol_e20', 'gasohol_e85', 'diesel', 'diesel_b20'] as const
const FUEL_I18N: Record<string, keyof typeof import('./i18n').t.value> = {
  gasoline_95: 'gasoline95',
  gasohol_95: 'gasohol95',
  gasohol_91: 'gasohol91',
  gasohol_e20: 'gasoholE20',
  gasohol_e85: 'gasoholE85',
  diesel: 'diesel',
  diesel_b20: 'dieselB20',
}

type PriceEntry = { date: string; prices: Record<string, number> }
const data = priceData as PriceEntry[]

const fuelType = signal('gasohol_95')
const litres = signal(40)

// ── Car models with tank capacities (litres) ──
type CarModel = { name: string; tank: number }
type Brand = { brand: string; models: CarModel[] }

const CAR_DATA: Brand[] = [
  {
    brand: 'Toyota',
    models: [
      { name: 'Yaris Ativ', tank: 40 },
      { name: 'Corolla Cross', tank: 36 },
      { name: 'Hilux Revo', tank: 80 },
      { name: 'Fortuner', tank: 80 },
    ],
  },
  {
    brand: 'Honda',
    models: [
      { name: 'City', tank: 40 },
      { name: 'Civic', tank: 47 },
      { name: 'HR-V', tank: 40 },
      { name: 'CR-V', tank: 53 },
    ],
  },
  {
    brand: 'Mazda',
    models: [
      { name: 'Mazda 2', tank: 44 },
      { name: 'Mazda 3', tank: 51 },
      { name: 'CX-30', tank: 48 },
      { name: 'CX-5', tank: 56 },
    ],
  },
  {
    brand: 'Isuzu',
    models: [
      { name: 'D-Max', tank: 76 },
      { name: 'MU-X', tank: 80 },
    ],
  },
]

const FILL_OPTIONS = [
  { labelKey: 'full' as const, factor: 1 },
  { labelKey: null, label: '¾', factor: 0.75 },
  { labelKey: null, label: '½', factor: 0.5 },
  { labelKey: null, label: '¼', factor: 0.25 },
]

const selectedBrand = signal('')
const selectedModel = signal('')
const fillFactor = signal(1)
const litreMode = signal<'custom' | 'car'>('custom')

const availableModels = computed(() =>
  CAR_DATA.find(b => b.brand === selectedBrand.value)?.models ?? []
)

function onBrandChange(brand: string) {
  selectedBrand.value = brand
  selectedModel.value = ''
  // Auto-select first model
  const models = CAR_DATA.find(b => b.brand === brand)?.models
  if (models && models.length > 0) {
    selectedModel.value = models[0].name
    litres.value = Math.round(models[0].tank * fillFactor.value)
  }
}

function onModelChange(name: string) {
  selectedModel.value = name
  const model = availableModels.value.find(m => m.name === name)
  if (model) litres.value = Math.round(model.tank * fillFactor.value)
}

function onFillChange(factor: number) {
  fillFactor.value = factor
  const model = availableModels.value.find(m => m.name === selectedModel.value)
  if (model) litres.value = Math.round(model.tank * factor)
}

const RANGES: { days?: number; labelKey?: string; label?: string; dateA?: string }[] = [
  { labelKey: 'preWar', dateA: '2026-02-28' },
  { label: '7D', days: 7 },
  { label: '14D', days: 14 },
  { label: '30D', days: 30 },
]

function findPrice(targetDate: string, fuel: string): { date: string; price: number } | null {
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].date <= targetDate && data[i].prices[fuel] != null) {
      return { date: data[i].date, price: data[i].prices[fuel] }
    }
  }
  return null
}

function getDateNDaysAgo(from: string, n: number): string {
  const d = new Date(from)
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function shortDate(d: string): string {
  const loc = locale.value === 'th' ? 'th-TH' : 'en-US'
  return new Date(d).toLocaleDateString(loc, { month: 'short', day: 'numeric' })
}

const latestDate = data[data.length - 1].date

// Selected dates for comparison — default: pre US-Iran war (Mar 1) vs today
const selectedDateA = signal('2026-02-28')
const selectedDateB = signal(latestDate)

const priceA = computed(() => findPrice(selectedDateA.value, fuelType.value))
const priceB = computed(() => findPrice(selectedDateB.value, fuelType.value))
const diff = computed(() =>
  priceA.value && priceB.value ? (priceB.value.price - priceA.value.price) * litres.value : 0
)

// Chart always shows last 90 days
const threeMonthsAgo = getDateNDaysAgo(latestDate, 90)
const chartPoints = computed(() =>
  data
    .filter(e => e.date >= threeMonthsAgo && e.prices[fuelType.value] != null)
    .map(e => ({ date: e.date, price: e.prices[fuelType.value] }))
)

function setRange(r: typeof RANGES[number]) {
  selectedDateA.value = r.dateA ?? getDateNDaysAgo(latestDate, r.days!)
  selectedDateB.value = latestDate
}

// SVG icons
const ArrowDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
)
const ArrowUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
)
const EqualIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 9h14M5 15h14"/></svg>
)

export function App() {
  const a = priceA.value
  const b = priceB.value
  const d = diff.value
  const hasBoth = a && b && selectedDateB.value !== ''
  const waitingForB = selectedDateA.value && !selectedDateB.value

  // Which range pill matches the current A→B selection?
  const activeRange = hasBoth
    ? RANGES.findIndex(r => {
        const expectedA = r.dateA ?? getDateNDaysAgo(latestDate, r.days!)
        return selectedDateA.value === expectedA && selectedDateB.value === latestDate
      })
    : -1

  return (
    <div class="shell">
      {/* Header — full width */}
      <div class="clay-card header-card">
        <button class="lang-toggle" onClick={toggleLocale} aria-label="Switch language">
          {locale.value === 'en' ? 'TH' : 'EN'}
        </button>
        <h1>{t.value.title}</h1>
        <p class="subtitle">{t.value.subtitle}</p>
      </div>

      <div class="columns">
        {/* ── Left column: Chart + controls ── */}
        <div class="col-chart">
          {/* Fuel type card */}
          <div class="clay-card range-card">
            <span class="field-label" style="margin-bottom:0">{t.value.fuelType}</span>
            <div class="fuel-pills" style="margin-bottom:0" role="group" aria-label={t.value.fuelType}>
              {FUEL_KEYS.map(key => (
                <button
                  key={key}
                  class={`fuel-pill${fuelType.value === key ? ' fuel-pill--active' : ''}`}
                  onClick={() => { fuelType.value = key }}
                  aria-pressed={fuelType.value === key}
                >{t.value[FUEL_I18N[key]]}</button>
              ))}
            </div>
          </div>

          {chartPoints.value.length > 1 && (
            <div class="clay-card chart-card">
              <div class="chart-header">
                <span class="field-label" style="margin-bottom:0">{t.value.priceTrend}</span>
                <span class="chart-range">{chartPoints.value[0].date} → {latestDate}</span>
              </div>
              <PriceChart points={chartPoints.value} dateA={selectedDateA} dateB={selectedDateB} />
              <div class="chart-footer">
                {waitingForB ? (
                  <span class="chart-hint chart-hint--picking">
                    <span class="chart-hint-dot" style="background:#F97316" />
                    A = {shortDate(selectedDateA.value)} — {t.value.nowClickB}
                  </span>
                ) : hasBoth ? (
                  <span class="chart-hint">
                    <span class="chart-hint-dot" style="background:#F97316" />
                    {shortDate(a!.date)}
                    <span style="margin:0 0.3rem;color:#818CF8">→</span>
                    <span class="chart-hint-dot" style="background:#10b981" />
                    {shortDate(b!.date)}
                  </span>
                ) : (
                  <span class="chart-hint">{t.value.clickDateA}</span>
                )}
              </div>
            </div>
          )}

          {/* Compare range card */}
          <div class="clay-card range-card">
            <span class="field-label" style="margin-bottom:0">{t.value.compareRange}</span>
            <div class="range-pills" role="group" aria-label={t.value.compareRange}>
              {RANGES.map((r, i) => (
                <button
                  key={r.labelKey ?? r.label}
                  class={`range-pill${activeRange === i ? ' range-pill--active' : ''}`}
                  onClick={() => setRange(r)}
                  aria-pressed={activeRange === i}
                >{r.labelKey ? t.value[r.labelKey as keyof typeof t.value] : r.label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right column: Litres + Comparison + Result ── */}
        <div class="col-details">
          {/* Litres card */}
          <div class="clay-card car-card">
            <div class="mode-toggle" role="group" aria-label="Choose litres input mode">
              <button
                class={`mode-btn${litreMode.value === 'car' ? ' mode-btn--active' : ''}`}
                onClick={() => { litreMode.value = 'car' }}
                aria-pressed={litreMode.value === 'car'}
              >{t.value.byCarModel}</button>
              <button
                class={`mode-btn${litreMode.value === 'custom' ? ' mode-btn--active' : ''}`}
                onClick={() => { litreMode.value = 'custom' }}
                aria-pressed={litreMode.value === 'custom'}
              >{t.value.custom}</button>
            </div>

            {litreMode.value === 'car' ? (
              <>
                <div class="fuel-pills" role="group" aria-label="Select car brand">
                  {CAR_DATA.map(b => (
                    <button
                      key={b.brand}
                      class={`fuel-pill${selectedBrand.value === b.brand ? ' fuel-pill--active' : ''}`}
                      onClick={() => onBrandChange(b.brand)}
                      aria-pressed={selectedBrand.value === b.brand}
                    >{b.brand}</button>
                  ))}
                </div>
                {availableModels.value.length > 0 && (
                  <div class="fuel-pills" role="group" aria-label="Select car model">
                    {availableModels.value.map(m => (
                      <button
                        key={m.name}
                        class={`fuel-pill fuel-pill--outline${selectedModel.value === m.name ? ' fuel-pill--active' : ''}`}
                        onClick={() => onModelChange(m.name)}
                        aria-pressed={selectedModel.value === m.name}
                      >{m.name} ({m.tank}L)</button>
                    ))}
                  </div>
                )}
                {selectedModel.value && (
                  <div class="fill-row">
                    <span class="fill-label">{t.value.fillLevel}</span>
                    <div class="range-pills" role="group" aria-label={t.value.fillLevel}>
                      {FILL_OPTIONS.map(f => (
                        <button
                          key={f.labelKey ?? f.label}
                          class={`range-pill${fillFactor.value === f.factor ? ' range-pill--active' : ''}`}
                          onClick={() => onFillChange(f.factor)}
                          aria-pressed={fillFactor.value === f.factor}
                        >{f.labelKey ? t.value[f.labelKey] : f.label}</button>
                      ))}
                    </div>
                  </div>
                )}
                {selectedModel.value && (
                  <div class="litres-display">
                    <span class="litres-value">{litres.value}L</span>
                  </div>
                )}
              </>
            ) : (
              <div class="field" style="margin-top:0.25rem">
                <label class="field-label" for="litres-input">{t.value.litresToFill}</label>
                <input
                  id="litres-input"
                  class="clay-input"
                  type="number"
                  min="1"
                  value={litres.value}
                  onInput={(e) => {
                    const v = parseFloat((e.target as HTMLInputElement).value)
                    if (v > 0) litres.value = v
                  }}
                />
              </div>
            )}
          </div>

          {hasBoth ? (
            <>
              <div class="comparison">
                <div class="clay-card price-card price-card--a">
                  <div class="price-card-label">
                    <span class="pin-dot" style="background:#F97316" /> {t.value.dateA}
                  </div>
                  <div class="price-card-date">{shortDate(a!.date)}</div>
                  <div class="price-big">{a!.price.toFixed(2)}</div>
                  <div class="price-unit">{t.value.perLitre}</div>
                  <div class="price-divider" />
                  <div class="price-total">{(litres.value * a!.price).toFixed(2)} THB</div>
                  <div class="price-calc">{litres.value}L × {a!.price.toFixed(2)}</div>
                </div>
                <div class="clay-card price-card price-card--b">
                  <div class="price-card-label">
                    <span class="pin-dot" style="background:#10b981" /> {t.value.dateB}
                  </div>
                  <div class="price-card-date">{shortDate(b!.date)}</div>
                  <div class="price-big">{b!.price.toFixed(2)}</div>
                  <div class="price-unit">{t.value.perLitre}</div>
                  <div class="price-divider" />
                  <div class="price-total">{(litres.value * b!.price).toFixed(2)} THB</div>
                  <div class="price-calc">{litres.value}L × {b!.price.toFixed(2)}</div>
                </div>
              </div>

              <div class={`clay-card result-card ${d < 0 ? 'save' : d > 0 ? 'extra' : 'same'}`}>
                <div class="result-badge" aria-hidden="true">
                  {d < 0 ? <ArrowDownIcon /> : d > 0 ? <ArrowUpIcon /> : <EqualIcon />}
                </div>
                <div class="result-content">
                  <div class="result-label">
                    {d < 0 ? t.value.cheaperAtB : d > 0 ? t.value.moreExpensiveAtB : t.value.noChange}
                  </div>
                  <div class="result-amount">
                    {d === 0 ? t.value.samePrice : `${Math.abs(d).toFixed(2)} THB`}
                  </div>
                </div>
              </div>
            </>
          ) : !waitingForB ? (
            <div class="clay-card">
              <p class="no-data">{t.value.selectTwoDates}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
