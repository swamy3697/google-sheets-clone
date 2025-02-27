import { useState, useCallback, useEffect } from 'react';
import { parseFormula } from '../utils/formulaParser';
import { validateData } from '../utils/dataValidation';
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/localStorage';

const DEFAULT_ROWS = 100;
const DEFAULT_COLS = 26; // A to Z

export const useSpreadsheet = () => {
  const [data, setData] = useState(() => {
    const savedData = loadFromLocalStorage('spreadsheetData');
    return savedData || initializeEmptySheet(DEFAULT_ROWS, DEFAULT_COLS);
  });

  const [activeCell, setActiveCell] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [selectedRange, setSelectedRange] = useState(null);

  const [formulas, setFormulas] = useState({});

  const [sheetName, setSheetName] = useState('Sheet1');
  const [sheetDimensions, setSheetDimensions] = useState({
    rows: DEFAULT_ROWS,
    cols: DEFAULT_COLS
  });

  const updateCell = useCallback((rowIndex, colIndex, value) => {
    setData(prevData => {
      const newData = [...prevData];

      if (!newData[rowIndex]) {
        newData[rowIndex] = Array(sheetDimensions.cols).fill(null);
      }

      if (value && typeof value === 'string' && value.startsWith('=')) {
        setFormulas(prev => ({
          ...prev,
          [`${rowIndex},${colIndex}`]: value
        }));

        try {
          const result = parseFormula(value.substring(1), data);
          newData[rowIndex][colIndex] = {
            rawValue: value,
            displayValue: result,
            isFormula: true
          };
        } catch (error) {
          newData[rowIndex][colIndex] = {
            rawValue: value,
            displayValue: '#ERROR!',
            error: error.message,
            isFormula: true
          };
        }
      } else {
        if (formulas[`${rowIndex},${colIndex}`]) {
          setFormulas(prev => {
            const newFormulas = { ...prev };
            delete newFormulas[`${rowIndex},${colIndex}`];
            return newFormulas;
          });
        }

        const numValue = !isNaN(value) && value !== '' ? Number(value) : value;
        newData[rowIndex][colIndex] = {
          rawValue: value,
          displayValue: numValue,
          isFormula: false
        };
      }

      return newData;
    });

    recalculateFormulas();
  }, [data, sheetDimensions.cols, formulas]);

  const recalculateFormulas = useCallback(() => {
    if (Object.keys(formulas).length === 0) return;

    setData(prevData => {
      const newData = [...prevData];

      Object.entries(formulas).forEach(([cellKey, formula]) => {
        const [rowIndex, colIndex] = cellKey.split(',').map(Number);

        try {
          const result = parseFormula(formula.substring(1), newData);
          if (!newData[rowIndex]) {
            newData[rowIndex] = Array(sheetDimensions.cols).fill(null);
          }
          newData[rowIndex][colIndex] = {
            rawValue: formula,
            displayValue: result,
            isFormula: true
          };
        } catch (error) {
          if (newData[rowIndex] && newData[rowIndex][colIndex]) {
            newData[rowIndex][colIndex] = {
              ...newData[rowIndex][colIndex],
              displayValue: '#ERROR!',
              error: error.message
            };
          }
        }
      });

      return newData;
    });
  }, [formulas, sheetDimensions.cols]);

  const startEditing = useCallback((rowIndex, colIndex) => {
    setActiveCell({ row: rowIndex, col: colIndex });
    const cellValue = data[rowIndex]?.[colIndex];
    const value = cellValue?.rawValue || '';
    setEditingValue(value);
    setIsEditing(true);
  }, [data]);

  const finishEditing = useCallback(() => {
    if (!activeCell) return;
    const { row, col } = activeCell;
    updateCell(row, col, editingValue);
    setIsEditing(false);
    saveToLocalStorage('spreadsheetData', data);
  }, [activeCell, editingValue, updateCell, data]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  const addRow = useCallback((index) => {
    setData(prevData => {
      const newData = [...prevData];
      const newRow = Array(sheetDimensions.cols).fill(null);
      newData.splice(index + 1, 0, newRow);
      return newData;
    });
    setSheetDimensions(prev => ({ ...prev, rows: prev.rows + 1 }));
  }, [sheetDimensions.cols]);

  const addColumn = useCallback((index) => {
    setData(prevData => prevData.map(row => {
      const newRow = [...row];
      newRow.splice(index + 1, 0, null);
      return newRow;
    }));
    setSheetDimensions(prev => ({ ...prev, cols: prev.cols + 1 }));
  }, []);

  const deleteRow = useCallback((index) => {
    setData(prevData => {
      const newData = [...prevData];
      newData.splice(index, 1);
      return newData;
    });
    setSheetDimensions(prev => ({ ...prev, rows: Math.max(1, prev.rows - 1) }));
    recalculateFormulas();
  }, [recalculateFormulas]);

  const deleteColumn = useCallback((index) => {
    setData(prevData => prevData.map(row => {
      const newRow = [...row];
      newRow.splice(index, 1);
      return newRow;
    }));
    setSheetDimensions(prev => ({ ...prev, cols: Math.max(1, prev.cols - 1) }));
    recalculateFormulas();
  }, [recalculateFormulas]);

  const clearCells = useCallback((range) => {
    const { startRow, startCol, endRow, endCol } = range;
    setData(prevData => {
      const newData = [...prevData];
      for (let row = startRow; row <= endRow; row++) {
        if (!newData[row]) continue;
        for (let col = startCol; col <= endCol; col++) {
          if (newData[row][col]) {
            newData[row][col] = null;
            const cellKey = `${row},${col}`;
            if (formulas[cellKey]) {
              setFormulas(prev => {
                const newFormulas = { ...prev };
                delete newFormulas[cellKey];
                return newFormulas;
              });
            }
          }
        }
      }
      return newData;
    });
  }, [formulas]);

  const saveSpreadsheet = useCallback((name) => {
    const spreadsheetData = {
      data,
      formulas,
      sheetName: name || sheetName,
      dimensions: sheetDimensions
    };
    saveToLocalStorage(name || 'spreadsheetData', spreadsheetData);
  }, [data, formulas, sheetName, sheetDimensions]);

  const loadSpreadsheet = useCallback((name) => {
    const spreadsheetData = loadFromLocalStorage(name || 'spreadsheetData');
    if (spreadsheetData) {
      setData(spreadsheetData.data || initializeEmptySheet(DEFAULT_ROWS, DEFAULT_COLS));
      setFormulas(spreadsheetData.formulas || {});
      setSheetName(spreadsheetData.sheetName || 'Sheet1');
      setSheetDimensions(spreadsheetData.dimensions || { rows: DEFAULT_ROWS, cols: DEFAULT_COLS });
    }
  }, []);

  const resetSpreadsheet = useCallback(() => {
    setData(initializeEmptySheet(DEFAULT_ROWS, DEFAULT_COLS));
    setFormulas({});
    setActiveCell(null);
    setEditingValue('');
    setIsEditing(false);
    setSelectedRange(null);
    setSheetName('Sheet1');
    setSheetDimensions({ rows: DEFAULT_ROWS, cols: DEFAULT_COLS });
  }, []);

  useEffect(() => {
    const autoSaveTimeout = setTimeout(() => {
      saveToLocalStorage('spreadsheetData', {
        data,
        formulas,
        sheetName,
        dimensions: sheetDimensions
      });
    }, 2000);
    return () => clearTimeout(autoSaveTimeout);
  }, [data, formulas, sheetName, sheetDimensions]);

  return {
    data,
    activeCell,
    editingValue,
    isEditing,
    selectedRange,
    sheetName,
    sheetDimensions,
    formulas,
    setActiveCell,
    setEditingValue,
    setIsEditing,
    setSelectedRange,
    setSheetName,
    updateCell,
    startEditing,
    finishEditing,
    cancelEditing,
    addRow,
    addColumn,
    deleteRow,
    deleteColumn,
    clearCells,
    saveSpreadsheet,
    loadSpreadsheet,
    resetSpreadsheet,
    recalculateFormulas
  };
};

function initializeEmptySheet(rows, cols) {
  return Array(rows).fill().map(() => Array(cols).fill(null));
}

export default useSpreadsheet;