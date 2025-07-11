export const zIndex = {
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
  modal: 1000,
  notification: 1100,
} as const

export type ZIndex = typeof zIndex