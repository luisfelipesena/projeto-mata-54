import { balancedMultiWaySort } from '~/balancedMultiwaySort'
import * as fs from 'node:fs';

function gerarListaDeterministica(tamanho: number, semente: number): number[] {
  const lista: number[] = []
  let valor = semente

  for (let i = 0; i < tamanho; i++) {
    // Algoritmo simples de geração de números pseudoaleatórios
    valor = (valor * 1103515245 + 12345) & 0x7fffffff
    lista.push(valor % 50000)
  }

  return lista
}

const R = [] as any
for (let i = 1; i <= 10; i++) {
  for (let j = 10; j <= 1000; j += 10) {
    const r = i * j
    if (r <= 5000) {
      R.push(r)
    }
  }
}

const resultados: [number, number][] = []

for (const r of R) {
  const resultado = balancedMultiWaySort({
    method: 'P',
    mMaximumMemoryInRegisters: 2,
    kMaximumFilesOpened: 8,
    rInitialRuns: r,
    nListToBeSorted: gerarListaDeterministica(50000, 42),
  })

  resultados.push([r, resultado?.alpha ?? 0])
}


// Criar o conteúdo do CSV
let csvContent = 'rInitialRuns,alphasGerados\n';
for (const [rInitialRuns, alphaGerado] of resultados) {
  csvContent += `${rInitialRuns},${alphaGerado}\n`;
}

// Salvar o arquivo CSV
fs.writeFileSync('resultados_experimento.csv', csvContent);

console.log('Dados salvos em resultados_experimento.csv');
console.log('finished');