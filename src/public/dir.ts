"use strict"

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

const dirMap = {
    'left' : { row: 0, col: -1 },
    'right' : { row: 0, col: 1 },
    'up' : { row: -1, col: 0 },
    'down' : { row: 1, col: 0 },
}

export { Dir, Cmd, MapCodeToDir, codeToDir, dirMap }