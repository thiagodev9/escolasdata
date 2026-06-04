// Tabela de preços por aluno ativo/mês
const FAIXAS = [
  { ate: 30,       preco: 4.90, minimo: 97.00 },
  { ate: 80,       preco: 3.90, minimo: 0     },
  { ate: 150,      preco: 2.90, minimo: 0     },
  { ate: Infinity, preco: 1.99, minimo: 0     },
]

export function calcularMensalidadeSaas(qtdAlunos: number): {
  valor: number
  pricePerAluno: number
  faixa: string
} {
  const faixa = FAIXAS.find(f => qtdAlunos <= f.ate)!
  const valor = Math.max(qtdAlunos * faixa.preco, faixa.minimo)

  let label = ''
  if (faixa.ate === 30)       label = 'Até 30 alunos'
  else if (faixa.ate === 80)  label = '31–80 alunos'
  else if (faixa.ate === 150) label = '81–150 alunos'
  else                        label = '150+ alunos'

  return { valor: Math.round(valor * 100) / 100, pricePerAluno: faixa.preco, faixa: label }
}

export function descricaoCobranca(escolaNome: string, qtdAlunos: number, mesRef: string): string {
  const [ano, mes] = mesRef.split('-')
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  const mesNome = meses[Number(mes) - 1]
  return `EduNest - ${escolaNome} - ${mesNome}/${ano} - ${qtdAlunos} alunos`
}
