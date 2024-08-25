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

export function cascadeSort(data: InputData): SortResult {
  const phases: PhaseResult[] = []
  let totalWrites = 0

  const initialSequences = generateInitialSequences(
    data.nListToBeSorted,
    data.mMaximumMemoryInRegisters,
    data.rInitialRuns,
  )
  const sumInitialSequences = initialSequences.reduce(
    (acc, seq) => acc + seq.length,
    0,
  )
  const files = distributeInitialSequences(initialSequences, data)
  const beta0 = calculateBeta(data.mMaximumMemoryInRegisters, initialSequences)
  phases.push({
    phase: 0,
    beta: beta0,
    sequences: initialSequences,
    filesOpened: deepCopy(files) as SequenceFile,
  })
  const filesCopy = deepCopy(files) as SequenceFile

  totalWrites += initialSequences.length // Cada sequência inicial é escrita uma vez
  const T = filesCopy.length // Número total de fitas
  const aa = filesCopy.map((sequences) => sequences.length)
  const D = [...aa]
  const M = new Array(T).fill(0)
  for (let k = 1; k < T; k++) {
    M[k] = aa[k + 1] || 0
  }
  let first = 1
  const tape = filesCopy.map((sequences, index) => ({ index, sequences }))
  let l = T - 1

  while (
    l >= 0 &&
    tape.map((t) => t.sequences.length).reduce((acc, curr) => acc + curr, 0) !== 1
  ) {
    for (let p = T - 1; p >= 1; p--) {
      if (p === 1) {
        ;[tape[1], tape[2]] = [tape[2], tape[1]]
      } else if (first === 1 && D[p - 1] === M[p - 1]) {
        if (p < T - 1) {
          ;[tape[p], tape[p + 1]] = [tape[p + 1], tape[p]]
        }
        for (let j = 1; j < p; j++) {
          D[j] -= M[p - 1]
          M[j] -= M[p - 1]
        }
      } else {
        for (let j = 1; j < p; j++) {
          M[j] -= M[p - 1]
        }
        const sequencesToMerge = [] as unknown as Sequences
        for (let j = 1; j <= p; j++) {
          if (D[j] >= M[j] && tape[j].sequences.length > 0) {
            sequencesToMerge.push(tape[j].sequences[0])
            tape[j].sequences.shift()
            if (D[j] > M[j]) {
              D[j]--
            }
          }
        }
        if (sequencesToMerge.length > 0) {
          const mergedSequence = mergeMultipleSequences(sequencesToMerge)
          if (p < T - 1) {
            tape[p + 1].sequences.push(mergedSequence)
          } else {
            tape[1].sequences.push(mergedSequence)
          }
        }
      }
    }
    const currentSequences = filesCopy.flat() as Sequences
    const beta = calculateBeta(data.mMaximumMemoryInRegisters, currentSequences)
    phases.push({
      phase: phases.length + 1,
      beta,
      sequences: currentSequences,
      filesOpened: deepCopy(filesCopy) as SequenceFile,
    })
    totalWrites += currentSequences.length // Adicionar o número de sequências gravadas
    l--
    first = 0
    tape.unshift(tape.pop()!)
    D.fill(0)
    M.fill(0)
  }

  const alpha = calculateAlpha(totalWrites, sumInitialSequences)
  return { phases, alpha }
}

export function distributeInitialSequences(
  initialSequences: Sequences,
  data: InputData,
): SequenceFile {
  const files = Array.from(
    { length: data.kMaximumFilesOpened },
    () => [] as unknown as Sequences,
  ) as SequenceFile

  const table = buildIntercalationTableCascade(data, initialSequences.length)

  const lastLevelTable = (() => {
    const tableByLength = table.map((level) =>
      level.reduce((acc, curr) => acc + curr, 0),
    )
    const findLowestDifference = tableByLength.map((v) =>
      Math.abs(v - initialSequences.length),
    )
    const lowestDifference = Math.min(...findLowestDifference)
    const indexOfLowestDifference =
      findLowestDifference.indexOf(lowestDifference)
    return table[indexOfLowestDifference]
  })()

  const lastLevelSumNumber = lastLevelTable.reduce((acc, curr) => acc + curr, 0)
  const filledSequences = fillWithDummySequences(
    deepCopy(initialSequences) as any,
    lastLevelSumNumber || 0,
  )

  // Round robbing to distribute the sequences according the map `lastLevelTable` says how many sequences each file should have
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
export const fillWithDummySequences = (
  initialSequences: Sequences,
  nearestFibonacci: number,
): Sequences => {
  while (initialSequences.length < nearestFibonacci) {
    initialSequences.push([] as unknown as Sequence)
  }
  return initialSequences as Sequences
}

export const buildIntercalationTableCascade = (
  data: Pick<InputData, 'kMaximumFilesOpened'>,
  initialSequencesLength: number,
): number[][] => {
  const table: number[][] = []
  const onlyWorkingFiles = data.kMaximumFilesOpened - 1

  // Nível 0: todos os arquivos como 0, exceto o primeiro que tem 1
  const level0 = Array(onlyWorkingFiles).fill(0)
  // level0[0] = 1
  table.push(level0)

  // Nível 1: todos os arquivos com 1 sequência
  const level1 = Array(onlyWorkingFiles).fill(1)
  table.push(level1)

  // Níveis subsequentes
  let n = 2
  let sumLastLevel = table.at(-1)!.reduce((acc, curr) => acc + curr, 0)
  while (sumLastLevel < initialSequencesLength) {
    const newLevel = Array(onlyWorkingFiles).fill(0)
    for (let i = 0; i < onlyWorkingFiles; i++) {
      const prevLevel = table[n - 1]
      const an = prevLevel[0]
      const nSlices = prevLevel.slice(1, prevLevel.length - i)
      const sumSlices = nSlices.reduce((acc, curr) => acc + curr, 0)
      newLevel[i] = an + sumSlices
    }
    table.push(newLevel)
    sumLastLevel = newLevel!.reduce((acc, curr) => acc + curr, 0)
    n++
  }

  return table
}
