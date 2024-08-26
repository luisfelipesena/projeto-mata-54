import { balancedMultiWaySort } from '~/balancedMultiwaySort'
import { cascadeSort } from '~/cascadeSort'
import { polyphaseSort } from '~/polyphaseSort'
import type { InputData, SortResult } from '~/types'
import * as fs from 'node:fs'

// Função para ler a entrada do arquivo
function readInputFromFile(filePath: string): InputData {
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const lines = fileContent.trim().split('\n')

  const method = lines[0].trim() as 'B' | 'P' | 'C'
  const [m, k, r] = lines[1].split(' ').map(Number)
  const nListToBeSorted = lines[2].split(' ').map(Number)

  return {
    method,
    mMaximumMemoryInRegisters: m,
    kMaximumFilesOpened: k,
    rInitialRuns: r,
    nListToBeSorted
  }
}

// Função principal para processar a entrada e executar o método de ordenação
export function processInput(filePath: string) {
  const data = readInputFromFile(filePath)

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

// Verifica se um caminho de arquivo foi fornecido como argumento
if (process.argv.length < 3) {
  console.log('Por favor, forneça o caminho do arquivo de entrada como argumento.')
  process.exit(1)
}

// Executa o processamento da entrada
const filePath = process.argv[2]
processInput(filePath)