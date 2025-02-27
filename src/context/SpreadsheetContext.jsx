import { createContext, useContext, useState, useReducer, useEffect } from 'react';
import { evaluateFormula } from '../utils/formulaParser';

// Create the context and export it as a named export
export const SpreadsheetContext = createContext();

// Initial state with empty spreadsheet
const initialState = {
  cells: {},
  rows: 100,
  columns: 26,
  activeCell: null,
  selection: { start: null, end: null },
  undoStack: [],
  redoStack: [],
};

// Helper to convert between column index and letter
export const indexToColumn = (index) => {
  let column = '';
  let temp = index + 1;
  
  while (temp > 0) {
    const remainder = (temp - 1) % 26;
    column = String.fromCharCode(65 + remainder) + column;
    temp = Math.floor((temp - 1) / 26);
  }
  
  return column;
};

export const columnToIndex = (column) => {
  let result = 0;
  for (let i = 0; i < column.length; i++) {
    result = result * 26 + (column.charCodeAt(i) - 64);
  }
  return result - 1;
};

export const cellIdToPosition = (cellId) => {
  const match = cellId.match(/([A-Z]+)(\d+)/);
  if (!match) return null;
  
  const column = match[1];
  const row = parseInt(match[2], 10);
  
  return { column, columnIndex: columnToIndex(column), row: row - 1 };
};

export const positionToCellId = (columnIndex, rowIndex) => {
  return `${indexToColumn(columnIndex)}${rowIndex + 1}`;
};

function spreadsheetReducer(state, action) {
  switch (action.type) {
    case 'SET_CELL_VALUE': {
      const { cellId, value, formula } = action.payload;
      
      // Create new cells object with updated cell
      const newCells = {
        ...state.cells,
        [cellId]: {
          ...state.cells[cellId],
          value,
          formula: formula || value,
        },
      };

      // Update dependent cells
      const updatedCells = updateDependentCells(newCells, cellId);

      return {
        ...state,
        cells: updatedCells,
        undoStack: [...state.undoStack, { type: 'SET_CELL_VALUE', payload: { cellId, value: state.cells[cellId]?.value, formula: state.cells[cellId]?.formula } }],
        redoStack: [],
      };
    }
    
    case 'SET_CELL_FORMAT': {
      const { cellId, formatting } = action.payload;
      
      return {
        ...state,
        cells: {
          ...state.cells,
          [cellId]: {
            ...state.cells[cellId],
            formatting: {
              ...state.cells[cellId]?.formatting,
              ...formatting,
            },
          },
        },
        undoStack: [...state.undoStack, { type: 'SET_CELL_FORMAT', payload: { cellId, formatting: state.cells[cellId]?.formatting } }],
        redoStack: [],
      };
    }
    
    case 'SET_ACTIVE_CELL': {
      return {
        ...state,
        activeCell: action.payload,
        selection: { start: action.payload, end: action.payload },
      };
    }
    
    case 'SET_SELECTION': {
      return {
        ...state,
        selection: action.payload,
      };
    }
    
    case 'UNDO': {
      if (state.undoStack.length === 0) return state;
      
      const lastAction = state.undoStack[state.undoStack.length - 1];
      const newUndoStack = state.undoStack.slice(0, -1);
      
      let newState = { ...state, undoStack: newUndoStack, redoStack: [...state.redoStack, lastAction] };
      
      // Apply the inverse of the last action
      switch (lastAction.type) {
        case 'SET_CELL_VALUE': {
          const { cellId, value, formula } = lastAction.payload;
          newState.cells = {
            ...newState.cells,
            [cellId]: {
              ...newState.cells[cellId],
              value,
              formula,
            },
          };
          break;
        }
        
        case 'SET_CELL_FORMAT': {
          const { cellId, formatting } = lastAction.payload;
          newState.cells = {
            ...newState.cells,
            [cellId]: {
              ...newState.cells[cellId],
              formatting,
            },
          };
          break;
        }
        
        default:
          break;
      }
      
      return newState;
    }
    
    case 'REDO': {
      if (state.redoStack.length === 0) return state;
      
      const nextAction = state.redoStack[state.redoStack.length - 1];
      const newRedoStack = state.redoStack.slice(0, -1);
      
      let newState = { ...state, redoStack: newRedoStack, undoStack: [...state.undoStack, nextAction] };
      
      // Apply the action again
      switch (nextAction.type) {
        case 'SET_CELL_VALUE': {
          const { cellId, value, formula } = nextAction.payload;
          newState.cells = {
            ...newState.cells,
            [cellId]: {
              ...newState.cells[cellId],
              value,
              formula,
            },
          };
          break;
        }
        
        case 'SET_CELL_FORMAT': {
          const { cellId, formatting } = nextAction.payload;
          newState.cells = {
            ...newState.cells,
            [cellId]: {
              ...newState.cells[cellId],
              formatting: {
                ...newState.cells[cellId]?.formatting,
                ...formatting,
              },
            },
          };
          break;
        }
        
        default:
          break;
      }
      
      return newState;
    }
    
    case 'INSERT_ROW': {
      const { index } = action.payload;
      // Logic for inserting a row
      return state;
    }
    
    case 'DELETE_ROW': {
      const { index } = action.payload;
      // Logic for deleting a row
      return state;
    }
    
    case 'INSERT_COLUMN': {
      const { index } = action.payload;
      // Logic for inserting a column
      return state;
    }
    
    case 'DELETE_COLUMN': {
      const { index } = action.payload;
      // Logic for deleting a column
      return state;
    }
    
    default:
      return state;
  }
}

// Function to update dependent cells when a cell's value changes
function updateDependentCells(cells, changedCellId) {
  // This is a simplified implementation
  // A complete implementation would build a dependency graph and update all affected cells
  
  // For now, just reevaluate all formulas
  const updatedCells = { ...cells };
  
  Object.keys(updatedCells).forEach(cellId => {
    const cell = updatedCells[cellId];
    if (cell && cell.formula && cell.formula.startsWith('=')) {
      try {
        const value = evaluateFormula(cell.formula, updatedCells);
        updatedCells[cellId] = {
          ...cell,
          value,
        };
      } catch (error) {
        // If there's an error evaluating the formula, leave the value as is
        console.error(`Error evaluating formula in ${cellId}:`, error);
      }
    }
  });
  
  return updatedCells;
}

export function SpreadsheetProvider({ children }) {
  const [state, dispatch] = useReducer(spreadsheetReducer, initialState);
  
  // Add missing functions that are used in Cell.jsx
  const updateCellValue = (cellId, formula) => {
    let value = formula;
    
    // If it's a formula, evaluate it
    if (formula && formula.startsWith('=')) {
      try {
        value = evaluateFormula(formula, state.cells);
      } catch (error) {
        console.error(`Error evaluating formula: ${error}`);
        value = '#ERROR!';
      }
    }
    
    setCellValue(cellId, value, formula);
  };
  
  const getCellDisplayValue = (cellId) => {
    const cell = state.cells[cellId];
    if (!cell) return '';
    return cell.value || '';
  };
  
  const getCellFormatting = (cellId) => {
    const cell = state.cells[cellId];
    return cell?.formatting || {};
  };
  
  const setCellValue = (cellId, value, formula) => {
    dispatch({
      type: 'SET_CELL_VALUE',
      payload: { cellId, value, formula },
    });
  };
  
  const setCellFormat = (cellId, formatting) => {
    dispatch({
      type: 'SET_CELL_FORMAT',
      payload: { cellId, formatting },
    });
  };
  
  const setActiveCell = (cellId) => {
    dispatch({
      type: 'SET_ACTIVE_CELL',
      payload: cellId,
    });
  };
  
  const setSelection = (selection) => {
    dispatch({
      type: 'SET_SELECTION',
      payload: selection,
    });
  };
  
  const undo = () => {
    dispatch({ type: 'UNDO' });
  };
  
  const redo = () => {
    dispatch({ type: 'REDO' });
  };
  
  const insertRow = (index) => {
    dispatch({
      type: 'INSERT_ROW',
      payload: { index },
    });
  };
  
  const deleteRow = (index) => {
    dispatch({
      type: 'DELETE_ROW',
      payload: { index },
    });
  };
  
  const insertColumn = (index) => {
    dispatch({
      type: 'INSERT_COLUMN',
      payload: { index },
    });
  };
  
  const deleteColumn = (index) => {
    dispatch({
      type: 'DELETE_COLUMN',
      payload: { index },
    });
  };
  
  const value = {
    cells: state.cells,
    rows: state.rows,
    columns: state.columns,
    activeCell: state.activeCell,
    selection: state.selection,
    setCellValue,
    setCellFormat,
    setActiveCell,
    setSelection,
    undo,
    redo,
    insertRow,
    deleteRow,
    insertColumn,
    deleteColumn,
    // Add the missing functions to the context value
    updateCellValue,
    getCellDisplayValue,
    getCellFormatting
  };
  
  return (
    <SpreadsheetContext.Provider value={value}>
      {children}
    </SpreadsheetContext.Provider>
  );
}

export function useSpreadsheet() {
  const context = useContext(SpreadsheetContext);
  if (!context) {
    throw new Error('useSpreadsheet must be used within a SpreadsheetProvider');
  }
  return context;
}