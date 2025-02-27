import  { useContext } from 'react';
import { SpreadsheetContext } from '../../context/SpreadsheetContext';

const ColumnHeader = ({ colIndex }) => {
  const { selection, setSelection, activeCell } = useContext(SpreadsheetContext);
  
  // Convert column index to letter (0 -> A, 1 -> B, etc.)
  const getColumnLabel = (index) => {
    let columnLabel = '';
    let i = index;
    
    // Convert to base 26 (A-Z)
    do {
      const remainder = i % 26;
      columnLabel = String.fromCharCode(65 + remainder) + columnLabel;
      i = Math.floor(i / 26) - 1;
    } while (i >= 0);
    
    return columnLabel;
  };
  
  // Handle column header click to select entire column
  const handleColumnSelect = (e) => {
    const columnLabel = getColumnLabel(colIndex);
    
    // Select all cells in this column (from row 1 to 100)
    setSelection({
      start: `${columnLabel}1`,
      end: `${columnLabel}100`
    });
    
    // If shift is pressed, extend current selection
    if (e.shiftKey && activeCell) {
      // Determine active cell column
      const activeColMatch = activeCell.match(/[A-Z]+/)[0];
      
      setSelection({
        start: `${activeColMatch}1`,
        end: `${columnLabel}100`
      });
    }
  };
  
  // Determine if this column is selected
  const isColumnSelected = () => {
    if (!selection || !selection.start || !selection.end) return false;
    
    const columnLabel = getColumnLabel(colIndex);
    const startCol = selection.start.match(/[A-Z]+/)[0];
    const endCol = selection.end.match(/[A-Z]+/)[0];
    
    // Convert column letters to indices for comparison
    const startColIndex = getColumnIndex(startCol);
    const endColIndex = getColumnIndex(endCol);
    
    return colIndex >= Math.min(startColIndex, endColIndex) && 
           colIndex <= Math.max(startColIndex, endColIndex) &&
           selection.start.match(/\d+/)[0] === '1' &&
           selection.end.match(/\d+/)[0] === '100';
  };
  
  // Convert column letter to index (A -> 0, B -> 1, etc.)
  const getColumnIndex = (colLabel) => {
    return colLabel.split('').reduce((acc, char) => {
      return acc * 26 + (char.charCodeAt(0) - 64);
    }, 0) - 1;
  };
  
  return (
    <div
      className={`column-header ${isColumnSelected() ? 'selected' : ''}`}
      onClick={handleColumnSelect}
      title={`Column ${getColumnLabel(colIndex)}`}
      style={{
        gridRow: 1, // First row
        gridColumn: colIndex + 2 // +2 because first column is for row headers
      }}
    >
      {getColumnLabel(colIndex)}
    </div>
  );
};

export default ColumnHeader;