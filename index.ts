import { balancedMultiWaySort } from '~/balancedMultiwaySort'
import { cascadeSort } from '~/cascadeSort'
import { polyphaseSort } from '~/polyphaseSort'
import type { InputData, SortResult } from '~/types'

// Função principal para processar a entrada e executar o método de ordenação
export function processInput(data: InputData) {

  let result: SortResult
  if (data.method === 'B') {
    result = balancedMultiWaySort(data)
  } else if (data.method === 'P') {
    result = polyphaseSort(data)
  } else if (data.method === 'C') {
    result = cascadeSort(data)
  } else {
    console.log(`Método ${data.method} não reconhecido.`)
    return
  }

  // Exibe o resultado
  result.phases.forEach((phase) => {
    console.log(`fase ${phase.phase} ${phase.beta.toFixed(2)}`)
    phase.filesOpened.forEach((files, index) => {
      const sequences = files.reduce((acc, file) => {
        return `${acc} {${file.join(' ')}}`
      }, '')
      if (sequences) {
        console.log(`${index + 1}: ${sequences}`)
      }
    })
  })
  console.log(`final ${result.alpha.toFixed(2)}`)
  return result
}

// Teste com exemplo de entrada
processInput({
  method: 'B',
  mMaximumMemoryInRegisters: 3,
  kMaximumFilesOpened: 4,
  rInitialRuns: 3,
  nListToBeSorted: [7, 1, 5, 6, 3, 8, 2, 10, 4, 9, 1, 3, 7, 4, 1, 2, 3],
})
