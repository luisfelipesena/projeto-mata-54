import type { InputData, SortResult, PhaseResult } from './types'
import {
  calculateBeta,
  calculateAlpha,
  mergeMultipleSequences,
  generateInitialSequences,
} from './utils'

export function balancedMultiWaySort(data: InputData): SortResult {
  const {
    mMaximumMemoryInRegisters,
    nListToBeSorted,
    kMaximumFilesOpened,
    rInitialRuns,
  } = data
  const phases: PhaseResult[] = []
  let totalWrites = 0

  // Fase 0 - Geração das sequências iniciais
  const initialSequences = generateInitialSequences(
    nListToBeSorted,
    mMaximumMemoryInRegisters,
  )

  const beta0 = calculateBeta(mMaximumMemoryInRegisters, initialSequences)
  phases.push({ phase: 0, beta: beta0, sequences: initialSequences })
  totalWrites += initialSequences.reduce((acc, seq) => acc + seq.length, 0)

  // Fases de intercalamento
  let currentSequences = initialSequences
  while (currentSequences.length > 1) {
    const newSequences: number[][] = []
    for (let i = 0; i < currentSequences.length; i += kMaximumFilesOpened) {
      const sequencesToMerge = currentSequences.slice(
        i,
        Math.min(i + kMaximumFilesOpened, currentSequences.length),
      )
      newSequences.push(mergeMultipleSequences(sequencesToMerge))
    }
    currentSequences = newSequences
    const beta = calculateBeta(mMaximumMemoryInRegisters, currentSequences)
    phases.push({ phase: phases.length, beta, sequences: currentSequences })
    // Atualiza o total de escritas para esta fase
    totalWrites += currentSequences.reduce((acc, seq) => acc + seq.length, 0)
  }

  // Cálculo final de alpha
  const alpha = calculateAlpha(totalWrites, nListToBeSorted.length)

  return { phases, alpha }
}
