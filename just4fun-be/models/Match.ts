import mongoose = require("mongoose")

const ROWS: number = 6;
const COLUMNS: number = 7;
const CELL_TO_WIN: number = 4;

export interface Match extends mongoose.Document {
    player0: string,
    player1: string,
    winner: {
        player: number, // TODO?: renderlo enum, null = in corso, -1 = parità, 0/1 = vincitore;
        positions: number[][]
    },
    turn: number,
    board: number[][],
    moves: number[],
    matchStart: Date,
    lastMove: Date,

    makeMove: (player: string, column: number)=> void,
    insertDisk: (column: number)=> number,
    getCell: (row: number, column: number)=> number,
    checkWin: (row:number, column:number)=> Result,
    checkDirection: (row:number, column:number, deltaRow:number, deltaColumn:number)=> Result
}

export class MatchMethods extends Match{

}

export function isMatch(arg){
    return arg &&
        arg.player0 && typeof(arg.player0) == 'string' &&
        arg.player1 && typeof(arg.player1) == 'string' &&
        arg.winner && typeof(arg.winner) == 'string' &&
        arg.turn && typeof(arg.turn) == 'string' &&
        arg.board && Array.isArray(arg.board) &&
        arg.moves && Array.isArray(arg.moves) &&
        arg.matchStart && arg.matchStart instanceof Date &&
        arg.lastMove && arg.lastMove instanceof Date
}

let matchSchema = new mongoose.Schema<Match>({
    player0: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    player1: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    winner: {
        player: {
            type: mongoose.SchemaTypes.Number,
            required: false
        },
        positions: {
            type: [[mongoose.SchemaTypes.Number]],
            required: false
        }
    },
    turn:  {
        type: mongoose.SchemaTypes.Number,
        required: true
    },
    board: {
        type: [[mongoose.SchemaTypes.Number]],
        required: true
    },
    moves:  {
        type: [mongoose.SchemaTypes.Number],
        required: true
    },
    matchStart: {
        type: mongoose.SchemaTypes.Date,
        required: true
    },
    lastMove: {
        type: mongoose.SchemaTypes.Date,
        required: true
    }
})

matchSchema.methods.makeMove = function (player: string, column: number): void {
    if (this.winner.player !== null) throw new Error("Match ended")
    if ((this.turn == 0 && player != this.player0) || (this.turn == 1 && player != this.player1)) throw new Error("Not your turn"); //Not your turn

    let row;
    try{
        row = this.insertDisk(column);
    } catch (e) {
        return e
    }

    let winner = this.checkWin(row, column);
    if(winner.winner !== null){
        this.winner.player = winner.winner;
        this.winner.positions = winner.cells;
        this.markModified("winner")
    }

    this.turn = (this.turn + 1) % 2 //switch turn
}

matchSchema.methods.insertDisk = function(column: number):number {
    if (column < 0 || column >= COLUMNS) throw new Error("Not a valid column");
    let row = 0;
    while (this.getCell(row, column) != null) {
        if (++row == ROWS) {
            throw new Error("The column is full");
        }
    }
    this.board[row][column] = this.turn;
    this.markModified("board");
    return row;
}

matchSchema.methods.getCell = function(row: number, column: number): number {
    if (row < 0 || row >= ROWS || column < 0 || column >= COLUMNS) {
        return null
    }
    return this.board[row][column];
}

matchSchema.methods.checkWin = function(row:number, column:number): Result {
    let result;

    result = this.checkDirection(row, column, -1,1)
    if (result.winner == null)
        result = this.checkDirection(row, column, 0,1)
    if (result.winner == null)
        result = this.checkDirection(row, column, 1, 1)
    if (result.winner == null)
        result = this.checkDirection(row, column, 1, 0)

    return result;
}

matchSchema.methods.checkDirection = function(row:number, column:number, deltaRow:number, deltaColumn:number): Result {
    const player:number = this.getCell(row, column);
    const potentialWinner:Result = new Result();
    let count:number = CELL_TO_WIN - 1;
    let r:number = row, c:number = column;

    potentialWinner.add(r, c);
    while (this.getCell(r+=deltaRow, c+=deltaColumn) == player && count > 0){
        count--;
        potentialWinner.add(r, c);
    }
    r = row; c = column;
    while (this.getCell(r-=deltaRow, c-=deltaColumn) == player && count > 0){
        count--;
        potentialWinner.add(r, c);
    }

    if (count == 0)
        potentialWinner.setWinner(player);
    return potentialWinner;

}

export function getSchema() {return matchSchema}

let matchModel;
export function getModel(): mongoose.Model< mongoose.Document > {
    if (!matchModel)
        matchModel = mongoose.model('Match', getSchema());
    return matchModel
}

// utility classes
class Result {
    private _cells: [number, number][] = null;
    private _winner: number = null;

    constructor() {
        this._cells = [];
    }

    add(r: number, c: number) { this._cells.push([r, c]); }
    setWinner(w: number) {this._winner = w}
    clear(){ this._cells = []; }
    get winner() {return this._winner}
    get cells(): [number, number][] { return [...this._cells]; }
}