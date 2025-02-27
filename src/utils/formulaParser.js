import { getCellValue } from './cellReferences';

/**
 * Evaluates a formula string and returns the calculated result
 * @param {string} formula - The formula to evaluate (e.g. "=SUM(A1:B3)")
 * @param {object} cells - The current cells object from the spreadsheet
 * @param {string} currentCellId - The ID of the cell containing this formula (to prevent circular references)
 * @returns {number|string|boolean} The evaluated result
 */
export const evaluateFormula = (formula, cells, currentCellId) => {
  if (!formula || typeof formula !== 'string' || !formula.startsWith('=')) {
    return formula;
  }

  try {
    const expression = formula.substring(1).trim();
    const referencedCells = extractCellReferences(expression);
    if (referencedCells.includes(currentCellId)) {
      return '#CIRCULAR!';
    }

    const functionMatch = expression.match(/^([A-Z]+)\((.*)\)$/);
    if (functionMatch) {
      const functionName = functionMatch[1];
      const argumentsString = functionMatch[2];
      return evaluateFunction(functionName, argumentsString, cells, currentCellId);
    }

    const resolvedExpression = resolveCellReferences(expression, cells, currentCellId);
    const result = evaluateMathExpression(resolvedExpression);
    return result;
  } catch (error) {
    console.error('Formula evaluation error:', error);
    return '#ERROR!';
  }
};

const evaluateFunction = (functionName, argumentsString, cells, currentCellId) => {
  const args = parseArguments(argumentsString);
  switch (functionName.toUpperCase()) {
    case 'SUM':
      return calculateSum(args, cells, currentCellId);
    case 'AVERAGE':
      return calculateAverage(args, cells, currentCellId);
    case 'MAX':
      return calculateMax(args, cells, currentCellId);
    case 'MIN':
      return calculateMin(args, cells, currentCellId);
    case 'COUNT':
      return calculateCount(args, cells, currentCellId);
    case 'CONCAT':
    case 'CONCATENATE':
      return concatenateValues(args, cells, currentCellId);
    case 'IF':
      return evaluateIf(args, cells, currentCellId);
    default:
      return '#UNKNOWN_FUNCTION!';
  }
};

const parseArguments = (argumentsString) => {
  const args = [];
  let currentArg = '';
  let insideQuotes = false;
  for (let i = 0; i < argumentsString.length; i++) {
    const char = argumentsString[i];
    if (char === '"' && argumentsString[i - 1] !== '\\') {
      insideQuotes = !insideQuotes;
      currentArg += char;
    } else if (char === ',' && !insideQuotes) {
      args.push(currentArg.trim());
      currentArg = '';
    } else {
      currentArg += char;
    }
  }
  if (currentArg) {
    args.push(currentArg.trim());
  }
  return args;
};

export const extractCellReferences = (expression) => {
  const cellPattern = /([A-Z]+[0-9]+)(:[A-Z]+[0-9]+)?/g;
  const matches = expression.match(cellPattern) || [];
  const expandedReferences = [];
  for (const match of matches) {
    if (match.includes(':')) {
      const [startRef, endRef] = match.split(':');
      const rangeCells = expandCellRange(startRef, endRef);
      expandedReferences.push(...rangeCells);
    } else {
      expandedReferences.push(match);
    }
  }
  return expandedReferences;
};

export const expandCellRange = (startRef, endRef) => {
  const startMatch = startRef.match(/([A-Z]+)([0-9]+)/);
  const endMatch = endRef.match(/([A-Z]+)([0-9]+)/);
  if (!startMatch || !endMatch) {
    return [startRef];
  }
  const startCol = columnLetterToIndex(startMatch[1]);
  const startRow = parseInt(startMatch[2]);
  const endCol = columnLetterToIndex(endMatch[1]);
  const endRow = parseInt(endMatch[2]);
  const cells = [];
  for (let row = Math.min(startRow, endRow); row <= Math.max(startRow, endRow); row++) {
    for (let col = Math.min(startCol, endCol); col <= Math.max(startCol, endCol); col++) {
      cells.push(`${indexToColumnLetter(col)}${row}`);
    }
  }
  return cells;
};

export const columnLetterToIndex = (col) => {
  let result = 0;
  for (let i = 0; i < col.length; i++) {
    result = result * 26 + (col.charCodeAt(i) - 64);
  }
  return result - 1;
};

export const indexToColumnLetter = (index) => {
  let temp = index + 1;
  let letter = '';
  while (temp > 0) {
    const remainder = (temp - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    temp = Math.floor((temp - 1) / 26);
  }
  return letter;
};

const resolveCellReferences = (expression, cells, currentCellId) => {
  const rangePattern = /([A-Z]+[0-9]+):([A-Z]+[0-9]+)/g;
  expression = expression.replace(rangePattern, (match) => {
    const [startRef, endRef] = match.split(':');
    const rangeCells = expandCellRange(startRef, endRef);
    const values = rangeCells.map(cellId => {
      const value = getCellValue(cells, cellId, currentCellId);
      return isNaN(value) ? `"${value}"` : value;
    });
    return `[${values.join(',')}]`;
  });
  const cellPattern = /([A-Z]+[0-9]+)/g;
  expression = expression.replace(cellPattern, (cellId) => {
    const value = getCellValue(cells, cellId, currentCellId);
    return isNaN(value) ? `"${value}"` : value;
  });
  return expression;
};

const evaluateMathExpression = (expression) => {
  try {
    expression = expression.replace(/\[([^\]]*)\]/g, (match, contents) => {
      return `[${contents}].flat()`;
    });
    const result = Function(`'use strict'; return (${expression});`)();
    return result;
  } catch (error) {
    console.error('Math evaluation error:', error);
    return '#ERROR!';
  }
};

const calculateSum = (args, cells, currentCellId) => {
  const values = [];
  for (const arg of args) {
    if (arg.includes(':')) {
      const [startCell, endCell] = arg.split(':');
      const cellsInRange = expandCellRange(startCell, endCell);
      for (const cellId of cellsInRange) {
        const value = getCellValue(cells, cellId, currentCellId);
        if (!isNaN(value)) {
          values.push(Number(value));
        }
      }
    } else {
      const value = arg.match(/^[A-Z]+[0-9]+$/) ? getCellValue(cells, arg, currentCellId) : arg;
      if (!isNaN(value)) {
        values.push(Number(value));
      }
    }
  }
  return values.reduce((sum, value) => sum + value, 0);
};

const calculateAverage = (args, cells, currentCellId) => {
  const sum = calculateSum(args, cells, currentCellId);
  let count = 0;
  for (const arg of args) {
    if (arg.includes(':')) {
      const [startCell, endCell] = arg.split(':');
      const cellsInRange = expandCellRange(startCell, endCell);
      for (const cellId of cellsInRange) {
        const value = getCellValue(cells, cellId, currentCellId);
        if (!isNaN(value)) {
          count++;
        }
      }
    } else {
      const value = arg.match(/^[A-Z]+[0-9]+$/) ? getCellValue(cells, arg, currentCellId) : arg;
      if (!isNaN(value)) {
        count++;
      }
    }
  }
  return count === 0 ? 0 : sum / count;
};

const calculateMax = (args, cells, currentCellId) => {
  const values = [];
  for (const arg of args) {
    if (arg.includes(':')) {
      const [startCell, endCell] = arg.split(':');
      const cellsInRange = expandCellRange(startCell, endCell);
      for (const cellId of cellsInRange) {
        const value = getCellValue(cells, cellId, currentCellId);
        if (!isNaN(value)) {
          values.push(Number(value));
        }
      }
    } else {
      const value = arg.match(/^[A-Z]+[0-9]+$/) ? getCellValue(cells, arg, currentCellId) : arg;
      if (!isNaN(value)) {
        values.push(Number(value));
      }
    }
  }
  return values.length === 0 ? 0 : Math.max(...values);
};

const calculateMin = (args, cells, currentCellId) => {
  const values = [];
  for (const arg of args) {
    if (arg.includes(':')) {
      const [startCell, endCell] = arg.split(':');
      const cellsInRange = expandCellRange(startCell, endCell);
      for (const cellId of cellsInRange) {
        const value = getCellValue(cells, cellId, currentCellId);
        if (!isNaN(value)) {
          values.push(Number(value));
        }
      }
    } else {
      const value = arg.match(/^[A-Z]+[0-9]+$/) ? getCellValue(cells, arg, currentCellId) : arg;
      if (!isNaN(value)) {
        values.push(Number(value));
      }
    }
  }
  return values.length === 0 ? 0 : Math.min(...values);
};

const calculateCount = (args, cells, currentCellId) => {
  let count = 0;
  for (const arg of args) {
    if (arg.includes(':')) {
      const [startCell, endCell] = arg.split(':');
      const cellsInRange = expandCellRange(startCell, endCell);
      for (const cellId of cellsInRange) {
        const value = getCellValue(cells, cellId, currentCellId);
        if (value !== undefined && value !== null && value !== '') {
          count++;
        }
      }
    } else {
      const value = arg.match(/^[A-Z]+[0-9]+$/) ? getCellValue(cells, arg, currentCellId) : arg;
      if (value !== undefined && value !== null && value !== '') {
        count++;
      }
    }
  }
  return count;
};

const concatenateValues = (args, cells, currentCellId) => {
  let result = '';
  for (const arg of args) {
    if (arg.includes(':')) {
      const [startCell, endCell] = arg.split(':');
      const cellsInRange = expandCellRange(startCell, endCell);
      for (const cellId of cellsInRange) {
        const value = getCellValue(cells, cellId, currentCellId);
        result += value === null || value === undefined ? '' : value;
      }
    } else {
      if (arg.match(/^[A-Z]+[0-9]+$/)) {
        const value = getCellValue(cells, arg, currentCellId);
        result += value === null || value === undefined ? '' : value;
      } else {
        if (arg.startsWith('"') && arg.endsWith('"')) {
          result += arg.slice(1, -1);
        } else {
          result += arg;
        }
      }
    }
  }
  return result;
};

const evaluateIf = (args, cells, currentCellId) => {
  if (args.length < 2) {
    return '#ERROR!';
  }
  const condition = args[0];
  const resolvedCondition = resolveCellReferences(condition, cells, currentCellId);
  let conditionResult;
  try {
    conditionResult = evaluateMathExpression(resolvedCondition);
  } catch (error) {
    return '#ERROR!';
  }
  if (conditionResult) {
    return args.length > 1 ? evaluateArgument(args[1], cells, currentCellId) : '';
  } else {
    return args.length > 2 ? evaluateArgument(args[2], cells, currentCellId) : '';
  }
};

const evaluateArgument = (arg, cells, currentCellId) => {
  if (arg.match(/^[A-Z]+[0-9]+$/)) {
    return getCellValue(cells, arg, currentCellId);
  }
  if (arg.startsWith('"') && arg.endsWith('"')) {
    return arg.slice(1, -1);
  }
  if (!isNaN(arg)) {
    return Number(arg);
  }
  try {
    const resolvedArg = resolveCellReferences(arg, cells, currentCellId);
    return evaluateMathExpression(resolvedArg);
  } catch (error) {
    return arg;
  }
};

export default {
  evaluateFormula,
  extractCellReferences,
  expandCellRange,
  columnLetterToIndex,
  indexToColumnLetter
};