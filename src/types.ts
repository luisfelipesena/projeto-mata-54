export type SortMethod = 'B' | 'P' | 'C'

export interface InputData {
  method: SortMethod
  m: number
  k: number
  r: number
  n: number[]
}

export interface PhaseResult {
  phase: number
  beta: number
  sequences: number[][]
}

export interface SortResult {
  phases: PhaseResult[]
  alpha: number
}