"use strict"


document.body.innerHTML = "what"

type Dir = 'left' | 'right' | 'up' | 'down';

const codeToDir : any = {
    'ArrowLeft' : 'left',
    'ArrowRight' : 'right',
    'ArrowUp' : 'up',
    'ArrowDown' : 'down',
    'KeyW' : 'up',
    'KeyS' : 'down',
    'KeyA' : 'left',
    'KeyD' : 'right'

}

let output = "<pre>no input</pre>";
const inputs : string[] = [];
const field : any[] = newfield();
const pos = { row: 0, col: 0 };
field[pos.row][pos.col] = '@';

document.body.innerHTML = output;

document.body.addEventListener("keydown", (ev) =>
{
    inputs.push(ev.code);
    if(inputs.length > 5) {
        inputs.shift();
    }
    let d : Dir | undefined  = codeToDir[ev.code] as Dir | undefined;
    if(typeof d !== 'undefined') {
        move(d);
    }
    let fieldstr = fieldtostring();
    document.body.innerHTML = `<pre>${fieldstr}</pre>`;
} );

const dirMap = {
    'left' : { row: 0, col: -1 },
    'right' : { row: 0, col: 1 },
    'up' : { row: -1, col: 0 },
    'down' : { row: 1, col: 0 },
}

function move(dir : Dir) 
{
    let { row, col } = pos;
    row += dirMap[dir].row;
    col += dirMap[dir].col;

    console.log(`move ${dir} : from ${pos.row}, ${pos.col} to ${row}, ${col}`);
    if(row >= 0 && col >= 0 && row < 10 && col < 10) {
        console.log("move to", row, col);
        field[pos.row][pos.col] = '.';
        field[row][col] = '@';
        pos.row = row;
        pos.col = col;
    }
}

function fieldtostring()
{
    return field.map((row) => row.join('')).join('\n');
}

function newfield()
{
    const field = [];
    for(let i = 0 ; i < 10 ; i++) {
        field[i] = ''.padEnd(10, '.').split('');
    }
    return field;
}