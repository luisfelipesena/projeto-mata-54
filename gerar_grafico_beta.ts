import { balancedMultiWaySort } from '~/balancedMultiwaySort'
import { polyphaseSort } from '~/polyphaseSort'
import { cascadeSort } from '~/cascadeSort'
import * as fs from 'node:fs';
import type { SortResult } from '~/types';

function gerarListaDeterministica(tamanho: number, semente: number): number[] {
  const lista: number[] = []
  let valor = semente

  for (let i = 0; i < tamanho; i++) {
    valor = (valor * 1103515245 + 12345) & 0x7fffffff
    lista.push(valor % 50000)
  }

  return lista
}

const K = 4 // Valor fixo para k
const M = [3, 5, 7, 9, 11, 13, 15] // Valores de m para testar
const metodos = [
  'B',
  'P',
  'C'
] as const

type Resultado = {
  metodo: typeof metodos[number]
  k: number
  m: number
  j: number
  beta: number
}

const resultados: Resultado[] = []

for (const metodo of metodos) {
  for (const m of M) {
    const lista = gerarListaDeterministica(50000, 42)
    let resultado: SortResult

    switch (metodo) {
      case 'B':
        resultado = balancedMultiWaySort({
          method: 'B',
          mMaximumMemoryInRegisters: m,
          kMaximumFilesOpened: K,
          rInitialRuns: 10,  // Valor fixo para r
          nListToBeSorted: lista,
        })
        break
      case 'P':
        resultado = polyphaseSort({
          method: 'P',
          mMaximumMemoryInRegisters: m,
          kMaximumFilesOpened: K,
          rInitialRuns: 10,  // Valor fixo para r
          nListToBeSorted: lista,
        })
        break
      case 'C':
        resultado = cascadeSort({
          method: 'C',
          mMaximumMemoryInRegisters: m,
          kMaximumFilesOpened: K,
          rInitialRuns: 10,  // Valor fixo para r
          nListToBeSorted: lista,
        })
        break
    }

    resultado.phases.forEach((phase, j) => {
      resultados.push({
        metodo,
        k: K,
        m,
        j,
        beta: phase.beta
      })
    })
  }
}

// Criar o conteúdo do CSV para cada método
for (const metodo of metodos) {
  let csvContent = 'metodo,k,m,j,beta\n';
  for (const resultado of resultados) {
    if (resultado.metodo === metodo) {
      csvContent += `${resultado.metodo},${resultado.k},${resultado.m},${resultado.j},${resultado.beta}\n`;
    }
  }

  // Salvar o arquivo CSV para cada método
  fs.writeFileSync(`resultados_experimento_beta_${metodo}.csv`, csvContent);
  console.log(`Dados salvos em resultados_experimento_beta_${metodo}.csv`);
}

console.log('finished');