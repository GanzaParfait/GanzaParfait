import React from 'react'
import { Helmet } from 'react-helmet-async'

const Impact = () => {
  return (
    <>
      <Helmet>
        <title>Impact | Prince Parfait GANZA</title>
        <meta name="description" content="The proof of value. Measurable outcomes delivered by Prince Parfait GANZA." />
      </Helmet>
      
      <section className="section">
        <div className="container">
          <span className="section-subtitle"><span style={{width:'30px', height:'2px', background:'var(--accent-color)'}}></span> Proof of Value</span>
          <h1 className="mb-md">Measurable <span className="gradient-text">Outcomes</span></h1>
          
          <div className="grid-3 mb-lg">
            <div className="card text-center">
              <h2 className="gradient-text" style={{ fontSize: '3.5rem', marginBottom: 0 }}>80+</h2>
              <p className="text-secondary-color">Students Trained</p>
            </div>
            <div className="card text-center">
              <h2 className="gradient-text" style={{ fontSize: '3.5rem', marginBottom: 0 }}>4+</h2>
              <p className="text-secondary-color">Organizations Served</p>
            </div>
            <div className="card text-center">
              <h2 className="gradient-text" style={{ fontSize: '3.5rem', marginBottom: 0 }}>10+</h2>
              <p className="text-secondary-color">Systems Delivered</p>
            </div>
          </div>

          <h2 className="mb-md">Organizations Served</h2>
          <div className="grid-2">
            <div className="card">
              <h3>Lerony Co. Ltd</h3>
              <p>Organizational modernization and strategic leadership.</p>
            </div>
            <div className="card">
              <h3>Caritas Rwanda</h3>
              <p>Process optimization and operational transformation.</p>
            </div>
            <div className="card">
              <h3>Ethical Research Solutions</h3>
              <p>Data analytics and research operations structuring.</p>
            </div>
            <div className="card">
              <h3>APN African Marketplace</h3>
              <p>E-Commerce platform architecture and international expansion.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Impact
