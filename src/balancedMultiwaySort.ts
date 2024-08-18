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
  const files = distributeInitialSequences(
    initialSequences,
    kMaximumFilesOpened,
  )
  let busyFiles = files.slice(0, Math.floor(kMaximumFilesOpened / 2))
  let freeFiles = files.slice(Math.floor(kMaximumFilesOpened / 2))

  phases.push({
    phase: 0,
    beta: beta0,
    sequences: initialSequences,
    filesOpened: [...deepCopy(busyFiles), ...deepCopy(freeFiles)] as SequenceFile,
  })
  totalWrites += initialSequences.reduce((acc, seq) => acc + seq.length, 0)

  // Fases de intercalamento
  let phase = 1
  while (busyFiles.some((file) => file.length > 0)) {
    const newSequences = [] as unknown as Sequences
    const newBusyFiles = [] as unknown as SequenceFile
    const newFreeFiles = [] as unknown as SequenceFile

    // Intercalar sequências dos busyFiles
    for (const _ of busyFiles) {
      const sequencesToMerge = busyFiles.map((file) => file[0] || [])
      const mergedSequence = mergeMultipleSequences(sequencesToMerge)
      newSequences.push(mergedSequence as unknown as number[])
      newFreeFiles.push([mergedSequence] as any)

      // Remover as sequências usadas dos busyFiles
      busyFiles.forEach((file) => file.shift())
    }

    // Atualizar busyFiles e freeFiles
    newBusyFiles.push(...busyFiles.filter((file) => file.length > 0))
    newFreeFiles.push(...freeFiles.filter((file) => file.length > 0))

    const beta = calculateBeta(
      mMaximumMemoryInRegisters,
      newSequences as Sequences,
    )
    phases.push({
      phase,
      beta,
      sequences: newSequences as Sequences,
      filesOpened: [...newBusyFiles, ...newFreeFiles] as SequenceFile,
    })

    // Atualiza o total de escritas para esta fase
    totalWrites += newSequences.reduce((acc, seq) => acc + seq.length, 0)

    // Preparar para a próxima fase
    busyFiles = newBusyFiles
    freeFiles = newFreeFiles
    phase++
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
