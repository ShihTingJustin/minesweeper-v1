const GAME_STATE = {
  Playing: 'Playing',
  Win: 'Win',
  Lose: 'Lose',
}

const view = {
  /**
   * displayFields()
   * 顯示踩地雷的遊戲版圖在畫面上，
   * 輸入的 rows 是指版圖的行列數。
   */
  displayFields(rows) {
    const playGround = document.querySelector('#game')
    for (let i = 1; i <= rows; i++) {
      for (let j = 1; j <= 9; j++) {
        playGround.innerHTML += `
          <div data-index='${i}-${j}' class='square'></div>
        `
        model.squarePositions.push(`${i}-${j}`)
      }
    }
  },
  /**
   * showFieldContent()
   * 更改單一格子的內容，像是顯示數字、地雷，或是海洋。
   */
  showFieldContent(field) {
    if (model.mines.includes(field.dataset.index)) {
      //顯示地雷
      field.classList.add('fas', 'fa-bomb', 'open')
      console.log(field)
    } else if (controller.getFieldData(field.dataset.index) === 0) {
      //打開時周邊沒地雷 顯示海洋
      field.classList.add('open', 'ocean')
    } else {
      //顯示數字
      field.classList.add('open')
      field.innerText = `${model.fieldMineAmount}`
      //依據數字搭配不同顏色
      field.classList.add(`mine${model.fieldMineAmount}`)
    }
  },
  showFlagCounter() {
    document.getElementById('flag-counter').innerHTML = `flags: ${model.mines.length - model.flags.length}`
  },

  /**
   * renderTime()
   * 顯示經過的遊戲時間在畫面上。
   */
  renderTimer() {
    const timer = document.getElementById('timer');
    timer.innerHTML = String(model.timerStartTime).padStart(3, '0');
  },
  /**
   * showBoard()
   * 遊戲結束時，或是 debug 時將遊戲的全部格子內容顯示出來。
   */
  showBoard() {
    const squares = document.querySelectorAll('.square')
    switch (controller.currentState) {
      case GAME_STATE.Playing:
        squares.forEach(square => {
          if (square.classList.contains('mine')) {
            square.classList.add('fas', 'fa-bomb')
          }
        })
        break;

      default:
        squares.forEach(square => {
          if (square.classList.contains('mine')) {
            square.classList.add('fas', 'fa-bomb')
            if (square.classList.contains('flag')) {
              //遊戲結束時插在地雷上的旗子會打叉
              square.classList.remove('fa-flag', 'fa-bomb')
              square.classList.add('fas', 'fa-times')
              square.setAttribute('data-fa-mask', 'fas fa-bomb')
            }
          }
        })
    }
  }
}


const controller = {
  currentState: GAME_STATE.Playing,
  /**
   * createGame()
   * 根據參數決定遊戲版圖的行列數，以及地雷的數量，
   * 一定要做的事情有：
   *   1. 顯示遊戲畫面 OK
   *   2. 遊戲計時
   *   3. 埋地雷 OK
   *   4. 綁定事件監聽器到格子上
   */
  createGame(numberOfRows, numberOfMines) {
    controller.currentState = GAME_STATE.Playing
    view.displayFields(numberOfRows)
    controller.setMinesAndFields(numberOfMines)
    console.log(model.mines, controller.currentState)
  },
  leftClick(e) {
    switch (controller.currentState) {
      case GAME_STATE.Playing:
        if (e.target.classList.contains('open') || e.target.classList.contains('flag')) {
          return
        } else if (e.target.classList.contains('square')) {
          controller.dig(e.target)
        }
        break;

      default:
        return //遊戲結束無法點擊
    }
    if (controller.isWin() === true) {
      controller.currentState = GAME_STATE.Win
      alert('Great Job! You Win!!!')
      view.showBoard()
      controller.removeListeners()
      controller.stopTimer()
    }
    console.log(model.mines.length, model.fields.length)
  },
  rightClick(e) {
    switch (controller.currentState) {
      case GAME_STATE.Playing:
        e.preventDefault()  //避免出現選單
        controller.flag(e.target)
        break

      default:
        return //遊戲結束無法點擊
    }
  },
  addListeners() {
    const playGround = document.querySelector('#game')
    playGround.addEventListener('click', function L_Click(e) { controller.leftClick(e) })
    playGround.addEventListener('contextmenu', function R_Click(e) { controller.rightClick(e) })
    console.log('All Listeners Set')
  },
  removeListeners() {
    const playGround = document.querySelector('#game')
    switch (controller.currentState) {
      case GAME_STATE.Playing:
        playGround.removeEventListener('click', function L_Click(e) { controller.leftClick(e) })
        playGround.removeEventListener('contextmenu', function R_Click(e) { controller.rightClick(e) })
        console.log('All Listeners Remove')

      default:
        return
    }
  },

  /**
   * setMinesAndFields()
   * 設定格子的內容，以及產生地雷的編號。
   */
  setMinesAndFields(numberOfMines) {
    //從 squarePositions 隨機選出號碼(避免重複)當作地雷並存入model
    for (let i = 0; i < numberOfMines;) {
      let randomIndex = Math.floor(Math.random() * model.rows * 9)
      if (!model.mines.includes(model.squarePositions[randomIndex])) {
        model.mines.push(model.squarePositions[randomIndex])
        //遍歷所有格子 號碼有在model.mines的就加上mine
        const squares = document.querySelectorAll('.square')
        squares.forEach(square => {
          if (model.mines.includes(square.dataset.index)) {
            square.classList.add('mine')
          }
        })
        i++
      }
    }
    view.showFlagCounter()
  },

  /**
   * getFieldData()
   * 取得單一格子的內容，決定這個格子是海洋還是號碼，
   * 如果是號碼的話，要算出這個號碼是幾號。
   * （計算周圍地雷的數量）
   */
  getFieldData(fieldIdx) {
    if (controller.currentState === GAME_STATE.Playing) {
      //清空
      model.fieldMineAmount = 0
      //check fieldIdx周圍的格子
      const data = utility.checkSquareAround(fieldIdx)
      //掃描FieldIdx周圍的地雷數量
      data.forEach(square => {
        if (model.mines.includes(square)) {
          model.fieldMineAmount++
        }
      })
      //將格子資料更新到model
      switch (model.fields.length) {
        case 0:
          model.fields.push(
            {
              position: fieldIdx,
              type: "number",
              number: model.fieldMineAmount,
              isDigged: true
            }
          )
          break;

        default:
          if (model.isField(fieldIdx) === false) {
            model.fields.push(
              {
                position: fieldIdx,
                type: "number",
                number: model.fieldMineAmount,
                isDigged: true
              }
            )
          }
      }
      console.log(model.fields)
      return model.fieldMineAmount
    } else {
      return
    }
  },

  /**
   * dig()
   * 使用者挖格子時要執行的函式，
   * 會根據挖下的格子內容不同，執行不同的動作，
   * 如果是號碼或海洋 => 顯示格子
   * 如果是地雷      => 遊戲結束
   */
  dig(field) {
    model.leftClickTimes++
    if (!field.classList.contains('flag')) {
      view.showFieldContent(field)
      console.log(field)
      if (model.isMine(field.dataset.index) === false) {
        controller.getFieldData(field.dataset.index)
        //掃描周圍地雷數量
        if (model.fieldMineAmount === 0) {
          //沒踩到地雷且周圍 地雷=0 就繼續踩周圍可以踩的格子
          const data = utility.checkSquareAround(field.dataset.index)
          data.forEach(e => {
            const squares = document.querySelectorAll('.square')
            squares.forEach(square => {
              if (String(square.dataset.index) === String(e) && !square.classList.contains('open')) {
                controller.dig(square)
              }
            })
          })
        } else {
          //沒踩到地雷但周圍有地雷
          controller.getFieldData(field.dataset.index)
          view.showFieldContent(field)
        }
      } else {
        switch (model.leftClickTimes) {
          //第一次不會踩到地雷
          case 1:
            console.log('you click bomb but give you another chance')
            controller.firstClickMine(field)
            break

          default:
            //踩到地雷的狀況
            view.showFieldContent(field)
            //踩到的地雷加上紅色背景
            field.classList.add('GG')
            controller.currentState = GAME_STATE.Lose
            alert("Oh No, It's a mine! Sorry for that...")
            view.showBoard()
            controller.removeListeners()
            controller.stopTimer()
        }
      }
    }
  },
  firstClickMine(field) {
    //畫面更新
    field.classList.remove('fa-bomb', 'mine', 'open')
    //資料更新
    utility.cleanLastGameData(1)
    controller.setMinesAndFields(10)
    controller.dig(field)
  },
  flag(field) {
    console.log(field)
    if (field.classList.contains('open')) {
      return
    } else if (field.classList.contains('flag')) {
      field.classList.remove('flag', 'fa-flag')
      if (model.flags.includes(String(field.dataset.index))) {
        const idx = model.flags.indexOf(String(field.dataset.index))
        model.flags.splice(idx, 1)
        console.log('flag removed', model.flags)
      }
    } else if (!field.classList.contains('flag')) {
      field.classList.add('flag', 'fas', 'fa-flag')
      model.flags.push(field.dataset.index)
      console.log('flag added', model.flags)
    }
    view.showFlagCounter()
  },
  setTimer() {
    const endTime = 999
    model.timer = setInterval(() => {
      model.timerStartTime++
      view.renderTimer()
      if (model.timerStartTime === endTime) {
        clearInterval(model.timer)
        return
      }
    }, 1000)

  },
  stopTimer() {
    window.clearInterval(model.timer)
  },
  resetTimer() {
    model.timerStartTime = 0
    model.timer = 0
    view.renderTimer()
  },
  getSettings() {
    controller.addListeners()
    controller.setTimer()

    const newGameBtn = document.querySelector('#New-btn')
    newGameBtn.addEventListener('click', () => {
      utility.cleanLastGameData()
      controller.removeListeners() //監聽器要拿掉 因為createGame會綁上
      alert('New Game Start!')
      controller.createGame(9, 10)
      controller.stopTimer()
      controller.resetTimer()
      controller.setTimer()
    })

    const godModeBtn = document.querySelector('#GM-btn')
    godModeBtn.addEventListener('click', () => {
      switch (controller.currentState) {
        case GAME_STATE.Lose:
          alert("God Can't Help You, Please Start a New Game...")
          break

        case GAME_STATE.Win:
          alert("You Are Winner, Please Don't Bother God !!!")
          break

        default:
          view.showBoard()
          alert('Now You Could See All the Mines !!!')
      }
    })
  },
  isWin() {
    let result
    if (model.fields.length === (81 - model.mines.length)) {
      result = true
    } else {
      result = false
    }
    return result
  }
}


const model = {
  leftClickTimes: 0,

  flags: [],

  rows: 9,

  fieldMineAmount: 0,  //暫存九宮格內的地雷數量

  squarePositions: [], //遊戲開始時存入全部格子 之後用來暫存格子周圍存在的其他格子
  /**
   * mines
   * 存放地雷的編號（第幾個格子）
   */
  mines: [],
  /**
   * fields
   * 存放格子內容，這裡同學可以自行設計格子的資料型態，
   * 例如：
   * {
   *   type: "number",
   *   number: 1,
   *   isDigged: false
   * }
   */
  fields: [],

  timerStartTime: 0,

  timer,

  isField(fieldIdx) {      // 用來判斷格子有沒有存入 model.fields
    let result
    model.fields.forEach(f => {
      if (f.position === fieldIdx) {
        result = true
      } else {
        result = false
      }
    })
    return result
  },

  /**
   * isMine()
   * 輸入一個格子編號，並檢查這個編號是否是地雷
   */
  isMine(fieldIdx) {
    return this.mines.includes(String(fieldIdx))
  }
}


const utility = {
  timer() {

  },
  /**
   * getRandomNumberArray()
   * 取得一個隨機排列的、範圍從 0 到 count參數 的數字陣列。
   * 例如：
   *   getRandomNumberArray(4)
   *     - [3, 0, 1, 2]
   */
  checkSquareAround(fieldIdx) {
    //解析 fieldIdx
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
    //檢查八個格子的位置存在 避免 < 0 或 > 9 再存入陣列
    //還要檢查格子是否 Open 不然會無窮迴圈QQ
    switch (yNum) {
      case 9:
        p.map(x => {
          const xStrS = String(x).substring(0, 1)
          const yStrS = String(x).substring(2, 3)
          const xNumS = Number(xStrS)
          const yNumS = Number(yStrS)

          if (xNumS >= 1 && yNumS > 1 && (utility.isSquareOpened(x) === false)) {
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

          if ((xNumS >= 1 && xNumS <= 9) && (yNumS >= 1 && yNumS <= 9) && (utility.isSquareOpened(x) === false)) {
            data.push(`${xNumS}-${yNumS}`)
          }
        })
    }
    //console.log(data)
    return data
  },
  isSquareOpened(squarePosition) {    //判斷格子有沒有打開
    let result
    const squares = document.querySelectorAll('.square')
    squares.forEach(square => {
      if (String(square.dataset.index) === String(squarePosition)) {
        if (square.classList.contains('open')) {
          return result = true
        } else {
          return result = false
        }
      }
    })
    return result
    //沒注意到有兩層函式 少寫這一行 debug 一整天... 
  },
  cleanLastGameData(option) {
    const playGround = document.querySelector('#game')
    switch (option) {
      case 1:
        //畫面清空
        //playGround.innerHTML = ``
        //資料清空
        model.fieldMineAmount = 0
        model.squarePosition = []
        model.mines = []
        model.fields = []
        model.flags = []
        model.leftClickTimes = 0
        break

      default:
        //畫面清空
        playGround.innerHTML = ``
        //資料清空
        model.fieldMineAmount = 0
        model.squarePosition = []
        model.mines = []
        model.fields = []
        model.flags = []
        model.timerStartTime = 0
        model.leftClickTimes = 0
    }
  }
}

controller.createGame(9, 10)
controller.getSettings()