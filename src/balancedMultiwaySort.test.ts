import { describe, it, expect } from 'bun:test'
import { balancedMultiWaySort } from './balancedMultiwaySort'
import type { InputData } from './types'

describe('balancedMultiwaySort', () => {
  it('deve ordenar corretamente uma entrada simples', () => {
    const input: InputData = {
      method: 'B',
      mMaximumMemoryInRegisters: 3,
      kMaximumFilesOpened: 4,
      rInitialRuns: 3,
      nListToBeSorted: [3, 1, 4, 1, 5, 9, 2, 6]
    }

    const result = balancedMultiWaySort(input)
    console.log(result)

    const numberOfPhases = result.phases.length;
    const lastPhase = result.phases[numberOfPhases - 1];
    const sortedSequence = lastPhase.sequences[0];
    const expectedSortedSequence = [1, 1, 2, 3, 4, 5, 6, 9];
    const alphaValue = result.alpha;

    expect(numberOfPhases).toBeGreaterThan(0);
    expect(sortedSequence).toEqual(expectedSortedSequence);
    expect(alphaValue).toBeGreaterThan(0);
  })

  it('deve lidar corretamente com uma entrada já ordenada', () => {
    const input: InputData = {
      method: 'B',
      mMaximumMemoryInRegisters: 3,
      kMaximumFilesOpened: 4,
      rInitialRuns: 3,
      nListToBeSorted: [1, 2, 3, 4, 5]
    }

    const result = balancedMultiWaySort(input)

    expect(result.phases.length).toBe(1) // Apenas a fase inicial
    expect(result.phases[0].sequences[0]).toEqual([1, 2, 3])
    expect(result.phases[0].sequences[1]).toEqual([4, 5])
    expect(result.alpha).toBe(1) // Cada elemento é escrito apenas uma vez
  })

  it('deve calcular corretamente beta para cada fase', () => {
    const input: InputData = {
      method: 'B',
      mMaximumMemoryInRegisters: 2,
      kMaximumFilesOpened: 4,
      rInitialRuns: 3,
      nListToBeSorted: [5, 2, 8, 1, 9, 3]
    }

    const result = balancedMultiWaySort(input)

    expect(result.phases[0].beta).toBe(1) // (2 + 2 + 2) / (2 * 3)
    expect(result.phases[1].beta).toBe(1.5) // (3 + 3) / (2 * 2)
    expect(result.phases[2].beta).toBe(3) // 6 / (2 * 1)
  })

  it('deve lidar com entradas de tamanho ímpar', () => {
    const input: InputData = {
      method: 'B',
      mMaximumMemoryInRegisters: 3,
      kMaximumFilesOpened: 4,
      rInitialRuns: 3,
      nListToBeSorted: [7, 3, 1, 5, 2]
    }

    const result = balancedMultiWaySort(input)

    expect(result.phases[result.phases.length - 1].sequences[0]).toEqual([1, 2, 3, 5, 7])
  })
})