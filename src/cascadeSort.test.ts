import { it, expect } from 'bun:test'
import { buildIntercalationTableCascade } from '~/cascadeSort'

it('Perfect Distribution', () => {
  const result = buildIntercalationTableCascade({ kMaximumFilesOpened: 6 }, 3)
  expect(result).toEqual([
    [0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ])
})

it('Perfect Distribution for 3 files', () => {
  const result = buildIntercalationTableCascade({ kMaximumFilesOpened: 3 }, 3)
  expect(result).toEqual([
    [0, 0], [1, 1], [2, 1]
  ])
})

