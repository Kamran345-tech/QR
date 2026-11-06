"use client";

import { useMemo, useState } from "react";

type Beat = { id: string; beat: string; uc: string; tehsil: string; district: string; status: "Active" | "Inactive" };

export default function Home() {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState("Overview");
  const [form, setForm] = useState({ beat: "", uc: "", tehsil: "Arifwala", district: "Pakpattan" });
  const filtered = useMemo(() => beats.filter(b => [b.beat,b.uc,b.tehsil].join(" ").toLowerCase().includes(query.toLowerCase())), [beats, query]);
  function addBeat(e: React.FormEvent) {
    e.preventDefault();
    if (!form.beat.trim() || !form.uc.trim()) return;
    setBeats(old => [...old, { ...form, id: crypto.randomUUID(), status: "Active" }]);
    setForm({ beat: "", uc: "", tehsil: "Arifwala", district: "Pakpattan" });
    setShowForm(false);
    setTab("Beat Management");
  }
  const nav = ["Overview", "Beat Management", "QR Print Center", "Complaints", "Settings"];
  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brandmark">SP</div><div><strong>SUTHRA PUNJAB</strong><small>BEAT QR MANAGEMENT</small></div></div>
      <div><div className="navlabel">WORKSPACE</div>{nav.map((n,i)=><div key={n} className={"navitem "+(tab===n?"active":"")} onClick={()=>setTab(n)} role="button"><span className="navicon">{["▦","⌗","▣","☷","⚙"][i]}</span>{n}</div>)}</div>
      <div className="sidefoot">Sanitation Beat Management<br/>Tehsil Operations Portal<br/><b>Version 1.0 · Preview</b></div>
    </aside>
    <main className="main">
      <header className="topbar"><div><div className="eyebrow">SUTHRA PUNJAB / OPERATIONS</div><h1>{tab}</h1></div><div className="topright"><div className="pill">◷ &nbsp; Management workspace</div><div className="avatar">SP</div></div></header>
      {tab==="Overview" && <>
        <section className="welcome"><div><h2>Clean streets. Smarter beat management.</h2><p>Manage sanitation beats, generate unique QR codes and make team information and complaint registration accessible to citizens.</p></div><div className="welcomeTag">● &nbsp; Beat QR Portal</div></section>
        <section className="stats">
          {[["Total Beats",String(beats.length),"⌗"],["Active Beats",String(beats.filter(b=>b.status==="Active").length),"✓"],["Complaints","0","☷"],["QR Sheets","0","▣"]].map(([label,value,icon])=><div className="stat" key={label}><div className="stathead"><span>{label}</span><span className="staticon">{icon}</span></div><div className="statnum">{value}</div><div className="statnote">Current workspace records</div></div>)}
        </section>
        <section className="contentgrid"><div className="panel"><div className="panelhead"><h3>Beat directory</h3><button className="btn secondary" onClick={()=>setTab("Beat Management")}>View all beats →</button></div><div className="empty"><div className="emptyicon">⌗</div><h4>{beats.length?"Your beats are ready to manage":"No beat records added yet"}</h4><p>Add your official beat details to start creating unique QR codes. No sample beat data has been inserted.</p><button className="btn" onClick={()=>setShowForm(true)}>＋ Add first beat</button></div></div>
        <div className="panel"><div className="panelhead"><h3>Getting started</h3><span className="muted">Setup guide</span></div><div className="steps">{[["01","Add official beat records","Enter beat number, UC and tehsil details."],["02","Assign sanitation teams","Add worker, supervisor and vehicle information."],["03","Generate and print QR","Create a unique QR sheet for every beat."],["04","Publish public beat pages","Let citizens view teams and register complaints."]].map(s=><div className="step" key={s[0]}><div className="stepnum">{s[0]}</div><div><strong>{s[1]}</strong><span>{s[2]}</span></div></div>)}</div></div></section>
      </>}
      {tab==="Beat Management" && <section className="panel"><div className="panelhead"><div><h3>Sanitation beats</h3><div className="muted">Create and maintain official beat records</div></div><button className="btn" onClick={()=>setShowForm(true)}>＋ Add beat</button></div><input aria-label="Search beats" placeholder="Search beat number or UC..." value={query} onChange={e=>setQuery(e.target.value)} style={{width:"100%",padding:12,border:"1px solid #e5ebe5",borderRadius:9,marginBottom:14}}/>{filtered.length===0?<div className="empty"><div className="emptyicon">⌕</div><h4>No beats found</h4><p>Add official records to populate the beat directory. Real beat data will not be invented.</p></div>:<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr>{["Beat","UC","Tehsil","District","Status","Action"].map(h=><th key={h} style={{textAlign:"left",padding:12,color:"#748178",borderBottom:"1px solid #e5ebe5"}}>{h}</th>)}</tr></thead><tbody>{filtered.map(b=><tr key={b.id}>{[b.beat,b.uc,b.tehsil,b.district,b.status].map((v,i)=><td key={i} style={{padding:12,borderBottom:"1px solid #eef1ee"}}>{v}</td>)}<td><button className="btn secondary" onClick={()=>setBeats(old=>old.filter(x=>x.id!==b.id))}>Delete</button></td></tr>)}</tbody></table></div>}</section>}
      {tab==="QR Print Center" && <section className="panel"><div className="panelhead"><h3>QR print center</h3><span className="muted">Print-ready beat sheets</span></div><div className="empty"><div className="emptyicon">▣</div><h4>QR sheets will appear here</h4><p>Add beats first. Each sheet will include the official Suthra Punjab logo, centered QR, beat identity, bilingual scan instructions and helpline 1139. Original logo will be inserted from your sample.</p><button className="btn" onClick={()=>setTab("Beat Management")}>Go to beat management</button></div></section>}
      {tab==="Complaints" && <section className="panel"><h3>Public complaints</h3><div className="empty" style={{marginTop:16}}><div className="emptyicon">☷</div><h4>No complaints received</h4><p>Complaint submissions will be listed here after the public form and database are connected.</p></div></section>}
      {tab==="Settings" && <section className="panel"><h3>Portal configuration</h3><p className="muted">District and tehsil settings, admin access and database configuration will be managed here.</p><div className="pill" style={{display:"inline-block",marginTop:8}}>Current workspace: Tehsil Arifwala · District Pakpattan</div></section>}
      <div className="footer">Suthra Punjab Beat QR Management · Administrative preview · Official beat data pending</div>
    </main>
    {showForm && <div className="modalback" onClick={()=>setShowForm(false)}><form className="modal" onSubmit={addBeat} onClick={e=>e.stopPropagation()}><h3>Add sanitation beat</h3><p>Enter only verified details from the official beat notification.</p><div className="formgrid"><div className="field"><label>Beat Number *</label><input required value={form.beat} onChange={e=>setForm({...form,beat:e.target.value})} placeholder="e.g. Beat 01"/></div><div className="field"><label>Union Council *</label><input required value={form.uc} onChange={e=>setForm({...form,uc:e.target.value})} placeholder="e.g. UC 01"/></div><div className="field"><label>Tehsil</label><input value={form.tehsil} onChange={e=>setForm({...form,tehsil:e.target.value})}/></div><div className="field"><label>District</label><input value={form.district} onChange={e=>setForm({...form,district:e.target.value})}/></div></div><div className="modalactions"><button type="button" className="btn secondary" onClick={()=>setShowForm(false)}>Cancel</button><button type="submit" className="btn">Save beat</button></div></form></div>}
  </div>;
}
