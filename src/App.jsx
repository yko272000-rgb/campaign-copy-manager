import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'campaign-copy-manager-campaigns'
const initialForm = {
  id: null, name: '', brand: '', type: 'Delivery', startDate: '', endDate: '', time: '',
  location: '', channel: 'Bloom App', bookingLink: '', whatsappContact: '', offer: '',
  dialect: 'Kuwaiti', tone: 'Friendly', content: {}, updatedAt: '',
}
const locationTypes = ['Visit', 'Event', 'Store Visit']
const copyTypes = [
  ['invitation', 'Invitation'], ['brief', 'Influencer Brief'],
  ['reminder', 'Reminder'], ['notification', 'App Notification'],
]

function generateCopy(form, kind) {
  const isArabic = true
  const campaign = form.name || 'هذه الحملة'
  const brand = form.brand || 'علامتنا'
  const details = form.offer ? `\n\nالعرض: ${form.offer}` : ''
  const place = form.location ? `\nالموقع: ${form.location}` : ''
  const dates = form.startDate ? `\nالتاريخ: ${form.startDate}${form.endDate ? ` إلى ${form.endDate}` : ''}${form.time ? `، ${form.time}` : ''}` : ''
  const channel = form.channel === 'Booking Link' && form.bookingLink ? `\nرابط الحجز: ${form.bookingLink}` : form.channel === 'WhatsApp' && form.whatsappContact ? `\nللتواصل عبر واتساب: ${form.whatsappContact}` : ''
  const variants = {
    invitation: `هلا! يسعدنا دعوتك للمشاركة في حملة «${campaign}» مع ${brand}.\n\nنبحث عن محتوى جميل بأسلوبك ويعكس تجربتك بكل عفوية.${dates}${place}${details}${channel}\n\nإذا يناسبك، نحب نسمع منك!`,
    brief: `بريف حملة «${campaign}» — ${brand}\n\nالمطلوب: مشاركة تجربتك بأسلوب ${form.tone.toLowerCase()} وطبيعي، مع إبراز أهم تفاصيل التجربة بشكل واضح.${dates}${place}${details}\n\nالقناة: ${form.channel}\nالله يعطيك العافية وننتظر إبداعك!`,
    reminder: `هلا! تذكير لطيف بخصوص حملة «${campaign}» مع ${brand}.${dates}${place}\n\nنتحمس نشوف محتواك الجميل، وإذا تحتاج أي مساعدة لا تتردد تتواصل معنا.`,
    notification: `فرصة جديدة مع ${brand}! ✨\nانضم/ي إلى حملة «${campaign}» واستمتع/ي بالتجربة.${details}${channel}`,
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
    try { setCampaigns(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []) } catch { setCampaigns([]) }
  }, [])
  const setField = (key, value) => setForm(current => ({ ...current, [key]: value }))
  const setContent = (kind, value) => setForm(current => ({ ...current, content: { ...current.content, [kind]: value } }))
  const generate = kind => setContent(kind, generateCopy(form, kind))
  const generateAll = () => copyTypes.forEach(([key]) => generate(key))
  const save = () => {
    if (!form.name.trim() || !form.brand.trim()) { window.alert('Please add a campaign name and brand name.'); return }
    const saved = { ...form, id: form.id || crypto.randomUUID(), updatedAt: new Date().toISOString() }
    const next = form.id ? campaigns.map(c => c.id === form.id ? saved : c) : [saved, ...campaigns]
    setCampaigns(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setForm(saved)
    window.alert('Campaign saved successfully.')
  }
  const newCampaign = () => { setForm(initialForm); setView('new'); setEditing(null) }
  const openCampaign = campaign => { setForm({ ...initialForm, ...campaign, content: campaign.content || {} }); setView('new'); setEditing(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const deleteCampaign = id => {
    if (!window.confirm('Delete this campaign?')) return
    const next = campaigns.filter(c => c.id !== id); setCampaigns(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    if (form.id === id) newCampaign()
  }
  const filtered = useMemo(() => campaigns.filter(c => [c.name,c.brand,c.dialect,c.tone].join(' ').toLowerCase().includes(search.toLowerCase())), [campaigns, search])
  const needsLocation = locationTypes.includes(form.type)

  return <div className="app-shell">
    <aside className="sidebar"><div className="brand-mark"><span>CM</span><div>Campaign<br/><b>Copy Manager</b></div></div>
      <nav><button className={view === 'new' ? 'active' : ''} onClick={newCampaign}>＋ <span>New Campaign</span></button><button className={view === 'history' ? 'active' : ''} onClick={() => setView('history')}>▣ <span>Campaign History</span></button></nav>
      <p className="sidebar-note">Internal workspace<br/>for campaign teams</p></aside>
    <main>{view === 'new' ? <>
      <header><div><p className="eyebrow">CAMPAIGN WORKSPACE</p><h1>{form.id ? 'Edit Campaign' : 'New Campaign'}</h1><p className="subtle">Set up the campaign and create ready-to-use influencer copy.</p></div><button className="primary" onClick={save}>Save Campaign</button></header>
      <section className="panel"><h2>Campaign details</h2><div className="form-grid">
        <Field label="Campaign Name" required value={form.name} onChange={v=>setField('name',v)} placeholder="e.g. Summer Launch"/><Field label="Brand Name" required value={form.brand} onChange={v=>setField('brand',v)} placeholder="Brand name"/>
        <Select label="Campaign Type" value={form.type} onChange={v=>setField('type',v)} options={['Delivery','Visit','Event','Store Visit','Other']}/><Field label="Start Date" type="date" value={form.startDate} onChange={v=>setField('startDate',v)}/>
        <Field label="End Date" type="date" value={form.endDate} onChange={v=>setField('endDate',v)}/><Field label="Time" type="time" value={form.time} onChange={v=>setField('time',v)}/>
        {needsLocation && <Field label="Location" required value={form.location} onChange={v=>setField('location',v)} placeholder="Venue or address"/>}
      </div></section>
      <section className="panel"><h2>Channel & offer</h2><div className="form-grid"><Select label="Campaign Channel" value={form.channel} onChange={v=>setField('channel',v)} options={['Bloom App','Booking Link','WhatsApp']}/>
        {form.channel === 'Booking Link' && <Field label="Booking Link" type="url" value={form.bookingLink} onChange={v=>setField('bookingLink',v)} placeholder="https://..."/>}
        {form.channel === 'WhatsApp' && <Field label="WhatsApp Contact" value={form.whatsappContact} onChange={v=>setField('whatsappContact',v)} placeholder="+965 ..."/>}
        <label className="field full"><span>Gift / Offer</span><textarea value={form.offer} onChange={e=>setField('offer',e.target.value)} placeholder="Enter the full gift or offer details..." rows="4"/></label></div></section>
      <section className="panel"><h2>Copy direction</h2><div className="form-grid"><Select label="Dialect" value={form.dialect} onChange={v=>setField('dialect',v)} options={['Kuwaiti','Saudi','Emirati','Qatari','Omani','Bahraini']}/><Select label="Tone" value={form.tone} onChange={v=>setField('tone',v)} options={['Casual','Friendly','Classy','Premium','Exciting','Professional']}/></div></section>
      <section className="content-head"><div><p className="eyebrow">CONTENT GENERATION</p><h2>Campaign copy</h2></div><div className="generator-actions">{copyTypes.map(([key,label])=><button key={key} onClick={()=>generate(key)}>Generate {label.replace('Influencer ', '')}</button>)}<button className="primary" onClick={generateAll}>Generate All</button></div></section>
      <section className="content-grid">{copyTypes.map(([key,label]) => <ContentCard key={key} title={label} text={form.content[key] || ''} editing={editing===key} onEdit={()=>setEditing(editing===key?null:key)} onChange={v=>setContent(key,v)} onCopy={()=>navigator.clipboard.writeText(form.content[key] || '')} onRegenerate={()=>generate(key)}/>)}</section>
    </> : <>
      <header><div><p className="eyebrow">CAMPAIGN LIBRARY</p><h1>Campaign History</h1><p className="subtle">Find, reopen, or remove saved campaigns.</p></div><button className="primary" onClick={newCampaign}>New Campaign</button></header>
      <section className="panel"><div className="history-tools"><input aria-label="Search campaigns" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search campaigns, brands, dialects..."/><span>{filtered.length} saved</span></div>
        {filtered.length ? <div className="campaign-list">{filtered.map(c=><article className="campaign-row" key={c.id}><div><h3>{c.name}</h3><p>{c.brand}</p></div><div><small>DATES</small><p>{c.startDate || '—'} {c.endDate && `– ${c.endDate}`}</p></div><div><small>STYLE</small><p>{c.dialect} · {c.tone}</p></div><div className="row-actions"><button onClick={()=>openCampaign(c)}>Open Campaign</button><button className="danger" onClick={()=>deleteCampaign(c.id)}>Delete</button></div></article>)}</div> : <div className="empty"><div>◇</div><h3>No campaigns found</h3><p>Create your first campaign to save it here.</p></div>}</section>
    </>}</main>
  </div>
}

function Field({label, required, type='text', value, onChange, placeholder}) { return <label className="field"><span>{label}{required && <b> *</b>}</span><input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} required={required}/></label> }
function Select({label, value, onChange, options}) { return <label className="field"><span>{label}</span><select value={value} onChange={e=>onChange(e.target.value)}>{options.map(item=><option key={item}>{item}</option>)}</select></label> }
function ContentCard({title,text,editing,onEdit,onChange,onCopy,onRegenerate}) { return <article className="copy-card"><div className="card-head"><h3>{title}</h3><span className={text?'ready':'draft'}>{text?'Ready':'Draft'}</span></div>{editing ? <textarea className="copy-editor" dir="rtl" value={text} onChange={e=>onChange(e.target.value)} rows="9"/> : <p className={text ? 'arabic-copy' : 'placeholder'} dir={text ? 'rtl' : 'ltr'}>{text || 'Generate copy to preview it here.'}</p>}<div className="card-actions"><button onClick={onEdit}>{editing?'Done':'Edit'}</button><button onClick={onCopy} disabled={!text}>Copy</button><button onClick={onRegenerate}>Regenerate</button></div></article> }

export default App
