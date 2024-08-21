function generatePolyphasePattern(
  files: number,
  totalRuns: number,
): number[][] {
  const result = []
  let currentPattern = Array(files).fill(0)
  currentPattern[0] = 1 // Iniciando com 1 "run" no primeiro arquivo

  while (currentPattern.reduce((a, b) => a + b, 0) < totalRuns) {
    result.push([...currentPattern])

    // Geração do próximo padrão
    const newPattern = Array(files).fill(0)
    for (let i = 0; i < files; i++) {
      for (let j = 0; j < files; j++) {
        if (i !== j) {
          newPattern[i] += currentPattern[j]
        }
      }
    }
    currentPattern = newPattern
  }

  return result
}

// Exemplo de uso
const files = 4
const totalRuns = 13
const pattern = generatePolyphasePattern(files, totalRuns)
console.log(pattern)
