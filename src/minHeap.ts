class HeapElement {
  constructor(
    public value: number,
    public flagged = false,
  ) { }
}

export class MinHeap {
  heap: HeapElement[]
  insertFlagged(value: number): void {
    this.insert(value, true)
  }

  constructor() {
    this.heap = []
  }

  public size(): number {
    return this.heap.length
  }

  public isEmpty(): boolean {
    return this.size() === 0
  }

  public insert(value: number, flagged = false): void {
    const element = new HeapElement(value, flagged)
    this.heap.push(element)
    this.bubbleUp()
  }

  public extractMin(): number | undefined {
    if (this.isEmpty()) {
      return undefined
    }
    if (this.size() === 1) {
      return this.heap.pop()!.value
    }

    const min = this.heap[0].value
    this.heap[0] = this.heap.pop()!
    this.bubbleDown()

    return min
  }

  public peek(): number | undefined {
    return this.heap[0]?.value
  }

  public setFlag(index: number, value: boolean): void {
    if (index >= 0 && index < this.size()) {
      this.heap[index].flagged = value
    }
  }

  public getFlag(index: number): boolean {
    if (index >= 0 && index < this.size()) {
      return this.heap[index].flagged
    }
    return false
  }

  public allFlagged(): boolean {
    return this.heap.every((element) => element.flagged)
  }
  public clearAllFlags(): void {
    this.heap.forEach((element) => {
      element.flagged = false
    })
    this.bubbleDown()
  }

  private bubbleUp(): void {
    let index = this.size() - 1
    const current = this.heap[index]

    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2)
      const parent = this.heap[parentIndex]

      if (current.flagged && !parent.flagged) {
        break
      }

      if (!current.flagged && current.value >= parent.value) {
        break
      }

      this.heap[index] = parent
      index = parentIndex
    }

    this.heap[index] = current
  }

  private bubbleDown(): void {
    let index = 0
    const length = this.size()
    const current = this.heap[index]

    while (true) {
      const leftChildIndex = 2 * index + 1
      const rightChildIndex = 2 * index + 2
      let smallestChildIndex = index

      if (leftChildIndex < length) {
        const leftChild = this.heap[leftChildIndex]
        if (
          !leftChild.flagged &&
          (leftChild.value < this.heap[smallestChildIndex].value ||
            this.heap[smallestChildIndex].flagged)
        ) {
          smallestChildIndex = leftChildIndex
        }
      }

      if (rightChildIndex < length) {
        const rightChild = this.heap[rightChildIndex]
        if (
          !rightChild.flagged &&
          (rightChild.value < this.heap[smallestChildIndex].value ||
            this.heap[smallestChildIndex].flagged)
        ) {
          smallestChildIndex = rightChildIndex
        }
      }

      if (smallestChildIndex === index) {
        break
      }

      this.heap[index] = this.heap[smallestChildIndex]
      index = smallestChildIndex
    }

    this.heap[index] = current
  }
}
