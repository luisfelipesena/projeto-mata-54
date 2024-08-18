import { MinHeap } from '~/minHeap'
import type { Sequence, Sequences } from '~/types'

export function calculateBeta(m: number, sequences: number[][]): number {
  const totalLength = sequences.reduce((acc, seq) => acc + seq.length, 0)
  return Number.parseFloat((totalLength / (m * sequences.length)).toFixed(2))
}

// Função auxiliar para calcular alpha
export function calculateAlpha(
  totalWrites: number,
  totalRecords: number,
): number {
  return totalWrites / totalRecords
}

// Função auxiliar para intercalar duas sequências
export function mergeSequences(seq1: number[], seq2: number[]): number[] {
  const merged: number[] = []
  while (seq1.length && seq2.length) {
    if (seq1[0] < seq2[0]) {
      merged.push(seq1.shift()!)
    } else {
      merged.push(seq2.shift()!)
    }
  }
  return merged.concat(seq1).concat(seq2)
}

// Função para geração de sequências iniciais usando seleção natural
export function generateInitialSequences(
  n: number[],
  mMaximumMemoryInRegisters: number,
  rInitialRuns: number,
): Sequences {
  const sequences: number[][] = []
  const minHeap = new MinHeap()
  let currentSequence: number[] = []
  let lastAddedValue = Number.NEGATIVE_INFINITY

  for (let i = 0; i < n.length; i++) {
    const currentValue = n[i]
    if (sequences.length === rInitialRuns) {
      break
    }

    if (minHeap.size() < mMaximumMemoryInRegisters) {
      if (currentValue < lastAddedValue) {
        minHeap.insertFlagged(currentValue)
      } else {
        minHeap.insert(currentValue)
      }
    }

    if (minHeap.size() === mMaximumMemoryInRegisters || i === n.length - 1) {
      const minValue = minHeap.extractMin()
      if (minValue !== undefined) {
        currentSequence.push(minValue)
        lastAddedValue = minValue
      }
    }

    if (minHeap.allFlagged()) {
      sequences.push(currentSequence)
      currentSequence = []
      lastAddedValue = Number.NEGATIVE_INFINITY
      minHeap.clearAllFlags()
    }
  }

  if (currentSequence.length > 0) {
    sequences.push(currentSequence)
  }

  return sequences as Sequences
}

// Função para mesclar múltiplas sequências
export function mergeMultipleSequences(sequences: Sequence[]): Sequence {
  const merged: number[] = []
  const heads: number[] = new Array(sequences.length).fill(0)

  while (true) {
    let minValue = Number.POSITIVE_INFINITY
    let minIndex = -1

    // Encontrar o menor valor entre os elementos atuais de todas as sequências
    for (let i = 0; i < sequences.length; i++) {
      if (heads[i] < sequences[i].length && sequences[i][heads[i]] < minValue) {
        minValue = sequences[i][heads[i]]
        minIndex = i
      }
    }

    // Se não encontramos um valor mínimo, todas as sequências foram processadas
    if (minIndex === -1) {
      break
    }

    // Adicionar o valor mínimo à sequência mesclada e avançar o ponteiro
    merged.push(minValue)
    heads[minIndex]++
  }

  return merged as Sequence
}

export const deepCopy = <T>(array: T[]): T[] => JSON.parse(JSON.stringify(array))