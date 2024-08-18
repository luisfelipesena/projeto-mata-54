export function calculateBeta(m: number, sequences: number[][]): number {
  const totalLength = sequences.reduce((acc, seq) => acc + seq.length, 0)
  return totalLength / (m * sequences.length)
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
export function generateInitialSequences(n: number[], m: number): number[][] {
  const sequences: number[][] = []
  let heap: number[] = []

  for (let i = 0; i < n.length; i++) {
    heap.push(n[i])
    if (heap.length === m || i === n.length - 1) {
      heap.sort((a, b) => a - b) // Ordena o heap
      sequences.push([...heap]) // Adiciona uma cópia do heap como uma sequência
      heap = []
    }
  }

  return sequences
}

// Função para geração de sequências iniciais usando seleção natural
export function generateInitialSequencesWithPaths(n: number[], m: number, p: number): number[][] {
  const sequences: number[][] = []
  let heap: number[] = []
  let currentPath = 0

  for (let i = 0; i < n.length; i++) {
    heap.push(n[i])
    if (heap.length === m || i === n.length - 1) {
      heap.sort((a, b) => a - b) // Ordena o heap

      // Divide o heap em p caminhos
      const sequenceSize = Math.ceil(heap.length / p)
      for (let j = 0; j < p && heap.length > 0; j++) {
        const pathSequence = heap.splice(0, sequenceSize)
        if (pathSequence.length > 0) {
          sequences.push(pathSequence)
          currentPath = (currentPath + 1) % p
        }
      }

      heap = []
    }
  }

  return sequences
}

// Função para mesclar múltiplas sequências
export function mergeMultipleSequences(sequences: number[][]): number[] {
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

  return merged
}
