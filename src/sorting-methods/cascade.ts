export class CascadeSort {
  private heap: number[]

  constructor() {
    this.heap = []
  }

  sort(file: number[], m: number, k: number): number[] {
    let runs = this.generateInitialRuns(file, m)
    let result: number[] = []
    while (runs.length > 1) {
      runs = this.mergeRuns(runs, k)
    }
    result = runs[0]
    return result
  }

  private generateInitialRuns(file: number[], m: number): number[][] {
    // Gera runs iniciais usando seleção natural
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
    // Intercala as runs usando k arquivos temporários
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
      // biome-ignore lint/style/noNonNullAssertion: TODO
      run.push(runs[minIndex].shift()!)
      if (runs[minIndex].length === 0) {
        runs.splice(minIndex, 1)
      }
    }
    mergedRuns.push(run)
    return mergedRuns
  }
}
