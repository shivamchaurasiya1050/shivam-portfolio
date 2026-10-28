import React, { useEffect, useState } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import {
  ArrowDownRight, ArrowUpRight, Github, Linkedin, Mail, MapPin,
  Code2, Database, Server, Layers3, Menu, X, Send, CheckCircle2,
  ExternalLink, HeartPulse, Boxes, Building2, ShoppingBag, Workflow,
  Plus, Pencil, Trash2, LogOut, LockKeyhole, LayoutDashboard, LoaderCircle
} from 'lucide-react';
import { supabase } from './supabase';

const skillGroups = [
  { title: 'Frontend', icon: Layers3, items: ['React.js', 'Next.js', 'JavaScript', 'TypeScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Bootstrap', 'React Router', 'React Hook Form'] },
  { title: 'Backend', icon: Server, items: ['Node.js', 'Express.js', 'NestJS', 'REST APIs', 'JWT', 'Webhooks', 'BullMQ', 'Cron Jobs', 'Nodemailer', 'Multer'] },
  { title: 'Databases & ORM', icon: Database, items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Prisma', 'Sequelize', 'Mongoose'] },
  { title: 'Cloud & Tools', icon: Code2, items: ['Git & GitHub', 'Docker', 'Kubernetes', 'WSL2', 'Postman', 'MeiliSearch', 'Vite', 'Swagger', 'Firebase', 'Twilio'] },
];

const starterProjects = [
  { title: 'Hospital Management System & ABDM', slug: 'hospital-management-abdm', description: 'Healthcare workflows spanning IPD admissions, revisits, bed allocation, billing, invoices, advance payments, and digital health identity integration.', tech_stack: ['React', 'Node.js', 'ABDM V3', 'REST APIs', 'MongoDB'], image_url: '', github_url: '', live_url: '', featured: true, sort_order: 1 },
  { title: 'Pharmacy365', slug: 'pharmacy365', description: 'A pharmacy management platform with modular data models and workflows for inventory, purchases, suppliers and permissions.', tech_stack: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL'], image_url: '', github_url: '', live_url: '', featured: true, sort_order: 2 },
  { title: 'Real Estate Portal', slug: 'real-estate-portal', description: 'Property discovery and listing workflows with filtering, reviews, saved properties, favorites and scheduled publishing.', tech_stack: ['React', 'Node.js', 'MongoDB', 'MeiliSearch', 'Cron'], image_url: '', github_url: '', live_url: '', featured: false, sort_order: 3 },
  { title: 'Webhook & Shipment Integrations', slug: 'webhook-shipment-integrations', description: 'Event-driven backend integrations designed to process external webhook events and shipment-related jobs asynchronously.', tech_stack: ['Node.js', 'BullMQ', 'Redis', 'Webhooks'], image_url: '', github_url: '', live_url: '', featured: false, sort_order: 4 },
  { title: 'GST Lookup Integration', slug: 'gst-lookup-integration', description: 'NestJS service integration with a GST lookup sandbox, including input validation, token caching and defensive error handling.', tech_stack: ['NestJS', 'TypeScript', 'REST APIs'], image_url: '', github_url: '', live_url: '', featured: false, sort_order: 5 },
];

function MissingSupabase() {
  return <div className="notice error">Supabase is not configured. Copy <code>.env.example</code> to <code>.env</code>, add your project URL and publishable/anon key, then restart Vite.</div>;
}

function useSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => listener.subscription.unsubscribe();
  }, []);
  return { session, loading };
}

function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <header className="topbar">
    <a className="brand" href="/#home"><span className="brand-mark">SC</span><span>Shivam<span className="muted">.dev</span></span></a>
    <button className="menu-toggle" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
    <nav className={open ? 'nav-links open' : 'nav-links'}>{[['About','/#about'],['Skills','/#skills'],['Projects','/#projects'],['Contact','/#contact']].map(([n,h])=><a key={n} href={h} onClick={()=>setOpen(false)}>{n}</a>)}<Link className="nav-cta" to="/admin" onClick={()=>setOpen(false)}>Admin login <ArrowUpRight size={15}/></Link></nav>
  </header>;
}

function ProjectCard({ project }) {
  return <article className="project-card">
    <div className="project-index">{String(project.sort_order || 0).padStart(2,'0')}</div>
    <div className="project-main">
      <div className="project-type">{project.featured ? '★ FEATURED PROJECT' : 'SELECTED PROJECT'}</div>
      <h3>{project.title}</h3>
      <p className="project-description">{project.description}</p>
      {project.image_url && <img className="project-image" src={project.image_url} alt={project.title} loading="lazy" />}
      <div className="project-stack">{(project.tech_stack || []).map(s=><span key={s}>{s}</span>)}</div>
      <div className="project-links">{project.github_url && <a href={project.github_url} target="_blank" rel="noreferrer"><Github size={15}/> GitHub <ExternalLink size={12}/></a>}{project.live_url && <a href={project.live_url} target="_blank" rel="noreferrer">Live demo <ExternalLink size={12}/></a>}</div>
    </div>
    <div className="project-arrow"><ArrowUpRight size={20}/></div>
  </article>;
}

function PublicPortfolio() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contact, setContact] = useState({name:'',email:'',subject:'',message:''});
  const [contactStatus, setContactStatus] = useState({type:'',message:''});
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) { setError('missing'); setLoading(false); return; }
      const { data, error: queryError } = await supabase.from('projects').select('*').order('sort_order',{ascending:true}).order('created_at',{ascending:false});
      if (!active) return;
      if (queryError) setError(queryError.message);
      else setProjects(data || []);
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, []);

  async function submitContact(e) {
    e.preventDefault(); setContactStatus({type:'',message:''});
    if (!supabase) { setContactStatus({type:'error',message:'Supabase is not configured.'}); return; }
    setSending(true);
    const { error: insertError } = await supabase.from('contact_messages').insert([{
      name: contact.name.trim(), email: contact.email.trim(),
      subject: contact.subject.trim() || null, message: contact.message.trim()
    }]);
    setSending(false);
    if (insertError) setContactStatus({type:'error',message:'Could not send message. Check Supabase setup and policies.'});
    else { setContactStatus({type:'success',message:'Thanks! Your message has been submitted.'}); setContact({name:'',email:'',subject:'',message:''}); }
  }

  return <div className="site-shell">
    <SiteHeader/>
    <main>
      <section className="hero section-wrap" id="home">
        <div className="hero-copy">
          <div className="eyebrow"><span className="status-dot"/> FULL-STACK DEVELOPER · INDIA</div>
          <h1>Building useful products<br/>with <span className="gradient-text">clean code.</span></h1>
          <p className="hero-description">I'm Shivam Chaurasiya — a software developer focused on web applications, backend systems, SaaS products, and healthcare integrations.</p>
          <div className="hero-actions"><a className="button button-primary" href="#projects">Explore my work <ArrowDownRight size={17}/></a><a className="button button-secondary" href="#contact"><Mail size={16}/> Contact me</a></div>
          <div className="hero-meta"><span><MapPin size={15}/> Lucknow, India</span><span className="meta-divider"/><span>Open to relevant opportunities</span></div>
        </div>
        <div className="hero-visual"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="code-window"><div className="window-top"><div className="window-dots"><i/><i/><i/></div><span>developer.ts</span><span className="window-lock">TS</span></div><div className="code-lines"><p><span className="line-no">01</span><span className="syntax-purple">const</span> developer = {'{'}</p><p><span className="line-no">02</span>&nbsp;&nbsp;name: <span className="syntax-green">'Shivam'</span>,</p><p><span className="line-no">03</span>&nbsp;&nbsp;role: <span className="syntax-green">'Full-stack'</span>,</p><p><span className="line-no">04</span>&nbsp;&nbsp;focus: [</p><p><span className="line-no">05</span>&nbsp;&nbsp;&nbsp;&nbsp;<span className="syntax-green">'Web apps'</span>,</p><p><span className="line-no">06</span>&nbsp;&nbsp;&nbsp;&nbsp;<span className="syntax-green">'APIs'</span>,</p><p><span className="line-no">07</span>&nbsp;&nbsp;&nbsp;&nbsp;<span className="syntax-green">'Integrations'</span></p><p><span className="line-no">08</span>&nbsp;&nbsp;],</p><p><span className="line-no">09</span>&nbsp;&nbsp;learning: <span className="syntax-blue">true</span></p><p><span className="line-no">10</span>{'}'};</p><p className="code-comment"><span className="line-no">11</span>// turn ideas into software_</p></div></div><div className="float-card float-card-top"><span className="float-icon"><Code2 size={17}/></span><span><b>Full-stack</b><small>Product development</small></span></div><div className="float-card float-card-bottom"><span className="float-icon green"><Database size={17}/></span><span><b>API & data</b><small>Integrations · queues</small></span></div><div className="visual-glow"/></div>
        <a className="scroll-cue" href="#about"><span/> SCROLL TO EXPLORE</a>
      </section>

      <section className="section-wrap about-section" id="about"><div className="section-heading"><span className="section-kicker">01 / ABOUT</span><h2>Thoughtful engineering.<br/><span className="muted-heading">Real-world problem solving.</span></h2></div><div className="about-grid"><div className="about-intro"><p className="large-copy">I enjoy turning complex workflows into maintainable software — from responsive interfaces to APIs, database models, and third-party integrations.</p><p>My work has covered healthcare systems, pharmacy operations, real estate workflows, and asynchronous backend processing. I value practical solutions, clear architecture, and continuous learning.</p><a className="text-link" href="#contact">Have a project in mind? <ArrowUpRight size={16}/></a></div><div className="highlights">{[{title:'Full-stack product development',text:'Build and maintain user-facing features and backend APIs across SaaS and business applications.'},{title:'API integrations',text:'Connect external services, handle authentication and tokens, validate payloads, and design practical error handling.'},{title:'Data & background processing',text:'Work with relational and document databases, queues, scheduled tasks, and search functionality.'}].map((item,i)=><article className="highlight" key={item.title}><span className="highlight-num">0{i+1}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div></div></section>

      <section className="section-wrap skills-section" id="skills"><div className="section-heading"><span className="section-kicker">02 / TOOLKIT</span><h2>Tools I build with.</h2><p className="section-subtitle">A practical stack for building, integrating, and shipping web products.</p></div><div className="skills-grid">{skillGroups.map(({title,icon:Icon,items})=><article className="skill-card" key={title}><div className="skill-card-head"><span className="skill-icon"><Icon size={19}/></span><h3>{title}</h3></div><div className="skill-tags">{items.map(item=><span className="skill-tag" key={item}>{item}</span>)}</div></article>)}</div><p className="skills-note">Tools listed reflect technologies discussed across my development work; depth of experience varies by tool.</p></section>

      <section className="section-wrap projects-section" id="projects"><div className="section-heading project-heading"><div><span className="section-kicker">03 / SELECTED WORK</span><h2>Projects & experience.</h2><p className="section-subtitle">Projects are loaded live from Supabase.</p></div><span className="project-count">DYNAMIC PROJECTS</span></div>
        {loading ? <div className="loading-state"><LoaderCircle className="spin"/> Loading projects…</div> : error ? <div className="notice error">{error === 'missing' ? 'Connect Supabase to display dynamic projects.' : 'Unable to load projects. Check the projects table and its SELECT policy.'}</div> : projects.length === 0 ? <div className="empty-state">No projects published yet. Add your first project from the <Link to="/admin">admin panel</Link>.</div> : <div className="projects-list">{projects.map(project=><ProjectCard key={project.id} project={project}/>)}</div>}
        <p className="project-disclaimer">Project descriptions are high-level summaries. Only publish details and links you are allowed to share.</p>
      </section>

      <section className="section-wrap contact-section" id="contact"><div className="contact-panel"><div className="contact-copy"><span className="section-kicker">04 / GET IN TOUCH</span><h2>Let's build something<br/><span className="gradient-text">meaningful.</span></h2><p>Have a role, project, or technical challenge in mind? Send me a message and let's start a conversation.</p><div className="contact-detail"><Mail size={17}/><span>{import.meta.env.VITE_CONTACT_EMAIL || 'Add your email in .env'}</span></div><div className="contact-detail"><MapPin size={17}/><span>Lucknow, Uttar Pradesh, India</span></div><div className="social-links"><a href="https://github.com/" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={18}/></a><a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={18}/></a></div><p className="social-hint">Replace GitHub and LinkedIn links with your actual profile URLs.</p></div>
        <form className="contact-form" onSubmit={submitContact}><h3>Send a message</h3><p className="form-subtitle">Fields marked * are required.</p><label>Your name *<input name="name" value={contact.name} onChange={e=>setContact({...contact,name:e.target.value})} required maxLength={100} placeholder="Your name"/></label><label>Email address *<input type="email" name="email" value={contact.email} onChange={e=>setContact({...contact,email:e.target.value})} required maxLength={254} placeholder="you@example.com"/></label><label>Subject<input name="subject" value={contact.subject} onChange={e=>setContact({...contact,subject:e.target.value})} maxLength={160} placeholder="Job opportunity / Project"/></label><label>Message *<textarea name="message" value={contact.message} onChange={e=>setContact({...contact,message:e.target.value})} required maxLength={5000} rows={4} placeholder="Tell me what you have in mind…"/></label>{contactStatus.message&&<div className={`form-status ${contactStatus.type}`} role="status">{contactStatus.type==='success'&&<CheckCircle2 size={17}/>} {contactStatus.message}</div>}<button className="button button-primary submit-button" disabled={sending}>{sending?'Sending…':'Send message'} <Send size={16}/></button><p className="privacy-note">Messages are submitted to your configured Supabase database.</p></form>
      </div></section>
    </main>
    <footer className="footer"><a className="brand footer-brand" href="#home"><span className="brand-mark">SC</span><span>Shivam<span className="muted">.dev</span></span></a><span>Designed & built with care · {new Date().getFullYear()}</span><a href="#home" className="back-top">Back to top ↑</a></footer>
  </div>;
}

function AdminLogin({ onLogin }) {
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  async function submit(e) {
    e.preventDefault(); setError('');
    if (!supabase) { setError('Supabase is not configured.'); return; }
    setBusy(true);
    const {error:loginError}=await supabase.auth.signInWithPassword({email:email.trim(),password});
    setBusy(false);
    if(loginError) setError('Login failed. Check email/password and ensure the admin user exists in Supabase Auth.');
    else onLogin();
  }
  return <div className="admin-shell"><div className="admin-card"><Link className="brand" to="/"><span className="brand-mark">SC</span><span>Shivam<span className="muted">.dev</span></span></Link><div className="admin-icon"><LockKeyhole size={23}/></div><h1>Admin login</h1><p className="admin-muted">Sign in to manage your portfolio projects.</p>{!supabase&&<MissingSupabase/>}<form className="contact-form admin-form" onSubmit={submit}><label>Email address<input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="admin@example.com"/></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Your password"/></label>{error&&<div className="form-status error">{error}</div>}<button className="button button-primary submit-button" disabled={busy||!supabase}>{busy?'Signing in…':'Sign in'} <ArrowUpRight size={16}/></button></form><Link className="back-link" to="/">← Back to portfolio</Link></div></div>;
}

const emptyProject = { title:'', slug:'', description:'', tech_stack:'', image_url:'', github_url:'', live_url:'', featured:false, sort_order:0 };

function AdminDashboard({ session }) {
  const [projects,setProjects]=useState([]);
  const [loading,setLoading]=useState(true);
  const [form,setForm]=useState(emptyProject);
  const [editingId,setEditingId]=useState(null);
  const [message,setMessage]=useState({type:'',text:''});
  const [saving,setSaving]=useState(false);
  const navigate=useNavigate();

  async function loadProjects() {
    setLoading(true);
    const {data,error}=await supabase.from('projects').select('*').order('sort_order',{ascending:true}).order('created_at',{ascending:false});
    if(error) setMessage({type:'error',text:'Could not load projects. Check the projects table and RLS policies.'});
    else setProjects(data||[]);
    setLoading(false);
  }
  useEffect(()=>{loadProjects();},[]);

  async function logout() { await supabase.auth.signOut(); navigate('/admin'); }
  function startEdit(p) {
    setEditingId(p.id);
    setForm({title:p.title||'',slug:p.slug||'',description:p.description||'',tech_stack:(p.tech_stack||[]).join(', '),image_url:p.image_url||'',github_url:p.github_url||'',live_url:p.live_url||'',featured:!!p.featured,sort_order:p.sort_order||0});
    setMessage({type:'',text:''});
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function resetForm(){setForm(emptyProject);setEditingId(null);}
  function change(e) {
    const {name,value,type,checked}=e.target;
    setForm(prev=>({...prev,[name]:type==='checkbox'?checked:name==='sort_order'?Number(value):value}));
  }
  async function save(e) {
    e.preventDefault(); setSaving(true);setMessage({type:'',text:''});
    const payload={
      title:form.title.trim(),
      slug:(form.slug.trim()||form.title.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')),
      description:form.description.trim(),
      tech_stack:form.tech_stack.split(',').map(s=>s.trim()).filter(Boolean),
      image_url:form.image_url.trim()||null,
      github_url:form.github_url.trim()||null,
      live_url:form.live_url.trim()||null,
      featured:form.featured,
      sort_order:Number(form.sort_order)||0
    };
    const result=editingId
      ? await supabase.from('projects').update(payload).eq('id',editingId)
      : await supabase.from('projects').insert(payload);
    setSaving(false);
    if(result.error){setMessage({type:'error',text:result.error.code==='23505'?'That slug is already used. Choose another slug.':'Save failed. Check your projects table, column names, and admin RLS policy.'});return;}
    setMessage({type:'success',text:editingId?'Project updated successfully.':'Project added successfully.'});
    resetForm(); await loadProjects();
  }
  async function remove(p) {
    if(!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    const {error}=await supabase.from('projects').delete().eq('id',p.id);
    if(error) setMessage({type:'error',text:'Delete failed. Check admin permissions and RLS policies.'});
    else {setMessage({type:'success',text:'Project deleted.'});await loadProjects();}
  }

  return <div className="admin-shell admin-dashboard-shell"><header className="admin-topbar"><Link className="brand" to="/"><span className="brand-mark">SC</span><span>Portfolio<span className="muted">.admin</span></span></Link><div className="admin-user"><span>{session.user.email}</span><button className="button button-secondary small-button" onClick={logout}><LogOut size={15}/> Sign out</button></div></header>
    <main className="admin-dashboard"><div className="dashboard-title"><div><span className="section-kicker">PORTFOLIO MANAGEMENT</span><h1><LayoutDashboard size={27}/> Projects dashboard</h1><p>Add and maintain the projects shown on your public portfolio.</p></div><Link className="button button-secondary" to="/">View portfolio <ExternalLink size={15}/></Link></div>
      {message.text&&<div className={`form-status ${message.type}`}>{message.text}</div>}
      <div className="admin-content-grid">
        <section className="admin-editor"><div className="editor-heading"><div><h2>{editingId?'Edit project':'Add a project'}</h2><p>Fields marked * are required.</p></div>{editingId&&<button className="text-button" onClick={resetForm}>Cancel edit</button>}</div>
          <form onSubmit={save} className="editor-form">
            <label>Project title *<input name="title" value={form.title} onChange={change} required maxLength={150} placeholder="e.g. Real-Time Chat App"/></label>
            <label>Slug (optional)<input name="slug" value={form.slug} onChange={change} maxLength={170} placeholder="real-time-chat-app"/></label>
            <label>Description *<textarea name="description" value={form.description} onChange={change} required maxLength={3000} rows={4} placeholder="What does the project do?"/></label>
            <label>Tech stack (comma separated)<input name="tech_stack" value={form.tech_stack} onChange={change} placeholder="React, Node.js, PostgreSQL"/></label>
            <label>Image URL<input name="image_url" type="url" value={form.image_url} onChange={change} placeholder="https://example.com/project.png"/></label>
            <label>GitHub URL<input name="github_url" type="url" value={form.github_url} onChange={change} placeholder="https://github.com/username/repo"/></label>
            <label>Live demo URL<input name="live_url" type="url" value={form.live_url} onChange={change} placeholder="https://your-project.com"/></label>
            <label>Display order<input name="sort_order" type="number" value={form.sort_order} onChange={change} min="0" max="9999"/></label>
            <label className="checkbox-label"><input type="checkbox" name="featured" checked={form.featured} onChange={change}/> Mark as featured project</label>
            <button className="button button-primary submit-button" disabled={saving}>{saving?'Saving…':editingId?'Update project':'Add project'} <Plus size={16}/></button>
          </form>
        </section>
        <section className="admin-projects"><div className="editor-heading"><div><h2>Your projects</h2><p>{projects.length} project{projects.length===1?'':'s'} in Supabase</p></div></div>
          {loading?<div className="loading-state"><LoaderCircle className="spin"/> Loading…</div>:projects.length===0?<div className="empty-state">No projects yet. Add one using the form.</div>:<div className="admin-project-list">{projects.map(p=><article className="admin-project-row" key={p.id}><div className="admin-project-info"><b>{p.title}</b><span>{(p.tech_stack||[]).slice(0,4).join(' · ')}</span>{p.featured&&<small>★ Featured</small>}</div><div className="admin-row-actions"><button aria-label={`Edit ${p.title}`} title="Edit" onClick={()=>startEdit(p)}><Pencil size={16}/></button><button className="delete-action" aria-label={`Delete ${p.title}`} title="Delete" onClick={()=>remove(p)}><Trash2 size={16}/></button></div></article>)}</div>}
        </section>
      </div>
      <div className="security-note"><LockKeyhole size={17}/><p><b>Security:</b> This panel uses Supabase Auth. Database policies must grant write access only to your authenticated admin account. Never place a service-role key in browser code.</p></div>
    </main>
  </div>;
}

function AdminRoute() {
  const {session,loading}=useSession();
  if(!supabase) return <div className="admin-shell"><div className="admin-card"><MissingSupabase/><Link className="back-link" to="/">← Back to portfolio</Link></div></div>;
  if(loading) return <div className="admin-shell"><div className="loading-state"><LoaderCircle className="spin"/> Checking session…</div></div>;
  return session ? <AdminDashboard session={session}/> : <AdminLogin onLogin={()=>{}}/>;
}

export default function App() {
  return <Routes><Route path="/" element={<PublicPortfolio/>}/><Route path="/admin" element={<AdminRoute/>}/><Route path="*" element={<PublicPortfolio/>}/></Routes>;
}