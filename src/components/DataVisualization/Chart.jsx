import { useState, useEffect, useContext } from 'react';
import { SpreadsheetContext } from '../context/SpreadsheetContext';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

const Chart = ({ type = 'bar', selection, title = 'Chart', width = 600, height = 400 }) => {
  const { cells } = useContext(SpreadsheetContext);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);

  const [chartConfig, setChartConfig] = useState({
    showLegend: true,
    showGrid: true,
    showTooltip: true,
    colors: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28', '#FF8042']
  });

  useEffect(() => {
    if (!selection || !selection.start || !selection.end) {
      setError('No valid selection');
      return;
    }

    try {
      const data = extractDataFromSelection(selection);
      setChartData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setChartData([]);
    }
  }, [selection, cells]);

  const extractDataFromSelection = (selection) => {
    const startCell = parseCellId(selection.start);
    const endCell = parseCellId(selection.end);

    if (!startCell || !endCell) {
      throw new Error('Invalid cell selection format');
    }

    const rowCount = endCell.row - startCell.row + 1;
    const colCount = endCell.col - startCell.col + 1;

    if (rowCount < 2 && colCount < 2) {
      throw new Error('Selection must include at least two rows or two columns');
    }

    let formattedData = [];

    if (rowCount > colCount) {
      const categories = [];
      for (let col = startCell.col; col <= endCell.col; col++) {
        const cellId = formatCellId({ row: startCell.row, col });
        const cellValue = cells[cellId]?.value || '';
        categories.push(String(cellValue));
      }

      for (let row = startCell.row + 1; row <= endCell.row; row++) {
        const dataPoint = { name: row - startCell.row };

        for (let col = startCell.col; col <= endCell.col; col++) {
          const cellId = formatCellId({ row, col });
          const cellValue = cells[cellId]?.value || 0;
          const category = categories[col - startCell.col] || `Col${col - startCell.col + 1}`;
          dataPoint[category] = isNaN(Number(cellValue)) ? 0 : Number(cellValue);
        }

        formattedData.push(dataPoint);
      }
    } else {
      for (let row = startCell.row; row <= endCell.row; row++) {
        const nameCellId = formatCellId({ row, col: startCell.col });
        const nameValue = cells[nameCellId]?.value || `Row${row - startCell.row + 1}`;
        const dataPoint = { name: String(nameValue) };

        for (let col = startCell.col + 1; col <= endCell.col; col++) {
          const cellId = formatCellId({ row, col });
          const cellValue = cells[cellId]?.value || 0;
          const series = `Series${col - startCell.col}`;
          dataPoint[series] = isNaN(Number(cellValue)) ? 0 : Number(cellValue);
        }

        formattedData.push(dataPoint);
      }
    }

    return formattedData;
  };

  function parseCellId(cellId) {
    const match = cellId.match(/([A-Z]+)(\d+)/);
    if (!match) return null;

    const colStr = match[1];
    const rowNum = parseInt(match[2]);

    let colNum = 0;
    for (let i = 0; i < colStr.length; i++) {
      colNum = colNum * 26 + (colStr.charCodeAt(i) - 64);
    }

    return { col: colNum, row: rowNum };
  }

  function formatCellId({ col, row }) {
    let colStr = '';
    let tempCol = col;

    while (tempCol > 0) {
      const remainder = (tempCol - 1) % 26;
      colStr = String.fromCharCode(65 + remainder) + colStr;
      tempCol = Math.floor((tempCol - 1) / 26);
    }

    return `${colStr}${row}`;
  }

  const getDataKeys = () => {
    if (chartData.length === 0) return [];
    const keys = Object.keys(chartData[0]).filter(key => key !== 'name');
    return keys;
  };

  const renderChart = () => {
    const dataKeys = getDataKeys();

    if (dataKeys.length === 0) {
      return <div className="no-data">No data available for charting</div>;
    }

    switch (type.toLowerCase()) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              {chartConfig.showTooltip && <Tooltip />}
              {chartConfig.showLegend && <Legend />}
              {dataKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={chartConfig.colors[index % chartConfig.colors.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              {chartConfig.showTooltip && <Tooltip />}
              {chartConfig.showLegend && <Legend />}
              {dataKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={chartConfig.colors[index % chartConfig.colors.length]}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              {chartConfig.showTooltip && <Tooltip />}
              {chartConfig.showLegend && <Legend />}
              {dataKeys.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  fill={chartConfig.colors[index % chartConfig.colors.length]}
                  stroke={chartConfig.colors[index % chartConfig.colors.length]}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const pieData = dataKeys.map((key, index) => ({
          name: key,
          value: chartData.reduce((sum, item) => sum + (item[key] || 0), 0),
          color: chartConfig.colors[index % chartConfig.colors.length]
        }));

        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              {chartConfig.showTooltip && <Tooltip />}
              {chartConfig.showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <div className="error">Unsupported chart type: {type}</div>;
    }
  };

  return (
    <div className="chart-container" style={{ width, height }}>
      <h3 className="chart-title">{title}</h3>
      {error ? (
        <div className="chart-error">{error}</div>
      ) : (
        <div className="chart-content" style={{ width: '100%', height: 'calc(100% - 40px)' }}>
          {renderChart()}
        </div>
      )}
    </div>
  );
};

export default Chart;