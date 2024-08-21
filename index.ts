import { balancedMultiWaySort } from '~/balancedMultiwaySort'
import { cascadeSort } from '~/cascadeSort'
import { polyphaseSort } from '~/polyphaseSort'
import type { InputData, SortResult, SortMethod } from '~/types'

// Função principal para processar a entrada e executar o método de ordenação
function processInput(input: string[]): void {
  const method = input[0] as SortMethod
  const [mMaximumMemoryInRegisters, kMaximumFilesOpened, rInitialRuns] =
    input[1].split(' ').map(Number)
  const nListToBeSorted = input[2].split(' ').map(Number)

  const data: InputData = {
    method,
    kMaximumFilesOpened,
    mMaximumMemoryInRegisters,
    rInitialRuns,
    nListToBeSorted,
  }

  let result: SortResult
  if (method === 'B') {
    result = balancedMultiWaySort({
      kMaximumFilesOpened: kMaximumFilesOpened,
      mMaximumMemoryInRegisters: mMaximumMemoryInRegisters,
      rInitialRuns: rInitialRuns,
      nListToBeSorted: nListToBeSorted,
      method: 'B',
    })
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
}

// Teste com exemplo de entrada
const inputExample = ['P', '3 4 3', '7 1 5 6 3 8 2 10 4 9 1 3 7 4 1 2 3']
processInput(inputExample)
