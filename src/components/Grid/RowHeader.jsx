import React, { useContext } from 'react';
import { SpreadsheetContext } from '../../context/SpreadsheetContext';

const RowHeader = ({ rowIndex }) => {
  const { selection, setSelection, activeCell } = useContext(SpreadsheetContext);
  
  // Handle row header click to select entire row
  const handleRowSelect = (e) => {
    const rowNum = rowIndex + 1;
    
    // Select all cells in this row (from column A to Z)
    setSelection({
      start: `A${rowNum}`,
      end: `Z${rowNum}`
    });
    
    // If shift is pressed, extend current selection
    if (e.shiftKey && activeCell) {
      // Determine active cell row
      const activeRowMatch = activeCell.match(/\d+/)[0];
      
      setSelection({
        start: `A${activeRowMatch}`,
        end: `Z${rowNum}`
      });
    }
  };
  
  // Determine if this row is selected
  const isRowSelected = () => {
    if (!selection || !selection.start || !selection.end) return false;
    
    const rowNum = rowIndex + 1;
    const startRow = parseInt(selection.start.match(/\d+/)[0]);
    const endRow = parseInt(selection.end.match(/\d+/)[0]);
    
    return rowNum >= Math.min(startRow, endRow) && 
           rowNum <= Math.max(startRow, endRow) &&
           selection.start.match(/[A-Z]+/)[0] === 'A' &&
           selection.end.match(/[A-Z]+/)[0] === 'Z';
  };
  
  return (
    <div
      className={`row-header ${isRowSelected() ? 'selected' : ''}`}
      onClick={handleRowSelect}
      title={`Row ${rowIndex + 1}`}
      style={{
        gridColumn: 1, // First column
        gridRow: rowIndex + 2 // +2 because first row is for column headers
      }}
    >
      {rowIndex + 1}
    </div>
  );
};

export default RowHeader;