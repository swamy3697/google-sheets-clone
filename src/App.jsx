import { useState } from 'react';
import AppBar from './components/AppBar';
import Toolbar from './components/Toolbar';
import FormulaBar from './components/FormulaBar';
import {Grid} from './components/Grid';
import { SpreadsheetProvider } from './context/SpreadsheetContext';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('Home');

  return (
    <SpreadsheetProvider>
      <div className="app">
        <AppBar />
        <Toolbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <FormulaBar />
        <Grid />
      </div>
    </SpreadsheetProvider>
  );
}

export default App;