const GAME_STATE = {
  Playing: 'Playing',
  Win: 'Win',
  Lose: 'Lose'
}

const view = {
  /**
   * displayFields()
   * 顯示踩地雷的遊戲版圖在畫面上，
   * 輸入的 rows 是指版圖的行列數。
   */
  displayFields(rows, columns) {
    const playGround = document.querySelector('#game')
    for (let i = 1; i <= rows; i++) {
      for (let j = 1; j <= columns; j++) {
        playGround.innerHTML += `
          <div data-index='${i}-${j}' class='square'></div>
        `
        model.squarePositions.push(`${i}-${j}`)
      }
    }

    const style = document.getElementsByTagName('style')[0]
    let row = ''
    for (let i = 1; i <= rows; i++) {
      row += ` 30px`
    }

    let column = ''
    for (let i = 1; i <= columns; i++) {
      column += ` 30px`
    }

    style.innerHTML = `
    #game {
      grid-template-columns: ${column};
      grid-template-rows: ${row};
    }
    `
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
    document.getElementById('flag-counter').innerHTML = `<i id='info-flag' class="fas fa-flag" style='margin-right: 6px;'></i>${model.mines.length - model.flags.length}`
  },

  /**
   * renderTime()
   * 顯示經過的遊戲時間在畫面上。
   */
  renderTimer() {
    const timer = document.getElementById('timer');
    const padStart = String(model.timerStartTime).padStart(3, '0')
    timer.innerHTML = `<i class="fas fa-clock" style='margin-right: 0px;'></i>${padStart}`
  },
  renderWin(seconds) {
    const container = document.querySelector('#container')
    const title = document.querySelector('.title')
    container.classList.add('winner-border')
    title.classList.add('win-title')
    title.innerText = 'Congratulations'

    setInterval(() => {
      container.classList.toggle('winner-border')
      title.classList.toggle('win-title')
    }, 250)
  },
  stopRenderWin() {
    window.clearInterval(model.winTmId)
    const container = document.querySelector('#container')
    const title = document.querySelector('.title')
    container.classList.remove('winner-border')
    title.classList.remove('win-title')
    title.innerText = 'Minesweeper'
  },
  renderLose() {
    const title = document.querySelector('.title')
    const newGameBtn = document.querySelector('#New-btn')
    title.classList.add('lose-title', 'move')
    title.innerText = 'Give it Another Try'
    newGameBtn.classList.add('lose-newGameBtn')
  },
  stopRenderLose() {
    const title = document.querySelector('.title')
    const newGameBtn = document.querySelector('#New-btn')
    title.classList.remove('lose-title')
    newGameBtn.classList.remove('lose-newGameBtn')
    title.innerText = 'Minesweeper'
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

      case GAME_STATE.Win:
        squares.forEach(square => {
          if (square.classList.contains('mine')) {
            square.classList.add('fas', 'fa-bomb')
            if (square.classList.contains('flag')) {
              //遊戲結束時插在地雷上的旗子會留下且變成橘色
              square.classList.add('fa-flag')
              square.classList.add('flag-win')
              square.classList.remove('fa-bomb')
              console.log(square)
            }
          }
        })
        break

      case GAME_STATE.Lose:
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
        break
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
  createGame(numberOfRows, numberOfColumns, numberOfMines) {
    model.gameDifficulty = { rows: numberOfRows, columns: numberOfColumns, mines: numberOfMines }
    controller.currentState = GAME_STATE.Playing
    view.displayFields(numberOfRows, numberOfColumns)
    controller.setMinesAndFields(numberOfMines)
    console.log(model.mines, controller.currentState)
  },
  leftClick(e) {
    switch (controller.currentState) {
      case GAME_STATE.Playing:
        if (e.target.classList.contains('open') || e.target.classList.contains('flag')) {
          return
        } else if (e.target.classList.contains('square')) {
          model.leftClickTimes++
          //點擊成功一秒後開始計時
          if (model.leftClickTimes === 1) {
            setTimeout(controller.setTimer(), 1000)
          }
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
      view.renderWin(999)
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
      let randomIndex = Math.floor(Math.random() * model.squarePositions.length)
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
      //console.log(model.fields)
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
    if (!field.classList.contains('flag')) {
      view.showFieldContent(field)
      //console.log(field)
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
            view.renderLose()
            controller.removeListeners()
            controller.stopTimer()
        }
      }
    }
  },
  firstClickMine(field) {
    //畫面更新
    const squares = document.querySelectorAll('.square')
    squares.forEach(square => {
      if (square.classList.contains('mine')) {
        square.classList.remove('fa-bomb', 'mine', 'open')
      }
    })
    //資料更新
    utility.cleanLastGameData(1)
    controller.setMinesAndFields(model.gameDifficulty.mines)
    console.log(model.mines)
    controller.dig(field)
    model.leftClickTimes = 2
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
  modalGame() {
    const modal = document.querySelector('.modal-content')
    const beginner = document.getElementById('beginner')
    const master = document.getElementById('master')
    const legend = document.getElementById('legend')
    const custom = document.getElementById('custom')
    const saveBtn = document.querySelector('#modal-save-btn')

    modal.addEventListener('click', e => {
      if (beginner.checked) {
        if (e.target.id === 'modal-save-btn') {
          view.stopRenderWin()
          view.stopRenderLose()
          controller.startNewGame(9, 9, 10)
          saveBtn.setAttribute('data-dismiss', 'modal')
        }
      } else if (master.checked) {
        if (e.target.id === 'modal-save-btn') {
          view.stopRenderWin()
          view.stopRenderLose()
          controller.startNewGame(16, 16, 40)
          saveBtn.setAttribute('data-dismiss', 'modal')
        }
      } else if (legend.checked) {
        if (e.target.id === 'modal-save-btn') {
          view.stopRenderWin()
          view.stopRenderLose()
          controller.startNewGame(16, 30, 99)
          saveBtn.setAttribute('data-dismiss', 'modal')
        }
      } else if (custom.checked) {
        if (e.target.id === 'modal-save-btn') {
          const rowInput = document.querySelector('#custom-row')
          const columnInput = document.querySelector('#custom-column')
          const mineInput = document.querySelector('#custom-mine')
          const gameField = rowInput.value * columnInput.value
          const maxMineAmount = Math.floor(gameField / 4)
          let rowInputStatus = false
          let columnInputStatus = false
          let mineInputStatus = false

          //檢查Height
          switch (isNaN(rowInput.value)) {
            case false:
              switch (rowInput.value > 0) {
                case true:
                  switch (rowInput.value % 1) {
                    case 0:
                      rowInputStatus = true
                      break

                    default:
                      alert(`Height is Not a Integer !`)
                  } break

                default:
                  alert(`Height is Not a Positive Number !`)
              } break

            default:
              alert(`Height is Not a Number !`)
          }

          //檢查Width
          switch (isNaN(columnInput.value)) {
            case false:
              switch (columnInput.value > 0) {
                case true:
                  switch (columnInput.value % 1) {
                    case 0:
                      columnInputStatus = true
                      break

                    default:
                      alert(`Width is Not a Integer !`)
                  } break

                default:
                  alert(`Width is Not a Positive Number !`)
              } break

            default:
              alert(`Width is Not a Number !`)
          }

          //檢查Mines
          switch (isNaN(mineInput.value)) {
            case false:
              switch (mineInput.value > 0) {
                case true:
                  switch (mineInput.value % 1) {
                    case 0:
                      mineInputStatus = true
                      break

                    default:
                      alert(`Mines is Not a Integer !`)
                  } break

                default:
                  alert(`Mines is Not a Positive Number !`)
              } break

            default:
              alert(`Mines is Not a Number !`)
          }

          if (gameField < 2) {
            alert(`The Game Field is too small, Please Adjust the Value of Height or Width.`)
            rowInputStatus = false
            columnInputStatus = false
          } else if (maxMineAmount < mineInput.value) {
            alert(`The Mines are too many, the Maximum is ${maxMineAmount}.`)
            mineInputStatus = false
          } else if (rowInputStatus === true && columnInputStatus === true && mineInputStatus === true) {
            view.stopRenderWin()
            view.stopRenderLose()
            controller.startNewGame(rowInput.value, columnInput.value, mineInput.value)
            saveBtn.setAttribute('data-dismiss', 'modal')
          }

        }
      }
    })

    //點擊輸入框就會選取custom
    const customInput = document.querySelectorAll('.custom-input')
    customInput.forEach(i => {
      i.addEventListener('click', () => {
        custom.checked = true
      })
    })
  },
  startNewGame(rows, columns, mines) {
    utility.cleanLastGameData()
    controller.removeListeners() //監聽器要拿掉 因為createGame會綁上
    alert('New Game Start!')
    controller.createGame(rows, columns, mines)
    controller.stopTimer()
    controller.resetTimer()
  },

  getSettings() {
    controller.addListeners()
    controller.modalGame()

    const newGameBtn = document.querySelector('#New-btn')
    newGameBtn.addEventListener('click', () => {
      view.stopRenderWin()
      view.stopRenderLose()
      utility.cleanLastGameData()
      controller.removeListeners() //監聽器要拿掉 因為createGame會綁上
      alert('New Game Start!')
      controller.createGame(model.gameDifficulty.rows, model.gameDifficulty.columns, model.gameDifficulty.mines)
      controller.stopTimer()
      controller.resetTimer()
    })

    const godModeBtn = document.querySelector('#GM-btn')
    godModeBtn.addEventListener('click', () => {
      model.leftClickTimes = 2 //避免跟第一次不會踩到地雷衝突產生bug
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
    if (model.fields.length === (model.gameDifficulty.rows * model.gameDifficulty.columns - model.gameDifficulty.mines)) {
      result = true
    } else {
      result = false
    }
    return result
  }
}


const model = {
  winTmId: 0,

  gameDifficulty: { rows: 0, columns: 0, mines: 0 },

  leftClickTimes: 0,

  flags: [],

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

  timer: 0,  //給 timer 用的變數

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

  checkSquareAround(fieldIdx) {
    //解析 fieldIdx
    const idx = fieldIdx.indexOf('-')
    let reg = /\d/ig
    let fieldIdxReg = fieldIdx.match(reg)
    let xNum
    let yNum
    //console.log(fieldIdxReg)
    switch (fieldIdxReg.length) {
      case 2:
        xNum = Number(fieldIdxReg[0])
        yNum = Number(fieldIdxReg[1])
        break

      case 3:
        if (idx === 1) {
          xNum = Number(fieldIdxReg[0])
          yNum = Number(fieldIdxReg[1] + fieldIdxReg[2])
        } else if (idx === 2) {
          xNum = Number(fieldIdxReg[0] + fieldIdxReg[1])
          yNum = Number(fieldIdxReg[2])
        }
        break

      case 4:
        xNum = Number(fieldIdxReg[0] + fieldIdxReg[1])
        yNum = Number(fieldIdxReg[2] + fieldIdxReg[3])
        break
    }
    //console.log(xNum, yNum)
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
    //console.log(p)

    const data = []
    p.map(i => {
      const idx = i.indexOf('-')
      let iReg = i.match(reg)
      switch (iReg.length) {
        case 2:
          xNum = Number(iReg[0])
          yNum = Number(iReg[1])
          switch (yNum) {
            case (model.columns):
              //console.log(541)
              if (xNum >= 1 && yNum > 1 && (utility.isSquareOpened(i) === false)) {
                data.push(`${xNum}-${yNum}`)
              }
              break

            default:
              //console.log(548)
              if ((xNum >= 1 && xNum <= model.gameDifficulty.rows) && (yNum >= 1 && yNum <= model.gameDifficulty.columns) && (utility.isSquareOpened(i) === false)) {
                data.push(`${xNum}-${yNum}`)
              }
              break
          }

        case 3:
          if (idx === 1) {
            xNum = Number(iReg[0])
            yNum = Number(iReg[1] + iReg[2])
          } else if (idx === 2) {
            xNum = Number(iReg[0] + iReg[1])
            yNum = Number(iReg[2])
          }
          //console.log(xNum, yNum)
          switch (yNum) {
            case (model.columns):
              //console.log(565)
              if ((xNum >= 1 && xNum <= model.gameDifficulty.rows) && (yNum >= 1 && yNum <= model.gameDifficulty.columns) && (utility.isSquareOpened(i) === false)) {
                data.push(`${xNum}-${yNum}`)
              }
              break

            default:
              //console.log(572)
              if (xNum >= 1 && yNum >= 1 && (utility.isSquareOpened(i) === false)) {
                data.push(`${xNum}-${yNum}`)
              }
              break
          }

        case 4:
          xNum = Number(iReg[0] + iReg[1])
          yNum = Number(iReg[2] + iReg[3])
          //console.log(xNum, yNum)
          switch (yNum) {
            case (model.columns):
              //console.log(584)
              if ((xNum >= 1 && xNum <= model.rows) && (yNum >= 1 && yNum <= model.columns) && (utility.isSquareOpened(i) === false)) {
                data.push(`${xNum}-${yNum}`)
              }
              break

            default:
              //console.log(591)
              if (xNum >= 1 && yNum >= 1 && (utility.isSquareOpened(i) === false)) {
                data.push(`${xNum}-${yNum}`)
              }
              break
          }
      }
    })
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
      case 1:    //for #310
        //畫面清空
        //playGround.innerHTML = ``
        //資料清空
        model.fieldMineAmount = 0
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
        model.squarePositions = []
        model.mines = []
        model.fields = []
        model.flags = []
        model.timerStartTime = 0
        model.leftClickTimes = 0
    }
  }
}

controller.createGame(9, 9, 10)
controller.getSettings()