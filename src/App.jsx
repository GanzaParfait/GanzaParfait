import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'

// Pages
import Home from './pages/Home'
import About from './pages/About'
import Impact from './pages/Impact'
import Experience from './pages/Experience'
import Projects from './pages/Projects'
import Expertise from './pages/Expertise'
import Evidence from './pages/Evidence'
import Contact from './pages/Contact'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="impact" element={<Impact />} />
        <Route path="experience" element={<Experience />} />
        <Route path="projects" element={<Projects />} />
        <Route path="expertise" element={<Expertise />} />
        <Route path="evidence" element={<Evidence />} />
        <Route path="contact" element={<Contact />} />
      </Route>
    </Routes>
  )
}

export default App
