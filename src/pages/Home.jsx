import React from 'react'
import { Helmet } from 'react-helmet-async'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Home | Prince Parfait GANZA - Systems Strategist</title>
        <meta name="description" content="Prince Parfait GANZA helps organizations improve performance and unlock growth through strategy, execution, and technology." />
      </Helmet>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-shape"></div>
        <div className="container animate-up">
          <div style={{ maxWidth: '800px' }}>
            <span className="section-subtitle"><span style={{width:'30px', height:'2px', background:'var(--accent-color)'}}></span> Systems Strategist</span>
            <h1 className="mb-sm">Architecting <span className="gradient-text">systems.</span><br />Unlocking growth.</h1>
            <p className="mb-md" style={{ fontSize: '1.25rem', maxWidth: '600px' }}>
              Do you have an organizational challenge? I help institutions improve performance and establish operational visibility.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/contact" className="btn">Let's Talk <ArrowRight size={20} /></Link>
              <Link to="/projects" className="btn btn-secondary">View Impact</Link>
            </div>
            
            <div style={{ marginTop: '4rem', display: 'flex', gap: '3rem' }}>
              <div>
                <h3 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: 0 }}>10+</h3>
                <p className="text-secondary-color">Systems Built</p>
              </div>
              <div>
                <h3 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: 0 }}>4</h3>
                <p className="text-secondary-color">Key Organizations</p>
              </div>
              <div>
                <h3 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: 0 }}>100%</h3>
                <p className="text-secondary-color">Execution Focus</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section section-bg-alt">
        <div className="container grid-2">
          <div className="animate-up delay-100">
            <div className="dummy-img" style={{ height: '100%', minHeight: '400px' }}>
              [ Professional Portrait Image ]
            </div>
          </div>
          <div className="animate-up delay-200" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span className="section-subtitle"><span style={{width:'30px', height:'2px', background:'var(--accent-color)'}}></span> About Me</span>
            <h2>Beyond mere development. <span className="gradient-text">Driving outcomes.</span></h2>
            <p>
              I am a Founder, Strategist, Consultant, and Problem Solver. My work bridges the critical gap between executive vision and operational reality.
            </p>
            <p className="mb-md">
              Technology is simply the evidence of my ability to solve complex organizational challenges. My focus remains steadfast on modernization, operational visibility, and capacity building.
            </p>
            <div>
               <Link to="/about" className="btn">More About Me</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services/Expertise */}
      <section className="section">
        <div className="container animate-up delay-100">
          <span className="section-subtitle"><span style={{width:'30px', height:'2px', background:'var(--accent-color)'}}></span> Knowledge Domains</span>
          <h2 className="mb-lg">Strategic <span className="gradient-text">Capabilities</span></h2>
          
          <div className="grid-3">
            <div className="card">
              <div className="card-icon"><CheckCircle2 size={30} /></div>
              <h3>Organizational Transformation</h3>
              <p>Helping institutions move from fragmented legacy processes to streamlined, efficient digital systems.</p>
              <Link to="/expertise" className="text-accent" style={{ fontWeight: 600 }}>Explore &rarr;</Link>
            </div>
            <div className="card">
              <div className="card-icon"><CheckCircle2 size={30} /></div>
              <h3>Operational Visibility</h3>
              <p>Improving reporting, tracking, and high-level decision-making capabilities through robust data architecture.</p>
              <Link to="/expertise" className="text-accent" style={{ fontWeight: 600 }}>Explore &rarr;</Link>
            </div>
            <div className="card">
              <div className="card-icon"><CheckCircle2 size={30} /></div>
              <h3>Digital Strategy & Growth</h3>
              <p>Supporting ambitious organizations in creating scalable, robust foundations for rapid market expansion.</p>
              <Link to="/expertise" className="text-accent" style={{ fontWeight: 600 }}>Explore &rarr;</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="section section-bg-alt">
        <div className="container animate-up delay-100">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
            <div>
               <span className="section-subtitle"><span style={{width:'30px', height:'2px', background:'var(--accent-color)'}}></span> Execution Evidence</span>
               <h2 style={{ marginBottom: 0 }}>Selected <span className="gradient-text">Impact</span></h2>
            </div>
            <Link to="/projects" className="btn btn-secondary">View All Projects</Link>
          </div>
          
          <div className="grid-2">
            <Link to="/projects" className="project-card">
              <div className="dummy-img" style={{ height: '400px' }}>[ Project Image 1 ]</div>
              <div className="project-overlay">
                <h3>APN African Marketplace</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 0 }}>Platform Architecture & Strategy</p>
              </div>
            </Link>
            <Link to="/projects" className="project-card">
              <div className="dummy-img" style={{ height: '400px' }}>[ Project Image 2 ]</div>
              <div className="project-overlay">
                <h3>Caritas Rwanda</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 0 }}>Process Optimization</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
