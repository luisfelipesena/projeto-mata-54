import { describe, it, expect } from 'bun:test'
import { MinHeap } from './minHeap'

describe('MinHeap', () => {
  it('deve inserir elementos corretamente e manter o tamanho máximo de 3', () => {
    const heap = new MinHeap()
    const maxSize = 3
    const values = [18, 7, 3, 24, 15, 5, 20, 25, 16, 14]
    const sequence: number[] = []
    let maxValue: number | undefined = undefined

    console.log('Inserindo elementos na heap:')

    values.forEach((value, index) => {
      if (maxValue !== undefined && value < maxValue) {
        heap.insertFlagged(value)
      } else {
        heap.insert(value)
      }

      if (heap.size() > maxSize) {
        maxValue = heap.extractMin()
        sequence.push(maxValue!)
      }

      console.log(`Após inserir ${value} (maxValue: ${maxValue}):`)
      logHeapState(heap, sequence)

    })

    expect(heap.size()).toBe(3)
    expect(heap.allFlagged()).toBe(true)
  })
})

function logHeapState(heap: MinHeap, sequence: number[]) {
  const elements: string[] = []
  for (let i = 0; i < heap.size(); i++) {
    const value = heap.heap[i].value
    const flagged = heap.getFlag(i)
    elements.push(`${value}${flagged ? '(F)' : ''}`)
  }
  console.log(`Heap: [${elements.join(', ')}]`)
  console.log(`Sequence: [${sequence.join(', ')}]`)
}