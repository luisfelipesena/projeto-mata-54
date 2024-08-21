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
    filesOpened: files,
  })
  totalWrites += initialSequences.reduce((acc, seq) => acc + seq.length, 0)

  // Fases de intercalamento (logica polifásica)
  const currentSequences = initialSequences

  // Cálculo final de alpha
  const alpha = calculateAlpha(totalWrites, nListToBeSorted.length)

  return { phases, alpha }
}
export function distributeInitialSequences(
  initialSequences: Sequences,
  data: InputData,
): SequenceFile {
  const files: number[][][] = Array.from(
    { length: data.kMaximumFilesOpened },
    () => [],
  )
  return files as SequenceFile
}

export const generateFibonacciSequenceGeneralized = (
  maximumItemsInGeneration: number,
  order: number,
): number[] => {
  const fibSeq = Array(maximumItemsInGeneration).fill(0)
  for (let i = 0; i < order; i++) {
    fibSeq[i] = 1
  }
  for (let i = order; i < maximumItemsInGeneration; i++) {
    for (let m = 1; m <= order; m++) {
      fibSeq[i] += fibSeq[i - m]
    }
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
  for (let i = 0; i < nearestFibonacci; i++) {
    initialSequences.push([0] as Sequence)
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
const input: InputData = {
  method: 'P',
  mMaximumMemoryInRegisters: 3,
  kMaximumFilesOpened: 3,
  rInitialRuns: 3,
  nListToBeSorted: [7, 1, 5, 6, 3, 8, 2, 10, 4, 9, 1, 3, 7, 4, 1, 2, 3],
}
const result = buildIntercalationTable({ kMaximumFilesOpened: 3 }, 5)
