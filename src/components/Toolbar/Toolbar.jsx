import { useState } from 'react';
import { useSpreadsheet } from '../../context/SpreadsheetContext';
import './Toolbar.css';

function Toolbar({ activeTab, setActiveTab }) {
  const { activeCell, setCellFormat } = useSpreadsheet();
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState('10');
  
  const handleFontFamilyChange = (e) => {
    setFontFamily(e.target.value);
    if (activeCell) {
      setCellFormat(activeCell, { fontFamily: e.target.value });
    }
  };
  
  const handleFontSizeChange = (e) => {
    setFontSize(e.target.value);
    if (activeCell) {
      setCellFormat(activeCell, { fontSize: e.target.value });
    }
  };
  
  const handleFormatClick = (format) => {
    if (activeCell) {
      setCellFormat(activeCell, { [format]: true });
    }
  };
  
  return (
    <div className="toolbar">
      <div className="toolbar-tabs">
        <button 
          className={`toolbar-tab ${activeTab === 'Home' ? 'active' : ''}`}
          onClick={() => setActiveTab('Home')}
        >
          Home
        </button>
        <button 
          className={`toolbar-tab ${activeTab === 'Insert' ? 'active' : ''}`}
          onClick={() => setActiveTab('Insert')}
        >
          Insert
        </button>
        <button 
          className={`toolbar-tab ${activeTab === 'Format' ? 'active' : ''}`}
          onClick={() => setActiveTab('Format')}
        >
          Format
        </button>
        <button 
          className={`toolbar-tab ${activeTab === 'Data' ? 'active' : ''}`}
          onClick={() => setActiveTab('Data')}
        >
          Data
        </button>
      </div>
      
      <div className="toolbar-content">
        {activeTab === 'Home' && (
          <div className="toolbar-section">
            <div className="toolbar-group">
              <select 
                className="toolbar-select" 
                value={fontFamily}
                onChange={handleFontFamilyChange}
              >
                <option value="Arial">Arial</option>
                <option value="Calibri">Calibri</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
              </select>
              
              <select 
                className="toolbar-select font-size-select" 
                value={fontSize}
                onChange={handleFontSizeChange}
              >
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
                <option value="14">14</option>
                <option value="16">16</option>
                <option value="18">18</option>
                <option value="20">20</option>
                <option value="22">22</option>
                <option value="24">24</option>
              </select>
            </div>
            
            <div className="toolbar-group">
              <button 
                className="toolbar-button" 
                title="Bold (Ctrl+B)"
                onClick={() => handleFormatClick('bold')}
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M13.5,15.5H10V12.5H13.5A1.5,1.5 0 0,1 15,14A1.5,1.5 0 0,1 13.5,15.5M10,6.5H13A1.5,1.5 0 0,1 14.5,8A1.5,1.5 0 0,1 13,9.5H10M15.6,10.79C16.57,10.11 17.25,9 17.25,8C17.25,5.74 15.5,4 13.25,4H7V18H14.04C16.14,18 17.75,16.3 17.75,14.21C17.75,12.69 16.89,11.39 15.6,10.79Z"></path>
                </svg>
              </button>
              
              <button 
                className="toolbar-button" 
                title="Italic (Ctrl+I)"
                onClick={() => handleFormatClick('italic')}
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M10,4V7H12.21L8.79,15H6V18H14V15H11.79L15.21,7H18V4H10Z"></path>
                </svg>
              </button>
              
              <button 
                className="toolbar-button" 
                title="Underline (Ctrl+U)"
                onClick={() => handleFormatClick('underline')}
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M5,21H19V19H5V21M12,17A6,6 0 0,0 18,11V3H15.5V11A3.5,3.5 0 0,1 12,14.5A3.5,3.5 0 0,1 8.5,11V3H6V11A6,6 0 0,0 12,17Z"></path>
                </svg>
              </button>
            </div>
            
            <div className="toolbar-group">
              <button 
                className="toolbar-button" 
                title="Align Left"
                onClick={() => handleFormatClick('alignLeft')}
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M3,3H21V5H3V3M3,7H15V9H3V7M3,11H21V13H3V11M3,15H15V17H3V15M3,19H21V21H3V19Z"></path>
                </svg>
              </button>
              
              <button 
                className="toolbar-button" 
                title="Align Center"
                onClick={() => handleFormatClick('alignCenter')}
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M3,3H21V5H3V3M7,7H17V9H7V7M3,11H21V13H3V11M7,15H17V17H7V15M3,19H21V21H3V19Z"></path>
                </svg>
              </button>
              
              <button 
                className="toolbar-button" 
                title="Align Right"
                onClick={() => handleFormatClick('alignRight')}
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M3,3H21V5H3V3M9,7H21V9H9V7M3,11H21V13H3V11M9,15H21V17H9V15M3,19H21V21H3V19Z"></path>
                </svg>
              </button>
            </div>
            
            <div className="toolbar-group">
              <button className="toolbar-button color-picker-button" title="Text Color">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M9.62,12L12,5.67L14.37,12M11,3L5.5,17H7.75L8.87,14H15.12L16.25,17H18.5L13,3H11Z"></path>
                </svg>
                <div className="color-indicator"></div>
              </button>
              
              <button className="toolbar-button color-picker-button" title="Fill Color">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M19,11.5C19,11.5 17,13.67 17,15A2,2 0 0,0 19,17A2,2 0 0,0 21,15C21,13.67 19,11.5 19,11.5M5.21,10L10,5.21L14.79,10M16.56,8.94L7.62,0L6.21,1.41L8.59,3.79L3.44,8.94C2.85,9.5 2.85,10.47 3.44,11.06L8.94,16.56C9.23,16.85 9.62,17 10,17C10.38,17 10.77,16.85 11.06,16.56L16.56,11.06C17.15,10.47 17.15,9.5 16.56,8.94Z"></path>
                </svg>
                <div className="color-indicator"></div>
              </button>
            </div>
            
            <div className="toolbar-group">
              <button className="toolbar-button" title="Borders">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M3,3V21H21V3H3M5,5H19V19H5V5M11,7V9H13V7H11M7,7V9H9V7H7M15,7V9H17V7H15M7,11V13H9V11H7M11,11V13H13V11H11M15,11V13H17V11H15M7,15V17H9V15H7M11,15V17H13V15H11M15,15V17H17V15H15Z"></path>
                </svg>
              </button>
            </div>
            
            <div className="toolbar-group">
              <button className="toolbar-button" title="Function">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M19,3H5C3.9,3 3,3.9 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V5C21,3.9 20.1,3 19,3M9.5,11.5C9.5,12.3 8.8,13 8,13H7V15H5.5V9H8C8.8,9 9.5,9.7 9.5,10.5V11.5M14.5,15H13V13.5H11.5V15H10V9H11.5V12H13V9H14.5V15M19,12.5C19,13.3 18.3,14 17.5,14H16V15H14.5V13.5H16V12.5H17.5V11.5H16V9H17.5C18.3,9 19,9.7 19,10.5V12.5M7.5,10.5H8V11.5H7.5V10.5Z"></path>
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'Data' && (
          <div className="toolbar-section">
            <div className="toolbar-group">
              <button className="toolbar-button-with-text" title="Sort Range">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M3,13H15V11H3M3,6V8H21V6M3,18H9V16H3V18Z"></path>
                </svg>
                <span>Sort Range</span>
              </button>
              
              <button className="toolbar-button-with-text" title="Find & Replace">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"></path>
                </svg>
                <span>Find & Replace</span>
              </button>
              
              <button className="toolbar-button-with-text" title="Remove Duplicates">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,17L8,15H10V13H8V15L6,13V17H10M14,17V15L16,17L14,19V17Z"></path>
                </svg>
                <span>Remove Duplicates</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Toolbar;