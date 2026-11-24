import { useEffect, useRef, useState } from 'react'

const API = import.meta.env.VITE_API_URL

const AREAS = [
  'Vereeniging', 'Vanderbijlpark', 'Meyerton', 'Sasolburg', 'Henley on Klip',
  'Walkerville', 'Midvaal', 'Three Rivers', 'Roshnee', 'Ennerdale',
  'Sebokeng', 'Evaton', 'Sharpeville', 'Boipatong', 'Bophelong',
  'Zamdela', 'Refengkgotso', 'Orange Farm', 'Other',
]

const FIELDS = [
  { name: 'title', label: 'What needs doing?', ph: 'e.g. Paint two bedrooms', max: 60 },
  { name: 'description', label: 'Details', ph: 'What, how big, what to bring', max: 300, area: true },
  { name: 'area', label: 'Area', options: AREAS },
  { name: 'pay', label: 'Pay', ph: 'e.g. R600 / day', max: 20 },
  { name: 'when_text', label: 'When', ph: 'e.g. Saturday morning', max: 30 },
  { name: 'poster_name', label: 'Your name', ph: '', max: 30 },
  { name: 'phone', label: 'Your WhatsApp number', ph: '082 123 4567', max: 20 },
]
const EMPTY = Object.fromEntries(FIELDS.map((f) => [f.name, '']))

function ago(iso) {
  const m = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (m < 60) return `${Math.max(m, 1)} min ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} h ago`
  const d = Math.floor(h / 24)
  return `${d} ${d === 1 ? 'day' : 'days'} ago`
}

function waLink(j) {
  const msg = `Hi ${j.poster_name}, I saw your piece job “${j.title}” in ${j.area} and I’m interested.`
  return `https://wa.me/${j.phone}?text=${encodeURIComponent(msg)}`
}

export default function App() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [q, setQ] = useState('')
  const [area, setArea] = useState('')
  const [form, setForm] = useState(EMPTY)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const dlg = useRef(null)

  async function load() {
    try {
      const r = await fetch(`${API}/jobs`)
      if (!r.ok) throw new Error()
      setJobs(await r.json())
      setLoadError('')
    } catch {
      setLoadError('Could not load jobs. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [])

  const shown = jobs.filter(
    (j) =>
      (!area || j.area === area) &&
      (!q || `${j.title} ${j.description} ${j.area}`.toLowerCase().includes(q.toLowerCase()))
  )

  async function submit(e) {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      const r = await fetch(`${API}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!r.ok) {
        const { detail } = await r.json().catch(() => ({}))
        setFormError(typeof detail === 'string' ? detail : 'Please check every field.')
        return
      }
      setForm(EMPTY)
      dlg.current.close()
      load()
    } catch {
      setFormError('Could not reach the server. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const input = 'w-full min-h-11 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-base'

  return (
    <div className="min-h-screen bg-slate-200 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 pb-20 pt-6">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Piece Jobs</h1>
            <p className="mt-1 max-w-md text-slate-600">
              Quick work from people near you. Tap “I’m interested” and chat on WhatsApp.
            </p>
          </div>
          <button
            onClick={() => dlg.current.showModal()}
            className="rounded-lg bg-slate-900 px-4 py-3 font-bold text-white"
          >
            Post a piece job
          </button>
        </header>

        <div className="mb-5 flex flex-wrap gap-3">
          <input
            className={`${input} flex-1 basis-44 bg-white`}
            type="search"
            placeholder="Search: painting, garden, moving…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className={`${input} flex-1 basis-44 bg-white`}
            value={area}
            onChange={(e) => setArea(e.target.value)}
          >
            <option value="">All areas</option>
            {AREAS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </div>

        {loading && <p className="text-center text-slate-600">Loading jobs…</p>}
        {loadError && (
          <p className="rounded-lg bg-white p-6 text-center">
            {loadError}{' '}
            <button className="font-bold underline" onClick={load}>
              Retry
            </button>
          </p>
        )}
        {!loading && !loadError && shown.length === 0 && (
          <p className="rounded-lg bg-white p-6 text-center">
            No jobs yet. Post one and workers will see it here.
          </p>
        )}

        <main className="grid gap-5 sm:grid-cols-2">
          {shown.map((j) => (
            <article key={j.id} className="flex flex-col rounded-md bg-white shadow-md">
              <div className="flex-1 p-5 pb-3">
                <h2 className="mb-2 text-xl font-extrabold leading-tight">{j.title}</h2>
                <ul className="mb-3 flex flex-wrap gap-2 text-sm">
                  <li className="rounded-full bg-yellow-400 px-3 py-0.5 font-bold">{j.pay}</li>
                  <li className="rounded-full border border-slate-300 bg-slate-50 px-3 py-0.5">{j.area}</li>
                  <li className="rounded-full border border-slate-300 bg-slate-50 px-3 py-0.5">{j.when_text}</li>
                </ul>
                <p className="mb-2 text-slate-600">{j.description}</p>
                <p className="text-sm text-slate-500">
                  Posted by {j.poster_name} · {ago(j.created_at)}
                </p>
              </div>
              <div className="relative mx-3 border-t-2 border-dashed border-slate-300">
                <span className="absolute -top-3 left-0 bg-white px-0.5 text-sm text-slate-500">✂</span>
              </div>
              <div className="p-4">
                <a
                  href={waLink(j)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg bg-green-700 p-3 text-center font-bold text-white"
                >
                  I’m interested
                </a>
              </div>
            </article>
          ))}
        </main>
      </div>

      <dialog ref={dlg} className="m-auto w-[min(520px,calc(100%-24px))] rounded-2xl p-0 backdrop:bg-black/60">
        <form onSubmit={submit} className="grid gap-3 p-5">
          <h2 className="text-2xl font-extrabold">Post a piece job</h2>
          {FIELDS.map((f) => (
            <label key={f.name} className="grid gap-1 text-sm font-medium">
              {f.label}
              {f.area ? (
                <textarea
                  className={`${input} min-h-24`}
                  required
                  maxLength={f.max}
                  placeholder={f.ph}
                  value={form[f.name]}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                />
              ) : f.options ? (
                <select
                  className={input}
                  required
                  value={form[f.name]}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                >
                  <option value="">Choose area</option>
                  {f.options.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              ) : (
                <input
                  className={input}
                  required
                  maxLength={f.max}
                  placeholder={f.ph}
                  inputMode={f.name === 'phone' ? 'tel' : undefined}
                  value={form[f.name]}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                />
              )}
            </label>
          ))}
          <p className="min-h-5 text-sm text-red-700" role="alert">
            {formError}
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => dlg.current.close()}
              className="rounded-lg border border-slate-300 px-4 py-3 font-bold"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              className="rounded-lg bg-slate-900 px-4 py-3 font-bold text-white disabled:opacity-60"
            >
              {saving ? 'Publishing…' : 'Publish job'}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  )
}