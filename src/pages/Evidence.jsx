import React from 'react'
import { Helmet } from 'react-helmet-async'

const Evidence = () => {
  return (
    <>
      <Helmet>
        <title>Evidence Library | Prince Parfait GANZA</title>
        <meta name="description" content="The definitive proof library that substantiates all claims." />
      </Helmet>
      
      <section className="section">
        <div className="container">
          <span className="section-subtitle"><span style={{width:'30px', height:'2px', background:'var(--accent-color)'}}></span> Credibility</span>
          <h1 className="mb-md">The Evidence <span className="gradient-text">Library</span></h1>
          
          <p className="mb-lg" style={{ maxWidth: '700px' }}>
            A curated grid providing undeniable proof of competence. This library documents production systems, leadership initiatives, and professional endorsements.
          </p>

          <h2 className="mb-md">Systems & Interfaces</h2>
          <div className="grid-3 mb-lg">
            <div className="dummy-img" style={{ height: '250px' }}>[ APN Marketplace UI ]</div>
            <div className="dummy-img" style={{ height: '250px' }}>[ Inventory System UI ]</div>
            <div className="dummy-img" style={{ height: '250px' }}>[ CRNIS System UI ]</div>
          </div>

          <h2 className="mb-md">Leadership & Training</h2>
          <div className="grid-3 mb-lg">
            <div className="dummy-img" style={{ height: '250px' }}>[ Workshop Photo 1 ]</div>
            <div className="dummy-img" style={{ height: '250px' }}>[ Workshop Photo 2 ]</div>
            <div className="dummy-img" style={{ height: '250px' }}>[ Mentorship Session ]</div>
          </div>

          <h2 className="mb-md">Endorsements</h2>
          <div className="grid-2">
            <div className="card">
              <p className="mb-sm" style={{ fontStyle: 'italic' }}>"Prince didn't simply build a website, he architected a complete business presence serving customers internationally."</p>
              <h3 className="mb-0" style={{ fontSize: '1.25rem' }}>Executive Sponsor</h3>
              <p className="text-secondary-color" style={{ fontSize: '0.9rem' }}>APN African Marketplace</p>
            </div>
            <div className="card">
              <p className="mb-sm" style={{ fontStyle: 'italic' }}>"His systems thinking fundamentally changed how we handle data and reporting."</p>
              <h3 className="mb-0" style={{ fontSize: '1.25rem' }}>Director</h3>
              <p className="text-secondary-color" style={{ fontSize: '0.9rem' }}>Caritas Rwanda</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Evidence
