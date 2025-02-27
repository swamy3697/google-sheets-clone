import { useState, useEffect, useRef, useCallback } from 'react';
import { useSpreadsheet } from '../../context/SpreadsheetContext';
import Cell from './Cell';
import RowHeader from './RowHeader';
import ColumnHeader from './ColumnHeader';
import './Grid.css';

function Grid() {
  const { 
    rows, 
    columns, 
    activeCell, 
    setActiveCell, 
    selection, 
    setSelection 
  } = useSpreadsheet();

  const gridRef = useRef(null);
  const [visibleRows, setVisibleRows] = useState({ start: 0, end: 50 });
  const [visibleCols, setVisibleCols] = useState({ start: 0, end: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  // Completely rewritten indexToColumn function to correctly map index 0 to "A"
  const indexToColumn = useCallback((index) => {
    if (index < 0) return '';
    
    let colStr = '';
    let tempIndex = index;
    
    do {
      const remainder = tempIndex % 26;
      colStr = String.fromCharCode(65 + remainder) + colStr;
      tempIndex = Math.floor(tempIndex / 26) - 1;
    } while (tempIndex >= 0);
    
    return colStr;
  }, []);

  const positionToCellId = useCallback((colIndex, rowIndex) => {
    const column = indexToColumn(colIndex);
    const row = rowIndex + 1;
    return `${column}${row}`;
  }, [indexToColumn]);

  const renderCells = useCallback(() => {
    const cells = [];

    for (let rowIndex = visibleRows.start; rowIndex <= visibleRows.end; rowIndex++) {
      for (let colIndex = visibleCols.start; colIndex <= visibleCols.end; colIndex++) {
        const cellId = positionToCellId(colIndex, rowIndex);
        cells.push(
          <Cell
            key={cellId}
            cellId={cellId}
            rowIndex={rowIndex}
            colIndex={colIndex}
          />
        );
      }
    }

    return cells;
  }, [visibleRows, visibleCols, positionToCellId]);

  const renderColumnHeaders = useCallback(() => {
    const headers = [];

    for (let colIndex = visibleCols.start; colIndex <= visibleCols.end; colIndex++) {
      headers.push(
        <ColumnHeader
          key={`col-${colIndex}`}
          colIndex={colIndex}
        />
      );
    }

    return headers;
  }, [visibleCols]);

  const renderRowHeaders = useCallback(() => {
    const headers = [];

    for (let rowIndex = visibleRows.start; rowIndex <= visibleRows.end; rowIndex++) {
      headers.push(
        <RowHeader
          key={`row-${rowIndex}`}
          rowIndex={rowIndex}
        />
      );
    }

    return headers;
  }, [visibleRows]);

  const handleMouseDown = useCallback((e) => {
    const closestCell = e.target.closest('.cell');
    if (closestCell) {
      setIsDragging(true);

      const cellId = closestCell.getAttribute('data-cell-id');
      if (cellId) {
        setDragStart(cellId);
        setSelection({
          start: cellId,
          end: cellId
        });

        setActiveCell(cellId);
      }
    }
  }, [setActiveCell, setSelection]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging && dragStart) {
      const closestCell = e.target.closest('.cell');
      if (closestCell) {
        const cellId = closestCell.getAttribute('data-cell-id');
        if (cellId && cellId !== selection?.end) {
          setSelection({
            start: dragStart,
            end: cellId
          });
        }
      }
    }
  }, [isDragging, dragStart, selection, setSelection]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleScroll = useCallback(() => {
    if (!gridRef.current) return;

    const { scrollTop, scrollLeft, clientHeight, clientWidth } = gridRef.current;

    const rowHeight = 30;
    const colWidth = 120;

    const headerHeight = 40;
    const headerWidth = 40;

    const startRow = Math.max(0, Math.floor((scrollTop - headerHeight) / rowHeight));
    const startCol = Math.max(0, Math.floor((scrollLeft - headerWidth) / colWidth));

    const visibleRowCount = Math.ceil(clientHeight / rowHeight);
    const visibleColCount = Math.ceil(clientWidth / colWidth);

    setVisibleRows({
      start: Math.max(0, startRow - 5),
      end: Math.min(rows - 1, startRow + visibleRowCount + 5)
    });

    setVisibleCols({
      start: Math.max(0, startCol - 3),
      end: Math.min(columns - 1, startCol + visibleColCount + 3)
    });
  }, [rows, columns]);

  const handleKeyDown = useCallback((e) => {
    if (!activeCell) return;

    const match = activeCell.match(/([A-Z]+)(\d+)/);
    if (!match) return;

    const colStr = match[1];
    const rowNum = parseInt(match[2], 10);

    // Convert column letter to index
    let colIndex = 0;
    for (let i = 0; i < colStr.length; i++) {
      colIndex = colIndex * 26 + (colStr.charCodeAt(i) - 'A'.charCodeAt(0));
    }

    const rowIndex = rowNum - 1;
    let newColIndex = colIndex;
    let newRowIndex = rowIndex;

    switch (e.key) {
      case 'ArrowUp':
        newRowIndex = Math.max(0, rowIndex - 1);
        break;
      case 'ArrowDown':
        newRowIndex = Math.min(rows - 1, rowIndex + 1);
        break;
      case 'ArrowLeft':
        newColIndex = Math.max(0, colIndex - 1);
        break;
      case 'ArrowRight':
        newColIndex = Math.min(columns - 1, colIndex + 1);
        break;
      case 'Tab':
        e.preventDefault();
        newColIndex = e.shiftKey
          ? Math.max(0, colIndex - 1)
          : Math.min(columns - 1, colIndex + 1);
        break;
      case 'Enter':
        if (!e.isComposing && !e.target.closest('input')) {
          e.preventDefault();
          newRowIndex = Math.min(rows - 1, rowIndex + 1);
        }
        break;
      default:
        return;
    }

    if (newColIndex !== colIndex || newRowIndex !== rowIndex) {
      const newCellId = positionToCellId(newColIndex, newRowIndex);
      setActiveCell(newCellId);

      setSelection({
        start: newCellId,
        end: newCellId
      });

      ensureCellVisible(newRowIndex, newColIndex);
    }
  }, [activeCell, rows, columns, positionToCellId, setActiveCell, setSelection]);

  const ensureCellVisible = useCallback((rowIndex, colIndex) => {
    if (!gridRef.current) return;

    const rowHeight = 30;
    const colWidth = 120;
    const headerHeight = 40;
    const headerWidth = 40;

    const { scrollTop, scrollLeft, clientHeight, clientWidth } = gridRef.current;

    const cellTop = headerHeight + rowIndex * rowHeight;
    const cellLeft = headerWidth + colIndex * colWidth;

    if (cellTop < scrollTop + headerHeight) {
      gridRef.current.scrollTop = cellTop - headerHeight;
    } else if (cellTop + rowHeight > scrollTop + clientHeight) {
      gridRef.current.scrollTop = cellTop + rowHeight - clientHeight;
    }

    if (cellLeft < scrollLeft + headerWidth) {
      gridRef.current.scrollLeft = cellLeft - headerWidth;
    } else if (cellLeft + colWidth > scrollLeft + clientWidth) {
      gridRef.current.scrollLeft = cellLeft + colWidth - clientWidth;
    }
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    grid.addEventListener('scroll', handleScroll);
    return () => grid.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      ref={gridRef}
      className="spreadsheet-grid"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      tabIndex={0}
      role="grid"
      aria-multiselectable="true"
    >
      <div className="corner-header" style={{ gridRow: 1, gridColumn: 1 }}></div>
      <div className="column-header-container">{renderColumnHeaders()}</div>
      <div className="row-header-container">{renderRowHeaders()}</div>
      <div className="grid-body">{renderCells()}</div>
    </div>
  );
}

export default Grid;