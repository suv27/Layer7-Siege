'use client'

import { useState } from 'react'
import { Activity, Bot, Shield, Target, Trophy, Zap } from 'lucide-react'

const threatPaths = [
  { left: '12%', top: '28%', x: '44%', y: '44%', delay: '0s' },
  { left: '82%', top: '20%', x: '57%', y: '39%', delay: '0.9s' },
  { left: '18%', top: '74%', x: '42%', y: '55%', delay: '1.7s' },
  { left: '88%', top: '68%', x: '61%', y: '54%', delay: '2.5s' },
  { left: '50%', top: '8%', x: '50%', y: '42%', delay: '3.2s' },
]

export default function Home() {
  const [sensitivity, setSensitivity] = useState(72)

  return (
    <main className="home-shell">
      <div className="home-grid" aria-hidden="true" />
      <div className="home-container">
        <header className="hero-header">
          <div className="brand-mark"><Shield size={22} strokeWidth={2.5} /></div>
          <div>
            <p className="eyebrow">GLOBAL THREAT SIMULATION CENTER</p>
            <h1>Layer7 Siege</h1>
          </div>
          <div className="header-status"><span className="status-dot" /> Network online</div>
        </header>

        <section className="hero-intro">
          <p className="hero-kicker">DEFEND THE APPLICATION LAYER</p>
          <h2>Master Layer 7 Security through Interactive, Gamified Simulation</h2>
          <p className="hero-copy">Build sharper instincts against real attack patterns, tune your WAF, and watch every decision change the battlefield.</p>
          <div className="hero-actions">
            <a className="primary-action" href="/scenarios">Enter the simulation <span>↗</span></a>
            <a className="secondary-action" href="#pillars">Explore the defense stack</a>
          </div>
        </section>

        <section className="threat-center" aria-label="Global threat simulation preview">
          <div className="threat-map">
            <div className="map-label map-label-top">LIVE GLOBAL TELEMETRY <span>●</span></div>
            <div className="map-coordinate">38.8977° N&nbsp;&nbsp; 77.0365° W</div>
            <div className="map-grid-lines" aria-hidden="true" />
            <div className="map-land land-one" aria-hidden="true" />
            <div className="map-land land-two" aria-hidden="true" />
            <div className="map-land land-three" aria-hidden="true" />
            {threatPaths.map((path, index) => (
              <span key={index} className="threat-path" style={{ left: path.left, top: path.top, '--target-x': path.x, '--target-y': path.y, animationDelay: path.delay } as React.CSSProperties} />
            ))}
            <div className="defense-core"><Shield size={42} /><span>WAF<br /><b>ACTIVE</b></span></div>
            <div className="map-label map-label-bottom"><Activity size={14} /> 1,284 requests/sec <span className="red-text">· 18 threats intercepted</span></div>
          </div>
          <aside className="center-panel">
            <div className="panel-heading"><span>DEFENSE PERIMETER</span><strong>LIVE</strong></div>
            <p className="panel-title">Cloud Network / WAF</p>
            <div className="panel-stat"><span>Global rank</span><strong>#130</strong></div>
            <div className="panel-stat"><span>XP to next badge</span><strong>7,420 <small>/ 10,000</small></strong></div>
            <div className="progress-track"><span style={{ width: '74%' }} /></div>
            <label className="slider-label" htmlFor="waf-sensitivity"><span>WAF sensitivity</span><b>{sensitivity}%</b></label>
            <input id="waf-sensitivity" type="range" min="0" max="100" value={sensitivity} onChange={(event) => setSensitivity(Number(event.target.value))} />
            <div className="panel-footer"><span className="status-dot" /> Shield integrity nominal</div>
          </aside>
        </section>

        <section id="pillars" className="pillars-section">
          <div className="section-heading"><div><p className="eyebrow">YOUR DEFENSE STACK</p><h2>Train for the traffic that matters.</h2></div><span className="live-chip"><span className="status-dot" /> 4 modules online</span></div>
          <div className="pillar-grid">
            <FeatureCard icon={<Target />} number="01" title="OWASP Top 10" description="Detect SQLi, XSS, and API abuse before they reach the application." tone="cyan" />
            <FeatureCard icon={<Bot />} number="02" title="Bot Mitigation" description="Separate human behavior from headless browsers and scraping tools." tone="lime" />
            <FeatureCard icon={<Zap />} number="03" title="DDoS Protection" description="Tune rate limits and burst controls against traffic surges." tone="orange" />
            <FeatureCard icon={<Trophy />} number="04" title="Gamification" description="Earn XP, climb the ranks, and turn every defense into progress." tone="violet" />
          </div>
        </section>

        <section className="challenge-banner">
          <div><p className="eyebrow red-text">DAILY THREAT BRIEFING · 09:41 UTC</p><h2>Critical Patch Day: Defend against a zero-day SQLi exploit</h2><p>New payload signatures detected across the perimeter. Can your rules hold?</p></div>
          <a className="challenge-action" href="/scenarios">Play Scenario <span>↗</span></a>
        </section>

        <footer className="tech-footer"><p className="eyebrow">BUILT FOR THE MODERN SECURITY ENGINEER</p><div className="tech-pills"><TechBadge name="Next.js 14" /><TechBadge name="TypeScript" /><TechBadge name="TailwindCSS" /><TechBadge name="Fastify" /><TechBadge name="Node.js" /></div></footer>
      </div>
    </main>
  )
}

function FeatureCard({ icon, number, title, description, tone }: { icon: React.ReactNode; number: string; title: string; description: string; tone: string }) {
  return <article className={`pillar-card pillar-${tone}`}><div className="pillar-top"><span className="pillar-icon">{icon}</span><span className="pillar-number">{number}</span></div><h3>{title}</h3><p>{description}</p><div className="pillar-state"><span className="status-dot" /> Training module online <span>↗</span></div></article>
}

function TechBadge({ name }: { name: string }) {
  return <span className="tech-pill">{name}</span>
}
