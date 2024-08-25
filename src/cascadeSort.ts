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
  const files = distributeInitialSequences(initialSequences, data)
  const beta0 = calculateBeta(data.mMaximumMemoryInRegisters, initialSequences)
  phases.push({
    phase: 0,
    beta: beta0,
    sequences: initialSequences,
    filesOpened: deepCopy(files) as SequenceFile,
  })
  const filesCopy = deepCopy(files) as SequenceFile
  const firstPass = true

  totalWrites += initialSequences.reduce((acc, seq) => acc + seq.length, 0)
  const T = filesCopy.length // Número total de fitas
  // AA[k]: Representa o número inicial de sequências em cada nível.
  const aa = filesCopy.map((sequences) => sequences.length)
  // D[j]: Representa o número de sequências restantes em cada fita.
  const D = [...aa]
  // M[k]: Representa o número de sequências a serem mescladas em cada nível.
  const M = new Array(T).fill(0)
  for (let k = 1; k < T; k++) {
    M[k] = aa[k + 1] || 0 // C7. Set M[k] <- AA[k+1] for 1 <= k < T
  }
  // FIRST: Indica se é a primeira passagem de mesclagem.
  let first = 1 // C7. Set FIRST <- 1
  // TAPE[j]: Representa as fitas de entrada/saída.
  const tape = filesCopy.map((sequences, index) => ({ index, sequences }))
  // l = level
  let l = T - 1
  while (l >= 0 && tape.map((t) => t.sequences.length).reduce((acc, curr) => acc + curr, 0) !== 1) {
    // C8. [Cascade.]
    for (let p = T - 1; p >= 1; p--) {
      if (p === 1) {
        // C8. If p = 1, simulate the one-way merge
        // Rebobinar TAPE[2] (não é necessário em arrays)
        // Trocar TAPE[1] e TAPE[2]
        ;[tape[1], tape[2]] = [tape[2], tape[1]]
      } else if (first === 1 && D[p - 1] === M[p - 1]) {
        // C8. Otherwise if FIRST = 1 and D[p-1] = M[p-1]
        if (p < T - 1) {
          ;[tape[p], tape[p + 1]] = [tape[p + 1], tape[p]]
        }
        // Subtrair M[p - 1] de D[1], ..., D[p-1] e M[1], ..., M[p-1]
        for (let j = 1; j < p; j++) {
          D[j] -= M[p - 1]
          M[j] -= M[p - 1]
        }
      } else {
        // C8. Otherwise
        // Subtrair M[p - 1] de M[1], ..., M[p-1]
        for (let j = 1; j < p; j++) {
          M[j] -= M[p - 1]
        }
        // Merge one run from each TAPE[j]
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
        // Continue until TAPE[p] is empty (handled by the loop)
      }
      // Rewind TAPE[p] and TAPE[p+1] (não é necessário em arrays)
    }
    const currentSequences = filesCopy.flat() as Sequences
    const beta = calculateBeta(data.mMaximumMemoryInRegisters, currentSequences)
    phases.push({
      phase: phases.length + 1,
      beta,
      sequences: currentSequences,
      filesOpened: deepCopy(filesCopy) as SequenceFile,
    })
    // C9. [Down a level.]
    l--
    first = 0
    // Rotate tapes: (TAPE[1], ..., TAPE[T]) <- (TAPE[T], ..., TAPE[1])
    tape.unshift(tape.pop()!)
    // Reset D and M (they will remain zero)
    D.fill(0)
    M.fill(0)
  }

  const alpha = calculateAlpha(totalWrites, data.nListToBeSorted.length)
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

export function cascadeMerge(files: SequenceFile, data: InputData): SortResult {
  const phases: PhaseResult[] = []
  let filesCopy = deepCopy(files) as SequenceFile
  let totalWrites = 0
  let level = filesCopy.length - 2
  let firstPass = true

  while (level >= 0) {
    for (let p = filesCopy.length - 1; p >= 1; p--) {
      if (p === 1) {
        ;[filesCopy[1], filesCopy[2]] = [filesCopy[2], filesCopy[1]]
      } else if (firstPass && filesCopy[p - 1].length === 0) {
        // Simulate p-way merge for first pass with empty tape
        ;[filesCopy[p], filesCopy[p + 1]] = [filesCopy[p + 1], filesCopy[p]]
      } else {
        // Perform actual p-way merge
        const sequencesToMerge = filesCopy
          .slice(1, p + 1)
          .map((file) => file.shift())
          .filter(Boolean) as Sequence[]
        const mergedSequence = mergeMultipleSequences(sequencesToMerge)
        filesCopy[p].push(mergedSequence)
        totalWrites += mergedSequence.length
      }

      // Rewind tapes (in our case, just ensure the arrays are properly managed)
      if (filesCopy[p].length === 0) {
        filesCopy[p] = [] as unknown as Sequences
      }
      if (filesCopy[p].length === 0) {
        filesCopy[p] = [] as unknown as Sequences
      }
    }

    // Record phase result
    const currentSequences = filesCopy.flat() as Sequences
    const beta = calculateBeta(data.mMaximumMemoryInRegisters, currentSequences)
    phases.push({
      phase: phases.length + 1,
      beta,
      sequences: currentSequences,
      filesOpened: deepCopy(filesCopy) as SequenceFile,
    })

    // Prepare for next level
    level--
    firstPass = false
    filesCopy = [
      filesCopy[filesCopy.length - 1],
      ...filesCopy.slice(0, filesCopy.length - 1),
    ] as SequenceFile
  }

  const alpha = calculateAlpha(totalWrites, data.nListToBeSorted.length)
  return { phases, alpha }
}
