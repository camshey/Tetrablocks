const cellValue = [ '.', '@', '#', '*' ] as const;
type CellValue = typeof cellValue[number];
//   ^?

const nullPiece : CellValue[][] = [];

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

let field : any = null;

function setPieceField(f : any)
{
    field = f;
}
class Piece {
    cells : CellValue[][];
    size : number;
    bottom : number;
    pos: Coord;
    startpos: Coord;

    constructor(pieceName? : string)
    {
        if(pieceName === 'null') {
            this.cells = nullPiece;
        } else {
            const rnum = Math.floor(Math.random() * pieceTable.length);
            this.cells = pieceTable[rnum];    
        }

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

export { setPieceField, CellValue, Coord, cellValue, nullPiece, pieceTable, Piece }