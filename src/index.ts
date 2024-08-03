import {
  BalancedMultiwaySort,
  PolyphaseSort,
  CascadeSort,
} from './sorting-methods' // Assumindo que os métodos foram exportados de um módulo
import readline from 'node:readline'

function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  let method: string
  let m: number
  let k: number
  let r: number
  let n: number
  let values: number[] = []

  rl.question('Enter the sorting method (B, P, or C): ', (answer1: string) => {
    method = answer1.trim()
    rl.question('Enter the values of m, k, r, and n: ', (answer2: string) => {
      const params = answer2.trim().split(' ').map(Number)
      m = params[0]
      k = params[1]
      r = params[2]
      n = params[3]

      rl.question('Enter the values to be sorted: ', (answer3: string) => {
        values = answer3.trim().split(' ').map(Number)
        rl.close()

        let sorter: any
        switch (method) {
          case 'B':
            sorter = new BalancedMultiwaySort()
            break
          case 'P':
            sorter = new PolyphaseSort()
            break
          case 'C':
            sorter = new CascadeSort()
            break
          default: {
            console.error('Invalid method')
            return
          }
        }

        const sortedFile = sorter.sort(values, m, k)

        console.log('Sorted File:', sortedFile)
        // The printPhases method of each sorting class already prints the required details.
      })
    })
  })
}

main()
