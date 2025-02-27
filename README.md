# Google Sheets Clone

A lightweight, React-based spreadsheet application inspired by Google Sheets, built with Vite for a fast development experience. This project includes features like a grid interface, formula bar, toolbar, context menus, data visualization, and dialogs for find/replace, cell formatting, and saving/loading data.

## Features
- Spreadsheet grid with cell editing and selection
- Formula bar for entering and editing expressions
- Toolbar for common actions
- Context menu for additional cell options
- Data visualization using charts (via Recharts)
- Dialogs for find/replace, cell formatting, and save/load functionality
- Custom hooks for cell selection, drag-and-drop, and undo/redo
- Theme and spreadsheet context Providers
- Utility functions for formula parsing, cell references, and data validation

## Project Structure
```
├── src
│   ├── App.css              # Main app styles
│   ├── App.jsx              # Root component
│   ├── assets               # Static assets
│   │   ├── react.svg
│   │   └── styles
│   │       └── variables.css
│   ├── components           # Reusable UI components
│   │   ├── AppBar
│   │   ├── ContextMenu
│   │   ├── DataVisualization
│   │   ├── Dialogs
│   │   ├── FormulaBar
│   │   ├── Grid
│   │   └── Toolbar
│   ├── context              # React Context Providers
│   ├── functions            # Business logic and utilities
│   ├── hooks                # Custom React hooks
│   ├── index.css            # Global styles
│   ├── index.js             # Entry point
│   ├── main.jsx             # Vite main file
│   └── utils                # Helper utilities
```

## Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) (v8 or higher) or [yarn](https://yarnpkg.com/) (optional)

## Installation

Install dependencies using npm:
```bash
npm install
```
Or using yarn:
```bash
yarn install
```

## Usage

Run the development server:
```bash
npm run dev
```
Or with yarn:
```bash
yarn dev
```

Open your browser to http://localhost:5173 (or the port displayed in the terminal).

Build for production:
```bash
npm run build
```
Or with yarn:
```bash
yarn build
```

Preview the production build:
```bash
npm run preview
```
Or with yarn:
```bash
yarn preview
```

Lint the codebase:
```bash
npm run lint
```
Or with yarn:
```bash
yarn lint
```

## Dependencies

- **React**: ^19.0.0 - Core library for building the UI
- **React DOM**: ^19.0.0 - DOM rendering for React
- **Recharts**: ^2.15.1 - Charting library for data visualization

## Dev Dependencies

- **Vite**: ^6.2.0 - Fast build tool and development server
- **ESLint**: ^9.21.0 - Linting for code quality
- **@vitejs/plugin-react**: ^4.3.4 - React support for Vite
- **eslint-plugin-react**: ^7.37.4 - React-specific linting rules
- **eslint-plugin-react-hooks**: ^5.0.0 - Rules for React hooks
- **eslint-plugin-react-refresh**: ^0.4.19 - Fast refresh support
- **@types/react**: ^19.0.10 - TypeScript types for React
- **@types/react-dom**: ^19.0.4 - TypeScript types for React DOM

## Scripts

- **dev**: Start the development server with Vite
- **build**: Build the app for production
- **lint**: Run ESLint to check for code issues
- **preview**: Preview the production build locally

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m "Add feature"`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a Pull Request

## License

This project is private and not licensed for public use.