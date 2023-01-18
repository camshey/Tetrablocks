"use strict"

document.body.innerHTML = "what"

type Dir = 'left' | 'right' | 'up' | 'down';
type Cmd = Dir | 'rotate';
type MapCodeToDir = {
    [key: string] : Cmd
}

const codeToDir : MapCodeToDir = {
    'ArrowLeft' : 'left',
    'ArrowRight' : 'right',
    'ArrowUp' : 'rotate',
    'ArrowDown' : 'down',
    'KeyW' : 'rotate',
    'KeyS' : 'down',
    'KeyA' : 'left',
    'KeyD' : 'right'
}

const cellValue = [ '.', '@', '#', '*' ] as const;
type CellValue = typeof cellValue[number];
//   ^?

const pieceTable : CellValue[][][] = [
    [ 
        [ '.', '.', '.' ],
        [ '#', '#', '#' ],
        [ '.', '#', '.' ],
    ],

    [ 
        [ '#', '#' ],
        [ '#', '#' ],
    ],
    [ 
        [ '.', '.', '.' ],
        [ '#', '.', '.' ],
        [ '#', '#', '#' ],
    ],
    [ 
        [ '.', '.', '.' ],
        [ '.', '.', '#' ],
        [ '#', '#', '#' ],
    ],
    [ 
        [ '.', '.', '.' ],
        [ '#', '#', '.' ],
        [ '.', '#', '#' ],
    ],

    [ 
        [ '.', '.', '.' ],
        [ '.', '#', '#' ],
        [ '#', '#', '.' ],
    ],
    [
        [ '.', '#', '.', '.' ],
        [ '.', '#', '.', '.' ],
        [ '.', '#', '.', '.' ],
        [ '.', '#', '.', '.' ],                        
    ]


]

type Coord = { row: number, col: number }

class Piece {
    cells : CellValue[][];
    size : number;
    bottom : number;
    pos: Coord;

    constructor()
    {
        const rnum = Math.floor(Math.random() * pieceTable.length);
        
        this.cells = pieceTable[rnum];
        this.pos = { row: -3, col: 3 };
        this.size = this.cells.length;
        this.bottom = this.cells.length - 1;

    }

    rotate()
    {
        const piece = this.cells;
        const newpiece : CellValue[][] = piece.map(() => []);
        const end = newpiece.length - 1;

        for(let row = 0 ; row < piece.length ; row++ ) {
            for(let col = 0 ; col < piece[row].length ; col++) {
                const cell = piece[row][col]
                newpiece[col][end - row] = cell;
                if(cell === '#' && end - row + this.pos.col < 0)
                    this.pos.col++;
                else if(cell === '#' && end - row + this.pos.col > 9)
                    this.pos.col--;
            }
        }
        this.cells = newpiece;

        while(field.collision(this.pos)) {
            this.pos.row--;
        }


    }
}

class Field {
    cells : CellValue[][];
    pieceObj! : Piece;
    interval : any;
    deadrows : number;
    noInput : boolean;

    constructor()
    {
        this.cells = newfield();
        this.deadrows = 0;
        this.newpiece();
        this.interval = setInterval(this.tick.bind(this), 250);
        this.noInput = false;
    }

    newpiece()
    {
        this.pieceObj = new Piece();
    }

    


    outofbounds()
    {
        const { size, pos } = this.pieceObj;
        

        for(let row = 0 ; row < size ; row++) {
            for(let col = 0 ; col < size ; col++) {
                if(this.pieceObj.cells[row][col] === '#') {
                    if(col + pos.col < 0 || col + pos.col > 9) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    ispiece(row : number, col : number)
    {
        const { cells, pos } = this.pieceObj;
        if(typeof cells[row - pos.row] !== 'undefined' &&
        cells[row - pos.row][col - pos.col] === '#') {
            return true;
        }

    }

    collision(testpos : { row: number, col: number })
    {
        const { size, cells } = this.pieceObj;
        for(let row = 0 ; row < size ; row++) {
            for(let col = 0 ; col < size ; col++) {
                if(cells[row][col] === '#') {
                    if(col + testpos.col < 0 || col + testpos.col > 9) {
                        return true;
                    }
                    if(row + testpos.row >= this.cells.length) {
                        return true;
                    }
                    if(typeof this.cells[testpos.row + row] !== 'undefined' &&
                    this.cells[testpos.row + row][testpos.col + col] !== '.') {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    draw()
    {
        let f = this.toString();
        document.body.innerHTML = `<pre>${f}</pre>`;
        console.log("drawing...")
    }
    crystallize()
    {
        const { size, pos, cells } = this.pieceObj;
        for(let r = 0 ; r < size ; r++) {
            for(let c = 0 ; c < size ; c++) {
                if(cells[r][c] === '#') {
                    if(r + pos.row < 0) {
                        return false;
                    }
                    this.cells[r + pos.row][c + pos.col] = '@';
                }
            }
        }
        this.newpiece();

        return true;

    }

    clearrows()
    {
        for(let row = field.cells.length - 1 ; row >=0 ; row--) {
            if(this.cells[row].filter( x => x === '@').length === this.cells[row].length) {
                this.cells[row] = ''.padEnd(this.cells[row].length, '*').split('') as CellValue[];
                this.deadrows++;
            }
        }

    }

    removerows()
    {
        for(let i = 0 ; i < this.deadrows ; i++) {
            for(let row = field.cells.length - 1 ; row >= 0 ; row--) {
                if(this.cells[row].filter(x => x === '*').length === this.cells[row].length) {
                    this.collapse(row);
                }
            }
        }
        this.deadrows = 0;
    }

    collapse(from : number)
    {
        console.log(`Collapse from ${from}`)
        for(let row = from ; row > 0 ; row--) {
            this.cells[row] = this.cells[row - 1];
        }
        this.cells[0] = ''.padEnd(this.cells[1].length, '.').split('') as CellValue[];
    }

    tick()
    {
        
        this.removerows();

        let opos = { row: this.pieceObj.pos.row, col: this.pieceObj.pos.col };

        this.move('down');

        let { pos } = this.pieceObj;

        if(pos.row === opos.row && pos.col === opos.col) {
            if(!this.noInput) {
                this.noInput = true;
            } else {
                if(!this.crystallize()) {
                    console.log("Game Over!");
                    clearInterval(this.interval);
                } else {
                    this.clearrows();
                };
                this.noInput = false;
            }
        }
        this.draw();
    }

    toString()
    {
        let flat = [];
        for(let row = 0 ; row < this.cells.length ; row++) {
            for(let col = 0 ; col < this.cells[row].length ; col++) {
                flat.push(' ');
                if(this.ispiece(row, col))
                    flat.push('#')
                else
                    flat.push(this.cells[row][col]);
            }
            flat.push('\n');
        }
        return flat.join('');
    }
    
    move(dir : Dir) 
    {
        let { row, col } = this.pieceObj.pos;
        row += dirMap[dir].row;
        col += dirMap[dir].col;
    
        console.log(`move ${dir} : from ${this.pieceObj.pos.row}, ${this.pieceObj.pos.col} to ${row}, ${col}`);
        if(!this.collision({row: row, col: col})) {
            console.log("move to", row, col);
            this.pieceObj.pos.row = row;
            this.pieceObj.pos.col = col;
        } else {
            console.log("abort move");
        }
    }

}

let output = "<pre>no input</pre>";
const inputs : string[] = [];
const field = new Field();

document.body.innerHTML = output;

document.body.addEventListener("keydown", (ev) =>
{
    let d : Cmd | undefined  = codeToDir[ev.code] as Cmd | undefined;

    field.noInput = false;
    if(typeof d !== 'undefined') {
        if(d === 'rotate') {
            field.pieceObj.rotate();
        } else {
            field.move(d);
        }
    }
    field.draw();
} );

const dirMap = {
    'left' : { row: 0, col: -1 },
    'right' : { row: 0, col: 1 },
    'up' : { row: -1, col: 0 },
    'down' : { row: 1, col: 0 },
}




function newfield() : CellValue[][]
{
    const field = [];
    for(let i = 0 ; i < 20 ; i++) {
        field[i] = ''.padEnd(10, '.').split('') as CellValue[];
    }
    return field;
}