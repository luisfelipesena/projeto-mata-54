type SortMethod = 'B' | 'P' | 'C'

interface InputData {
  method: SortMethod
  m: number
  k: number
  r: number
  n: number[]
}

interface PhaseResult {
  phase: number
  beta: number
  sequences: number[][]
}

interface SortResult {
  phases: PhaseResult[]
  alpha: number
}

// Função auxiliar para calcular beta
function calculateBeta(m: number, sequences: number[][]): number {
  const totalLength = sequences.reduce((acc, seq) => acc + seq.length, 0)
  return totalLength / (m * sequences.length)
}

// Função auxiliar para calcular alpha
function calculateAlpha(totalWrites: number, totalRecords: number): number {
  return totalWrites / totalRecords
}

// Função auxiliar para intercalar duas sequências
function mergeSequences(seq1: number[], seq2: number[]): number[] {
  const merged: number[] = []
  while (seq1.length && seq2.length) {
    if (seq1[0] < seq2[0]) {
      merged.push(seq1.shift()!)
    } else {
      merged.push(seq2.shift()!)
    }
  }
  return merged.concat(seq1).concat(seq2)
}

// Função para geração de sequências iniciais usando seleção natural
function generateInitialSequences(n: number[], m: number): number[][] {
  const sequences: number[][] = []
  let heap: number[] = []

  for (let i = 0; i < n.length; i++) {
    heap.push(n[i])
    if (heap.length === m || i === n.length - 1) {
      heap.sort((a, b) => a - b) // Ordena o heap
      sequences.push([...heap]) // Adiciona uma cópia do heap como uma sequência
      heap = []
    }
  }

  return sequences
}

// Implementação do método Balanceada Multi-Caminhos (B)
function balancedMultiwaySort(data: InputData): SortResult {
  const { m, k, r, n } = data
  const phases: PhaseResult[] = []
  let totalWrites = 0

  // Fase 0 - Geração das sequências iniciais
  const initialSequences = generateInitialSequences(n, m)

  const beta0 = calculateBeta(m, initialSequences)
  phases.push({ phase: 0, beta: beta0, sequences: initialSequences })
  totalWrites += initialSequences.reduce((acc, seq) => acc + seq.length, 0)

  // Fases de intercalamento
  let currentSequences = initialSequences
  for (let phase = 1; currentSequences.length > 1; phase++) {
    const newSequences: number[][] = []
    for (let i = 0; i < currentSequences.length; i += 2) {
      const seq1 = currentSequences[i]
      const seq2 = currentSequences[i + 1] || []
      newSequences.push(mergeSequences(seq1, seq2))
    }
    currentSequences = newSequences
    const beta = calculateBeta(m, currentSequences)
    phases.push({ phase, beta, sequences: currentSequences })
    totalWrites += currentSequences.reduce((acc, seq) => acc + seq.length, 0)
  }

  // Cálculo final de alpha
  const alpha = calculateAlpha(totalWrites, n.length)

  return { phases, alpha }
}

// Implementação do método Polifásico (P)
function polyphaseSort(data: InputData): SortResult {
  const { m, k, r, n } = data
  const phases: PhaseResult[] = []
  let totalWrites = 0

  // Fase 0 - Geração das sequências iniciais
  const initialSequences = generateInitialSequences(n, m)

  const beta0 = calculateBeta(m, initialSequences)
  phases.push({ phase: 0, beta: beta0, sequences: initialSequences })
  totalWrites += initialSequences.reduce((acc, seq) => acc + seq.length, 0)

  // Fases de intercalamento (logica polifásica)
  let currentSequences = initialSequences
  for (let phase = 1; currentSequences.length > 1; phase++) {
    const newSequences: number[][] = []
    let minSeqIndex = 0
    for (let i = 1; i < currentSequences.length; i++) {
      if (currentSequences[i].length < currentSequences[minSeqIndex].length) {
        minSeqIndex = i
      }
    }
    for (let i = 0; i < currentSequences.length; i++) {
      if (i !== minSeqIndex) {
        newSequences.push(
          mergeSequences(currentSequences[minSeqIndex], currentSequences[i]),
        )
      }
    }
    currentSequences = newSequences
    const beta = calculateBeta(m, currentSequences)
    phases.push({ phase, beta, sequences: currentSequences })
    totalWrites += currentSequences.reduce((acc, seq) => acc + seq.length, 0)
  }

  // Cálculo final de alpha
  const alpha = calculateAlpha(totalWrites, n.length)

  return { phases, alpha }
}

// Implementação do método em Cascata (C)
function cascadeSort(data: InputData): SortResult {
  const { m, k, r, n } = data
  const phases: PhaseResult[] = []
  let totalWrites = 0

  // Fase 0 - Geração das sequências iniciais
  const initialSequences = generateInitialSequences(n, m)

  const beta0 = calculateBeta(m, initialSequences)
  phases.push({ phase: 0, beta: beta0, sequences: initialSequences })
  totalWrites += initialSequences.reduce((acc, seq) => acc + seq.length, 0)

  // Fases de intercalamento (logica em cascata)
  let currentSequences = initialSequences
  for (let phase = 1; currentSequences.length > 1; phase++) {
    const newSequences: number[][] = []
    for (let i = 0; i < currentSequences.length; i += 2) {
      const seq1 = currentSequences[i]
      const seq2 = currentSequences[i + 1] || []
      newSequences.push(mergeSequences(seq1, seq2))
    }
    currentSequences = newSequences
    const beta = calculateBeta(m, currentSequences)
    phases.push({ phase, beta, sequences: currentSequences })
    totalWrites += currentSequences.reduce((acc, seq) => acc + seq.length, 0)
  }

  // Cálculo final de alpha
  const alpha = calculateAlpha(totalWrites, n.length)

  return { phases, alpha }
}

// Função principal para processar a entrada e executar o método de ordenação
function processInput(input: string[]): void {
  const method = input[0] as SortMethod
  const [m, k, r] = input[1].split(' ').map(Number)
  const n = input[2].split(' ').map(Number)

  const data: InputData = { method, m, k, r, n }

  let result: SortResult
  if (method === 'B') {
    result = balancedMultiwaySort(data)
  } else if (method === 'P') {
    result = polyphaseSort(data)
  } else if (method === 'C') {
    result = cascadeSort(data)
  } else {
    console.log(`Método ${method} não reconhecido.`)
    return
  }

  // Exibe o resultado
  result.phases.forEach((phase) => {
    console.log(`fase ${phase.phase} ${phase.beta.toFixed(2)}`)
    phase.sequences.forEach((seq, index) => {
      console.log(`${index + 1}: {${seq.join(' ')}}`)
    })
  })
  console.log(`final ${result.alpha.toFixed(2)}`)
}

// Teste com exemplo de entrada
const inputExample = ['B', '3 4 3', '7 1 5 6 3 8 2 10 4 9 1 3 7 4 1 2 3']
processInput(inputExample)
