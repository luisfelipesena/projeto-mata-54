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
  mergeMultipleSequences,
  deepCopy,
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
  let files = distributeInitialSequences(initialSequences, kMaximumFilesOpened)

  phases.push({
    phase: 0,
    beta: beta0,
    sequences: initialSequences,
    filesOpened: deepCopy(files) as SequenceFile,
  })
  totalWrites += initialSequences.reduce((acc, seq) => acc + seq.length, 0)

  // Fases de intercalamento
  let phase = 1
  while (files.filter((file) => file.length > 0).length > 1) {
    const newFiles = Array.from({ length: kMaximumFilesOpened }, () => [] as unknown as Sequences)
    const freeFilesIndexes = (() => {
      const indexes = files.map((_, index) => _.length === 0 ? index : null).filter(v => v !== null)
      return indexes
    })()
    const busyFilesIndexes = (() => {
      const indexes = files.map((_, index) => _.length > 0 ? index : null).filter(v => v !== null)
      return indexes
    })()

    // Intercalar sequências dos arquivos ocupados
    for (const index of freeFilesIndexes) {
      const sequencesToMerge = files.map((file) => file[0] || [])
      if (sequencesToMerge.some((seq) => seq.length > 0)) {

        const mergedSequence = mergeMultipleSequences(sequencesToMerge)
        newFiles[index] = [mergedSequence] as Sequences
        // Remover as sequências usadas
        for (const busyIndex of busyFilesIndexes) {
          files[busyIndex].shift()
        }
      }
    }

    files = newFiles as SequenceFile

    const currentSequences = files.flat() as Sequences
    const beta = calculateBeta(mMaximumMemoryInRegisters, currentSequences)
    phases.push({
      phase,
      beta,
      sequences: currentSequences,
      filesOpened: deepCopy(files) as SequenceFile,
    })

    // Atualiza o total de escritas para esta fase
    totalWrites += currentSequences.reduce((acc, seq) => acc + seq.length, 0)

    phase++
  }

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
