import React from 'react'
import { Helmet } from 'react-helmet-async'

const Experience = () => {
  return (
    <>
      <Helmet>
        <title>Experience | Prince Parfait GANZA</title>
        <meta name="description" content="A curated timeline highlighting leadership and execution." />
      </Helmet>
      
      <section className="section section-bg-alt">
        <div className="container">
          <span className="section-subtitle"><span style={{width:'30px', height:'2px', background:'var(--accent-color)'}}></span> Professional Journey</span>
          <h1 className="mb-md">A Track Record of <span className="gradient-text">Leadership</span></h1>
          
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card mb-md" style={{ borderLeft: '4px solid var(--accent-color)' }}>
              <span className="text-secondary-color" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Present</span>
              <h2 className="mb-xs">Founder & Strategist</h2>
              <h3 className="mb-sm text-accent">Lerony Co. Ltd</h3>
              <p><strong>Challenge:</strong> Building scalable foundations for expansion.</p>
              <p><strong>Contribution:</strong> Led the entire organizational strategy, product development, and operational structure.</p>
              <p><strong>Outcome:</strong> Established a growing brand with robust internal systems.</p>
            </div>

            <div className="card mb-md" style={{ borderLeft: '4px solid var(--accent-color)' }}>
              <span className="text-secondary-color" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Recent</span>
              <h2 className="mb-xs">Transformation Consultant</h2>
              <h3 className="mb-sm text-accent">Ethical Research Solutions & Caritas Rwanda</h3>
              <p><strong>Challenge:</strong> Fragmented processes and data collection bottlenecks.</p>
              <p><strong>Contribution:</strong> Architected research operations frameworks and optimized data pipelines.</p>
              <p><strong>Outcome:</strong> Dramatically improved reporting tracking and high-level decision-making capabilities.</p>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--accent-color)' }}>
              <span className="text-secondary-color" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Key Initiative</span>
              <h2 className="mb-xs">Platform Architect</h2>
              <h3 className="mb-sm text-accent">APN African Marketplace</h3>
              <p><strong>Challenge:</strong> Transforming a raw business concept into a fully operational international online marketplace.</p>
              <p><strong>Contribution:</strong> Built and launched the digital platform, supported brand development.</p>
              <p><strong>Outcome:</strong> Active online presence, global customer reach, and operational digital storefront.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Experience
