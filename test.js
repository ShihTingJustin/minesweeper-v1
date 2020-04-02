let fieldIdx = '5-9'
const xStr = String(fieldIdx).substring(0, 1)
const yStr = String(fieldIdx).substring(2, 3)
const xNum = Number(xStr)
const yNum = Number(yStr)
const p = [
  `${xNum - 1}-${yNum - 1}`,
  `${xNum - 1}-${yNum}`,
  `${xNum - 1}-${yNum + 1}`,
  `${xNum}-${yNum - 1}`,
  `${xNum}-${yNum + 1}`,
  `${xNum + 1}-${yNum - 1}`,
  `${xNum + 1}-${yNum}`,
  `${xNum + 1}-${yNum + 1}`
]
const data = []
console.log(p)

switch (yNum) {
  case 9:
    p.map(x => {
      const xStrS = String(x).substring(0, 1)
      const yStrS = String(x).substring(2, 3)
      const xNumS = Number(xStrS)
      const yNumS = Number(yStrS)

      if (xNumS >= 1 && yNumS > 1) {
        data.push(`${xNumS}-${yNumS}`)
      }
    })
    break

  default:
    p.map(x => {
      const xStrS = String(x).substring(0, 1)
      const yStrS = String(x).substring(2, 3)
      const xNumS = Number(xStrS)
      const yNumS = Number(yStrS)

      if ((xNumS >= 1 && xNumS <= 9) && (yNumS >= 1 && yNumS <= 9)) {
        data.push(`${xNumS}-${yNumS}`)
      }
    })
}
console.log(data)

function fuck(i) {
  if (i === 1) {
    return true
  } else return false
}

console.log(fuck(5))