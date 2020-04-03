GAME_STATE = {
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
      field.classList.add('fas', 'fa-bomb', 'open')
      console.log(field)
    } else if (controller.getFieldData(field.dataset.index) === 0) {
      //打開時周邊沒地雷 就變成海洋
      field.classList.add('open', 'ocean')
    } else {
      field.classList.add('open')
      field.innerText = `${model.fieldMineAmount}`
    }
  },

  /**
   * renderTime()
   * 顯示經過的遊戲時間在畫面上。
   */
  renderTime(time) { },

  /**
   * showBoard()
   * 遊戲結束時，或是 debug 時將遊戲的全部格子內容顯示出來。
   */
  showBoard() {
    const squares = document.querySelectorAll('.square')
    squares.forEach(square => {
      if (square.classList.contains('mine')) {
        square.classList.add('fas', 'fa-bomb')
      }
    })
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
    document.querySelector('.flag-counter').innerHTML = `flags: ${model.flags}`
    controller.setMouseEvent()
    console.log(model.mines)
  },
  setMouseEvent() {
    const playGround = document.querySelector('#game')
    playGround.addEventListener('click', e => {
      if (e.target.classList.contains('open') || e.target.classList.contains('flag')) {
        return
      } else if (e.target.classList.contains('square')) {
        controller.dig(e.target)
      }

      if (utility.isWin() === true) {
        controller.currentState = GAME_STATE.Win
        alert('Great Job! You Win!!!')
      }
      console.log(model.mines.length, model.fields.length)
    })

    playGround.addEventListener('contextmenu', e => {
      e.preventDefault()  //避免出現選單
      if (e.target.classList.contains('open')) {
        return
      } else if (e.target.classList.contains('flag')) {
        e.target.classList.remove('flag', 'fas', 'fa-flag')
        console.log('flag removed', model.fields)
      } else if (!e.target.classList.contains('flag')) {
        e.target.classList.add('flag', 'fas', 'fa-flag')
        console.log('flag added', model.fields)
      }
    })
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
  },

  /**
   * getFieldData()
   * 取得單一格子的內容，決定這個格子是海洋還是號碼，
   * 如果是號碼的話，要算出這個號碼是幾號。
   * （計算周圍地雷的數量）
   */
  getFieldData(fieldIdx) {
    //清空
    model.fieldMineAmount = 0
    //check fieldIdx周圍的格子
    const data = controller.checkSquareAround(fieldIdx)
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
  },

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

  /**
   * dig()
   * 使用者挖格子時要執行的函式，
   * 會根據挖下的格子內容不同，執行不同的動作，
   * 如果是號碼或海洋 => 顯示格子
   * 如果是地雷      => 遊戲結束
   */
  dig(field) {
    view.showFieldContent(field)
    if (model.isMine(field.dataset.index) === false) {
      controller.getFieldData(field.dataset.index)
      //掃描周圍地雷數量
      if (model.fieldMineAmount === 0) {
        //沒踩到地雷且周圍 地雷=0 就繼續踩周圍可以踩的格子
        const data = controller.checkSquareAround(field.dataset.index)
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
      //踩到地雷的狀況
      view.showFieldContent(field)
      //踩到的地雷加上紅色背景
      field.classList.add('GG')
      alert("Oh No, It's a mine! Sorry for that...")
      view.showBoard()
      controller.currentState = GAME_STATE.Lose
    }
  },
  getSettings() {
    const newGameBtn = document.querySelector('#New-btn')
    newGameBtn.addEventListener('click', () => {
      utility.cleanLastGameData()
      controller.currentState === GAME_STATE.Playing
      alert('New Game Start!')
      controller.createGame(9, 10)
    })

    const godModeBtn = document.querySelector('#GM-btn')
    godModeBtn.addEventListener('click', () => {
      if (controller.currentState === GAME_STATE.Lose) {
        alert("God Can't Help You, Please Start a New Game...")
      } else if (controller.currentState === GAME_STATE.Win) {
        alert("You Are Winner, Please Don't Bother God !!!")
      } else {
        view.showBoard()
        alert('Now You See All the Mines !!!')
      }
    })
  }
}


const model = {
  flags: 10,

  rows: 9,

  fieldMineAmount: 0,  //暫存九宮格內的地雷數量

  squarePositions: [], //暫存格子周圍存在的其他格子
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
  /**
   * getRandomNumberArray()
   * 取得一個隨機排列的、範圍從 0 到 count參數 的數字陣列。
   * 例如：
   *   getRandomNumberArray(4)
   *     - [3, 0, 1, 2]
   */
  getRandomNumberArray(count) {
    const number = [...Array(count).keys()]
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
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
  cleanLastGameData() {
    //畫面清空
    const playGround = document.querySelector('#game')
    playGround.innerHTML = ``
    //資料清空
    model.fieldMineAmount = 0
    model.squarePosition = []
    model.mines = []
    model.fields = []
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

controller.createGame(9, 10)
controller.getSettings()