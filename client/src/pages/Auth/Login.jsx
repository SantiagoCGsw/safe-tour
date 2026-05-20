import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUsuario } from '../../services/auth.service'
import { useAuth } from '../../context/AuthContext'

function StarCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.3, alpha: Math.random() * 0.7 + 0.3,
      speed: Math.random() * 0.008 + 0.002, phase: Math.random() * Math.PI * 2,
    }))
    const particles = Array.from({ length: 12 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 3 + 1.5, alpha: Math.random() * 0.5 + 0.2, trail: [],
    }))
    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 0.016
      stars.forEach((s) => {
        const a = s.alpha * (0.6 + 0.4 * Math.sin(t * s.speed * 60 + s.phase))
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill()
      })
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0
        p.trail.push({ x: p.x, y: p.y }); if (p.trail.length > 18) p.trail.shift()
        for (let i = 1; i < p.trail.length; i++) {
          const prog = i / p.trail.length
          ctx.beginPath(); ctx.moveTo(p.trail[i-1].x, p.trail[i-1].y); ctx.lineTo(p.trail[i].x, p.trail[i].y)
          ctx.strokeStyle = `rgba(100,180,255,${prog * p.alpha * 0.6})`; ctx.lineWidth = prog * p.size * 0.5; ctx.stroke()
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(160,210,255,${p.alpha})`; ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0 }} />
}

function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [focused, setFocused] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault(); setCargando(true); setError('')
    try {
      const { data } = await loginUsuario(form)
      login(data); navigate('/mapa')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión')
    } finally { setCargando(false) }
  }

  return (
    <div style={s.root}>
      <div style={s.bg} />
      <div style={s.nebula1} /><div style={s.nebula2} />
      <StarCanvas />
      <div style={s.card}>
        <div style={s.logoWrap}>
          <div style={s.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="#64b4ff" strokeWidth="1.5"/>
              <circle cx="14" cy="14" r="4" fill="#64b4ff"/>
              <line x1="14" y1="1" x2="14" y2="7" stroke="#64b4ff" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="14" y1="21" x2="14" y2="27" stroke="#64b4ff" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="1" y1="14" x2="7" y2="14" stroke="#64b4ff" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="21" y1="14" x2="27" y2="14" stroke="#64b4ff" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={s.titulo}>Safe Tour</h1>
        </div>
        <p style={s.subtitulo}>Explora Bogotá con seguridad</p>
        <form onSubmit={handleSubmit} style={s.form}>
          {[{ name:'email', type:'email', placeholder:'tu@correo.com', label:'Correo electrónico' },
            { name:'password', type:'password', placeholder:'••••••••', label:'Contraseña' }].map((f) => (
            <div key={f.name} style={s.fieldWrap}>
              <label style={s.label}>{f.label}</label>
              <input
                style={{ ...s.input, borderColor: focused===f.name ? '#64b4ff' : 'rgba(100,180,255,0.25)', boxShadow: focused===f.name ? '0 0 0 3px rgba(100,180,255,0.15)' : 'none' }}
                type={f.type} name={f.name} placeholder={f.placeholder}
                value={form[f.name]} onChange={handleChange}
                onFocus={() => setFocused(f.name)} onBlur={() => setFocused(null)} required
              />
            </div>
          ))}
          {error && <p style={s.error}>{error}</p>}
          <button style={s.boton} type="submit" disabled={cargando}>
            {cargando ? <span style={s.spinner}/> : 'Iniciar sesión'}
          </button>
        </form>
        <p style={s.linkTxt}>¿No tienes cuenta? <Link to="/register" style={s.link}>Regístrate</Link></p>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </div>
  )
}

const s = {
  root: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', fontFamily:"'Segoe UI', system-ui, sans-serif" },
  bg: { position:'fixed', inset:0, background:'linear-gradient(160deg,#020b18 0%,#051832 25%,#0a2448 50%,#071e3d 75%,#030d1c 100%)', zIndex:0 },
  nebula1: { position:'fixed', top:'-20%', left:'-10%', width:'60vw', height:'60vw', borderRadius:'50%', background:'radial-gradient(ellipse,rgba(20,80,180,0.18) 0%,transparent 70%)', zIndex:0, pointerEvents:'none' },
  nebula2: { position:'fixed', bottom:'-15%', right:'-10%', width:'50vw', height:'50vw', borderRadius:'50%', background:'radial-gradient(ellipse,rgba(10,50,140,0.15) 0%,transparent 70%)', zIndex:0, pointerEvents:'none' },
  card: { position:'relative', zIndex:10, width:'100%', maxWidth:'400px', margin:'1rem', padding:'2.5rem 2rem', borderRadius:'20px', background:'rgba(5,18,40,0.75)', backdropFilter:'blur(20px)', border:'1px solid rgba(100,180,255,0.18)', boxShadow:'0 8px 48px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.05)', animation:'fadeUp 0.6s ease both' },
  logoWrap: { display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', marginBottom:'6px' },
  logoIcon: { display:'flex', alignItems:'center', justifyContent:'center', width:'48px', height:'48px', borderRadius:'14px', background:'rgba(100,180,255,0.1)', border:'1px solid rgba(100,180,255,0.2)' },
  titulo: { margin:0, fontSize:'1.9rem', fontWeight:'700', color:'#e8f4ff', letterSpacing:'-0.5px' },
  subtitulo: { textAlign:'center', color:'rgba(160,200,255,0.6)', fontSize:'0.88rem', margin:'0 0 2rem', letterSpacing:'0.3px' },
  form: { display:'flex', flexDirection:'column', gap:'1.1rem' },
  fieldWrap: { display:'flex', flexDirection:'column', gap:'6px' },
  label: { fontSize:'0.8rem', fontWeight:'500', color:'rgba(160,200,255,0.75)', letterSpacing:'0.4px', textTransform:'uppercase' },
  input: { padding:'0.8rem 1rem', borderRadius:'10px', border:'1px solid', background:'rgba(10,30,70,0.6)', color:'#e8f4ff', fontSize:'0.95rem', outline:'none', transition:'border-color 0.2s,box-shadow 0.2s' },
  boton: { marginTop:'0.5rem', padding:'0.9rem', background:'linear-gradient(135deg,#1565c0,#0d47a1)', color:'#fff', border:'none', borderRadius:'10px', fontSize:'1rem', fontWeight:'600', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', minHeight:'48px' },
  spinner: { width:'20px', height:'20px', border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' },
  error: { color:'#ff6b6b', fontSize:'0.83rem', textAlign:'center', margin:0, padding:'0.5rem 0.75rem', borderRadius:'8px', background:'rgba(255,100,100,0.1)', border:'1px solid rgba(255,100,100,0.2)' },
  linkTxt: { textAlign:'center', marginTop:'1.25rem', fontSize:'0.88rem', color:'rgba(160,200,255,0.55)' },
  link: { color:'#64b4ff', textDecoration:'none', fontWeight:'600' },
}

export default Login