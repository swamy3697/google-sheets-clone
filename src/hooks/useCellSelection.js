/**
 * Gets the value of a cell, resolving any formulas
 * @param {object} cells - The cells object from the spreadsheet
 * @param {string} cellId - The ID of the cell to get value from (e.g. "A1")
 * @param {string} currentCellId - The ID of the cell requesting the value (to prevent circular refs)
 * @returns {any} The cell value
 */
export const getCellValue = (cells, cellId, currentCellId) => {
  if (cellId === currentCellId) {
    return '#CIRCULAR!';
  }

  if (!cells[cellId]) {
    return '';
  }

  const cell = cells[cellId];
  return cell.value !== undefined ? cell.value : '';
};

/**
 * Converts an A1-style reference to row and column indices
 * @param {string} cellId - Cell ID in A1 notation (e.g. "A1")
 * @returns {object} Object with row and col indices
 */
export const cellIdToIndices = (cellId) => {
  const match = cellId.match(/([A-Z]+)([0-9]+)/);
  if (!match) return null;

  const colStr = match[1];
  const row = parseInt(match[2]) - 1;

  let col = 0;
  for (let i = 0; i < colStr.length; i++) {
    col = col * 26 + (colStr.charCodeAt(i) - 64);
  }

  return { row, col: col - 1 };
};

/**
 * Converts row and column indices to an A1-style reference
 * @param {number} row - Row index (0-based)
 * @param {number} col - Column index (0-based)
 * @returns {string} Cell ID in A1 notation
 */
export const indicesToCellId = (row, col) => {
  let colStr = '';
  let tempCol = col + 1;

  while (tempCol > 0) {
    const remainder = (tempCol - 1) % 26;
    colStr = String.fromCharCode(65 + remainder) + colStr;
    tempCol = Math.floor((tempCol - 1) / 26);
  }

  return `${colStr}${row + 1}`;
};

/**
 * Checks if a cell reference is valid
 * @param {string} cellId - Cell ID to check
 * @returns {boolean} True if valid
 */
export const isValidCellReference = (cellId) => {
  return /^[A-Z]+[0-9]+$/.test(cellId);
};

/**
 * Validates and normalizes a cell range
 * @param {string} startCellId - Start cell ID
 * @param {string} endCellId - End cell ID
 * @returns {object|null} Object with start and end cell IDs, or null if invalid
 */
export const normalizeCellRange = (startCellId, endCellId) => {
  if (!isValidCellReference(startCellId) || !isValidCellReference(endCellId)) {
    return null;
  }

  const start = cellIdToIndices(startCellId);
  const end = cellIdToIndices(endCellId);

  const normalizedStart = indicesToCellId(
    Math.min(start.row, end.row),
    Math.min(start.col, end.col)
  );

  const normalizedEnd = indicesToCellId(
    Math.max(start.row, end.row),
    Math.max(start.col, end.col)
  );

  return { start: normalizedStart, end: normalizedEnd };
};

export default {
  getCellValue,
  cellIdToIndices,
  indicesToCellId,
  isValidCellReference,
  normalizeCellRange
};