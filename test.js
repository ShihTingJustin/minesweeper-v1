function startTimer(seconds) {
  const now = Date.now() //取得現在的時間戳記
  const endTime = Date.now() + seconds * 1000 //結束的時間戳記
  console.log({
    now,
    endTime
  })

  const timerId = setInterval(() => {
    const remainingSeconds = Math.floor(endTime - Date.now())

    console.log(`剩餘時間： ${remainingSeconds}`)
    if (remainingSeconds < 0) {
      alert('時間到')
      clearInterval(timerId)
      return
    }
  }, 1000)
}

startTimer(10)