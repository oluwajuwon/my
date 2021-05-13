// Tic-Tac-Toe
 
// X |  |
// O |  |
//   |  | X
import React from 'react'
 
const Square = ({value, onclick, ...props }) => {
  return (
     <button onClick={onclick}>
       {value}
     </button>
   )
}
 
class Board extends React.Component {
  state = {
   winner: '',
   finished: false,
   boardData: Array(9).fill(''),
   xTime: true,
   currentValue: '',
   selectedId: null,
 }
  handleClick = (i) => {
   const { boardData, xTime } = this.state;
   let newBoardData = [...boardData]
   const valueToAdd = xTime ? 'x' : 'o';
  
   newBoardData.splice(i, 1, valueToAdd)
  
   this.setState({ boardData: [...newBoardData], currentValue: valueToAdd, selectedId: i}, () => {
    
     this.setState(prevState => ({ xTime: !prevState.xTime}));
     this.calculateWinner();
   });
 }
  calculateWinner = () => {
   const { boardData } = this.state;
   let board = [...boardData];
   const boxes = [
     [0,1,2],
     [3,4,5],
     [6,7,8],
     [0, 3, 6],
     [1, 4, 7],
     [2, 5, 8],
     [0, 4, 8],
     [2, 4, 6],
   ]
  
   for (let i = 0; i < boxes.length; i++) {
     const [a, b, c] = boxes[i];
     if (board[a] && board[a] === board[b] && board[a] === board[c]) {
       return this.setState({ winner: board[a] });
     }
   }
  
 }
  render() {
   const squareArr = [
     { name: 'one', id: 0 },
     { name: 'two', id: 1 },
     { name: 'three', id: 2 },
     { name: 'four', id: 3 },
     { name: 'five', id: 4 },
     { name: 'six', id: 5 },
     { name: 'seven', id: 6 },
     { name: 'eight', id: 7 },
     { name: 'nine', id: 8 },
   ];
 
   return (
     <div className="board-section">
       {squareArr.map((square, i) => (
         <Square onclick={() => this.handleClick(i)} value={this.state.boardData[i]} />
         ))
       }
     </div>
    
   )
 }
}
 
export default Board;
 

