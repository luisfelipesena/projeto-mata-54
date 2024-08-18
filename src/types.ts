export type SortMethod = 'B' | 'P' | 'C'

export interface InputData {
  /** Método de ordenação escolhido (B: Balanceada multi-caminhos, P: Polifásica, C: Cascata) */
  method: SortMethod
  /** Capacidade da memória principal em número de registros */
  mMaximumMemoryInRegisters: number
  /** Número máximo de arquivos que podem ser abertos simultaneamente */
  kMaximumFilesOpened: number
  /** Número inicial de sequências ordenadas (runs) a serem geradas */
  rInitialRuns: number
  /** Array contendo os valores dos registros a serem ordenados */
  nListToBeSorted: number[]
}

type Sequences = number[][]
export interface PhaseResult {
  phase: number
  beta: number
  sequences: Sequences
  filesOpened: Sequences[]
}

export interface SortResult {
  phases: PhaseResult[]
  alpha: number
}