import React from 'react'
import { Helmet } from 'react-helmet-async'

const Projects = () => {
  return (
    <>
      <Helmet>
        <title>Projects & Case Studies | Prince Parfait GANZA</title>
        <meta name="description" content="A comprehensive case-study collection detailing strategic approaches and business results." />
      </Helmet>
      
      <section className="section">
        <div className="container">
          <span className="section-subtitle"><span style={{width:'30px', height:'2px', background:'var(--accent-color)'}}></span> Case Studies</span>
          <h1 className="mb-md">Selected <span className="gradient-text">Work</span></h1>
          
          <div className="grid-2">
            {/* Case Study 1 */}
            <div className="card" style={{ padding: 0 }}>
              <div className="dummy-img" style={{ height: '300px', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>[ APN Marketplace Screenshot ]</div>
              <div style={{ padding: '2rem' }}>
                <h2 className="mb-xs" style={{ fontSize: '1.75rem' }}>APN African Marketplace</h2>
                <p className="text-secondary-color mb-sm">E-commerce Architecture</p>
                <p><strong>Context:</strong> An international e-commerce marketplace serving customers in the US while promoting African products.</p>
                <p><strong>Solution:</strong> Built the digital platform, established digital visibility, and contributed to customer acquisition infrastructure.</p>
                <button className="btn btn-secondary mt-sm">Read Full Case Study</button>
              </div>
            </div>

            {/* Case Study 2 */}
            <div className="card" style={{ padding: 0 }}>
              <div className="dummy-img" style={{ height: '300px', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>[ Inventory System Screenshot ]</div>
              <div style={{ padding: '2rem' }}>
                <h2 className="mb-xs" style={{ fontSize: '1.75rem' }}>Inventory Management System</h2>
                <p className="text-secondary-color mb-sm">Operational Visibility</p>
                <p><strong>Context:</strong> A legacy system causing bottlenecks in tracking and reporting.</p>
                <p><strong>Solution:</strong> Architected a streamlined digital system for accurate reporting and real-time operational visibility.</p>
                <button className="btn btn-secondary mt-sm">Read Full Case Study</button>
              </div>
            </div>
            
            {/* Case Study 3 */}
            <div className="card" style={{ padding: 0 }}>
              <div className="dummy-img" style={{ height: '300px', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>[ CRNIS System Screenshot ]</div>
              <div style={{ padding: '2rem' }}>
                <h2 className="mb-xs" style={{ fontSize: '1.75rem' }}>CRNIS</h2>
                <p className="text-secondary-color mb-sm">Data & Analytics</p>
                <p><strong>Context:</strong> Fragmented research operations requiring standardization.</p>
                <p><strong>Solution:</strong> Developed a centralized monitoring and evaluation framework to generate actionable intelligence.</p>
                <button className="btn btn-secondary mt-sm">Read Full Case Study</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Projects
