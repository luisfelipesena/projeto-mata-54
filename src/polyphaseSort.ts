import type { InputData, SortResult, PhaseResult, SequenceFile, Sequences, Sequence } from './types'
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

  // Fase 0 - Geração das sequências iniciais
  const initialSequences = generateInitialSequences(
    nListToBeSorted,
    mMaximumMemoryInRegisters,
    rInitialRuns,
  )
  const files = distributeInitialSequences(
    initialSequences,
    kMaximumFilesOpened,
  )

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
export function distributeInitialSequences(initialSequences: Sequences, kMaximumFilesOpened: number): SequenceFile {
  const files: number[][][] = Array.from({ length: kMaximumFilesOpened }, () => []);
  const fibonacciSequence = generateFibonacciSequenceGeneralized(initialSequences.length, initialSequences.length - 1)
  const nearestFibonacci = findNearestFibonacciGeneralized(initialSequences.length, fibonacciSequence)
  return files as SequenceFile
}

export const generateFibonacciSequenceGeneralized = (maximumItemsInGeneration: number, order: number): number[] => {
  const fibSeq = Array(maximumItemsInGeneration).fill(0);
  for (let i = 0; i < order; i++) {
    fibSeq[i] = 1;
  }
  for (let i = order; i < maximumItemsInGeneration; i++) {
    for (let m = 1; m <= order; m++) {
      fibSeq[i] += fibSeq[i - m];
    }
  }
  return fibSeq;
}
export const findNearestFibonacciGeneralized = (n: number, fibonacciSequence: number[]): number => {
  let nearestFibonacci = fibonacciSequence[0];
  for (let i = 1; i < fibonacciSequence.length; i++) {
    if (fibonacciSequence[i] >= n) {
      nearestFibonacci = fibonacciSequence[i];
      break;
    }
  }
  return nearestFibonacci;
}
export const fillInitialSequences = (initialSequences: Sequences, nearestFibonacci: number): Sequences => {
  for (let i = 0; i < nearestFibonacci; i++) {
    initialSequences.push([0] as Sequence)
  }
  return initialSequences as Sequences
}

export const buildIntercalationTable = (data: InputData) => {
  const iterationsAccordingFib = 5
  const {
    mMaximumMemoryInRegisters,
    kMaximumFilesOpened,
    rInitialRuns,
    nListToBeSorted,
  } = data

  // First level with all files as 0 except the last that has 1 
  const firstLevel = Array(kMaximumFilesOpened).fill(0)
  firstLevel[kMaximumFilesOpened - 1] = 1
  // Seccond level fill all the levels with the 1 sequence except the last that has 0

  // Third level in sequence:
  // - Should find the greatest number of sequence in the level
  // - in next sequence should free that space and sum this value to all the other runs 
  // - Do it until the number of iterations according fibonacci sequence

  const secondLevel = Array(kMaximumFilesOpened).fill(0)
  secondLevel[kMaximumFilesOpened - 1] = 1

  return [firstLevel, secondLevel]
}