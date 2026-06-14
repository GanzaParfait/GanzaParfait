import React from 'react'
import { Helmet } from 'react-helmet-async'

const Expertise = () => {
  return (
    <>
      <Helmet>
        <title>Expertise | Prince Parfait GANZA</title>
        <meta name="description" content="Knowledge domains and professional skills of Prince Parfait GANZA." />
      </Helmet>
      
      <section className="section section-bg-alt">
        <div className="container">
          <span className="section-subtitle"><span style={{width:'30px', height:'2px', background:'var(--accent-color)'}}></span> Knowledge & Expertise</span>
          <h1 className="mb-md">High-Level <span className="gradient-text">Domains</span></h1>
          
          <div className="grid-3 mb-lg">
            <div className="card">
              <h3>Organizational Transformation</h3>
              <p>Moving institutions from fragmented legacy processes to efficient digital systems.</p>
            </div>
            <div className="card">
              <h3>Business Operations</h3>
              <p>Structuring workflows to maximize output and reduce operational friction.</p>
            </div>
            <div className="card">
              <h3>Digital Strategy</h3>
              <p>Creating robust foundations for rapid market expansion and digital presence.</p>
            </div>
            <div className="card">
              <h3>Data & Analytics</h3>
              <p>Structuring data collection and monitoring frameworks for actionable intelligence.</p>
            </div>
            <div className="card">
              <h3>Leadership</h3>
              <p>Developing people, teams, and long-term organizational capabilities.</p>
            </div>
            <div className="card">
              <h3>Entrepreneurship</h3>
              <p>Transforming raw business concepts into operational realities.</p>
            </div>
          </div>

          <h2 className="mb-md">Professional Skills Matrix</h2>
          <div className="grid-4">
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}><p className="mb-0 font-weight-bold" style={{ fontWeight: 600 }}>Strategic Planning</p></div>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}><p className="mb-0 font-weight-bold" style={{ fontWeight: 600 }}>Project Leadership</p></div>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}><p className="mb-0 font-weight-bold" style={{ fontWeight: 600 }}>Stakeholder Engagement</p></div>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}><p className="mb-0 font-weight-bold" style={{ fontWeight: 600 }}>Solution Design</p></div>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}><p className="mb-0 font-weight-bold" style={{ fontWeight: 600 }}>Business Analysis</p></div>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}><p className="mb-0 font-weight-bold" style={{ fontWeight: 600 }}>Process Mapping</p></div>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}><p className="mb-0 font-weight-bold" style={{ fontWeight: 600 }}>Technical Training</p></div>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}><p className="mb-0 font-weight-bold" style={{ fontWeight: 600 }}>Digital Transformation</p></div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Expertise
