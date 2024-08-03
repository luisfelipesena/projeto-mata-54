export class CascadeSort {
  private heap: number[]
  private phases: { phase: number; sequences: number[][]; beta: number }[]
  private alpha: number

  constructor() {
    this.heap = []
    this.phases = []
    this.alpha = 0
  }

  sort(file: number[], m: number, k: number): number[] {
    let runs = this.generateInitialRuns(file, m)
    this.recordPhase(0, runs, m)
    let result: number[] = []
    let phase = 1
    while (runs.length > 1) {
      runs = this.mergeRuns(runs, k)
      this.recordPhase(phase++, runs, m)
    }
    result = runs[0]
    this.calculateAlpha(file.length)
    this.printPhases()
    return result
  }

  private generateInitialRuns(file: number[], m: number): number[][] {
    const runs: number[][] = []
    const run: number[] = []
    this.heap = file.slice(0, m)
    this.heap.sort((a, b) => a - b)
    let i = m
    while (i < file.length) {
      run.push(this.heap[0])
      this.heap[0] = file[i]
      i++
      this.heap.sort((a, b) => a - b)
    }
    runs.push(run)
    return runs
  }

  private mergeRuns(runs: number[][], k: number): number[][] {
    const mergedRuns: number[][] = []
    const run: number[] = []
    while (runs.length > 0) {
      let min = Number.POSITIVE_INFINITY
      let minIndex = -1
      for (let i = 0; i < runs.length; i++) {
        if (runs[i][0] < min) {
          min = runs[i][0]
          minIndex = i
        }
      }
      run.push(runs[minIndex].shift()!)
      if (runs[minIndex].length === 0) {
        runs.splice(minIndex, 1)
      }
    }
    mergedRuns.push(run)
    return mergedRuns
  }

  private recordPhase(phase: number, runs: number[][], m: number): void {
    const totalSize = runs.reduce((sum, run) => sum + run.length, 0)
    const beta = totalSize / (m * runs.length)
    this.phases.push({ phase, sequences: runs, beta })
  }

  private calculateAlpha(n: number): void {
    const totalOperations = this.phases.reduce(
      (sum, phase) => sum + phase.sequences.length,
      0,
    )
    this.alpha = totalOperations / n
  }

  private printPhases(): void {
    for (const phase of this.phases) {
      console.log(`fase ${phase.phase} ${phase.beta.toFixed(2)}`)
      phase.sequences.forEach((seq, index) => {
        console.log(`${index + 1}: {${seq.join(' ')}}`)
      })
    }
    console.log(`final ${this.alpha.toFixed(2)}`)
  }
}
