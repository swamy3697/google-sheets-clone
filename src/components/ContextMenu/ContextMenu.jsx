import { useContext, useEffect, useRef } from 'react';
import { SpreadsheetContext } from '../context/SpreadsheetContext';
import './ContextMenu.css';

const ContextMenu = () => {
  const {
    contextMenu,
    setContextMenu,
    selection,
    cells,
    cutCells,
    copyCells,
    pasteCells,
    deleteCells,
    insertRow,
    insertColumn,
    deleteRow,
    deleteColumn
  } = useContext(SpreadsheetContext);

  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [contextMenu, setContextMenu]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu, setContextMenu]);

  if (!contextMenu) {
    return null;
  }

  const { x, y, type, rowIndex, colIndex } = contextMenu;

  const handleMenuItemClick = (action) => {
    switch (action) {
      case 'cut':
        cutCells();
        break;
      case 'copy':
        copyCells();
        break;
      case 'paste':
        pasteCells();
        break;
      case 'delete':
        deleteCells();
        break;
      case 'insert_row_above':
        insertRow(rowIndex);
        break;
      case 'insert_row_below':
        insertRow(rowIndex + 1);
        break;
      case 'delete_row':
        deleteRow(rowIndex);
        break;
      case 'insert_column_left':
        insertColumn(colIndex);
        break;
      case 'insert_column_right':
        insertColumn(colIndex + 1);
        break;
      case 'delete_column':
        deleteColumn(colIndex);
        break;
      default:
        break;
    }
    setContextMenu(null);
  };

  const menuStyle = {
    left: `${x}px`,
    top: `${y}px`,
  };

  const getMenuItems = () => {
    const commonItems = [
      { id: 'cut', label: 'Cut', shortcut: 'Ctrl+X' },
      { id: 'copy', label: 'Copy', shortcut: 'Ctrl+C' },
      { id: 'paste', label: 'Paste', shortcut: 'Ctrl+V' },
      { id: 'delete', label: 'Delete', shortcut: 'Delete' },
    ];

    const rowItems = [
      { id: 'insert_row_above', label: 'Insert row above' },
      { id: 'insert_row_below', label: 'Insert row below' },
      { id: 'delete_row', label: 'Delete row' },
    ];

    const columnItems = [
      { id: 'insert_column_left', label: 'Insert column left' },
      { id: 'insert_column_right', label: 'Insert column right' },
      { id: 'delete_column', label: 'Delete column' },
    ];

    switch (type) {
      case 'cell':
        return commonItems;
      case 'row':
        return [...commonItems, { id: 'divider', type: 'divider' }, ...rowItems];
      case 'column':
        return [...commonItems, { id: 'divider', type: 'divider' }, ...columnItems];
      default:
        return commonItems;
    }
  };

  return (
    <div ref={menuRef} className="context-menu" style={menuStyle}>
      <ul>
        {getMenuItems().map((item) => (
          item.type === 'divider' ? (
            <li key={item.id} className="divider"></li>
          ) : (
            <li key={item.id} onClick={() => handleMenuItemClick(item.id)} className="menu-item">
              <span className="menu-item-label">{item.label}</span>
              {item.shortcut && (
                <span className="menu-item-shortcut">{item.shortcut}</span>
              )}
            </li>
          )
        ))}
      </ul>
    </div>
  );
};

export default ContextMenu;