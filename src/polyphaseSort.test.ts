import { it, expect } from 'bun:test'
import type { InputData, Sequence, Sequences } from './types'
import { polyphaseSort, distributeInitialSequences, generateFibonacciSequenceGeneralized, findNearestFibonacciGeneralized, fillInitialSequences, buildIntercalationTable } from '~/polyphaseSort'
import { generateInitialSequences } from '~/utils'

it('Sequencia generalizada de fibonnaci', () => {
  const result = generateFibonacciSequenceGeneralized(10, 4)
  expect(result).toEqual([1, 1, 1, 1, 4, 7, 13, 25, 49, 94])
})
it('Deve encontrar o número mais próximo de fibonacci', () => {
  const result = findNearestFibonacciGeneralized(9, [1, 1, 2, 3, 5, 8, 13, 21, 34, 55])
  expect(result).toEqual(13)
})
it('Deve completar as sequencias iniciais com sequencias vazias', () => {
  const kMaximumFilesOpened = 4
  const mMaximumMemoryInRegisters = 3
  const rInitialRuns = 4
  const initialSequences = generateInitialSequences([7, 1, 5, 6, 3, 8, 2, 10, 4, 9, 1, 3, 7, 4, 1, 2, 3], mMaximumMemoryInRegisters, rInitialRuns)
  const fibonacciSequence = generateFibonacciSequenceGeneralized(10, kMaximumFilesOpened - 1)
  const nearestFibonacci = findNearestFibonacciGeneralized(initialSequences.length, fibonacciSequence)
  expect(nearestFibonacci).toEqual(5)

  const filledSequences = fillInitialSequences([] as unknown as Sequences, nearestFibonacci)
  expect(filledSequences.length).toEqual(nearestFibonacci)
})
it('Deve construir a tabela de intercalamento', () => {
  const kMaximumFilesOpened = 4
  const mMaximumMemoryInRegisters = 3
  const rInitialRuns = 4
  const initialSequences = generateInitialSequences([7, 1, 5, 6, 3, 8, 2, 10, 4, 9, 1, 3, 7, 4, 1, 2, 3], mMaximumMemoryInRegisters, rInitialRuns)
  const fibonacciSequence = generateFibonacciSequenceGeneralized(10, kMaximumFilesOpened - 1)
  const nearestFibonacci = findNearestFibonacciGeneralized(initialSequences.length, fibonacciSequence)
  expect(nearestFibonacci).toEqual(5)

  const filledSequences = fillInitialSequences([] as unknown as Sequences, nearestFibonacci)
  expect(filledSequences.length).toEqual(nearestFibonacci)
})

it('Deve construir a tabela de intercalação corretamente', () => {
  const input: InputData = {
    method: 'P',
    mMaximumMemoryInRegisters: 3,
    kMaximumFilesOpened: 3,
    rInitialRuns: 3,
    nListToBeSorted: [7, 1, 5, 6, 3, 8, 2, 10, 4, 9, 1, 3, 7, 4, 1, 2, 3],
  }

  const result = buildIntercalationTable(input)

  // Verificar se a tabela tem o número correto de níveis
  expect(result.length).toBe(5)

  // Verificar o primeiro nível
  expect(result[0]).toEqual([0, 0, 1])

  // Verificar o segundo nível
  expect(result[1]).toEqual([1, 1, 0])

  // Verificar os níveis subsequentes
  expect(result[2]).toEqual([0, 2, 1])
  expect(result[3]).toEqual([2, 0, 3])
  expect(result[4]).toEqual([5, 3, 0])

  // Verificar se todos os níveis têm o número correto de arquivos
  result.forEach(level => {
    expect(level.length).toBe(input.kMaximumFilesOpened)
  })

  // Verificar se a soma dos elementos em cada nível segue a sequência de Fibonacci generalizada
  const sums = result.map(level => level.reduce((a, b) => a + b, 0))
  expect(sums).toEqual([1, 2, 3, 5, 8])
})

it.skip('Exemplo do pdf', () => {
  const input: InputData = {
    method: 'P',
    mMaximumMemoryInRegisters: 3,
    kMaximumFilesOpened: 4,
    rInitialRuns: 3,
    nListToBeSorted: [7, 1, 5, 6, 3, 8, 2, 10, 4, 9, 1, 3, 7, 4, 1, 2, 3],
  }

  const result = polyphaseSort(input)
  const expectedSortedSequence = [
    1, 1, 2, 3, 3, 4, 4, 5, 6, 7, 7, 8, 9, 10,
  ] as Sequence
  // console.log(result)
  expect(result.phases.at(-1)?.sequences[0]).toEqual(expectedSortedSequence)
})

it.skip('distributeInitialSequences', () => {
  const initialSequences = Array.from({ length: 19 }, (_, i) => [
    i * 3 + 1,
    i * 3 + 2,
    i * 3 + 3,
  ]) as unknown as Sequences
  const kMaximumFilesOpened = 6
  const result = distributeInitialSequences(
    initialSequences,
    kMaximumFilesOpened,
  )
})