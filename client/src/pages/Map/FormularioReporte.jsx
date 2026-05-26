export default function FormularioReporte({ nuevoReporte, setNuevoReporte, enviando, onCrear, onCancelar }) {
  return (
    <div style={s.formulario}>
      <div style={s.header}>
        <span style={{ color: '#fff' }}>Crear reporte</span>
        <button onClick={onCancelar} style={s.closeBtn}>✕</button>
      </div>
      <input placeholder="Título" value={nuevoReporte.titulo}
        onChange={e => setNuevoReporte({ ...nuevoReporte, titulo: e.target.value })}
        style={s.input} />
      <textarea placeholder="Descripción" rows={3} value={nuevoReporte.descripcion}
        onChange={e => setNuevoReporte({ ...nuevoReporte, descripcion: e.target.value })}
        style={s.input} />
      <select value={nuevoReporte.tipo}
        onChange={e => setNuevoReporte({ ...nuevoReporte, tipo: e.target.value })}
        style={s.input}>
        <option value="accidente">Accidente</option>
        <option value="robo">Robo</option>
        <option value="obra">Obra</option>
        <option value="peligro">Peligro</option>
        <option value="turismo">Turismo</option>
      </select>
      <button style={{ ...s.crearBtn, opacity: enviando ? 0.7 : 1 }}
        onClick={onCrear} disabled={enviando}>
        {enviando ? 'Enviando...' : 'Crear reporte'}
      </button>
    </div>
  )
}

const s = {
  formulario: { position: 'absolute', left: '16px', bottom: '16px', width: '320px', background: 'rgba(5,18,40,0.95)', borderRadius: '16px', padding: '16px', zIndex: 1200, display: 'flex', flexDirection: 'column', gap: '12px' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  closeBtn:   { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '18px' },
  input:      { padding: '10px', borderRadius: '10px', border: '1px solid rgba(100,180,255,0.2)', outline: 'none', background: 'rgba(10,25,50,0.95)', color: '#e8f4ff' },
  crearBtn:   { padding: '12px', borderRadius: '10px', border: 'none', background: '#1565c0', color: '#fff', cursor: 'pointer' },
}
