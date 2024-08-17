import type { InputData, SortResult, PhaseResult } from './types'

export function balancedMultiwaySort(data: InputData): SortResult {
  const { m, n } = data
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

export function polyphaseSort(data: InputData): SortResult {
  const { m, n } = data
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

export function cascadeSort(data: InputData): SortResult {
  const { m, n } = data
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

export function calculateBeta(m: number, sequences: number[][]): number {
  const totalLength = sequences.reduce((acc, seq) => acc + seq.length, 0)
  return totalLength / (m * sequences.length)
}

// Função auxiliar para calcular alpha
export function calculateAlpha(
  totalWrites: number,
  totalRecords: number,
): number {
  return totalWrites / totalRecords
}

// Função auxiliar para intercalar duas sequências
export function mergeSequences(seq1: number[], seq2: number[]): number[] {
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
export function generateInitialSequences(n: number[], m: number): number[][] {
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
