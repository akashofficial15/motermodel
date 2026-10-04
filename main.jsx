import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Bike, CalendarDays, Check, ChevronRight, ClipboardList, FileText, Gauge, Languages, Menu, MessageCircle, MoreHorizontal, Plus, Search, Settings, ShieldCheck, Sparkles, Wrench, X } from 'lucide-react';
import './styles.css';

const seedJobs = [
  { id: 'JC-1048', customer: 'Ravi Kumar', phone: '98490 22341', vehicle: 'Honda Activa 6G', plate: 'TS 09 EA 4821', service: 'General service + brake pad', mechanic: 'Suresh', bay: 'Bay 2', status: 'Work in progress', total: 1680, received: '09:10 AM', color: 'yellow' },
  { id: 'JC-1047', customer: 'Sowmya Reddy', phone: '99887 11229', vehicle: 'TVS Jupiter', plate: 'TS 08 FH 1092', service: 'Oil change & inspection', mechanic: 'Anil', bay: 'Bay 1', status: 'Ready for pickup', total: 950, received: '08:35 AM', color: 'green' },
  { id: 'JC-1046', customer: 'Naveen P', phone: '90321 88990', vehicle: 'Royal Enfield Classic 350', plate: 'AP 28 CD 7710', service: 'Chain kit replacement', mechanic: 'Suresh', bay: 'Bay 3', status: 'Received', total: 3200, received: '10:42 AM', color: 'red' },
];

const navItems = [
  { id: 'overview', label: 'Overview', icon: Gauge },
  { id: 'jobs', label: 'Job cards', icon: ClipboardList },
  { id: 'customers', label: 'Customers', icon: Bike },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays },
  { id: 'billing', label: 'Billing', icon: FileText },
  { id: 'reports', label: 'Reports', icon: Sparkles },
];

const money = (value) => `₹${Number(value).toLocaleString('en-IN')}`;
const statusClass = (status) => status.toLowerCase().replaceAll(' ', '-');

function App() {
  const [active, setActive] = useState('overview');
  const [jobs, setJobs] = useState(() => JSON.parse(localStorage.getItem('garageflow-jobs') || 'null') || seedJobs);
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('EN');
  const [showNewJob, setShowNewJob] = useState(false);
  const [toast, setToast] = useState('');
  const [settings, setSettings] = useState({ shopName: 'MOTORHAUS', gst: 18, capacity: 12 });

  useEffect(() => localStorage.setItem('garageflow-jobs', JSON.stringify(jobs)), [jobs]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 3000); return () => clearTimeout(t); } }, [toast]);

  const filteredJobs = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return jobs;
    return jobs.filter((job) => [job.customer, job.phone, job.vehicle, job.plate, job.id, job.service].some((field) => field.toLowerCase().includes(query)));
  }, [jobs, search]);

  const openWhatsApp = (job, type = 'ready') => {
    const messages = {
      received: `Hello ${job.customer}, your ${job.vehicle} (${job.plate}) has been received at ${settings.shopName}. We will share the estimate shortly.`,
      estimate: `Hello ${job.customer}, estimate for ${job.vehicle} (${job.plate}) is ${money(job.total)} including ${settings.gst}% GST. Please reply APPROVE to proceed.`,
      ready: `Hello ${job.customer}, your ${job.vehicle} (${job.plate}) is ready for pickup. Total: ${money(job.total)} including GST.`,
      invoice: `Hello ${job.customer}, invoice for ${job.vehicle} (${job.plate}) is ${money(job.total)}. Thank you for choosing ${settings.shopName}.`,
    };
    window.open(`https://wa.me/91${job.phone.replace(/\D/g, '')}?text=${encodeURIComponent(messages[type])}`, '_blank');
  };

  const advanceStatus = (id) => {
    const order = ['Received', 'Work in progress', 'Ready for pickup', 'Completed'];
    setJobs((current) => current.map((job) => job.id === id ? { ...job, status: order[Math.min(order.indexOf(job.status) + 1, order.length - 1)] } : job));
    setToast('Job card updated');
  };

  const addJob = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const newJob = { id: `JC-${1049 + jobs.length}`, customer: data.get('customer'), phone: data.get('phone'), vehicle: data.get('vehicle'), plate: data.get('plate').toUpperCase(), service: data.get('service'), mechanic: 'Unassigned', bay: 'Bay 1', status: 'Received', total: Number(data.get('total') || 0), received: 'Just now', color: 'green' };
    setJobs((current) => [newJob, ...current]);
    setShowNewJob(false);
    setToast('Job card created');
  };

  const translatedNav = language === 'TE' ? { overview: 'అవలోకనం', jobs: 'జాబ్ కార్డులు', customers: 'కస్టమర్లు', schedule: 'షెడ్యూల్', billing: 'బిల్లింగ్', reports: 'నివేదికలు' } : {};
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Wrench size={19} /></div><div><strong>{settings.shopName}</strong><span>WORKSHOP OS</span></div></div>
        <div className="shop-status"><span className="live-dot" /> Shop open <span className="status-time">08:00 - 19:00</span></div>
        <nav>{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={active === id ? 'nav-item active' : 'nav-item'} onClick={() => setActive(id)}><Icon size={18} /><span>{translatedNav[id] || label}</span>{id === 'jobs' && <b>{jobs.filter((job) => job.status !== 'Completed').length}</b>}</button>)}</nav>
        <div className="sidebar-bottom"><button className="nav-item" onClick={() => setActive('settings')}><Settings size={18} /><span>Settings</span></button><div className="user-chip"><div className="avatar">HK</div><div><strong>Harsh Kumar</strong><span>Owner</span></div><MoreHorizontal size={17} /></div></div>
      </aside>
      <main className="main-content">
        <header className="topbar"><div className="mobile-brand"><div className="brand-mark"><Wrench size={18} /></div><strong>{settings.shopName}</strong></div><div className="breadcrumb"><span>{language === 'TE' ? 'వర్క్‌స్పేస్' : 'Workspace'}</span><ChevronRight size={14} /><strong>{translatedNav[active] || navItems.find((item) => item.id === active)?.label || 'Settings'}</strong></div><div className="top-actions"><button className="icon-button mobile-menu"><Menu size={18} /></button><div className="language-toggle"><button className={language === 'EN' ? 'selected' : ''} onClick={() => setLanguage('EN')}>EN</button><button className={language === 'TE' ? 'selected' : ''} onClick={() => setLanguage('TE')}>తెలుగు</button></div><button className="owner-badge"><ShieldCheck size={15} /> Owner</button></div></header>
        <div className="content-wrap">
          {active === 'overview' && <Overview jobs={jobs} onNew={() => setShowNewJob(true)} onOpen={openWhatsApp} onAdvance={advanceStatus} setActive={setActive} />}
          {active === 'jobs' && <JobsView jobs={filteredJobs} search={search} setSearch={setSearch} onNew={() => setShowNewJob(true)} onOpen={openWhatsApp} onAdvance={advanceStatus} />}
          {active === 'customers' && <Customers jobs={jobs} />}
          {active === 'schedule' && <Schedule jobs={jobs} />}
          {active === 'billing' && <Billing jobs={jobs} onOpen={openWhatsApp} setToast={setToast} />}
          {active === 'reports' && <Reports jobs={jobs} />}
          {active === 'settings' && <SettingsView settings={settings} setSettings={setSettings} setToast={setToast} />}
        </div>
      </main>
      {showNewJob && <NewJobModal onClose={() => setShowNewJob(false)} onSubmit={addJob} />}
      {toast && <div className="toast"><Check size={17} />{toast}</div>}
    </div>
  );
}

function PageHeader({ eyebrow, title, sub, action, onAction }) { return <div className="page-header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{sub}</p></div>{action && <button className="primary-button" onClick={onAction}><Plus size={17} />{action}</button>}</div>; }
function StatCard({ label, value, detail, tone, icon: Icon }) { return <div className={`stat-card ${tone}`}><div className="stat-top"><span>{label}</span><div className="stat-icon"><Icon size={17} /></div></div><strong>{value}</strong><small>{detail}</small></div>; }

function Overview({ jobs, onNew, onOpen, onAdvance, setActive }) {
  const activeJobs = jobs.filter((job) => job.status !== 'Completed');
  return <><PageHeader eyebrow="Monday, 14 September 2026" title="Good morning, Harsh." sub="Here is your workshop at a glance." action="New job card" onAction={onNew} /><div className="stats-grid"><StatCard label="Today's jobs" value={jobs.length} detail="2 awaiting action" tone="mint" icon={ClipboardList} /><StatCard label="In progress" value={jobs.filter((job) => job.status === 'Work in progress').length} detail="Across 3 active bays" tone="amber" icon={Wrench} /><StatCard label="Revenue today" value={money(5830)} detail="+12.4% from last Monday" tone="blue" icon={FileText} /><StatCard label="Outstanding" value={money(24800)} detail="7 invoices pending" tone="rose" icon={CalendarDays} /></div><section className="dashboard-grid"><div className="panel today-panel"><div className="panel-heading"><div><h2>Today's workshop</h2><span>{activeJobs.length} vehicles on the floor</span></div><button className="text-button" onClick={() => setActive('jobs')}>View all <ChevronRight size={15} /></button></div><div className="job-list">{activeJobs.map((job) => <JobRow key={job.id} job={job} onOpen={onOpen} onAdvance={onAdvance} />)}</div></div><div className="right-stack"><div className="panel capacity-panel"><div className="panel-heading"><div><h2>Capacity</h2><span>Monday, 14 Sep</span></div><span className="capacity-count">8 / 12</span></div><div className="capacity-bar"><i /><i /><i /><i /><i /><i /><i /><i /><i className="empty" /><i className="empty" /><i className="empty" /><i className="empty" /></div><div className="capacity-legend"><span><i className="dot green" />Available 4</span><span><i className="dot yellow" />Booked 8</span></div><button className="outline-button full" onClick={() => setActive('schedule')}><CalendarDays size={16} /> Manage schedule</button></div><div className="panel quick-panel"><div className="panel-heading"><h2>Quick actions</h2></div><div className="quick-actions"><button onClick={onNew}><Plus size={17} /> New job card</button><button onClick={() => setActive('billing')}><FileText size={17} /> Create invoice</button><button onClick={() => setActive('customers')}><Bike size={17} /> Find customer</button></div></div></div></section></>;
}

function JobRow({ job, onOpen, onAdvance }) { return <div className="job-row"><div className={`vehicle-icon ${job.color}`}><Bike size={19} /></div><div className="job-main"><div className="job-title"><strong>{job.customer}</strong><span className={`status-pill ${statusClass(job.status)}`}>{job.status}</span></div><div className="job-meta"><span>{job.vehicle}</span><span className="plate">{job.plate}</span><span>{job.bay}</span></div></div><div className="job-service"><span>{job.service}</span><small>{job.received}</small></div><div className="job-value"><strong>{money(job.total)}</strong><small>{job.mechanic}</small></div><div className="row-actions"><button title="Draft WhatsApp" onClick={() => onOpen(job, job.status === 'Ready for pickup' ? 'ready' : 'received')}><MessageCircle size={16} /></button><button className="advance-button" onClick={() => onAdvance(job.id)}>{job.status === 'Completed' ? <Check size={16} /> : <ChevronRight size={16} />}</button></div></div>; }

function JobsView({ jobs, search, setSearch, onNew, onOpen, onAdvance }) { return <><PageHeader eyebrow="Workshop floor" title="Job cards" sub="Track every vehicle from drop-off to pickup." action="New job card" onAction={onNew} /><div className="toolbar"><div className="search-box"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, plate, phone, or gaadi..." /></div><div className="filter-pills"><button className="filter-active">All <span>{jobs.length}</span></button><button>Received</button><button>In progress</button><button>Ready</button></div></div><div className="panel jobs-panel"><div className="table-head"><span>Job card</span><span>Service</span><span>Amount</span><span>Action</span></div>{jobs.map((job) => <JobRow key={job.id} job={job} onOpen={onOpen} onAdvance={onAdvance} />)}</div></>; }

function Customers({ jobs }) { const customers = jobs.reduce((acc, job) => { if (!acc[job.phone]) acc[job.phone] = { ...job, visits: 1, spend: job.total }; else { acc[job.phone].visits += 1; acc[job.phone].spend += job.total; } return acc; }, {}); return <><PageHeader eyebrow="Customer book" title="Customers" sub="Your customer and vehicle directory, always within reach." action="Add customer" onAction={() => alert('Customer form ready for your next booking.')} /><div className="toolbar"><div className="search-box"><Search size={17} /><input placeholder="Search customer, WhatsApp, or vehicle..." /></div><button className="outline-button"><MoreHorizontal size={16} /> Filters</button></div><div className="customer-grid">{Object.values(customers).map((customer) => <div className="customer-card" key={customer.phone}><div className="customer-card-top"><div className="avatar large">{customer.customer.split(' ').map((n) => n[0]).join('').slice(0, 2)}</div><button className="icon-button"><MoreHorizontal size={17} /></button></div><h3>{customer.customer}</h3><span className="muted">{customer.phone}</span><div className="customer-vehicle"><Bike size={16} /><strong>{customer.vehicle}</strong><span>{customer.plate}</span></div><div className="customer-foot"><span>{customer.visits} visit{customer.visits > 1 ? 's' : ''}</span><strong>{money(customer.spend)} lifetime</strong></div></div>)}</div></>; }

function Schedule({ jobs }) { return <><PageHeader eyebrow="Appointments" title="Schedule" sub="Keep the bays balanced and customers moving." action="Book a slot" onAction={() => alert('Booking form ready for your next appointment.')} /><div className="schedule-head"><button className="date-nav">‹</button><strong>Mon, 14 Sep 2026</strong><button className="date-nav">›</button><span className="today-chip">Today</span></div><div className="schedule-grid">{['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'].map((time, index) => <div className="time-row" key={time}><span>{time}</span><div className={index === 1 ? 'appointment booked' : index === 2 ? 'appointment active' : 'appointment empty-slot'}>{index === 1 ? <><strong>{jobs[1]?.customer}</strong><small>{jobs[1]?.vehicle} · Bay 1</small></> : index === 2 ? <><strong>{jobs[0]?.customer}</strong><small>{jobs[0]?.vehicle} · Bay 2</small></> : index === 3 ? <><button><Plus size={16} /> Add appointment</button></> : <span className="slot-label">Available</span>}</div></div>)}</div></>; }

function Billing({ jobs, onOpen, setToast }) { const [selected, setSelected] = useState(jobs[0]?.id); const [discount, setDiscount] = useState(0); const [advance, setAdvance] = useState(0); const [gst, setGst] = useState(18); const job = jobs.find((item) => item.id === selected) || jobs[0]; const subtotal = Number(job?.total || 0); const taxable = Math.max(0, subtotal - Number(discount || 0)); const tax = Math.round(taxable * Number(gst || 0) / 100); const grandTotal = taxable + tax; const balance = Math.max(0, grandTotal - Number(advance || 0)); return <><PageHeader eyebrow="Money desk" title="Billing" sub="Estimates, approvals and invoices in one place." action="New estimate" onAction={() => setToast('Estimate builder opened')} /><div className="billing-summary"><div><span>Pending approval</span><strong>2</strong></div><div><span>Ready to invoice</span><strong>3</strong></div><div><span>Collected today</span><strong>{money(5830)}</strong></div></div><div className="billing-grid"><div className="panel invoice-builder"><div className="panel-heading"><div><h2>Estimate & invoice</h2><span>Owner approval required before sending</span></div><ShieldCheck size={19} color="#258054" /></div><label>Job card<select value={selected} onChange={(event) => setSelected(event.target.value)}>{jobs.map((item) => <option key={item.id} value={item.id}>{item.id} · {item.customer}</option>)}</select></label><div className="invoice-inputs"><label>Discount<input type="number" value={discount} onChange={(event) => setDiscount(event.target.value)} /></label><label>GST %<input type="number" value={gst} onChange={(event) => setGst(event.target.value)} /></label><label>Advance paid<input type="number" value={advance} onChange={(event) => setAdvance(event.target.value)} /></label></div><div className="invoice-totals"><span>Service subtotal <strong>{money(subtotal)}</strong></span><span>Discount <strong>- {money(discount)}</strong></span><span>GST ({gst}%) <strong>{money(tax)}</strong></span><span className="total-line">Grand total <strong>{money(grandTotal)}</strong></span><span className="balance-line">Balance due <strong>{money(balance)}</strong></span></div><div className="invoice-actions"><button className="outline-button" onClick={() => job && onOpen({ ...job, total: grandTotal }, 'estimate')}><MessageCircle size={16} /> Draft approval on WhatsApp</button><button className="primary-button" onClick={() => setToast('Bill approved and invoice finalized')}><Check size={16} /> Approve bill</button></div></div><div className="panel jobs-panel"><div className="table-head billing-head"><span>Customer / vehicle</span><span>Status</span><span>Amount</span><span>Actions</span></div>{jobs.map((job) => <div className="billing-row" key={job.id}><div><strong>{job.customer}</strong><span>{job.vehicle} · {job.plate}</span></div><span className={`status-pill ${job.status === 'Ready for pickup' ? 'ready-for-pickup' : 'awaiting-approval'}`}>{job.status === 'Ready for pickup' ? 'Owner approved' : 'Awaiting approval'}</span><strong>{money(job.total)}</strong><div className="billing-actions"><button className="icon-button" title="WhatsApp invoice" onClick={() => onOpen(job, 'invoice')}><MessageCircle size={16} /></button><button className="small-button" onClick={() => { setSelected(job.id); setToast('Bill opened for review'); }}>{job.status === 'Ready for pickup' ? 'Invoice' : 'Review'}</button></div></div>)}</div></div></>; }

function Reports({ jobs }) { const total = jobs.reduce((sum, job) => sum + job.total, 0); return <><PageHeader eyebrow="Business pulse" title="Reports" sub="A clear view of revenue and money still on the road." /><div className="report-grid"><div className="panel report-chart"><div className="panel-heading"><div><h2>Revenue overview</h2><span>Last 7 days · including GST</span></div><strong>{money(42750)}</strong></div><div className="bars">{[['Mon', 52], ['Tue', 70], ['Wed', 45], ['Thu', 82], ['Fri', 64], ['Sat', 94], ['Sun', 28]].map(([day, height]) => <div className="bar-wrap" key={day}><div className="bar" style={{ height: `${height}%` }} /><span>{day}</span></div>)}</div></div><div className="panel report-breakdown"><div className="panel-heading"><div><h2>Outstanding</h2><span>Across 7 invoices</span></div><strong>{money(24800)}</strong></div><div className="breakdown"><span><i className="dot rose" />Due today <strong>{money(6200)}</strong></span><span><i className="dot amber" />1–7 days <strong>{money(9800)}</strong></span><span><i className="dot slate" />Over 7 days <strong>{money(8800)}</strong></span></div><button className="outline-button full">Export report</button></div></div><div className="kpi-row"><div><span>Total jobs</span><strong>{jobs.length}</strong><small>This month</small></div><div><span>Average ticket</span><strong>{money(Math.round(total / jobs.length))}</strong><small>Per completed job</small></div><div><span>Collection rate</span><strong>82%</strong><small>+5.2% from last month</small></div></div></>; }

function SettingsView({ settings, setSettings, setToast }) { return <><PageHeader eyebrow="Workspace" title="Settings" sub="Shape GarageFlow around your shop." /><div className="settings-grid"><div className="panel settings-panel"><h2>Shop profile</h2><p className="panel-sub">These details appear on invoices and WhatsApp messages.</p><label>Shop name<input value={settings.shopName} onChange={(e) => setSettings({ ...settings, shopName: e.target.value.toUpperCase() })} /></label><label>GST percentage<input type="number" value={settings.gst} onChange={(e) => setSettings({ ...settings, gst: e.target.value })} /></label><label>Daily vehicle capacity<input type="number" value={settings.capacity} onChange={(e) => setSettings({ ...settings, capacity: e.target.value })} /></label><button className="primary-button" onClick={() => setToast('Settings saved')}>Save settings</button></div><div className="panel settings-panel brand-preview"><div className="preview-mark"><Wrench size={26} /></div><h2>{settings.shopName}</h2><span>Workshop invoice preview</span><div className="preview-line" /><strong>GST: {settings.gst}%</strong></div></div></>; }

function NewJobModal({ onClose, onSubmit }) { return <div className="modal-backdrop"><div className="modal"><div className="modal-head"><div><div className="eyebrow">New work order</div><h2>Create job card</h2></div><button className="icon-button" onClick={onClose}><X size={18} /></button></div><form onSubmit={onSubmit}><div className="form-grid"><label>Customer name<input name="customer" required placeholder="e.g. Ravi Kumar" /></label><label>WhatsApp number<input name="phone" required placeholder="98765 43210" /></label><label>Vehicle make & model<input name="vehicle" required placeholder="e.g. Honda Activa 6G" /></label><label>Number plate<input name="plate" required placeholder="TS 09 EA 4821" /></label><label className="wide">Service / complaint<input name="service" required placeholder="e.g. General service, noise from front" /></label><label>Estimated amount<input name="total" type="number" placeholder="0" /></label></div><div className="form-footer"><span>Owner approval is required before final invoice.</span><button type="submit" className="primary-button"><Plus size={16} /> Create job card</button></div></form></div></div>; }

createRoot(document.getElementById('root')).render(<App />);
