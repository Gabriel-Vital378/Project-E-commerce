const URL_API = '/api'

const requisitar = async (caminho, opcoes = {}) => {
  const token = localStorage.getItem('token')
  const cabecalhos = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
  try {
    const resp = await fetch(URL_API + caminho, { ...opcoes, headers: cabecalhos })
    const dados = await resp.json()
    if (resp.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      window.location.href = '/login'
    }
    return { ok: resp.ok, status: resp.status, ...dados }
  } catch {
    return { ok: false, success: false, message: 'Servidor offline ou inacessível.' }
  }
}

export const cliente = {
  buscar:     (caminho)         => requisitar(caminho, { method: 'GET' }),
  enviar:     (caminho, corpo)  => requisitar(caminho, { method: 'POST',  body: JSON.stringify(corpo) }),
  atualizar:  (caminho, corpo)  => requisitar(caminho, { method: 'PUT',   body: JSON.stringify(corpo) }),
  patch:      (caminho, corpo)  => requisitar(caminho, { method: 'PATCH', body: JSON.stringify(corpo) }),
  deletar:    (caminho)         => requisitar(caminho, { method: 'DELETE' }),
  requisitar: (caminho, opcoes) => requisitar(caminho, opcoes),
}

export const formatar = {
  moeda:     (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v),
  data:      (s) => new Date(s).toLocaleDateString('pt-BR'),
  categoria: (c) => ({ mouse: 'Mouse', teclado: 'Teclado', headset: 'Headset' })[c] || c,
}
