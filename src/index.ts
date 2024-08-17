import type { InputData, SortResult, SortMethod } from './types'
import { balancedMultiWaySort } from './balancedMultiwaySort'
import { polyphaseSort } from './polyphaseSort'
import { cascadeSort } from './cascadeSort'

// Função principal para processar a entrada e executar o método de ordenação
function processInput(input: string[]): void {
  const method = input[0] as SortMethod
  const [m, k, r] = input[1].split(' ').map(Number)
  const n = input[2].split(' ').map(Number)

  const data: InputData = { method, mMaximumMemoryInRegisters: m, kMaximumFilesOpened: k, rInitialRuns: r, nListToBeSorted: n }

  let result: SortResult
  if (method === 'B') {
    result = balancedMultiWaySort(data)
  } else if (method === 'P') {
    result = polyphaseSort(data)
  } else if (method === 'C') {
    result = cascadeSort(data)
  } else {
    console.log(`Método ${method} não reconhecido.`)
    return
  }

  // Exibe o resultado
  result.phases.forEach((phase) => {
    console.log(`fase ${phase.phase} ${phase.beta.toFixed(2)}`)
    phase.sequences.forEach((seq, index) => {
      console.log(`${index + 1}: {${seq.join(' ')}}`)
    })
  })
  console.log(`final ${result.alpha.toFixed(2)}`)
}

// Teste com exemplo de entrada
const inputExample = ['B', '3 4 3', '7 1 5 6 3 8 2 10 4 9 1 3 7 4 1 2 3']
processInput(inputExample)
