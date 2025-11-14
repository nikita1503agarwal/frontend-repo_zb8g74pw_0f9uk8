import { useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}

function App() {
  const [prompt, setPrompt] = useState('Ultra-realistic portrait photo of a person')
  const [age, setAge] = useState('25')
  const [skin, setSkin] = useState('medium')
  const [eyes, setEyes] = useState('brown')
  const [nationality, setNationality] = useState('Korean')

  const [enhanced, setEnhanced] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loadingEnhance, setLoadingEnhance] = useState(false)
  const [loadingGenerate, setLoadingGenerate] = useState(false)
  const [history, setHistory] = useState([])
  const [error, setError] = useState('')

  const enhancePrompt = async () => {
    setError('')
    setLoadingEnhance(true)
    try {
      const res = await fetch(`${API_BASE}/api/enhance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, age, skin_tone: skin, eye_color: eyes, nationality })
      })
      if (!res.ok) throw new Error('Failed to enhance')
      const data = await res.json()
      setEnhanced(data.enhanced_prompt)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoadingEnhance(false)
    }
  }

  const generateImage = async () => {
    setError('')
    setLoadingGenerate(true)
    try {
      const payload = { prompt, age, skin_tone: skin, eye_color: eyes, nationality, enhanced_prompt: enhanced || undefined }
      const res = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to generate')
      const data = await res.json()
      setEnhanced(data.enhanced_prompt)
      setImageUrl(data.image_url)
      setHistory((h) => [{ image_url: data.image_url, enhanced_prompt: data.enhanced_prompt, id: data.id }, ...h].slice(0, 6))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoadingGenerate(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="text-2xl font-extrabold tracking-tight">
          YOURSELF
        </div>
        <a href="/test" className="text-sm text-white/70 hover:text-white">System Check</a>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-4">
          <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
            <h2 className="text-lg font-semibold mb-3">Describe your model</h2>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-white/50"
              placeholder="Type your idea..."
            />
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              <Field label="Age" value={age} onChange={setAge} placeholder="e.g., 25 or early 30s" />
              <Field label="Skin tone" value={skin} onChange={setSkin} placeholder="e.g., fair / medium / deep" />
              <Field label="Eye color" value={eyes} onChange={setEyes} placeholder="e.g., brown / blue / green" />
              <Field label="Nationality" value={nationality} onChange={setNationality} placeholder="e.g., Australian / Korean / Arab" />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={enhancePrompt} disabled={loadingEnhance} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50">
                {loadingEnhance ? 'Enhancing...' : 'Enhance Prompt'}
              </button>
              <button onClick={generateImage} disabled={loadingGenerate} className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50">
                {loadingGenerate ? 'Generating...' : 'Generate Image'}
              </button>
            </div>
            {enhanced && (
              <div className="mt-4 text-sm text-white/80">
                <div className="font-semibold mb-1">Enhanced Prompt</div>
                <div className="bg-black/30 p-3 rounded-md border border-white/10">{enhanced}</div>
              </div>
            )}
            {error && (
              <div className="mt-3 text-red-300 text-sm">{error}</div>
            )}
          </div>

          <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10 min-h-[420px] flex items-center justify-center">
            {imageUrl ? (
              <img src={imageUrl} alt="Generated" className="max-h-[420px] rounded-lg shadow-lg" />)
              : (
              <div className="text-white/50 text-center">
                Your generated image will appear here.
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
            <h3 className="font-semibold mb-3">Recent</h3>
            <div className="grid gap-3">
              {history.length === 0 && (
                <div className="text-sm text-white/60">No generations yet.</div>
              )}
              {history.map((h) => (
                <div key={h.image_url} className="flex gap-3 items-center">
                  <img src={h.image_url} alt="thumb" className="w-16 h-16 object-cover rounded" />
                  <div className="text-xs text-white/80 line-clamp-3">{h.enhanced_prompt}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      <footer className="px-6 py-6 text-center text-white/50 text-sm">
        Built with love. Prompt better. Generate smarter.
      </footer>
    </div>
  )
}

export default App
