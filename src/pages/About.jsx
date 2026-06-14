import React from 'react'
import { Helmet } from 'react-helmet-async'

const About = () => {
  return (
    <>
      <Helmet>
        <title>About | Prince Parfait GANZA</title>
        <meta name="description" content="Learn more about Prince Parfait GANZA's story, journey, and principles." />
      </Helmet>
      
      <section className="section section-bg-alt">
        <div className="container">
          <span className="section-subtitle"><span style={{width:'30px', height:'2px', background:'var(--accent-color)'}}></span> My Story</span>
          <h1 className="mb-md">The Person Behind <span className="gradient-text">the Impact</span></h1>
          
          <div className="grid-2">
            <div className="dummy-img" style={{ height: '500px' }}>[ About Image ]</div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 className="mb-sm">A unique intersection of skills</h2>
              <p>I help organizations improve performance, strengthen operations, and unlock growth by combining strategy, execution, technology, data, and people development.</p>
              <p>I have successfully operated across critical intersections that are rarely found together: Technology, Research, Data, Operations, Training, Entrepreneurship, and Organizational transformation.</p>
              
              <h3 className="mt-md mb-sm" style={{ marginTop: '2rem' }}>Core Principles</h3>
              <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '0.5rem' }}><strong>Execution Over Theory:</strong> Strategy is meaningless without the capability to implement.</li>
                <li style={{ marginBottom: '0.5rem' }}><strong>Systems Thinking:</strong> Fixing an isolated problem is less valuable than optimizing the whole.</li>
                <li><strong>Empowering People:</strong> True capacity building ensures teams can sustain growth independently.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default About
