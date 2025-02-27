{
  cells: {
    'A1': { value: 10, formula: '10', formatting: { bold: true, color: '#ff0000' } },
    'B1': { value: 20, formula: '20', formatting: {} },
    'C1': { value: 30, formula: 'SUM(A1:B1)', formatting: {} },
    // More cells...
  },
  rows: 100,
  columns: 26,
  activeCell: 'A1',
  selection: { start: 'A1', end: 'C3' },
  undoStack: [...],
  redoStack: [...]
}