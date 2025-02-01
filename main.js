(() => {
    const ticTaeToeGame = {
        players: [
            { id: 'X', score: 0 },
            { id: 'O', score: 0 },
        ],
        currentPlayer: null,
        blocked: false,
        board: [
            [null, null, null],
            [null, null, null],
            [null, null, null],
        ],
        mapRowsCols: [
            ['0,0', '0,1', '0,2'],
            ['1,0', '1,1', '1,2'],
            ['2,0', '2,1', '2,2'],
            ['0,0', '1,0', '2,0'],
            ['0,1', '1,1', '2,1'],
            ['0,2', '1,2', '2,2'],
            ['0,0', '1,1', '2,2'],
            ['0,2', '1,1', '2,0'],
        ],
        start: () => {
            ticTaeToeGame.currentPlayer = ticTaeToeGame.players[0]
            ticTaeToeGame.createBoard()
            document.getElementById('btn-restart').addEventListener('click', () => ticTaeToeGame.restartGame())
        },
        restartGame: () => {
            ticTaeToeGame.blocked = false
            ticTaeToeGame.iteratorBoard((r, c) => ticTaeToeGame.board[r][c] = null)
            ticTaeToeGame.currentPlayer = ticTaeToeGame.players[0]
            document.querySelectorAll('.bg-winner').forEach(el => el.classList.remove('bg-winner'))
            document.querySelectorAll('.block-play').forEach(el => el.innerHTML = '')
            document.getElementById('block-winner').classList.add('hidden')
            document.getElementById('block-winner').classList.remove('show-winner')
            document.getElementById('container-blocks').classList.remove('hidden', 'minimize-board')
        },
        isDraw: () => {
            const plays = []
            ticTaeToeGame.iteratorBoard((r, c, v) => plays.push(v))
            return plays.every(p => p !== null)
        },
        addPlay: async (position) => {
            const { id } = ticTaeToeGame.currentPlayer
            const [row, col] = position
            const isValidPosition = (row >= 0 && row <= 2) && (col >= 0 && col <= 2) && (!ticTaeToeGame.board[row][col])

            if (!isValidPosition) {
                return false
            }

            ticTaeToeGame.board[row][col] =  id
            document.querySelector('[data-map="' + position.join(',') + '"]').append(ticTaeToeGame.createIcon())

            const result = ticTaeToeGame.results()

            if (result.won) {
                ticTaeToeGame.showWinner(result.cells)
                ticTaeToeGame.updateScore()
                return true
            }

            if (ticTaeToeGame.isDraw()) {
                ticTaeToeGame.showDraw()
                return true
            }

            ticTaeToeGame.currentPlayer = id === 'X' ? ticTaeToeGame.players[1] : ticTaeToeGame.players[0]
            return false
        },
        iteratorBoard: fnc => {
            for (let row = 0; row < ticTaeToeGame.board.length; row++) {
                for (let col = 0; col < ticTaeToeGame.board[row].length; col++) {
                    fnc(row, col, ticTaeToeGame.board[row][col])
                }
            }
        },
        results: () => {
            const winner = cells => cells
                .map(cell => {
                    const [r, c] = cell.split(',')
                    return ticTaeToeGame.board[r][c]
                })
                .every(m => m === ticTaeToeGame.currentPlayer.id)

            const filterWin = ticTaeToeGame.mapRowsCols.find(cells => winner(cells))
            return { won: Array.isArray(filterWin), cells: filterWin || [] }
        },
        createBoard: () => {
            const addPlay = (position) => async () => {
                if (ticTaeToeGame.blocked) {
                    return
                }

                ticTaeToeGame.blocked = true

                const play = await ticTaeToeGame.addPlay(position)
                let playRandom = false

                if (ticTaeToeGame.currentPlayer.id === 'O') {
                    playRandom = await ticTaeToeGame.addRandomPlay()
                }

                if (!play && !playRandom) {
                    ticTaeToeGame.blocked = false
                }
            }

            const createDiv = (position) => {
                const div = document.createElement('div')
                div.classList.add('col', 'block-play')
                div.setAttribute('data-map', position.join(','))
                div.addEventListener('click', addPlay(position))
                document.getElementById('container-blocks').append(div)
            }

            ticTaeToeGame.iteratorBoard((r, c) => createDiv([r, c]))
        },
        createIcon: () => {
            const classPlayer = ticTaeToeGame.currentPlayer.id === 'X' ? ['x', 'x-lg'] : ['circle', 'circle-lg']
            const div = document.createElement('div')
            div.classList.add(...classPlayer)
            div.append(document.createElement('div'))
            return div
        },
        showWinner: cells => {
            const blinkCellsEffect = () => {
                for (const c of cells) {
                    const block = document.querySelector('[data-map="' + c + '"]')
                    for (const child of block.children) {
                        child.classList.add('blink')
                    }
                }
            }

            const minimizeBoardEffect = () => {
                document.getElementById('container-blocks').classList.add('minimize-board')
            }

            const showWinnerEffect = () => {
                const block = document.getElementById('container-blocks')
                const blockWinner = document.getElementById('block-winner')
                const span = document.createElement('span')
                span.innerHTML = 'VENCEDOR'
                blockWinner.children[0].innerHTML = ''

                block.classList.remove('minimize-board')
                block.classList.add('hidden')
                blockWinner.classList.remove('hidden')
                blockWinner.classList.add('show-winner')
                blockWinner.children[0].append(span)
                blockWinner.children[0].append(ticTaeToeGame.createIcon())
            }

            setTimeout(() => blinkCellsEffect(), 100)
            setTimeout(() => minimizeBoardEffect(), 1100)
            setTimeout(() => showWinnerEffect(), 2000)
        },
        showDraw: () => {

        },
        addRandomPlay: async () => new Promise((resolve) => {
            const availableCells = []

            ticTaeToeGame.iteratorBoard((r, c, v) => {
                if (!v) {
                    availableCells.push([r, c])
                }
            })

            const random = Math.floor(Math.random() * availableCells.length)
            const position = availableCells[random]

            setTimeout(() => resolve(ticTaeToeGame.addPlay(position)), 300)
        }),
        updateScore: () => {
            ticTaeToeGame.currentPlayer.score += 1
            document.getElementById('score-o').innerHTML = ticTaeToeGame.players[0].score
            document.getElementById('score-x').innerHTML = ticTaeToeGame.players[1].score
        }
    }

    ticTaeToeGame.start()
})()
