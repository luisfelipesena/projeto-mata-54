import { balancedMultiWaySort } from '~/balancedMultiwaySort'
import { polyphaseSort } from '~/polyphaseSort'
import { cascadeSort } from '~/cascadeSort'
import * as fs from 'node:fs';

function gerarListaDeterministica(tamanho: number, semente: number): number[] {
  const lista: number[] = []
  let valor = semente

  for (let i = 0; i < tamanho; i++) {
    valor = (valor * 1103515245 + 12345) & 0x7fffffff
    lista.push(valor % 50000)
  }

  return lista
}

const R = [] as number[]
for (let i = 1; i <= 10; i++) {
  for (let j = 10; j <= 1000; j += 10) {
    const r = i * j
    if (r <= 5000) {
      R.push(r)
    }
  }
}

const K = [4, 6, 8, 10, 12]
const metodos = [
  // 'B',
  // 'P',
  'C'
] as const

type Resultado = {
  metodo: typeof metodos[number]
  k: number
  r: number
  alpha: number
}

const resultados: Resultado[] = []

for (const metodo of metodos) {
  for (const k of K) {
    for (const r of R) {
      const lista = gerarListaDeterministica(50000, 42)
      let resultado: any

      switch (metodo) {
        case 'B':
          resultado = balancedMultiWaySort({
            method: 'B',
            mMaximumMemoryInRegisters: 3,
            kMaximumFilesOpened: k,
            rInitialRuns: r,
            nListToBeSorted: lista,
          })
          break
        case 'P':
          resultado = polyphaseSort({
            method: 'P',
            mMaximumMemoryInRegisters: 3,
            kMaximumFilesOpened: k,
            rInitialRuns: r,
            nListToBeSorted: lista,
          })
          break
        case 'C':
          resultado = cascadeSort({
            method: 'C',
            mMaximumMemoryInRegisters: 3,
            kMaximumFilesOpened: k,
            rInitialRuns: r,
            nListToBeSorted: lista,
          })
          break
      }

      resultados.push({
        metodo,
        k,
        r,
        alpha: resultado?.alpha ?? 0
      })
    }
  }
}

// Criar o conteúdo do CSV
let csvContent = 'metodo,k,r,alpha\n';
for (const resultado of resultados) {
  csvContent += `${resultado.metodo},${resultado.k},${resultado.r},${resultado.alpha}\n`;
}

// Salvar o arquivo CSV
fs.writeFileSync('resultados_experimento.csv', csvContent);

console.log('Dados salvos em resultados_experimento.csv');
console.log('finished');