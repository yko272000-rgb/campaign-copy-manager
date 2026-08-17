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
  tone: 'Friendly & Casual',
  coveragePoints: '',
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

const dialects = ['Kuwaiti', 'Saudi', 'Emirati', 'Qatari', 'Omani', 'Bahraini']
const tones = ['Friendly & Casual', 'Classy & Premium', 'Fun & Energetic', 'Warm & Personal', 'Professional & Polished']

const dialectCopy = {
  Kuwaiti: {
    inviteOpen: 'هلا والله! حابين نعزمج',
    inviteBody: 'على تجربة',
    inviteClose: 'ونحب نشوف تغطيتج بأسلوبج الطبيعي والعفوي ✨',
    reminderOpen: 'هلا! حبيت أذكّرج',
    reminderClose: 'وناطرين تغطيتج الحلوة ✨',
    bloom: 'للتسجيل، سجلي عن طريق تطبيق Bloom.',
    link: 'للتسجيل، احجزي من خلال الرابط:',
    whatsapp: 'للتأكيد، بلغينا بـ',
    briefIntro: 'نقاط التركيز بالتغطية:',
    notificationTitle: 'فرصتج مع',
    notificationLead: 'تجربة حلوة ناطرتج ✨',
  },
  Saudi: {
    inviteOpen: 'هلا! يسعدنا ندعوك',
    inviteBody: 'لتجربة',
    inviteClose: 'ونحب تكون تغطيتك عفوية وبأسلوبك الخاص ✨',
    reminderOpen: 'هلا! حبيت أذكّرك',
    reminderClose: 'ومتحمسين نشوف تغطيتك ✨',
    bloom: 'للتسجيل، سجلي عن طريق تطبيق Bloom.',
    link: 'للتسجيل، احجزي من خلال الرابط:',
    whatsapp: 'للتأكيد، أرسلينا',
    briefIntro: 'نقاط التركيز بالتغطية:',
    notificationTitle: 'فرصتك مع',
    notificationLead: 'تجربة حلوة بانتظارك ✨',
  },
  Emirati: {
    inviteOpen: 'هلا! يسعدنا نعزمج',
    inviteBody: 'على تجربة',
    inviteClose: 'ونحب نشوف التغطية بطريقتج وبأسلوبج العفوي ✨',
    reminderOpen: 'هلا! حبيت أذكّرج',
    reminderClose: 'ونتريا تغطيتج الحلوة ✨',
    bloom: 'للتسجيل، سجلي عن طريق تطبيق Bloom.',
    link: 'للتسجيل، احجزي من خلال الرابط:',
    whatsapp: 'للتأكيد، خبرينا بـ',
    briefIntro: 'نقاط التركيز في التغطية:',
    notificationTitle: 'فرصتج مع',
    notificationLead: 'تجربة حلوة تنتظرج ✨',
  },
  Qatari: {
    inviteOpen: 'هلا! يسعدنا ندعوج',
    inviteBody: 'لتجربة',
    inviteClose: 'ونحب نشوف تغطيتج بطريقتج العفوية والحلوة ✨',
    reminderOpen: 'هلا! حبيت أذكّرج',
    reminderClose: 'ومتحمسين نشوف تغطيتج ✨',
    bloom: 'للتسجيل، سجلي عن طريق تطبيق Bloom.',
    link: 'للتسجيل، احجزي من خلال الرابط:',
    whatsapp: 'للتأكيد، عطينا',
    briefIntro: 'نقاط التركيز في التغطية:',
    notificationTitle: 'فرصتج مع',
    notificationLead: 'تجربة حلوة ناطرتج ✨',
  },
  Omani: {
    inviteOpen: 'هلا! يسعدنا ندعوج',
    inviteBody: 'لتجربة',
    inviteClose: 'ونحب نشوف التغطية بأسلوبج الطبيعي والعفوي ✨',
    reminderOpen: 'هلا! حبيت أذكّرج',
    reminderClose: 'ونتريا نشوف تغطيتج ✨',
    bloom: 'للتسجيل، سجلي عن طريق تطبيق Bloom.',
    link: 'للتسجيل، احجزي من خلال الرابط:',
    whatsapp: 'للتأكيد، خبرينا بـ',
    briefIntro: 'نقاط التركيز في التغطية:',
    notificationTitle: 'فرصتج مع',
    notificationLead: 'تجربة حلوة بانتظارج ✨',
  },
  Bahraini: {
    inviteOpen: 'هلا! يسعدنا ندعوج',
    inviteBody: 'لتجربة',
    inviteClose: 'ونحب نشوف تغطيتج بطريقتج الطبيعية والعفوية ✨',
    reminderOpen: 'هلا! حبيت أذكّرج',
    reminderClose: 'ونتريا نشوف تغطيتج الحلوة ✨',
    bloom: 'للتسجيل، سجلي عن طريق تطبيق Bloom.',
    link: 'للتسجيل، احجزي من خلال الرابط:',
    whatsapp: 'للتأكيد، خبرينا بـ',
    briefIntro: 'نقاط التركيز في التغطية:',
    notificationTitle: 'فرصتج مع',
    notificationLead: 'تجربة حلوة ناطرتج ✨',
  },
}

function hasMultipleBranches(location = '') {
  return location.includes('\n') || location.includes(',') || location.includes('/')
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

function buildSchedule(form) {
  const dates = formatDates(form)
  const time = formatTime(form)
  const location = form.location.trim()
  const parts = []

  if (dates) parts.push(`التاريخ: ${dates}`)
  if (time) parts.push(`الوقت: ${time}`)
  if (location) parts.push(`الموقع: ${location}`)

  return parts.join('\n')
}

function buildCta(form) {
  const dialect = dialectCopy[form.dialect] || dialectCopy.Kuwaiti

  if (form.channel === 'Bloom App') {
    return dialect.bloom
  }

  if (form.channel === 'Booking Link') {
    return form.bookingLink
      ? `${dialect.link}\n${form.bookingLink}`
      : 'للتسجيل، احجزي من خلال رابط الحجز.'
  }

  const details = []
  if (hasMultipleDates(form)) details.push('التاريخ')
  if (form.timeFrom || form.timeTo || form.time) details.push('الوقت')
  if (hasMultipleBranches(form.location)) details.push('الفرع')

  if (!details.length) return 'للتأكيد، بلغينا بتفاصيل زيارتج.'

  return `${dialect.whatsapp} ${details.join(' و')}.${form.whatsappContact ? `\nواتساب: ${form.whatsappContact}` : ''}`
}

function toneIntro(tone) {
  switch (tone) {
    case 'Classy & Premium':
      return 'بأسلوب راقٍ وأنيق يعكس هوية البراند.'
    case 'Fun & Energetic':
      return 'بأسلوب حيوي ومرح يبين الحماس والتجربة.'
    case 'Warm & Personal':
      return 'بأسلوب دافئ وشخصي يخلي التجربة قريبة وطبيعية.'
    case 'Professional & Polished':
      return 'بأسلوب مرتب واحترافي مع الحفاظ على الطابع الطبيعي.'
    default:
      return 'بأسلوب عفوي، قريب، وطبيعي بدون ما يكون إعلاني.'
  }
}

function cleanPoint(point) {
  return point.replace(/^[-•*]\s*/, '').trim()
}

function getCoveragePoints(form) {
  return form.coveragePoints
    .split('\n')
    .map(cleanPoint)
    .filter(Boolean)
}

function generateCopy(form, kind) {
  const campaign = form.name || 'هذه الحملة'
  const brand = form.brand || 'البراند'
  const dialect = dialectCopy[form.dialect] || dialectCopy.Kuwaiti
  const schedule = buildSchedule(form)
  const cta = buildCta(form)
  const points = getCoveragePoints(form)

  if (kind === 'invitation') {
    const tone = toneIntro(form.tone)
    const offer = form.offer ? `\n\n🎁 ${form.offer}` : ''
    return `${dialect.inviteOpen} للمشاركة في حملة «${campaign}» مع ${brand}.\n\n${dialect.inviteBody} ${campaign} ${tone}\n\n${schedule}${offer}\n\n${dialect.inviteClose}\n\n${cta}`
  }

  if (kind === 'brief') {
    if (!points.length) {
      return `${dialect.briefIntro}\n\n• أضيفي هنا أهم النقاط اللي تبين التركيز عليها بالتغطية.\n• كل نقطة تكون واضحة ومباشرة.`
    }

    return `${dialect.briefIntro}\n\n${points.map(point => `• ${point}`).join('\n')}`
  }

  if (kind === 'reminder') {
    const details = schedule ? `\n\n${schedule}` : ''
    return `${dialect.reminderOpen} بخصوص حملة «${campaign}» مع ${brand}.${details}\n\n${dialect.reminderClose}\n\n${cta}`
  }

  if (kind === 'notification') {
    const shortDetail = form.offer || campaign
    const detail = shortDetail.length > 85 ? `${shortDetail.slice(0, 82)}...` : shortDetail
    return `${dialect.notificationTitle} ${brand} ✨\n${dialect.notificationLead}\n${detail}`
  }

  return ''
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
  const generateAll = () => {
    const nextContent = {}
    copyTypes.forEach(([key]) => { nextContent[key] = generateCopy(form, key) })
    setForm(current => ({ ...current, content: { ...current.content, ...nextContent } }))
  }

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
    setForm({ ...initialForm, content: {} })
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
              <div><p className="eyebrow">COPY WRITER BY ECHO</p><h1>{form.id ? 'Edit Campaign' : 'New Campaign'}</h1><p className="subtle">Build campaign details, direction and ready-to-use influencer copy.</p></div>
              <button className="primary" onClick={save}>Save Campaign</button>
            </header>

            <section className="panel">
              <div className="section-title"><div><span className="section-number">01</span><div><h2>Campaign details</h2><p>These are the details used in the invitation and reminder.</p></div></div></div>
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
              <div className="section-title"><div><span className="section-number">02</span><div><h2>Registration & offer</h2><p>The invitation closing line changes automatically by registration method.</p></div></div></div>
              <div className="form-grid">
                <Select label="Registration Method" value={form.channel} onChange={v => setField('channel', v)} options={['Bloom App', 'Booking Link', 'WhatsApp']} />
                {form.channel === 'Booking Link' && <Field label="Booking Link" type="url" value={form.bookingLink} onChange={v => setField('bookingLink', v)} placeholder="https://..." />}
                {form.channel === 'WhatsApp' && <Field label="WhatsApp Contact" value={form.whatsappContact} onChange={v => setField('whatsappContact', v)} placeholder="+965 ..." />}
                <label className="field full"><span>Gift / Offer</span><textarea value={form.offer} onChange={e => setField('offer', e.target.value)} placeholder="Enter the gift or offer details..." rows="4" /></label>
              </div>
            </section>

            <section className="panel">
              <div className="section-title"><div><span className="section-number">03</span><div><h2>Copy direction</h2><p>Dialect changes the wording. Tone controls the invitation personality.</p></div></div></div>
              <div className="form-grid">
                <Select label="Dialect" value={form.dialect} onChange={v => setField('dialect', v)} options={dialects} />
                <Select label="Invitation Tone" value={form.tone} onChange={v => setField('tone', v)} options={tones} />
                <label className="field full"><span>Main Coverage Points <b>*</b></span><textarea value={form.coveragePoints} onChange={e => setField('coveragePoints', e.target.value)} placeholder={'Write only the main points you want the influencer to focus on in the coverage.\nExample:\nShow the new summer collection\nMention the special launch offer\nHighlight the store experience'} rows="7" /><small className="field-hint">The brief is sent after the influencer confirms. It will contain these points only, not the campaign invitation details.</small></label>
              </div>
            </section>

            <section className="content-head">
              <div><p className="eyebrow">CONTENT GENERATION</p><h2>Campaign copy</h2><p className="subtle">Each format follows its own purpose: invitation, coverage brief, reminder, and short app notification.</p></div>
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
  return <article className="copy-card"><div className="card-head"><h3>{title}</h3><span className={text ? 'ready' : 'draft'}>{text ? 'Ready' : 'Draft'}</span></div>{editing ? <textarea className="copy-editor" dir="rtl" value={text} onChange={e => onChange(e.target.value)} rows="10" /> : <p className={text ? 'arabic-copy' : 'placeholder'} dir={text ? 'rtl' : 'ltr'}>{text || 'Generate copy to preview it here.'}</p>}<div className="card-actions"><button onClick={onEdit}>{editing ? 'Done' : 'Edit'}</button><button onClick={onCopy} disabled={!text}>Copy</button><button onClick={onRegenerate}>Regenerate</button></div></article>
}

export default App
