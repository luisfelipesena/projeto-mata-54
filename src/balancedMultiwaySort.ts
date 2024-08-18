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
  let files = distributeInitialSequences(
    initialSequences,
    kMaximumFilesOpened,
  )

  phases.push({
    phase: 0,
    beta: beta0,
    sequences: initialSequences,
    filesOpened: deepCopy(files) as SequenceFile,
  })
  totalWrites += initialSequences.reduce((acc, seq) => acc + seq.length, 0)

  // Fases de intercalamento
  let phase = 1
  while (files.flat().length > 1) {
    const newFiles = [] as unknown as SequenceFile
    const halfK = Math.floor(kMaximumFilesOpened / 2)

    // Intercalar sequências dos arquivos ocupados
    for (let i = 0; i < halfK; i++) {
      const sequencesToMerge = files.slice(0, halfK).map(file => file[0] || [])
      if (sequencesToMerge.some(seq => seq.length > 0)) {
        const mergedSequence = mergeMultipleSequences(sequencesToMerge)
        newFiles.push([mergedSequence] as any)

        // Remover as sequências usadas
        for (let j = 0; j < halfK; j++) {
          if (files[j] && files[j].length > 0) {
            files[j].shift()
          }
        }
      }
    }

    // Adicionar sequências não mescladas aos novos arquivos
    files.forEach(file => {
      if (file.length > 0) {
        newFiles.push(file)
      }
    })

    files = newFiles

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