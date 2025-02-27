import { useState, useEffect } from 'react';
import { useSpreadsheet } from '../../context/SpreadsheetContext';
import './FormulaBar.css';

function FormulaBar() {
  const { activeCell, cells, setCellValue } = useSpreadsheet();
  const [formula, setFormula] = useState('');

  useEffect(() => {
    if (activeCell && cells[activeCell]) {
      setFormula(cells[activeCell].formula || '');
    } else {
      setFormula('');
    }
  }, [activeCell, cells]);

  const handleFormulaChange = (e) => {
    setFormula(e.target.value);
  };

  const handleFormulaSubmit = (e) => {
    if (e.key === 'Enter' && activeCell) {
      if (formula.startsWith('=')) {
        setCellValue(activeCell, null, formula);
      } else {
        setCellValue(activeCell, formula);
      }
    }
  };

  return (
    <div className="formula-bar">
      <div className="cell-reference">
        {activeCell || ''}
      </div>
      <div className="formula-equals">=</div>
      <input
        type="text"
        className="formula-input"
        value={formula}
        onChange={handleFormulaChange}
        onKeyDown={handleFormulaSubmit}
        placeholder="Enter a value or formula"
      />
    </div>
  );
}

export default FormulaBar;