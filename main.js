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
      this.showFieldContent(square)
    })
  }
}

const controller = {
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
    view.displayFields(numberOfRows)
    controller.setMinesAndFields(numberOfMines)

    const playGround = document.querySelector('#game')
    playGround.addEventListener('click', e => {
      if (e.target.classList.contains('open')) {
        return
      } else {
        controller.dig(e.target)
      }
    })

    // 右鍵 listen to the contextmenu

    console.log(model.mines)
    console.log(model.fields)
  },

  /**
   * setMinesAndFields()
   * 設定格子的內容，以及產生地雷的編號。
   */
  setMinesAndFields(numberOfMines) {
    //從 squarePositions 隨機選出號碼(避免重複)當作地雷並存入model
    for (let i = 0; i < numberOfMines;) {
      let randomIndex = Math.floor(Math.random() * model.rows * 9)
      let temp = []
      if (!temp.includes(randomIndex)) {
        temp.push(randomIndex)
        model.mines.push(model.squarePositions[randomIndex])
        i++
      }
    }
    //遍歷所有格子 地雷加上mine 海洋存進fields
    const squares = document.querySelectorAll('.square')
    squares.forEach(square => {
      if (model.mines.includes(square.dataset.index)) {
        square.classList.add('mine')
      }
    })
  },

  /**
   * getFieldData()
   * 取得單一格子的內容，決定這個格子是海洋還是號碼，
   * 如果是號碼的話，要算出這個號碼是幾號。
   * （計算周圍地雷的數量）
   */
  getFieldData(fieldIdx) {
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
    //確認八個格子的位置存在 避免 < 0 或 > 9 再存入陣列
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

    //再從陣列拿出來檢查有沒有在 model.mines
    //若有 開始計算數量

  },


  /**
   * dig()
   * 使用者挖格子時要執行的函式，
   * 會根據挖下的格子內容不同，執行不同的動作，
   * 如果是號碼或海洋 => 顯示格子
   * 如果是地雷      => 遊戲結束
   */
  dig(field) {
    //沒踩到地雷的狀況
    if (model.isMine(field.dataset.index) === false) {
      controller.getFieldData(field.dataset.index)
      field.classList.add('open')
      model.fields.push(
        {
          type: "field",
          number: 0,
          isDigged: true
        }
      )
      view.showFieldContent(field)
      console.log(field.dataset.index, model.fields)
    } else {
      //踩到地雷的狀況
      view.showFieldContent(field)
      //踩到的地雷加上紅色背景
      field.classList.add('GG')
      console.log('GG惹')
      view.showBoard()
    }
  }
  // spreadOcean(field) {}
}

const model = {
  rows: 9,

  squarePositions: [],
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
  }
}

controller.createGame(9, 10)
// console.log(model.isMine(model.mines[11]))