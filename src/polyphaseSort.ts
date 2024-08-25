import type {
  InputData,
  SortResult,
  PhaseResult,
  SequenceFile,
  Sequences,
  Sequence,
} from './types'
import {
  calculateBeta,
  calculateAlpha,
  generateInitialSequences,
  mergeMultipleSequences,
  deepCopy,
} from './utils'

export function polyphaseSort(data: InputData): SortResult {
  const {
    mMaximumMemoryInRegisters,
    kMaximumFilesOpened,
    rInitialRuns,
    nListToBeSorted,
  } = data
  const phases: PhaseResult[] = []
  let totalWrites = 0

  const initialSequences = generateInitialSequences(
    nListToBeSorted,
    mMaximumMemoryInRegisters,
    rInitialRuns,
  )
  const files = distributeInitialSequences(initialSequences, data)
  const beta0 = calculateBeta(mMaximumMemoryInRegisters, initialSequences)
  phases.push({
    phase: 0,
    beta: beta0,
    sequences: initialSequences,
    filesOpened: deepCopy(files) as SequenceFile,
  })

  // Cada sequência inicial gerada é escrita uma vez nos arquivos
  totalWrites += initialSequences.length

  const checkIfAllSequencesHasBeenMerged = (files: SequenceFile) => {
    return (
      files.map((file) => file.length).reduce((acc, curr) => acc + curr, 0) ===
      1
    )
  }
  const hasAnyFileEmpty = (files: SequenceFile) => {
    return !!files.find((file) => file.length === 0)
  }
  let phase = 1
  while (!checkIfAllSequencesHasBeenMerged(files)) {
    const freeFileIndex = files.findIndex((file) => file.length === 0)
    const busyFiles = files.filter((file, idx) => file.length > 0 && idx !== freeFileIndex)
    while (!hasAnyFileEmpty(busyFiles as SequenceFile)) {
      const sequencesToMerge = busyFiles.map((file) => file[0] || [])
      const mergedSequence = mergeMultipleSequences(sequencesToMerge)
      busyFiles.forEach((busyFile) => busyFile.shift())
      // Remove the primeira sequência de cada arquivo!
      if (files[freeFileIndex].length === 0) {
        files[freeFileIndex] = [mergedSequence] as Sequences
      } else if (files[freeFileIndex].length > 0) {
        files[freeFileIndex].push(mergedSequence)
      }
      totalWrites += 1 // Uma operação de escrita para cada sequência gravada
    }
    const currentSequences = files.flat() as Sequences
    const beta = calculateBeta(mMaximumMemoryInRegisters, currentSequences)
    phases.push({
      phase,
      beta,
      sequences: currentSequences,
      filesOpened: deepCopy(files) as SequenceFile,
    })
    phase++
  }
  const alpha = calculateAlpha(totalWrites, initialSequences.length)

  return {
    phases,
    alpha,
  }
}

export function distributeInitialSequences(
  initialSequences: Sequences,
  data: InputData,
): SequenceFile {
  const files = Array.from(
    { length: data.kMaximumFilesOpened },
    () => [] as unknown as Sequences,
  ) as SequenceFile

  const fibonacciSequence =
    generateFibonacciSequenceGeneralizedUntilGreaterThan(
      initialSequences.length,
      data.kMaximumFilesOpened - 1,
    )
  const nearestFibonacci = findNearestFibonacciGeneralized(
    initialSequences.length,
    fibonacciSequence,
  )
  const table = buildIntercalationTable(data, nearestFibonacci)
  const sumOfEachLevel = table.map((level) =>
    level.reduce((acc, curr) => acc + curr, 0),
  )

  const lastLevelTable = (() => {
    const tableByLength = table.map((level) => level.reduce((acc, curr) => acc + curr, 0))
    const findLowestDifference = tableByLength.map(v => Math.abs(v - initialSequences.length))
    const lowestDifference = Math.min(...findLowestDifference)
    const indexOfLowestDifference = findLowestDifference.indexOf(lowestDifference)
    return table[indexOfLowestDifference]
  })()

  const lastLevelSumNumber = lastLevelTable.reduce((acc, curr) => acc + curr, 0)
  const filledSequences = fillInitialSequences(
    deepCopy(initialSequences) as any,
    lastLevelSumNumber || 0,
  )

  // You should round robbing to distribute the sequences according the map `lastLevelTable` says how many sequences each file should have
  let i = 0
  let j = 0
  while (
    files.map((file) => file.length).reduce((acc, curr) => acc + curr, 0) !==
    lastLevelSumNumber
  ) {
    const idx = j % lastLevelTable.length
    if (files[idx].length < lastLevelTable[idx]) {
      files[idx].push(filledSequences[i])
      i++
    }
    j++
  }

  return files as SequenceFile
}
export const generateFibonacciSequenceGeneralizedUntilGreaterThan = (
  greaterThanValue: number,
  order: number,
): number[] => {
  const fibSeq: number[] = []
  let lastValue = 0
  for (let i = 0; i < order; i++) {
    fibSeq.push(1)
  }
  let i = order
  while (lastValue < greaterThanValue) {
    for (let m = 1; m <= order; m++) {
      fibSeq[i] = (fibSeq[i] || 0) + fibSeq[i - m]
      lastValue = fibSeq[i]
    }
    i++
  }
  return fibSeq
}
export const findNearestFibonacciGeneralized = (
  n: number,
  fibonacciSequence: number[],
): number => {
  let nearestFibonacci = fibonacciSequence[0]
  for (let i = 1; i < fibonacciSequence.length; i++) {
    if (fibonacciSequence[i] >= n) {
      nearestFibonacci = fibonacciSequence[i]
      break
    }
  }
  return nearestFibonacci
}
export const fillInitialSequences = (
  initialSequences: Sequences,
  nearestFibonacci: number,
): Sequences => {
  while (initialSequences.length < nearestFibonacci) {
    initialSequences.push([] as unknown as Sequence)
  }
  return initialSequences as Sequences
}

export const buildIntercalationTable = (
  data: Pick<InputData, 'kMaximumFilesOpened'>,
  iterationsAccordingFib: number,
): number[][] => {
  const { kMaximumFilesOpened } = data
  const table: number[][] = []

  // Primeiro nível: todos os arquivos como 0, exceto o último que tem 1
  const firstLevel = Array(kMaximumFilesOpened).fill(0)
  firstLevel[kMaximumFilesOpened - 1] = 1
  table.push(firstLevel)

  // Segundo nível: todos os arquivos com 1 sequência, exceto o último que tem 0
  const secondLevel = Array(kMaximumFilesOpened).fill(1)
  secondLevel[kMaximumFilesOpened - 1] = 0
  table.push(secondLevel)

  // Níveis subsequentes
  for (let i = 2; i < iterationsAccordingFib; i++) {
    const previousLevel = table[i - 1]
    const newLevel = [...previousLevel]

    // Encontrar o maior número de sequências no nível anterior
    const maxSequences = Math.max(...previousLevel)
    const maxIndex = previousLevel.indexOf(maxSequences)

    // Zerar o arquivo com o maior número de sequências
    newLevel[maxIndex] = 0

    // Distribuir as sequências para os outros arquivos
    for (let j = 0; j < kMaximumFilesOpened; j++) {
      if (j !== maxIndex) {
        newLevel[j] += maxSequences
      }
    }

    table.push(newLevel)
  }

  return table
}
