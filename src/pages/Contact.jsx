import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Mail, MapPin } from 'lucide-react'

const LinkedinIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const Contact = () => {
  return (
    <>
      <Helmet>
        <title>Contact | Prince Parfait GANZA</title>
        <meta name="description" content="Start a conversation about strategic partnerships, consulting, or speaking opportunities." />
      </Helmet>
      
      <section className="section section-bg-alt" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center' }}>
            <div>
              <span className="section-subtitle"><span style={{width:'30px', height:'2px', background:'var(--accent-color)'}}></span> Let's Talk</span>
              <h1 className="mb-sm">Initiate a <span className="gradient-text">Conversation</span></h1>
              <p className="mb-lg">
                Whether you are navigating digital modernization, structuring research operations, or scaling an enterprise, I am available for strategic partnerships and consulting.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="card-icon" style={{ marginBottom: 0, width: '50px', height: '50px' }}><Mail size={24} /></div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: 0 }}>Email</h3>
                    <p className="mb-0 text-secondary-color">contact@princeparfait.com</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="card-icon" style={{ marginBottom: 0, width: '50px', height: '50px' }}><LinkedinIcon size={24} /></div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: 0 }}>LinkedIn</h3>
                    <p className="mb-0 text-secondary-color">linkedin.com/in/princeparfait</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="card-icon" style={{ marginBottom: 0, width: '50px', height: '50px' }}><MapPin size={24} /></div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: 0 }}>Location</h3>
                    <p className="mb-0 text-secondary-color">Kigali, Rwanda & Remote</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '3rem' }}>
              <h2 className="mb-md" style={{ fontSize: '2rem' }}>Send an Inquiry</h2>
              <form>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Name</label>
                  <input type="text" style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} placeholder="Jane Doe" />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Organization</label>
                  <input type="text" style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} placeholder="Company Ltd" />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Inquiry Type</label>
                  <select style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#fff' }}>
                    <option>Strategic Partnership</option>
                    <option>High-Level Consulting</option>
                    <option>Collaborations</option>
                    <option>Speaking & Training</option>
                  </select>
                </div>
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Message</label>
                  <textarea rows="4" style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} placeholder="How can we partner?"></textarea>
                </div>
                <button type="button" className="btn" style={{ width: '100%' }}>Submit Inquiry</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Contact
