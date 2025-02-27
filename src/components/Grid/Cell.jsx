import { useState, useEffect, useRef, useContext } from 'react';
import { SpreadsheetContext } from '../../context/SpreadsheetContext';
import './Cell.css';

const Cell = ({ rowIndex, colIndex, cellId }) => {
  const {
    cells,
    activeCell,
    setActiveCell,
    selection,
    updateCellValue,
    getCellDisplayValue,
    getCellFormatting
  } = useContext(SpreadsheetContext);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const cellRef = useRef(null);
  const inputRef = useRef(null);
  
  const cell = cells[cellId] || { value: '', formula: '', formatting: {} };
  const isActive = activeCell === cellId;
  
  const isSelected = selection && selection.start && selection.end && isInSelection(cellId, selection);
  
  function isInSelection(cellId, selection) {
    if (!selection || !selection.start || !selection.end) return false;
    
    const [startCol, startRow] = getCellIndices(selection.start);
    const [endCol, endRow] = getCellIndices(selection.end);
    const [currentCol, currentRow] = getCellIndices(cellId);
    
    return (
      currentRow >= Math.min(startRow, endRow) &&
      currentRow <= Math.max(startRow, endRow) &&
      currentCol >= Math.min(startCol, endCol) &&
      currentCol <= Math.max(startCol, endCol)
    );
  }
  
  function getCellIndices(cellId) {
    const colChar = cellId.match(/[A-Z]+/)[0];
    const rowNum = parseInt(cellId.match(/\d+/)[0]) - 1;
    const colNum = colChar.split('').reduce((acc, char) => {
      return acc * 26 + (char.charCodeAt(0) - 64);
    }, 0) - 1;
    
    return [colNum, rowNum];
  }
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(cell.formula || cell.value || '');
  };
  
  const handleClick = () => {
    if (!isEditing) {
      setActiveCell(cellId);
    }
  };
  
  const handleKeyDown = (e) => {
    if (isEditing) {
      if (e.key === 'Enter' && !e.shiftKey) {
        finishEditing();
        e.preventDefault();
      } else if (e.key === 'Escape') {
        setIsEditing(false);
        e.preventDefault();
      } else if (e.key === 'Tab') {
        finishEditing();
      }
    } else {
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setIsEditing(true);
        setEditValue(e.key);
        e.preventDefault();
      } else if (e.key === 'Enter' || e.key === 'F2') {
        setIsEditing(true);
        setEditValue(cell.formula || cell.value || '');
        e.preventDefault();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        updateCellValue(cellId, '');
        e.preventDefault();
      }
    }
  };
  
  const finishEditing = () => {
    updateCellValue(cellId, editValue);
    setIsEditing(false);
  };
  
  const getCellClasses = () => {
    const cellType = getCellType(cell.value);
    let classes = `cell cell-${cellType}`;
    if (isActive) classes += ' active';
    if (isSelected) classes += ' selected';
    return classes;
  };
  
  const getCellType = (value) => {
    if (value === null || value === undefined || value === '') return 'text';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (value instanceof Date) return 'date';
    if (typeof value === 'string' && value.startsWith('=')) return 'formula';
    if (typeof value === 'string' && value.startsWith('#')) return 'error';
    return 'text';
  };
  
  const getFormattingStyles = () => {
    const formatting = getCellFormatting(cellId);
    return {
      fontWeight: formatting.bold ? 'bold' : 'normal',
      fontStyle: formatting.italic ? 'italic' : 'normal',
      textDecoration: formatting.underline ? 'underline' : 'none',
      color: formatting.color || 'inherit',
      backgroundColor: formatting.backgroundColor || 'inherit',
      textAlign: formatting.align || (getCellType(cell.value) === 'number' ? 'right' : 'left'),
    };
  };
  
  return (
    <div
      ref={cellRef}
      className={getCellClasses()}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      onBlur={() => isEditing && finishEditing()}
      tabIndex={0}
      style={getFormattingStyles()}
      data-cell-id={cellId}
      data-row-index={rowIndex}
      data-col-index={colIndex}
      role="gridcell"
      aria-colindex={colIndex + 1}
      aria-rowindex={rowIndex + 1}
      aria-selected={isSelected}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="cell-input"
          data-testid={`cell-input-${cellId}`}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="cell-content">
          {getCellDisplayValue(cellId)}
        </div>
      )}
    </div>
  );
};

export default Cell;