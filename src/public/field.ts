"use strict"

import { setPieceField, CellValue, nullPiece, Piece } from "./piece.js";
import { Dir, Cmd, MapCodeToDir, codeToDir, dirMap } from "./dir.js";

function newfield() : CellValue[][]
{
    const field = [];
    for(let i = 0 ; i < 20 ; i++) {
        field[i] = ''.padEnd(10, '.').split('') as CellValue[];
    }
    return field;
}

class Field {
    cells : CellValue[][];
    piece! : Piece;
    nextPiece : Piece;
    heldPiece : Piece;
    timer : any;
    interval : number;
    speed : number;
    deadrows : number;
    noInput : boolean;
    swapped : boolean;
    dummy: number;
    linesCleared: number;
    display: any;
    lastInput: number;

    constructor(display : any)
    {
        this.dummy = 42;
        this.cells = newfield();
        this.deadrows = 0;
        this.piece = new Piece();
        this.nextPiece = new Piece();
        this.speed = 0; 
        this.interval = 250;
        this.timer = setInterval(this.tick.bind(this), this.interval);
        this.noInput = false;
        this.lastInput = 0;
        this.swapped = false;
        this.linesCleared = 0;
        this.heldPiece = new Piece('null');
        this.display = display;
    }


    swap()
    {
        if(this.swapped) 
            return;
        else        
            this.swapped = true;

        const tmp = this.piece;
        
        if(this.heldPiece.cells === nullPiece) {
            console.log("Swap with nextPiece, generate new nextPiece");
            this.piece = this.nextPiece;
            this.nextPiece = new Piece();
        } else {
            console.log("Swap with held piece");
            this.piece = this.heldPiece;
            this.heldPiece.reset();
        }
        this.heldPiece = tmp;
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
        for(let row = this.cells.length - 1 ; row >= 0 ; row--) {
            if(this.cells[row].filter( x => x === '@').length === this.cells[row].length) {
                this.cells[row] = ''.padEnd(this.cells[row].length, '*').split('') as CellValue[];
                this.display.splitoutline(row);
                this.deadrows++;
                this.linesCleared++;
            }
        }

    }

    removerows()
    {
        for(let i = 0 ; i < this.deadrows ; i++) {
            for(let row = this.cells.length - 1 ; row >= 0 ; row--) {
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
            this.display.dropoutline(row);
        }
        this.cells[0] = ''.padEnd(this.cells[1].length, '.').split('') as CellValue[];
    }

    tick()
    {
        const ospeed = this.speed;
        this.speed = Math.floor(this.linesCleared / 10);
        if(ospeed !== this.speed) {
            clearInterval(this.timer);
            this.interval = Math.floor(this.interval * 0.8);
            this.timer = setInterval(this.tick.bind(this), this.interval);
        }

        this.removerows();

        let opos = { row: this.piece.pos.row, col: this.piece.pos.col };

        this.move('down');

        let { pos } = this.piece;

        if(pos.row === opos.row && pos.col === opos.col) {
            if(!this.noInput) {
                this.noInput = true;
                this.lastInput = (new Date()).getTime();
            } else {
                if((new Date()).getTime() - this.lastInput > 1000) {
                    if(!this.crystallize()) {
                        console.log("Game Over!");
                        clearInterval(this.timer);
                    } else {
                        this.clearrows();
                    };
                    this.noInput = false;
                }
            }
        }
        this.display.draw(this);
    }
    
    harddrop()
    {
        let opos = { row: -0.5, col: -0.5 };
        let pos = this.piece.pos;

        while(pos.row !== opos.row) {
            opos = { ...pos };
            this.move('down');
        }
        this.display.draw(this);
        this.crystallize();
        this.clearrows();
        this.noInput = false;
        this.lastInput = (new Date()).getTime();
        this.display.draw(this);
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
    
        if(!this.collision({row: row, col: col})) {
            this.piece.pos.row = row;
            this.piece.pos.col = col;
        } else {
            console.log("abort move");
        }
    }

}

export { Field };