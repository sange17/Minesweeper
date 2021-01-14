(function () {
    const $container = document.querySelector('.container');
    const $gameTable = document.querySelector('.game-board tbody');
    const $mineCounter = document.querySelectorAll('.count-box > span');
    const $timer = document.querySelector('.time-box > span');
    const $btnReset = document.querySelector('.btn-reset')
    const $btnLevel = document.querySelector('.btn-box');
    const $gameResult = document.querySelector('.game-result');

    const INIT = {
        level: {
            beginner: {
                mines: 10,
                row: 9,
                col: 9
            },
            intermediate: {
                mines: 40,
                row: 16,
                col: 16
            },
            expert: {
                mines: 99,
                row: 16,
                col: 30
            }
        },
        difMine: 10,
        defRow: 9,
        defCol: 9,
        board: [],
        boardFlat: null,
        squareLen: 81,
        changeLevel: function (userLevel) {
            this.defMines = this.level[userLevel].mines;
            this.defRow = this.level[userLevel].row;
            this.defCol = this.level[userLevel].col;
            this.squareLen = this.defRow * this.defCol;
        }
    }

    let $td;
    let cntMine = INIT.defMines;
    let gameStart = 0;
    let timerId;
    let finalTime = 0;
    let minesRemain = 0;

    $btnLevel.addEventListener('click', function(e){
        if(e.target.nodeName === 'BUTTON'){
            resetGame();
            let level = e.target.dataset.level;
            $container.className = 'container ' + level;
            INIT.changeLevel(level);
            print3Digits(INIT.defMines, $mineCounter);
            createBoard(INIT.defRow, INIT.defCol);

            $td = $gameTable.querySelectorAll('.square');
        }
    });

    window.addEventListener('load', function(){
        createBoard(INIT.defRow, INIT.defCol);
        $td = $gameTable.querySelectorAll('.square');
        $btnReset.addEventListener('click', resetGame);
    });

    function print3Digits (num, elements) {
        let mineLen = ('' + num).padStart(3, '0').split('').slice(-3);
        elements.forEach(function(span, i){
            span.textContent = mineLen[i]
        });
    }

    function timer(){
        let startTime = 1;

        print3Digits(1,$timer);
        timerId = setInterval(function(){
            startTime++;
            print3Digits(startTime, $timer);
            finalTime = startTime;
        }, 1000);
    }

    function resetTimer() {
        print3Digits(0,$timer);
        clearInterval(timerId);
    }

    function createBoard (row, col) {
        $gameTable.innerHTML = '';
        let cntTd = 0;
        for(let i = 0; i < row; i++){
            const $tr = document.createElement('tr');
            $tr.className = 'row';
            for(let j = 0; j < col; j++){
                const $td = document.createElement('td');
                $td.className = 'square';
                $td.dataset.id = cntTd;

                $td.addEventListener('click',function(e){
                    leftClickEvent(e, Number($td.dataset.id));
                });
                $td.addEventListener('contextmenu', function(e){
                    rightClickEvent(e, Number($td.dataset.id));
                });

                $tr.appendChild($td);
                cntTd++;
            }
            $gameTable.appendChild($tr);
        }
    }

    function placeMines (mLen, row, col, tdIndex) {
        let x = Math.floor(tdIndex / INIT.defCol);
        let y = tdIndex % INIT.defCol;
        for(let i = 0; i < row; i++){
            INIT.board.push([]);
            for(let j = 0; j < col; j++){
                INIT.board[i].push(0);
            }
        }

        for(let i=0; i<mLen; i++){
            let rd1 = Math.floor(Math.random() * row);
            let rd2 = Math.floor(Math.random() * col);
            if(INIT.board[rd1][rd2] === 'm' || (rd1 === x && rd2 === y)){
                i--;
            } else {
                INIT.board[rd1][rd2] = 'm';
                countMines(rd1, rd2, INIT.board);
            }
        }
        INIT.boardFlat = [].concat.apply([],INIT.board);

        function countMines(in1, in2, arr) {
            let iLen = in1 + 2;
            let jLen = in2 + 2;
            for(let i = in1-1; i<iLen; i++){
                for(let j=in2-1; j<jLen; j++){
                    if(i<0 || j<0 || i===arr.length || j===arr[i].length || (i===in1 && j===in2)) {
                        continue;
                    }
                    arr[i][j] += (arr[i][j] !== 'm') ? 1 : '';
                }
            }
        }
    }

    function leftClickEvent (e, tdIndex) {
        if($gameResult.classList.contains('show')){
            return;
        }
        if(!gameStart) {
            gameStart = 1;
            placeMines(INIT.defMines, INIT.defRow, INIT.defCol, tdIndex);
            timer();
            console.log(INIT.board);
        }
        let alreadyFlag = $td[tdIndex].classList.contains('flag');
        let alreadyClicked = $td[tdIndex].classList.contains('clicked');
        if(alreadyFlag || alreadyClicked) {
            return;
        }
        let item = INIT.boardFlat[tdIndex];
        let x = Math.floor(tdIndex/INIT.defCol);
        let y = tdIndex % INIT.defCol;
        if(item ==='m'){
            gameOver(e.currentTarget);
        }else if(item === 0) {
            findEmptySquare(tdIndex, x, y);
        }else {
            e.currentTarget.classList.add('clicked');
            e.currentTarget.classList.add(`txt-${item}`);
            e.currentTarget.textContent = item;
            INIT.squareLen--;
            INIT.board[x][y] = 'o'
        }
        gameWin(INIT.squareLen);
    }

    function rightClickEvent (e, tdIndex) {
        e.preventDefault();
        if($gameResult.classList.contains('show')){
            return;
        }
        if(!gameStart) {
            gameStart = 1;
            placeMines(INIT.defMines, INIT.defRow, INIT.defCol, tdIndex);
            timer();
            console.log(INIT.board);
        }
        let alreadyClicked = $td[tdIndex].classList.contains('clicked');
        let hasFlag = $td[tdIndex].classList.contains('flag');
        if(!alreadyClicked) {
            if(!hasFlag) {
                if(cntMine > 0) {
                    $td[tdIndex].classList.add('flag');
                    cntMine--;
                    print3Digits(cntMine, $mineCounter);
                }
            }else{
                $td[tdIndex].classList.remove('flag');
                cntMine++;
                print3Digits(cntMine, $mineCounter);
            }
            hasFlag = !hasFlag;
        }
        gameWin(INIT.squareLen);
    }

    function gameOver (id) {
        resetTimer();
        $brnReset.classList.add('game-over');
        if(id){
            id.classList.add('bg-red');
        }

        let mines = 0;
        INIT.boardFlat.forEach(function (data, i) {
            if(data === 'm') {
                if(!$td[i].classList.contains('flag')){
                    $td[i].classList.add('clicked');
                    $td[i].classList.add('has-mine');
                    mines++;
                }
            }else {
                if($td[i].classList.contains('flag')){
                    $td[i].classList.add('no-mine');
                }
            }
        });
        minesRemain = mines;
        showResult('GAME OVER', finalTime, minesRemain);
    }

    function gameWin(squareLen) {
        $flag = $gameTable.querySelectorAll('.flag').length;
        if(squareLen === INIT.defMines && $flag === INIT.defMines) {
            resetTimer();
            $btnReset.className = 'btn-reset game-win';
            showResult('YOU WIN', finalTime, minesRemain);
        }
    }

    function showResult (msg, time, mines) {
        $gameResult.querySelector('.title').textContent = msg;
        $gameResult.querySelector('.time').textContent = finalTime;
        $gameResult.querySelector('.mine').textContent = minesRemain + '/' + INIT.defMines;
        $gameResult.classList.add('show');
        setTimeout(function() {
            $gameResult.className.add('move-up');
        }, 0);
    }

    function resetGame() {
        $gameResult.className = 'game-result';
        $btnReset.className = 'btn-reset';
        print3Digits(INIT.defMines, $mineCounter);
        resetTimer();
        cntMine = INIT.defMines;
        INIT.squareLen = INIT.defRow * INIT.defCol;
        gameStart = 0;
        INIT.board = [];
        INIT.boardFlat = null;
        $td.forEach(function (td){
            td.textContent = '';
            td.classList = 'square';
        });
    }

    function findEmptySquare (tdIndex, x, y) {
        $td[tdIndex].classList.add('clicked');
        if(INIT.board[x][y] !== 0) {
            $td[tdIndex].classList.add(`txt-${INIT.board[x][y]}`);
            $td[tdIndex].textContent = INIT.board[x][y];
        }
        INIT.squareLen--;
        INIT.board[x][y] = 'o';

        let iLen = x+2;
        let jLen = y+2;
        let noMine = true;

        for(let i=x-1; i<iLen; i++) {
            for(let j=y-1; j<jLen; j++){
                if(i<0 || j<0 || i===INIT.board.length || j===INIT.board[i].length || (i===x&&j===y) || INIT.board[i][j] === 'o') {
                    continue;
                }
                if(INIT.board[i][j] === 'm') {
                    noMine = false;
                }
            }
        }

        if(noMine) {
            for(let i=x-1; i<iLen; i++) {
                for(let j=y-1; j<jLen; j++) {
                    if(i<0 || j<0 || i===INIT.board.length || j===INIT.board[i].length || (i===x&&j===y) || INIT.board[i][j] === 'o') {
                        continue;
                    }
                    findEmptySquare(i*INIT.defCol + j, i, j);
                }
            }
        }
    }
})();