import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'campaign-copy-manager-campaigns'

const initialForm = {
  id: null,
  name: '',
  brand: '',
  type: 'Delivery',
  startDate: '',
  endDate: '',
  dateNotes: '',
  time: '',
  timeFrom: '',
  timeTo: '',
  location: '',
  channel: 'Bloom App',
  bookingLink: '',
  whatsappContact: '',
  offer: '',
  dialect: 'Kuwaiti',
  tone: 'Friendly',
  content: {},
  updatedAt: '',
}

const locationTypes = ['Visit', 'Event', 'Store Visit']
const copyTypes = [
  ['invitation', 'Invitation'],
  ['brief', 'Influencer Brief'],
  ['reminder', 'Reminder'],
  ['notification', 'App Notification'],
]

function hasMultipleBranches(location = '') {
  return location.includes('\n') || location.includes(',') || location.includes('/') || location.includes(' / ')
}

function hasMultipleDates(form) {
  return Boolean(form.endDate || form.dateNotes.trim())
}

function formatDates(form) {
  if (form.dateNotes.trim()) return form.dateNotes.trim()
  if (!form.startDate) return ''
  return form.endDate ? `${form.startDate} إلى ${form.endDate}` : form.startDate
}

function formatTime(form) {
  if (locationTypes.includes(form.type)) {
    if (form.timeFrom && form.timeTo) return `من ${form.timeFrom} إلى ${form.timeTo}`
    if (form.timeFrom) return `من ${form.timeFrom}`
    return ''
  }
  return form.time || ''
}

function buildCta(form) {
  if (form.channel === 'Bloom App') {
    return 'للتسجيل، سجلي عن طريق تطبيق Bloom.'
  }

  if (form.channel === 'Booking Link') {
    return form.bookingLink
      ? `للتسجيل، احجزي من خلال الرابط:\n${form.bookingLink}`
      : 'للتسجيل، احجزي من خلال رابط الحجز.'
  }

  const details = ['الوقت']
  if (hasMultipleDates(form)) details.unshift('التاريخ')
  if (hasMultipleBranches(form.location)) details.push('الفرع')
  const contact = form.whatsappContact ? `\nواتساب: ${form.whatsappContact}` : ''
  return `للتأكيد، بلغينا بـ${details.join(' و')}.${contact}`
}

function generateCopy(form, kind) {
  const campaign = form.name || 'هذه الحملة'
  const brand = form.brand || 'علامتنا'
  const dates = formatDates(form)
  const time = formatTime(form)
  const details = form.offer ? `\n\nالعرض: ${form.offer}` : ''
  const place = form.location ? `\nالموقع / الفروع: ${form.location}` : ''
  const schedule = dates
    ? `\nالتاريخ: ${dates}${time ? `\nالوقت: ${time}` : ''}`
    : time
      ? `\nالوقت: ${time}`
      : ''
  const cta = buildCta(form)

  const variants = {
    invitation: `هلا! يسعدنا دعوتج للمشاركة في حملة «${campaign}» مع ${brand}.\n\nنحب نشوف تغطيتج بأسلوبج الطبيعي والعفوي، وتعكس تجربتج بكل حلاوة.${schedule}${place}${details}\n\n${cta}`,
    brief: `بريف حملة «${campaign}» — ${brand}\n\nالمطلوب: مشاركة التجربة بأسلوب ${form.tone.toLowerCase()} وطبيعي، مع إبراز أهم تفاصيل التجربة بشكل واضح.${schedule}${place}${details}\n\nطريقة التسجيل: ${form.channel}\n${cta}`,
    reminder: `هلا! تذكير لطيف بخصوص حملة «${campaign}» مع ${brand}.${schedule}${place}\n\nنتحمس نشوف محتواج الجميل!\n\n${cta}`,
    notification: `فرصة جديدة مع ${brand}! ✨\nانضمي إلى حملة «${campaign}» واستمتعي بالتجربة.${schedule}${details}\n\n${cta}`,
  }

  return variants[kind]
}

function App() {
  const [view, setView] = useState('new')
  const [form, setForm] = useState(initialForm)
  const [campaigns, setCampaigns] = useState([])
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    try {
      setCampaigns(JSON.parse(localStorage.getItem(STORAGE_KEY)) || [])
    } catch {
      setCampaigns([])
    }
  }, [])

  const setField = (key, value) => setForm(current => ({ ...current, [key]: value }))
  const setContent = (kind, value) => setForm(current => ({ ...current, content: { ...current.content, [kind]: value } }))
  const generate = kind => setContent(kind, generateCopy(form, kind))
  const generateAll = () => copyTypes.forEach(([key]) => setContent(key, generateCopy(form, key)))

  const save = () => {
    if (!form.name.trim() || !form.brand.trim()) {
      window.alert('Please add a campaign name and brand name.')
      return
    }

    const saved = { ...form, id: form.id || crypto.randomUUID(), updatedAt: new Date().toISOString() }
    const next = form.id ? campaigns.map(c => c.id === form.id ? saved : c) : [saved, ...campaigns]
    setCampaigns(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setForm(saved)
    window.alert('Campaign saved successfully.')
  }

  const newCampaign = () => {
    setForm(initialForm)
    setView('new')
    setEditing(null)
  }

  const openCampaign = campaign => {
    setForm({ ...initialForm, ...campaign, content: campaign.content || {} })
    setView('new')
    setEditing(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteCampaign = id => {
    if (!window.confirm('Delete this campaign?')) return
    const next = campaigns.filter(c => c.id !== id)
    setCampaigns(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    if (form.id === id) newCampaign()
  }

  const filtered = useMemo(
    () => campaigns.filter(c => [c.name, c.brand, c.dialect, c.tone].join(' ').toLowerCase().includes(search.toLowerCase())),
    [campaigns, search]
  )

  const needsLocation = locationTypes.includes(form.type)
  const usesTimeRange = locationTypes.includes(form.type)

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="echo-logo"><span>echo</span><b>OOO</b></div>
        <div className="product-name"><span>Copy Writer</span><small>by Echo</small></div>
        <nav>
          <button className={view === 'new' ? 'active' : ''} onClick={newCampaign}><span>＋</span> New Campaign</button>
          <button className={view === 'history' ? 'active' : ''} onClick={() => setView('history')}><span>▣</span> Campaign History</button>
        </nav>
        <div className="sidebar-footer"><span>CREATIVE WORKSPACE</span><p>Built for Echo campaign teams.</p></div>
      </aside>

      <main>
        {view === 'new' ? (
          <>
            <header>
              <div><p className="eyebrow">COPY WRITER BY ECHO</p><h1>{form.id ? 'Edit Campaign' : 'New Campaign'}</h1><p className="subtle">Build campaign details and generate ready-to-use influencer copy.</p></div>
              <button className="primary" onClick={save}>Save Campaign</button>
            </header>

            <section className="panel">
              <div className="section-title"><div><span className="section-number">01</span><div><h2>Campaign details</h2><p>Tell us what the campaign is about.</p></div></div></div>
              <div className="form-grid">
                <Field label="Campaign Name" required value={form.name} onChange={v => setField('name', v)} placeholder="e.g. Summer Launch" />
                <Field label="Brand Name" required value={form.brand} onChange={v => setField('brand', v)} placeholder="Brand name" />
                <Select label="Campaign Type" value={form.type} onChange={v => setField('type', v)} options={['Delivery', 'Visit', 'Event', 'Store Visit', 'Other']} />
                <Field label="Start Date" type="date" value={form.startDate} onChange={v => setField('startDate', v)} />
                <Field label="End Date" type="date" value={form.endDate} onChange={v => setField('endDate', v)} />
                <Field label="Additional / Multiple Dates" value={form.dateNotes} onChange={v => setField('dateNotes', v)} placeholder="e.g. Aug 20, 22 & 24" />

                {needsLocation && <Field label="Location / Branches" required value={form.location} onChange={v => setField('location', v)} placeholder="e.g. The Avenues / 360 Mall" hint="Use /, commas, or new lines for multiple branches." className="full" />}

                {usesTimeRange ? (
                  <>
                    <Field label="Available From" type="time" value={form.timeFrom} onChange={v => setField('timeFrom', v)} />
                    <Field label="Available To" type="time" value={form.timeTo} onChange={v => setField('timeTo', v)} />
                  </>
                ) : (
                  <Field label="Time" type="time" value={form.time} onChange={v => setField('time', v)} />
                )}
              </div>
            </section>

            <section className="panel">
              <div className="section-title"><div><span className="section-number">02</span><div><h2>Registration & offer</h2><p>The closing line automatically matches the selected method.</p></div></div></div>
              <div className="form-grid">
                <Select label="Registration Method" value={form.channel} onChange={v => setField('channel', v)} options={['Bloom App', 'Booking Link', 'WhatsApp']} />
                {form.channel === 'Booking Link' && <Field label="Booking Link" type="url" value={form.bookingLink} onChange={v => setField('bookingLink', v)} placeholder="https://..." />}
                {form.channel === 'WhatsApp' && <Field label="WhatsApp Contact" value={form.whatsappContact} onChange={v => setField('whatsappContact', v)} placeholder="+965 ..." />}
                <label className="field full"><span>Gift / Offer</span><textarea value={form.offer} onChange={e => setField('offer', e.target.value)} placeholder="Enter the full gift or offer details..." rows="4" /></label>
              </div>
            </section>

            <section className="panel">
              <div className="section-title"><div><span className="section-number">03</span><div><h2>Copy direction</h2><p>Choose the language style and personality.</p></div></div></div>
              <div className="form-grid"><Select label="Dialect" value={form.dialect} onChange={v => setField('dialect', v)} options={['Kuwaiti', 'Saudi', 'Emirati', 'Qatari', 'Omani', 'Bahraini']} /><Select label="Tone" value={form.tone} onChange={v => setField('tone', v)} options={['Casual', 'Friendly', 'Classy', 'Premium', 'Exciting', 'Professional']} /></div>
            </section>

            <section className="content-head">
              <div><p className="eyebrow">CONTENT GENERATION</p><h2>Campaign copy</h2><p className="subtle">Four formats, one consistent campaign message.</p></div>
              <div className="generator-actions">{copyTypes.map(([key, label]) => <button key={key} onClick={() => generate(key)}>{label}</button>)}<button className="primary" onClick={generateAll}>Generate All</button></div>
            </section>

            <section className="content-grid">{copyTypes.map(([key, label]) => <ContentCard key={key} title={label} text={form.content[key] || ''} editing={editing === key} onEdit={() => setEditing(editing === key ? null : key)} onChange={v => setContent(key, v)} onCopy={() => navigator.clipboard.writeText(form.content[key] || '')} onRegenerate={() => generate(key)} />)}</section>
          </>
        ) : (
          <>
            <header><div><p className="eyebrow">COPY WRITER BY ECHO</p><h1>Campaign History</h1><p className="subtle">Find, reopen, or remove saved campaigns.</p></div><button className="primary" onClick={newCampaign}>New Campaign</button></header>
            <section className="panel">
              <div className="history-tools"><input aria-label="Search campaigns" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search campaigns, brands, dialects..." /><span>{filtered.length} saved</span></div>
              {filtered.length ? <div className="campaign-list">{filtered.map(c => <article className="campaign-row" key={c.id}><div><h3>{c.name}</h3><p>{c.brand}</p></div><div><small>DATES</small><p>{formatDates(c) || '—'}</p></div><div><small>STYLE</small><p>{c.dialect} · {c.tone}</p></div><div className="row-actions"><button onClick={() => openCampaign(c)}>Open Campaign</button><button className="danger" onClick={() => deleteCampaign(c.id)}>Delete</button></div></article>)}</div> : <div className="empty"><div>◇</div><h3>No campaigns found</h3><p>Create your first campaign to save it here.</p></div>}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

function Field({ label, required, type = 'text', value, onChange, placeholder, hint, className = '' }) {
  return <label className={`field ${className}`}><span>{label}{required && <b> *</b>}</span><input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} />{hint && <small className="field-hint">{hint}</small>}</label>
}

function Select({ label, value, onChange, options }) {
  return <label className="field"><span>{label}</span><select value={value} onChange={e => onChange(e.target.value)}>{options.map(item => <option key={item}>{item}</option>)}</select></label>
}

function ContentCard({ title, text, editing, onEdit, onChange, onCopy, onRegenerate }) {
  return <article className="copy-card"><div className="card-head"><h3>{title}</h3><span className={text ? 'ready' : 'draft'}>{text ? 'Ready' : 'Draft'}</span></div>{editing ? <textarea className="copy-editor" dir="rtl" value={text} onChange={e => onChange(e.target.value)} rows="9" /> : <p className={text ? 'arabic-copy' : 'placeholder'} dir={text ? 'rtl' : 'ltr'}>{text || 'Generate copy to preview it here.'}</p>}<div className="card-actions"><button onClick={onEdit}>{editing ? 'Done' : 'Edit'}</button><button onClick={onCopy} disabled={!text}>Copy</button><button onClick={onRegenerate}>Regenerate</button></div></article>
}

export default App
