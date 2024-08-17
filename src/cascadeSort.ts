import type { InputData, SortResult, PhaseResult } from './types'
import {
  calculateBeta,
  calculateAlpha,
  mergeSequences,
  generateInitialSequences,
} from './utils'

export function cascadeSort(data: InputData): SortResult {
  const { mMaximumMemoryInRegisters: m, nListToBeSorted: n } = data
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
