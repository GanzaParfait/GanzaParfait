import React from 'react';
import './App.css';

function App() {
  return (
    <>
      {/* 1. Navigation */}
      <nav className="container">
        <div className="navbar">
          <div className="nav-brand">Prince Parfait GANZA</div>
          <div className="nav-links">
            <a href="#about" className="nav-link">About</a>
            <a href="#impact" className="nav-link">Impact</a>
            <a href="#expertise" className="nav-link">Expertise</a>
            <a href="#projects" className="nav-link">Projects</a>
            <a href="#contact" className="nav-link btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Contact</a>
          </div>
        </div>
      </nav>

      {/* 2. Hero */}
      <header className="container hero animate-fade-in">
        <div className="hero-content">
          <span className="tag">Systems Strategist & Founder</span>
          <h1 className="mb-2">Architecting systems. <br />Unlocking organizational growth.</h1>
          <p className="text-large mb-3">
            I help ambitious organizations improve performance, strengthen core operations, and unlock sustainable growth through a unique combination of strategic planning, focused execution, technology integration, data-driven insights, and people development.
          </p>
          <div className="button-group">
            <a href="#projects" className="btn">View Case Studies</a>
            <a href="#contact" className="btn btn-secondary">Discuss a Collaboration</a>
          </div>
        </div>
      </header>

      {/* 3. Executive Introduction */}
      <section id="about" className="section section-bg-alt">
        <div className="container grid-2 animate-fade-in delay-100">
          <div>
            <h2 className="mb-2">Beyond mere development. Driving measurable business outcomes.</h2>
          </div>
          <div>
            <p>
              I am a Founder, Strategist, Consultant, and Problem Solver. My work bridges the critical gap between executive vision and operational reality.
            </p>
            <p>
              While I possess deep technical capabilities, technology is simply the evidence of my ability to solve complex organizational challenges. My focus remains steadfast on modernization, operational visibility, and capacity building.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Selected Organizations & Initiatives */}
      <section className="section">
        <div className="container animate-fade-in delay-200">
          <h3 className="text-center mb-3 text-accent" style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1rem' }}>Trusted by Ambitious Organizations</h3>
          <div className="grid-3" style={{ opacity: 0.7, alignItems: 'center', textAlign: 'center' }}>
            {/* Professional placeholders for logos */}
            <div><h3 className="mb-0 font-light">Lerony Co. Ltd</h3></div>
            <div><h3 className="mb-0 font-light">Caritas Rwanda</h3></div>
            <div><h3 className="mb-0 font-light">Ethical Research Solutions</h3></div>
            <div><h3 className="mb-0 font-light">APN Marketplace</h3></div>
          </div>
        </div>
      </section>

      {/* 5. Areas of Expertise */}
      <section id="expertise" className="section section-bg-alt">
        <div className="container animate-fade-in delay-100">
          <span className="tag">Knowledge Domains</span>
          <h2 className="mb-3">Strategic Capabilities</h2>
          
          <div className="grid-3">
            <div className="card">
              <h3 className="mb-1">Organizational Transformation</h3>
              <p>Helping institutions move from fragmented legacy processes to streamlined, efficient digital systems.</p>
            </div>
            <div className="card">
              <h3 className="mb-1">Operational Visibility & Data</h3>
              <p>Dramatically improving reporting, tracking, and high-level decision-making capabilities through robust data architecture.</p>
            </div>
            <div className="card">
              <h3 className="mb-1">Digital Strategy & Growth</h3>
              <p>Supporting ambitious organizations in creating scalable, robust foundations for rapid market expansion.</p>
            </div>
            <div className="card">
              <h3 className="mb-1">Research Operations</h3>
              <p>Structuring and optimizing data collection and monitoring frameworks to generate actionable intelligence.</p>
            </div>
            <div className="card">
              <h3 className="mb-1">Capacity Building</h3>
              <p>Systematically developing people, teams, and long-term organizational capabilities through targeted technical training.</p>
            </div>
            <div className="card">
              <h3 className="mb-1">E-Commerce Architecture</h3>
              <p>Establishing highly credible, effective online visibility and complex multi-vendor operational infrastructure.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Featured Impact & Case Studies */}
      <section id="projects" className="section">
        <div className="container animate-fade-in delay-200">
          <span className="tag">Execution Evidence</span>
          <h2 className="mb-3">Selected Impact</h2>

          <div className="card mb-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', padding: '0', overflow: 'hidden' }}>
            <div style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <span style={{ color: 'var(--text-secondary)' }}>[ High-Resolution System UI Screenshot ]</span>
            </div>
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 className="mb-1">APN African Marketplace</h3>
              <p><strong>Challenge:</strong> Transforming a raw business concept into a fully operational international online marketplace.</p>
              <p><strong>Contribution:</strong> Architected the robust digital platform, established comprehensive digital visibility, and built the customer acquisition infrastructure.</p>
              <p className="mb-2"><strong>Outcome:</strong> Achieved an active global customer reach, strong search engine positioning, and a highly operational digital storefront.</p>
              <div>
                <a href="/projects/apn-marketplace" className="btn btn-secondary">Read Case Study</a>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 7. Professional Journey Timeline Preview */}
      <section className="section section-bg-alt">
        <div className="container text-center animate-fade-in delay-100">
          <h2 className="mb-2">A Track Record of Leadership</h2>
          <p className="mb-3" style={{ maxWidth: '600px', margin: '0 auto 3rem auto' }}>
             Operating across the critical intersections of technology, research, data, operations, and entrepreneurship.
          </p>
          <div className="grid-3 text-left">
            <div className="card" style={{ borderLeft: '4px solid var(--accent-color)' }}>
              <p className="text-secondary mb-0" style={{ fontSize: '0.9rem' }}>Present</p>
              <h3 className="mb-0">Founder & Strategist</h3>
              <p>Lerony Co. Ltd</p>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--accent-color)' }}>
              <p className="text-secondary mb-0" style={{ fontSize: '0.9rem' }}>Recent</p>
              <h3 className="mb-0">Transformation Consultant</h3>
              <p>Ethical Research Solutions & Caritas Rwanda</p>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--accent-color)' }}>
              <p className="text-secondary mb-0" style={{ fontSize: '0.9rem' }}>Key Initiative</p>
              <h3 className="mb-0">Platform Architect</h3>
              <p>APN African Marketplace</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Principles & Philosophy */}
      <section className="section">
        <div className="container grid-2 animate-fade-in delay-200">
          <div>
            <h2 className="mb-2">Operating Principles</h2>
            <p>Every successful transformation is grounded in clear philosophy.</p>
          </div>
          <div>
            <div className="mb-2">
              <h3 className="mb-1">Execution Over Theory</h3>
              <p>Strategy is meaningless without the capability to implement. I build systems that actually work in the real world.</p>
            </div>
            <div className="mb-2">
              <h3 className="mb-1">Systems Thinking</h3>
              <p>Organizations are interconnected ecosystems. Fixing an isolated problem is less valuable than optimizing the whole.</p>
            </div>
            <div className="mb-2">
              <h3 className="mb-1">Empowering People</h3>
              <p>Technology is a tool; people are the engine. True capacity building ensures teams can sustain growth independently.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Evidence & Recognition Preview */}
      <section className="section section-bg-alt">
        <div className="container text-center animate-fade-in delay-100">
          <span className="tag">Credibility</span>
          <h2 className="mb-3">The Evidence Library</h2>
          <div className="grid-3 mb-3 text-left">
             <div className="card">
               <h3>Systems</h3>
               <p>Production interfaces, architecture models, and deployed infrastructure.</p>
             </div>
             <div className="card">
               <h3>Leadership</h3>
               <p>Documentation from training sessions, workshops, and team mentorship.</p>
             </div>
             <div className="card">
               <h3>Endorsements</h3>
               <p>Recommendation letters and testimonials from organizational leaders.</p>
             </div>
          </div>
          <a href="/evidence" className="btn btn-secondary">View Full Evidence Library</a>
        </div>
      </section>

      {/* 10. Future Vision & 11. Contact */}
      <section id="contact" className="section" style={{ backgroundColor: 'var(--accent-color)', color: '#fff' }}>
        <div className="container text-center animate-fade-in delay-200">
          <h2 className="mb-2" style={{ color: '#fff' }}>Ready to transform your operations?</h2>
          <p className="mb-3" style={{ color: 'var(--accent-light)', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
            Whether you are navigating digital modernization, structuring research operations, or scaling an enterprise, let's discuss how we can partner for measurable impact.
          </p>
          <div className="button-group" style={{ justifyContent: 'center' }}>
            <a href="mailto:contact@princeparfait.com" className="btn" style={{ backgroundColor: '#fff', color: 'var(--accent-color)' }}>Initiate a Conversation</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p className="mb-0" style={{ fontSize: '0.9rem' }}>
            &copy; {new Date().getFullYear()} Prince Parfait GANZA. All rights reserved. <br/>
            Strategic Identity • Execution Evidence
          </p>
        </div>
      </footer>
    </>
  );
}

export default App;
