import { useState } from 'react';
import './AppBar.css';

function AppBar() {
  const [filename, setFilename] = useState('Untitled spreadsheet');
  const [isEditing, setIsEditing] = useState(false);

  const handleEditFilename = () => {
    setIsEditing(true);
  };

  const handleFilenameChange = (e) => {
    setFilename(e.target.value);
  };

  const handleFilenameBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
  };

  return (
    <div className="app-bar">
      <div className="app-icon">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="#0F9D58" d="M19,11V5L5,19H12C15.87,19 19,16.13 19,12.1V11M19,3C20.11,3 21,3.9 21,5V11.1C21,17.04 16.53,22 11,22H5C3.9,22 3,21.1 3,20V4C3,2.9 3.9,2 5,2H17C18.1,2 19,2.9 19,4V3M17,7V5H14V7H17Z"></path>
        </svg>
      </div>

      <div className="filename-container">
        {isEditing ? (
          <input
            type="text"
            value={filename}
            onChange={handleFilenameChange}
            onBlur={handleFilenameBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="filename-input"
          />
        ) : (
          <h1 className="filename" onClick={handleEditFilename}>
            {filename}
          </h1>
        )}
      </div>

      <div className="menu-container">
        <button className="menu-item">File</button>
        <button className="menu-item">Edit</button>
        <button className="menu-item">View</button>
        <button className="menu-item">Insert</button>
        <button className="menu-item">Format</button>
        <button className="menu-item">Data</button>
        <button className="menu-item">Tools</button>
        <button className="menu-item">Help</button>
      </div>

      <div className="app-actions">
        <button className="action-button">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M15,4A8,8 0 0,1 23,12A8,8 0 0,1 15,20A8,8 0 0,1 7,12A8,8 0 0,1 15,4M15,6A6,6 0 0,0 9,12A6,6 0 0,0 15,18A6,6 0 0,0 21,12A6,6 0 0,0 15,6M14,8H16V11H19V13H16V16H14V13H11V11H14V8Z"></path>
          </svg>
        </button>
        <button className="action-button">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default AppBar;