import type { InputData, SortResult, PhaseResult } from './types'
import {
  calculateBeta,
  calculateAlpha,
  mergeSequences,
  generateInitialSequences,
} from './utils'

export function polyphaseSort(data: InputData): SortResult {
  const { mMaximumMemoryInRegisters: m, kMaximumFilesOppened: k, rInitialRuns: r, nListToBeSorted: n } = data
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
