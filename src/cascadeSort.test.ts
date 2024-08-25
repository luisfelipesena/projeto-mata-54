import { it, expect } from 'bun:test'
import { buildIntercalationTableCascade } from '~/cascadeSort'
import type { SequenceFile, Sequences } from '~/types'
import { mergeMultipleSequences } from '~/utils'

it.skip('Perfect Distribution', () => {
  const result = buildIntercalationTableCascade({ kMaximumFilesOpened: 6 }, 3)
  expect(result).toEqual([
    [0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ])
})

it('Perfect Distribution for 3 files', () => {
  const result = buildIntercalationTableCascade({ kMaximumFilesOpened: 3 }, 3)
  expect(result).toEqual([
    [0, 0],
    [1, 1],
    [2, 1],
  ])
})

it('CascadeMerge - deve realizar a mesclagem em cascata corretamente', () => {
  const genSequences = (sequenceLength: number, numberOfSequences: number) =>
    Array.from({ length: numberOfSequences }, (_) =>
      Array.from({ length: sequenceLength }, (_) => 1),
    ) as Sequences

  const file: SequenceFile = [
    [],
    [Array.from({ length: 10 }, (_) => 1)],
    [Array.from({ length: 19 }, (_) => 1)],
    [Array.from({ length: 26 }, (_) => 1)],
    [Array.from({ length: 30 }, (_) => 1)],
  ] as SequenceFile

  function mergeCascadePass(file: SequenceFile): SequenceFile {
    const T = file.length // Número total de fitas
    // AA[k]: Representa o número inicial de sequências em cada nível.
    const aa = file.map((sequences) => sequences.length)
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
    const tape = file.map((sequences, index) => ({ index, sequences }))
    // l = level
    let l = T - 1

    while (l > 0) {
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
      // C9. [Down a level.]
      l--
      first = 0
      // Rotate tapes: (TAPE[1], ..., TAPE[T]) <- (TAPE[T], ..., TAPE[1])
      tape.unshift(tape.pop()!)
      // Reset D and M (they will remain zero)
      D.fill(0)
      M.fill(0)
      console.log('tape', tape.map((t) => t.sequences.length))
    }

    // Retorna o resultado final
    return tape
  }
  const result = mergeCascadePass(file)

  // expect(mergeCascadePass(file)).toEqual([
  //   genSequences(10, 4),
  //   genSequences(9, 3),
  //   genSequences(7, 2),
  //   [],
  //   genSequences(4, 1),
  // ] as SequenceFile)
})
