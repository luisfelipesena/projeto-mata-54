import type {
  InputData,
  SortResult,
  PhaseResult,
  Sequences,
  SequenceFile,
} from './types'
import {
  calculateBeta,
  calculateAlpha,
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
    rInitialRuns,
  )

  const beta0 = calculateBeta(mMaximumMemoryInRegisters, initialSequences)
  const files = distributeInitialSequences(
    initialSequences,
    kMaximumFilesOpened,
  )
  const busyFiles = files.splice(0, files.length / 2)
  const freeFiles = files.splice(0)

  phases.push({
    phase: 0,
    beta: beta0,
    sequences: initialSequences,
    filesOpened: [...busyFiles, ...freeFiles] as SequenceFile,
  })
  totalWrites += initialSequences.reduce((acc, seq) => acc + seq.length, 0)

  // Fases de intercalamento
  let currentSequences = initialSequences
  while (currentSequences.length > 1) {
    const newSequences = [] as unknown as Sequences
    // TODO: Implementar a lógica de intercalamento

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

function distributeInitialSequences(
  sequences: Sequences,
  kMaximumFilesOpened: number,
): SequenceFile {
  const filesOpened = Array.from(
    { length: kMaximumFilesOpened },
    () => [] as number[][],
  )
  const firstHalf = Math.floor(kMaximumFilesOpened / 2)

  for (let i = 0; i < sequences.length; i++) {
    filesOpened[i % firstHalf].push(sequences[i])
  }
  return filesOpened as SequenceFile
}
