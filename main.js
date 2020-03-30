const view = {
  /**
   * displayFields()
   * 顯示踩地雷的遊戲版圖在畫面上，
   * 輸入的 rows 是指版圖的行列數。
   */
  displayFields(rows) {
    const playGround = document.querySelector('#game')
    playGround.innerHTML = utility.getRandomNumberArray(rows * 9).map(index => view.getSquareElement(index)).join('')
  },
  getSquareElement(index) {
    return `<div data-index='${index}' class='square'></div>`
  },
  /**
   * showFieldContent()
   * 更改單一格子的內容，像是顯示數字、地雷，或是海洋。
   */
  showFieldContent(field) {
    
    const squares = document.querySelectorAll('.square')
    squares.forEach(square => {
      if (square.classList.contains('mine')) {
        square.classList.add('fas', 'fa-bomb')
      }
    })
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
  showBoard() { }
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
    controller.dig()
    console.log(model.mines)
    console.log(model.fields)
  },

  /**
   * setMinesAndFields()
   * 設定格子的內容，以及產生地雷的編號。
   */
  setMinesAndFields(numberOfMines) {
    const squares = document.querySelectorAll('.square')
    squares.forEach(square => {
      if (square.dataset.index < numberOfMines) {
        square.classList.add('mine')
        model.mines.push(square.dataset.index)
      } else {
        model.fields.push({
          type: "number",
          number: square.dataset.index,
          isDigged: false
        })
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
    if (fieldIdx.classList) {

    } else {
      console.log('海洋')
    }
  },
  calculateMines() {

  },

  /**
   * dig()
   * 使用者挖格子時要執行的函式，
   * 會根據挖下的格子內容不同，執行不同的動作，
   * 如果是號碼或海洋 => 顯示格子
   * 如果是地雷      => 遊戲結束
   */
  dig(field) {
    const playGround = document.querySelector('#game')
    playGround.addEventListener('click', event => {
      if (model.isMine(event.target.dataset.index) !== true) {
        // //沒踩到地雷的狀況
        // getFieldData(event.target)
        // // model fields 更新資料
        // model.fields
        // //加上 className open 然後 view 打開
        // event.target.classList.add('open')
        // showFieldContent()


        console.log(event.target)
      } else {
        console.log('GG惹')
        // showFieldContent()
      }
    })
  }

  // spreadOcean(field) {}
}

const model = {
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

