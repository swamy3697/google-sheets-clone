import { useState, useCallback, useRef } from 'react';

const useDragAndDrop = (selectedRange, updateData) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragSourceRange, setDragSourceRange] = useState(null);
  const [dragTargetCell, setDragTargetCell] = useState(null);
  const dragDataRef = useRef(null);

  const startDrag = useCallback((e, sourceRange) => {
    if (!selectedRange) return;
    setIsDragging(true);
    setDragSourceRange(sourceRange || selectedRange);
    const dragElement = document.createElement('div');
    dragElement.classList.add('drag-feedback');
    document.body.appendChild(dragElement);
    dragElement.style.left = `${e.clientX}px`;
    dragElement.style.top = `${e.clientY}px`;
    document.body.style.cursor = 'move';
    e.preventDefault();
  }, [selectedRange]);

  const updateDrag = useCallback((e, rowIndex, colIndex) => {
    if (!isDragging) return;
    setDragTargetCell({ row: rowIndex, col: colIndex });
    const dragElement = document.querySelector('.drag-feedback');
    if (dragElement) {
      dragElement.style.left = `${e.clientX}px`;
      dragElement.style.top = `${e.clientY}px`;
    }
    e.preventDefault();
  }, [isDragging]);

  const endDrag = useCallback((getData, updateData) => {
    if (!isDragging || !dragSourceRange || !dragTargetCell) {
      setIsDragging(false);
      setDragSourceRange(null);
      setDragTargetCell(null);
      const dragElement = document.querySelector('.drag-feedback');
      if (dragElement) dragElement.remove();
      document.body.style.cursor = 'auto';
      return;
    }

    const rowOffset = dragTargetCell.row - dragSourceRange.startRow;
    const colOffset = dragTargetCell.col - dragSourceRange.startCol;

    if (rowOffset === 0 && colOffset === 0) {
      setIsDragging(false);
      setDragSourceRange(null);
      setDragTargetCell(null);
      const dragElement = document.querySelector('.drag-feedback');
      if (dragElement) dragElement.remove();
      document.body.style.cursor = 'auto';
      return;
    }

    const sourceData = [];
    for (let r = dragSourceRange.startRow; r <= dragSourceRange.endRow; r++) {
      const row = [];
      for (let c = dragSourceRange.startCol; c <= dragSourceRange.endCol; c++) {
        row.push(getData(r, c));
      }
      sourceData.push(row);
    }

    for (let r = 0; r < sourceData.length; r++) {
      for (let c = 0; c < sourceData[r].length; c++) {
        const targetRow = dragTargetCell.row + r;
        const targetCol = dragTargetCell.col + c;
        updateData(targetRow, targetCol, sourceData[r][c]);
      }
    }

    setIsDragging(false);
    setDragSourceRange(null);
    setDragTargetCell(null);
    const dragElement = document.querySelector('.drag-feedback');
    if (dragElement) dragElement.remove();
    document.body.style.cursor = 'auto';
  }, [isDragging, dragSourceRange, dragTargetCell]);

  const [isFilling, setIsFilling] = useState(false);
  const [fillSourceRange, setFillSourceRange] = useState(null);
  const [fillTargetRange, setFillTargetRange] = useState(null);

  const startFill = useCallback((e, sourceRange) => {
    if (!selectedRange) return;
    setIsFilling(true);
    setFillSourceRange(sourceRange || selectedRange);
    const fillElement = document.createElement('div');
    fillElement.classList.add('fill-feedback');
    document.body.appendChild(fillElement);
    fillElement.style.left = `${e.clientX}px`;
    fillElement.style.top = `${e.clientY}px`;
    document.body.style.cursor = 'crosshair';
    e.preventDefault();
  }, [selectedRange]);

  const updateFill = useCallback((e, rowIndex, colIndex) => {
    if (!isFilling) return;
    const startRow = Math.min(fillSourceRange.startRow, rowIndex);
    const startCol = Math.min(fillSourceRange.startCol, colIndex);
    const endRow = Math.max(fillSourceRange.endRow, rowIndex);
    const endCol = Math.max(fillSourceRange.endCol, colIndex);
    setFillTargetRange({
      startRow,
      startCol,
      endRow,
      endCol
    });
    const fillElement = document.querySelector('.fill-feedback');
    if (fillElement) {
      fillElement.style.left = `${e.clientX}px`;
      fillElement.style.top = `${e.clientY}px`;
    }
    e.preventDefault();
  }, [isFilling, fillSourceRange]);

  const endFill = useCallback((getData, updateData) => {
    if (!isFilling || !fillSourceRange || !fillTargetRange) {
      setIsFilling(false);
      setFillSourceRange(null);
      setFillTargetRange(null);
      const fillElement = document.querySelector('.fill-feedback');
      if (fillElement) fillElement.remove();
      document.body.style.cursor = 'auto';
      return;
    }

    const sourceWidth = fillSourceRange.endCol - fillSourceRange.startCol + 1;
    const sourceHeight = fillSourceRange.endRow - fillSourceRange.startRow + 1;

    if (sourceWidth > 1 && sourceHeight === 1 && fillTargetRange.endRow > fillSourceRange.endRow) {
      for (let c = 0; c < sourceWidth; c++) {
        const sourceCol = fillSourceRange.startCol + c;
        const sourceValue = getData(fillSourceRange.startRow, sourceCol);
        for (let r = fillSourceRange.endRow + 1; r <= fillTargetRange.endRow; r++) {
          updateData(r, sourceCol, sourceValue);
        }
      }
    } else if (sourceHeight > 1 && sourceWidth === 1 && fillTargetRange.endCol > fillSourceRange.endCol) {
      for (let r = 0; r < sourceHeight; r++) {
        const sourceRow = fillSourceRange.startRow + r;
        const sourceValue = getData(sourceRow, fillSourceRange.startCol);
        for (let c = fillSourceRange.endCol + 1; c <= fillTargetRange.endCol; c++) {
          updateData(sourceRow, c, sourceValue);
        }
      }
    } else if (sourceWidth === 1 && sourceHeight === 1) {
      const sourceValue = getData(fillSourceRange.startRow, fillSourceRange.startCol);
      if (typeof sourceValue === 'number') {
        if (fillTargetRange.endCol > fillSourceRange.endCol) {
          for (let c = fillSourceRange.endCol + 1, inc = 1; c <= fillTargetRange.endCol; c++, inc++) {
            updateData(fillSourceRange.startRow, c, sourceValue + inc);
          }
        } else if (fillTargetRange.endRow > fillSourceRange.endRow) {
          for (let r = fillSourceRange.endRow + 1, inc = 1; r <= fillTargetRange.endRow; r++, inc++) {
            updateData(r, fillSourceRange.startCol, sourceValue + inc);
          }
        }
      } else {
        if (fillTargetRange.endCol > fillSourceRange.endCol) {
          for (let c = fillSourceRange.endCol + 1; c <= fillTargetRange.endCol; c++) {
            updateData(fillSourceRange.startRow, c, sourceValue);
          }
        } else if (fillTargetRange.endRow > fillSourceRange.endRow) {
          for (let r = fillSourceRange.endRow + 1; r <= fillTargetRange.endRow; r++) {
            updateData(r, fillSourceRange.startCol, sourceValue);
          }
        }
      }
    }

    setIsFilling(false);
    setFillSourceRange(null);
    setFillTargetRange(null);
    const fillElement = document.querySelector('.fill-feedback');
    if (fillElement) fillElement.remove();
    document.body.style.cursor = 'auto';
  }, [isFilling, fillSourceRange, fillTargetRange]);

  const isDraggedOver = useCallback((rowIndex, colIndex) => {
    if (!isDragging || !dragTargetCell) return false;
    const dragWidth = dragSourceRange.endCol - dragSourceRange.startCol + 1;
    const dragHeight = dragSourceRange.endRow - dragSourceRange.startRow + 1;
    return (
      rowIndex >= dragTargetCell.row &&
      rowIndex < dragTargetCell.row + dragHeight &&
      colIndex >= dragTargetCell.col &&
      colIndex < dragTargetCell.col + dragWidth
    );
  }, [isDragging, dragSourceRange, dragTargetCell]);

  const isFilledOver = useCallback((rowIndex, colIndex) => {
    if (!isFilling || !fillTargetRange) return false;
    return (
      rowIndex >= fillTargetRange.startRow &&
      rowIndex <= fillTargetRange.endRow &&
      colIndex >= fillTargetRange.startCol &&
      colIndex <= fillTargetRange.endCol
    );
  }, [isFilling, fillTargetRange]);

  return {
    isDragging,
    dragSourceRange,
    dragTargetCell,
    startDrag,
    updateDrag,
    endDrag,
    isDraggedOver,

    isFilling,
    fillSourceRange,
    fillTargetRange,
    startFill,
    updateFill,
    endFill,
    isFilledOver
  };
};

export default useDragAndDrop;