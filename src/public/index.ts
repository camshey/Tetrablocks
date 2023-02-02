"use strict"

import e from "express";

document.body.innerHTML = "what"

type Dir = 'left' | 'right' | 'up' | 'down';
type Cmd = Dir | 'rotate' | 'swap' | 'drop';
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
    'KeyD' : 'right',
    'KeyC' : 'swap',
    'Space' : 'drop'
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
    startpos: Coord;

    constructor()
    {
        const rnum = Math.floor(Math.random() * pieceTable.length);

        
        this.cells = pieceTable[rnum];
        this.startpos = { row: -3, col: 3 };
        this.size = this.cells.length;
        this.bottom = this.cells.length - 1;
        this.pos = { ...this.startpos };

    }

    reset()
    {
        this.pos.row = this.startpos.row;
        this.pos.col = this.startpos.col;
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
                while(cell === '#' && end - row + this.pos.col < 0)
                    this.pos.col++;
                
                while(cell === '#' && end - row + this.pos.col > 9)
                    this.pos.col--;
            }
        }
        this.cells = newpiece;

        while(field.collision(this.pos)) {
            this.pos.row--;
        }


    }
    toString()
    {

        let flat = [];
        for(let row = 0 ; row < 4 ; row++) {
            flat.push('      ');
            for(let col = 0 ; col < 4 ; col++) {
                flat.push(' ');
                if(typeof this.cells[row] !== 'undefined' && this.cells[row][col] === '#')
                    flat.push(this.cells[row][col]);
                else
                    flat.push(' ');
            }
            flat.push('\n');
        }
        return flat.join('');
    }
}

document.body.innerHTML = '<div><div></div><div></div></div>';


const display = {
    topTarget  : document.body.children[0] as HTMLElement,
    textTarget : document.body.children[0].children[0] as HTMLElement,
    gridTarget : document.body.children[0].children[1] as HTMLElement,
    gridElements : [] as HTMLElement[][],
    setup : function()
    {
        this.topTarget.style.display = 'flex';
        this.textTarget.style.backgroundColor = "#aaffaa";
        this.gridTarget.style.backgroundColor = "#aaaaff";

        this.gridTarget.style.display = 'grid';
        this.gridTarget.style.height = "25.5rem";
        this.gridTarget.style.gridGap = "1px";
        this.gridTarget.style.gridTemplateColumns = "1rem ".repeat(10);
        for(let i = 0 ; i < 240 ; i++) {
            let d = document.createElement('div');
            if(typeof this.gridElements[Math.floor(i / 10)] === 'undefined') {
                this.gridElements[Math.floor(i / 10)] = [];
            }
            this.gridElements[Math.floor(i / 10)][i % 10] = d;
            d.style.height = "1em";
            d.style.backgroundColor = i % 2 === 0 ? "#888" : "#aaa";
            this.gridTarget.appendChild(d);

        }
        
    },


    draw: function(field : Field) 
    {
        let n = field.nextPiece.toString();
        let f = field.toString();
        this.textTarget.innerHTML = `<pre>${n}</pre><pre>${f}</pre>`;

        for(let row = 0 ; row < 4 ; row++) {
            for(let col = 0 ; col < 4 ; col++) {
                let e = this.gridElements[row][col + 3];

                if(typeof field.nextPiece.cells[row] !== 'undefined' &&
                field.nextPiece.cells[row][col] === '#') {
                    e.style.backgroundColor = '#ff8888';
                } else {
                    e.style.backgroundColor = '#888888';
                }
            }
        }

        for(let row = 0 ; row < field.cells.length ; row++) {
            for(let col = 0 ; col < field.cells[row].length ; col++) {
                const color = field.ispiece(row, col) ? "#f00" : field.cells[row][col] === '@' ? "#88f" : "#888";
                this.gridElements[row + 4][col].style.backgroundColor = color;
            }
        }

        console.log("drawing...")
    }
};

{
    let w = window as any;
    w.display = display;
}


display.setup();


class Field {
    cells : CellValue[][];
    piece! : Piece;
    nextPiece : Piece;
    interval : any;
    deadrows : number;
    noInput : boolean;
    swapped : boolean;
    dummy: number;

    constructor()
    {
        this.dummy = 42;
        this.cells = newfield();
        this.deadrows = 0;
        this.piece = new Piece();
        this.nextPiece = new Piece();
        this.interval = setInterval(this.tick.bind(this), 250);
        this.noInput = false;
        this.swapped = false;
    }


    swap()
    {
        if(!this.swapped) {
            const tmp = this.piece;

            this.piece = this.nextPiece;
            this.nextPiece = tmp;
            this.nextPiece.reset();
            this.swapped = true;
        }
    }


    outofbounds()
    {
        const { size, pos } = this.piece;
        

        for(let row = 0 ; row < size ; row++) {
            for(let col = 0 ; col < size ; col++) {
                if(this.piece.cells[row][col] === '#') {
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
        const { cells, pos } = this.piece;
        if(typeof cells[row - pos.row] !== 'undefined' &&
        cells[row - pos.row][col - pos.col] === '#') {
            return true;
        }

    }

    collision(testpos : { row: number, col: number })
    {
        const { size, cells } = this.piece;
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
        let n = this.nextPiece.toString();
        let f = this.toString();
        document.body.innerHTML = `<pre>${n}</pre><pre>${f}</pre>`;
        console.log("drawing...")

    }
    crystallize()
    {
        const { size, pos, cells } = this.piece;
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
        this.piece = this.nextPiece;
        this.nextPiece = new Piece();
        this.swapped = false;

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

        let opos = { row: this.piece.pos.row, col: this.piece.pos.col };

        this.move('down');

        let { pos } = this.piece;

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
        display.draw(this);
    }
    
    harddrop()
    {
        let opos = { row: -0.5, col: -0.5 };
        let pos = this.piece.pos;

        while(pos.row !== opos.row) {
            opos = { ...pos };
            this.move('down');
        }
        this.crystallize();
        this.clearrows();
        this.noInput = false;
        display.draw(this);
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
        let { row, col } = this.piece.pos;
        row += dirMap[dir].row;
        col += dirMap[dir].col;
    
        console.log(`move ${dir} : from ${this.piece.pos.row}, ${this.piece.pos.col} to ${row}, ${col}`);
        if(!this.collision({row: row, col: col})) {
            console.log("move to", row, col);
            this.piece.pos.row = row;
            this.piece.pos.col = col;
        } else {
            console.log("abort move");
        }
    }

}

let output = "<pre>no input</pre>";
const inputs : string[] = [];
const field = new Field();

// document.body.innerHTML = output;

document.body.addEventListener("keydown", (ev) =>
{
    let d : Cmd | undefined  = codeToDir[ev.code] as Cmd | undefined;

    field.noInput = false;
    if(typeof d !== 'undefined') {
        if(d === 'rotate') {
            field.piece.rotate();
        } else if(d === 'swap') {
            field.swap();
        } else if(d === 'drop') {
            field.harddrop();
        } else {
            field.move(d);
        }
    }
    display.draw(field);
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