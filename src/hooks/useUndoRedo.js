import { useState, useCallback, useEffect } from 'react';

const useUndoRedo = (initialState, maxHistorySize = 50) => {
  const [currentState, setCurrentState] = useState(initialState);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const setState = useCallback((newState) => {
    setUndoStack(prevStack => {
      const newStack = [...prevStack, currentState].slice(-maxHistorySize);
      return newStack;
    });
    setRedoStack([]);
    setCurrentState(newState);
  }, [currentState, maxHistorySize]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return false;
    const prevState = undoStack[undoStack.length - 1];
    setUndoStack(prevStack => prevStack.slice(0, -1));
    setRedoStack(prevStack => [...prevStack, currentState]);
    setCurrentState(prevState);
    return true;
  }, [undoStack, currentState]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return false;
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack(prevStack => prevStack.slice(0, -1));
    setUndoStack(prevStack => [...prevStack, currentState]);
    setCurrentState(nextState);
    return true;
  }, [redoStack, currentState]);

  const resetHistory = useCallback(() => {
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  return {
    state: currentState,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory
  };
};

export default useUndoRedo;