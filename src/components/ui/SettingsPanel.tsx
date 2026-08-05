import { Volume2, Music, Sun, Mountain, FlaskConical, Keyboard, Info, MoveRight } from 'lucide-react'
import Panel from './Panel'
import { useApp, type TimeOfDay } from '../../lib/state/app'
import { engine } from '../../lib/audio/engine'
import { mode } from '../../lib/ai/engine'
import { getProvider } from '../../lib/ai/providers'
import { useLocalStorage } from '../../lib/hooks/core'
import { SHORTCUTS, APP } from '../../lib/constants'

const TODS: { id: TimeOfDay; label: string; icon: string }[] = [
  { id: 'night', label: 'Night', icon: '🌙' },
  { id: 'dawn', label: 'Dawn', icon: '🌅' },
  { id: 'day', label: 'Day', icon: '☀️' },
  { id: 'dusk', label: 'Dusk', icon: '🌇' },
]

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3.5">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/[0.05] text-white/70">{icon}</span>
        <span className="text-sm font-medium text-white/85">{label}</span>
      </div>
      {children}
    </div>
  )
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-crimson' : 'bg-white/15'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  )
}

/** Settings — audio, world clock, quality, AI mode, shortcuts. */
export default function SettingsPanel() {
  const open = useApp((s) => s.settingsOpen)
  const setOpen = useApp((s) => s.setSettingsOpen)
  const { soundOn, setSound, tod, todAuto, setTod, quality, setQuality, retro, toggleRetro } = useApp()
  const [musicOn, setMusic] = useLocalStorage('arachnid-music-v1', true)
  const isAi = mode() === 'ai'
  const provider = getProvider()

  const setMusicOn = (v: boolean) => {
    setMusic(v)
    engine.setMusic(v)
  }

  return (
    <Panel open={open} onClose={() => setOpen(false)} title="Settings" subtitle="Tune the experience">
      <div className="space-y-3">
        <Row icon={<Volume2 size={16} />} label="Ambient audio">
          <Toggle label="Ambient audio" on={soundOn} onChange={(v) => { setSound(v); engine.setEnabled(v) }} />
        </Row>
        <Row icon={<Music size={16} />} label="Cinematic soundtrack">
          <Toggle label="Soundtrack" on={musicOn} onChange={setMusicOn} />
        </Row>
        <Row icon={<Sun size={16} />} label="Time of day — auto (follows your clock)">
          <Toggle label="Auto time of day" on={todAuto} onChange={(v) => useApp.getState().setTodAuto(v)} />
        </Row>
        <div className="grid grid-cols-4 gap-2">
          {TODS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTod(t.id)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 text-xs transition ${
                !todAuto && tod === t.id ? 'border-ember/60 bg-ember/10 text-ember' : 'border-white/10 text-white/55 hover:border-white/30'
              }`}
            >
              <span className="text-lg" aria-hidden>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
        <Row icon={<Mountain size={16} />} label="3D quality">
          <div className="flex overflow-hidden rounded-lg border border-white/10">
            {(['high', 'low'] as const).map((q) => (
              <button key={q} onClick={() => setQuality(q)} className={`px-3 py-1.5 text-xs uppercase tracking-wider transition ${quality === q ? 'bg-electric/25 text-blue-200' : 'text-white/50 hover:text-white'}`}>
                {q}
              </button>
            ))}
          </div>
        </Row>
        <Row icon={<FlaskConical size={16} />} label="Retro 8-bit mode (Konami)">
          <Toggle label="Retro mode" on={retro} onChange={() => toggleRetro()} />
        </Row>
        <Row icon={<Info size={16} />} label="Intelligence engine">
          <span className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-widest ${isAi ? 'bg-emerald-400/15 text-emerald-300' : 'bg-ember/15 text-ember'}`}>
            {isAi ? `● ${provider?.name ?? 'LLM'} mode` : '● Demo mode'}
          </span>
        </Row>

        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/45">
            <Keyboard size={13} /> Keyboard shortcuts
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {SHORTCUTS.map((s) => (
              <div key={s.keys} className="flex items-center justify-between gap-3 text-xs">
                <span className="text-white/60">{s.action}</span>
                <span className="rounded border border-white/15 bg-black/30 px-1.5 py-0.5 font-mono text-[10px] text-ember">{s.keys}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="px-2 pt-1 text-center font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">
          {APP.full} · v{APP.version} · original IP, spider-inspired <MoveRight size={10} className="inline" />
        </p>
      </div>
    </Panel>
  )
}
