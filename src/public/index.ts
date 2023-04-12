"use strict"

import e from "express";
import { setPieceField, CellValue, nullPiece, Piece } from "./piece.js";
import { Dir, Cmd, MapCodeToDir, codeToDir } from "./dir.js";
import { Field } from "./field.js";

document.body.innerHTML = '<div><div></div><div></div></div>';

const display = {
    topTarget  : document.body.children[0] as HTMLElement,
    statusTarget : document.body.children[0].children[0] as HTMLElement,
    heldTarget : document.createElement('div') as HTMLElement,
    linesTarget : document.createElement('div') as HTMLElement,
    gridTarget : document.body.children[0].children[1] as HTMLElement,
    gridElements : [] as HTMLElement[][],
    heldElements : [] as HTMLElement[][],
    previewBgColor : "#88f",
    previewPieceColor : "#f88",
    setup : function()
    {

        const cellSize = "1.5rem";
        this.topTarget.style.display = 'flex';
        this.statusTarget.style.backgroundColor = "#aaffaa";
        this.gridTarget.style.backgroundColor = "#aaaaff";

        this.gridTarget.style.display = 'grid';
        this.gridTarget.style.height = "auto";
        // this.gridTarget.style.gridGap = "1px";
        this.gridTarget.style.gridTemplateColumns = `${cellSize} `.repeat(10);

        const mkCell = (elements : HTMLElement[][], target : HTMLElement, count : number, width : number) => {
            let d = document.createElement('div');
            if(typeof elements[Math.floor(count / width)] === 'undefined') {
                elements[Math.floor(count / width)] = [];
            }
            elements[Math.floor(count / width)][count % width] = d;
            d.style.height = cellSize;
            d.style.backgroundColor = this.previewBgColor;
            target.appendChild(d);
        }

        for(let i = 0 ; i < 240 ; i++) {
            mkCell(this.gridElements, this.gridTarget, i, 10);
        }

        this.statusTarget.appendChild(this.linesTarget);
        this.statusTarget.appendChild(this.heldTarget);
        this.heldTarget.style.display = 'grid';
        this.heldTarget.style.height = 'auto';
        this.heldTarget.style.gridTemplateColumns = `${cellSize} `.repeat(4);
        for(let i = 0 ; i < 16 ; i ++) {
            mkCell(this.heldElements, this.heldTarget, i, 4);
        }


    },

    
    dropoutline: function(row : number)
    {
        const rrow = row + 4;
        this.gridElements[rrow].forEach((cur : HTMLElement, col : number) => {
            const above = this.gridElements[rrow - 1][col];
            
            for(let edge of ['borderTop', 'borderLeft', 'borderRight', 'borderBottom']) {
                (cur.style as any)[edge] = (above.style as any)[edge];
            }
    

        });

    },

        
    splitoutline: function(row : number)
    {
        const rrow = row + 4;

        if(typeof this.gridElements[rrow - 1] !== 'undefined') {
            this.gridElements[rrow - 1].forEach((cur : HTMLElement) => cur.style.borderBottom = '2px solid black');
        }

        if(typeof this.gridElements[rrow + 1] !== 'undefined') {
            this.gridElements[rrow + 1].forEach((cur : HTMLElement) => cur.style.borderTop = '2px solid black');
        }

    },

    outline: function(piece : Piece, el : HTMLElement, row : number, col : number) 
    {
        const dirMap = [
            { row: -1, col:  0, dir: 'borderTop' },
            { row:  1, col:  0, dir: 'borderBottom' },
            { row:  0, col: -1, dir: 'borderLeft' },
            { row:  0, col:  1, dir: 'borderRight' }
        ];
        for(let dir of dirMap) {
            if(typeof piece.cells[row + dir.row] === 'undefined' ||
            piece.cells[row + dir.row][col + dir.col] !== '#') {
                el.style;
                // ^?
                (el.style as any)[dir.dir] = '2px solid black';
            } else {
                (el.style as any)[dir.dir] = '';
            }
        }
          
    },

    unoutline: function(el: HTMLElement)
    {
        for(let edge of ['borderTop', 'borderLeft', 'borderRight', 'borderBottom']) {
            (el.style as any)[edge] = '';
        }
    },

    

    draw: function(field : Field) 
    {
        let n = field.nextPiece.toString();
        let f = field.toString();
        

        for(let row = 0 ; row < 4 ; row++) {
            for(let col = 0 ; col < 4 ; col++) {
                let e = this.gridElements[row][col + 3];
                //  ^?

                if(typeof field.nextPiece.cells[row] !== 'undefined' &&
                field.nextPiece.cells[row][col] === '#') {
                    e.style.backgroundColor = this.previewPieceColor;
                    this.outline(field.nextPiece, e, row, col);
                } else {
                    e.style.backgroundColor = this.previewBgColor;
                    this.unoutline(e);
                }
            }
        }

        for(let row = 0 ; row < 4 ; row++) {
            for(let col = 0 ; col < 4 ; col++) {
                let e = this.heldElements[row][col];
                //  ^?

                if(typeof field.heldPiece.cells[row] !== 'undefined' &&
                field.heldPiece.cells[row][col] === '#') {
                    e.style.backgroundColor = '#ff8888';
                    this.outline(field.heldPiece, e, row, col);
                } else {
                    e.style.backgroundColor = '#888888';
                    this.unoutline(e);
                }
            }
        }



        for(let row = 0 ; row < field.cells.length ; row++) {
            for(let col = 0 ; col < field.cells[row].length ; col++) {
                const ispiece = field.ispiece(row, col);
                const color = ispiece ? "#f00" : field.cells[row][col] === '@' ? "#88f" : "#888";
                this.gridElements[row + 4][col].style.backgroundColor = color;
                if(ispiece) {
                    this.outline(field.piece, 
                        this.gridElements[row + 4][col], 
                        row - field.piece.pos.row, 
                        col - field.piece.pos.col);
                } else {
                    if(field.cells[row][col] !== '@') {
                        this.unoutline(this.gridElements[row + 4][col]);
                    }
                }
            }
        }

        this.linesTarget.innerHTML = `Lines cleared:<br>${field.linesCleared}<br>Speed:<br>${field.speed}`;

    }
};

{
    let w = window as any;
    w.display = display;
}


display.setup();

const field = new Field(display);
setPieceField(field);

document.body.addEventListener("keydown", (ev) =>
{
    let d : Cmd | undefined  = codeToDir[ev.code] as Cmd | undefined;


    if(typeof d !== 'undefined') {
        if(d === 'rotate') {
            field.piece.rotate();
        } else if(d === 'swap') {
            field.swap();
        } else if(d === 'drop') {
            field.harddrop();
        } else if(d === 'pause') {
            field.pause();
        } else {
            field.move(d);
        }
    }
    display.draw(field);
} );






