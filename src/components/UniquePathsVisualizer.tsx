import React, { useState, useEffect } from "react";

// --- (Button, InputField, InfoCard, GridCell, InstructionsCard components remain the same) ---

const Button = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
  };

  return (
    <button
      className={`
        px-4 py-2 rounded-xl font-semibold transition-all duration-200 
        shadow-md flex items-center gap-2 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} 
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

const InputField = ({ label, ...props }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-300 mb-1">{label}</label>
    <input
      className="w-24 p-2 rounded-lg border border-gray-600 bg-gray-700 text-white 
               focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50
               transition-all duration-200"
      {...props}
    />
  </div>
);

const InfoCard = ({ title, value, subtitle, className = "" }) => (
  <div
    className={`text-center bg-gray-900/50 p-4 rounded-xl border border-gray-700/50 ${className}`}
  >
    <p className="text-xl text-gray-300 mb-2">
      {title}: <span className="font-bold text-blue-400 text-2xl">{value}</span>
    </p>
    {subtitle && <p className="text-sm text-purple-400">{subtitle}</p>}
  </div>
);

interface GridCellProps {
  r: number;
  c: number;
  cell: number;
  rows: number;
  cols: number;
  onMouseDown: (r: number, c: number) => void;
  onMouseEnter: (r: number, c: number) => void;
  onMouseUp: () => void;
  animatedPath: number[][];
  currentStep: number;
  dp: number[][];
  showDpValues: boolean;
  shortestMode: boolean;
  start: number[];
  end: number[];
}

const GridCell: React.FC<GridCellProps> = ({
  r,
  c,
  cell,
  rows,
  cols,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  animatedPath,
  currentStep,
  dp,
  showDpValues,
  shortestMode,
  start,
  end,
}) => {
  const isStart = shortestMode
    ? r === start[0] && c === start[1]
    : r === 0 && c === 0;
  const isEnd = shortestMode
    ? r === end[0] && c === end[1]
    : r === rows - 1 && c === cols - 1;
  const isObstacle = cell === 1;
  const pathIndex = animatedPath.findIndex(([pr, pc]) => pr === r && pc === c);
  const inPath = pathIndex >= 0;
  const isCurrentStep = pathIndex === currentStep;

  const baseClasses = `
    w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center 
    cursor-pointer border-2 font-mono text-sm select-none 
    transition-all duration-300 relative
  `;

  const cellClasses = (() => {
    if (isStart) {
      return `${baseClasses} bg-green-600 text-white font-bold shadow-lg border-green-400 
              ${inPath ? "ring-4 ring-purple-400 ring-opacity-60" : ""}`;
    }
    if (isEnd) {
      return `${baseClasses} bg-blue-600 text-white font-bold shadow-lg border-blue-400 
              ${inPath ? "ring-4 ring-purple-400 ring-opacity-60" : ""}`;
    }
    if (isObstacle) {
      return `${baseClasses} bg-red-600 border-red-500 text-white`;
    }

    let classes = `${baseClasses} bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700`;
    if (inPath) {
      classes += ` bg-purple-600 border-purple-400 shadow-lg`;
      if (isCurrentStep) {
        classes += ` ring-4 ring-yellow-400 ring-opacity-80 scale-110`;
      }
    }
    return classes;
  })();

  const renderContent = () => {
    if (pathIndex >= 0) {
      return (
        <div
          className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 text-black text-xs 
                       rounded-full flex items-center justify-center font-bold z-10"
        >
          {pathIndex + 1}
        </div>
      );
    }

    if (
      showDpValues &&
      dp[r] &&
      dp[r][c] !== undefined &&
      dp[r][c] > 0 &&
      !isObstacle
    ) {
      return (
        <span className="text-yellow-400 font-bold text-xs">{dp[r][c]}</span>
      );
    }

    if (isStart) return "S";
    if (isEnd) return "E";
    if (isObstacle) return "✕";
    return "";
  };

  return (
    <div
      onMouseDown={() => onMouseDown(r, c)}
      onMouseEnter={() => onMouseEnter(r, c)}
      onMouseUp={onMouseUp}
      className={cellClasses}
      style={{ userSelect: "none" }}
    >
      {renderContent()}
    </div>
  );
};

const InstructionsCard = () => (
  <div
    className="text-sm text-gray-400 text-center max-w-2xl bg-gray-900/30 p-4 
               rounded-xl border border-gray-700/30 space-y-2"
  >
    <p className="font-semibold mb-2">How to use:</p>
    <p>
      • <strong>Click or Drag</strong> to toggle obstacles. In Shortest Path
      mode, you can move Start (S) and End (E) points.
    </p>
    <p>
      • <span className="text-green-400">Green (S)</span> = Start,{" "}
      <span className="text-blue-400">Blue (E)</span> = End,{" "}
      <span className="text-red-400">Red (✕)</span> = Obstacle
    </p>
    <p>
      • <span className="text-purple-400">Purple path</span> shows the route,{" "}
      <span className="text-yellow-400">yellow numbers</span> show DP values.
    </p>
  </div>
);

export default function UniquePathsVisualizer() {
  const [rows, setRows] = useState(6);
  const [cols, setCols] = useState(6);
  const [grid, setGrid] = useState(
    Array.from({ length: 6 }, () => Array(6).fill(0))
  );
  const [dp, setDp] = useState<number[][]>([]);
  const [paths, setPaths] = useState(0);
  const [animatedPath, setAnimatedPath] = useState<number[][]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDpValues, setShowDpValues] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<string | null>(null);
  const [shortestMode, setShortestMode] = useState(true);
  const [start, setStart] = useState([0, 0]);
  const [end, setEnd] = useState([5, 5]);

  // --- FIX START: New state to track if a path is generally possible ---
  const [isPathPossible, setIsPathPossible] = useState(true);
  // --- FIX END ---

  const [draggingNode, setDraggingNode] = useState<"start" | "end" | null>(
    null
  );

  const handleMouseDown = (r: number, c: number) => {
    setAnimatedPath([]);
    setCurrentStep(-1);

    if (shortestMode) {
      if (r === start[0] && c === start[1]) {
        setDraggingNode("start");
        setIsDragging(true);
      } else if (r === end[0] && c === end[1]) {
        setDraggingNode("end");
        setIsDragging(true);
      } else {
        // Logic for adding/removing obstacles by dragging
        setIsDragging(true);
        const newMode = grid[r][c] === 0 ? "add" : "remove";
        setDragMode(newMode);
        const newGrid = grid.map((row) => [...row]);
        newGrid[r][c] = newMode === "add" ? 1 : 0;
        setGrid(newGrid);
      }
    } else {
      // Original logic for toggling obstacles when not in shortest mode
      if ((r === 0 && c === 0) || (r === rows - 1 && c === cols - 1)) return;
      setIsDragging(true);
      const newMode = grid[r][c] === 0 ? "add" : "remove";
      setDragMode(newMode);
      const newGrid = grid.map((row) => [...row]);
      newGrid[r][c] = newMode === "add" ? 1 : 0;
      setGrid(newGrid);
    }
  };

  const handleMouseEnter = (r: number, c: number) => {
    if (!isDragging) return;

    if (draggingNode) {
      // If we're dragging a start/end node
      const isObstacle = grid[r][c] === 1;
      const isOtherNode =
        (draggingNode === "start" && r === end[0] && c === end[1]) ||
        (draggingNode === "end" && r === start[0] && c === start[1]);
      if (!isObstacle && !isOtherNode) {
        if (draggingNode === "start") setStart([r, c]);
        if (draggingNode === "end") setEnd([r, c]);
      }
    } else {
      // If we're drawing obstacles
      const isStartNode = shortestMode
        ? r === start[0] && c === start[1]
        : r === 0 && c === 0;
      const isEndNode = shortestMode
        ? r === end[0] && c === end[1]
        : r === rows - 1 && c === cols - 1;
      if (isStartNode || isEndNode) return;

      const newGrid = grid.map((row) => [...row]);
      newGrid[r][c] = dragMode === "add" ? 1 : 0;
      setGrid(newGrid);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragMode(null);
    setDraggingNode(null);
  };

  // --- (findRandomPath and findShortestPath8Dir functions remain the same) ---
  const findRandomPath = (dpTable: number[][]): number[][] => {
    if (
      rows <= 0 ||
      cols <= 0 ||
      !dpTable ||
      !dpTable[rows - 1] ||
      dpTable[rows - 1][cols - 1] === 0
    ) {
      return [];
    }

    const path: number[][] = [];
    let r = rows - 1;
    let c = cols - 1;

    while (r > 0 || c > 0) {
      path.unshift([r, c]);

      const canGoUp = r > 0 && dpTable[r - 1] && dpTable[r - 1][c] > 0;
      const canGoLeft = c > 0 && dpTable[r][c - 1] > 0;

      if (canGoUp && canGoLeft) {
        const upWeight = dpTable[r - 1][c];
        const leftWeight = dpTable[r][c - 1];
        const total = upWeight + leftWeight;

        if (Math.random() < upWeight / total) {
          r--;
        } else {
          c--;
        }
      } else if (canGoUp) {
        r--;
      } else if (canGoLeft) {
        c--;
      } else {
        break;
      }
    }
    path.unshift([0, 0]);
    return path;
  };

  const findShortestPath8Dir = (
    grid: number[][],
    start: number[],
    end: number[]
  ): number[][] => {
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];

    const pq: [number, number, number][] = [];
    pq.push([0, start[0], start[1]]);

    const dist: number[][] = Array.from({ length: grid.length }, () =>
      Array(grid[0].length).fill(Infinity)
    );
    dist[start[0]][start[1]] = 0;

    const parent: { [key: string]: [number, number] | null } = {};
    parent[`${start[0]},${start[1]}`] = null;

    while (pq.length > 0) {
      pq.sort((a, b) => a[0] - b[0]);
      const [currentCost, r, c] = pq.shift()!;

      if (r === end[0] && c === end[1]) {
        const path: number[][] = [];
        let currentKey = `${r},${c}`;
        while (currentKey) {
          const [cr, cc] = currentKey.split(",").map(Number);
          path.unshift([cr, cc]);
          const p = parent[currentKey];
          currentKey = p ? `${p[0]},${p[1]}` : "";
        }
        return path;
      }

      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;

        if (
          nr >= 0 &&
          nr < grid.length &&
          nc >= 0 &&
          nc < grid[0].length &&
          grid[nr][nc] === 0
        ) {
          const moveCost = dr === 0 || dc === 0 ? 1 : Math.SQRT2;
          const newCost = currentCost + moveCost;

          if (newCost < dist[nr][nc]) {
            dist[nr][nc] = newCost;
            parent[`${nr},${nc}`] = [r, c];
            pq.push([newCost, nr, nc]);
          }
        }
      }
    }

    return []; // No path found
  };

  const computeDP = () => {
    if (rows <= 0 || cols <= 0) {
      setDp([]);
      setPaths(0);
      setAnimatedPath([]);
      setCurrentStep(-1);
      return;
    }

    const dpTable = Array.from({ length: rows }, () => Array(cols).fill(0));
    dpTable[0][0] = grid[0][0] === 0 ? 1 : 0;

    for (let c = 1; c < cols; c++) {
      dpTable[0][c] = grid[0][c] === 0 ? dpTable[0][c - 1] : 0;
    }
    for (let r = 1; r < rows; r++) {
      dpTable[r][0] = grid[r][0] === 0 ? dpTable[r - 1][0] : 0;
    }
    for (let r = 1; r < rows; r++) {
      for (let c = 1; c < cols; c++) {
        dpTable[r][c] =
          grid[r][c] === 0 ? dpTable[r - 1][c] + dpTable[r][c - 1] : 0;
      }
    }

    setDp(dpTable);
    setPaths(dpTable[rows - 1]?.[cols - 1] || 0);
  };

  // --- FIX START: This effect now checks for path possibility on every relevant change ---
  useEffect(() => {
    if (rows <= 0 || cols <= 0) {
      setIsPathPossible(false);
      return;
    }

    if (shortestMode) {
      const path = findShortestPath8Dir(grid, start, end);
      setIsPathPossible(path.length > 0);
    } else {
      // For unique paths mode, we still rely on the DP calculation result
      computeDP();
    }
  }, [grid, start, end, shortestMode, rows, cols]);

  useEffect(() => {
    // This effect ensures isPathPossible is updated when paths state changes in unique paths mode
    if (!shortestMode) {
      setIsPathPossible(paths > 0);
    }
  }, [paths, shortestMode]);
  // --- FIX END ---

  const animatePath = async () => {
    if (rows <= 0 || cols <= 0 || !isPathPossible) return;

    setIsAnimating(true);
    setAnimatedPath([]);
    setCurrentStep(-1);

    let path: number[][] = [];
    if (shortestMode) {
      path = findShortestPath8Dir(grid, start, end);
    } else {
      path = findRandomPath(dp);
    }

    setAnimatedPath(path.length > 0 ? [path[0]] : []);

    for (let i = 0; i < path.length; i++) {
      await new Promise<void>((resolve) => setTimeout(resolve, 100));
      setCurrentStep(i);
      setAnimatedPath(path.slice(0, i + 1));
    }

    setIsAnimating(false);
  };

  useEffect(() => {
    updateDimensions();
  }, [rows, cols]);

  const resetGrid = () => {
    if (rows > 0 && cols > 0) {
      setGrid(Array.from({ length: rows }, () => Array(cols).fill(0)));
      setStart([0, 0]);
      setEnd([rows - 1, cols - 1]);
    }
    setAnimatedPath([]);
    setCurrentStep(-1);
  };

  const updateDimensions = () => {
    if (rows <= 0 || cols <= 0) {
      setGrid([]);
      setAnimatedPath([]);
      return;
    }

    const newGrid = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => grid[r]?.[c] || 0)
    );
    setGrid(newGrid);

    // Adjust start/end points to be within the new bounds
    const newStart = [
      Math.min(start[0], rows - 1),
      Math.min(start[1], cols - 1),
    ];
    const newEnd = [Math.min(end[0], rows - 1), Math.min(end[1], cols - 1)];

    setStart(newStart);
    setEnd(newEnd);

    setAnimatedPath([]);
    setCurrentStep(-1);
  };

  const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) setRows(Math.max(1, Math.min(12, value)));
  };

  const handleColsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) setCols(Math.max(1, Math.min(12, value)));
  };

  const toggleMode = () => {
    setShortestMode(!shortestMode);
    resetGrid();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 p-6">
      <div className="flex flex-col items-center gap-8">
        <div
          className="bg-gray-800/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl 
                       w-full max-w-5xl flex flex-col items-center gap-8 
                       border border-gray-700/50"
        >
          {/* Header */}
          <div className="text-center">
            <h1
              className="text-4xl font-bold text-white mb-2 
                           bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
            >
              Pathfinding Visualizer
            </h1>
            <p className="text-gray-400">
  {shortestMode
    ? "Dijkstra's Shortest Path Algorithm"
    : (
        <>
          Unique Paths DP (
          <a
            href="https://leetcode.com/problems/unique-paths-ii/description/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-300 transition-colors duration-200"
          >
            LeetCode Problem
          </a>
          )
        </>
      )}
</p>

          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 items-end justify-center">
            <InputField
              label="Rows"
              type="number"
              min={1}
              max={12}
              value={rows}
              onChange={handleRowsChange}
            />
            <InputField
              label="Columns"
              type="number"
              min={1}
              max={12}
              value={cols}
              onChange={handleColsChange}
            />
            <Button onClick={updateDimensions}>Apply Size</Button>
            <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500/50"
                checked={shortestMode}
                onChange={toggleMode}
              />
              Shortest Path Mode
            </label>
          </div>

          {/* Grid */}
          {rows > 0 && cols > 0 && (
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                }}
              >
                {grid.map((row, r) =>
                  row.map((cell, c) => (
                    <GridCell
                      key={`${r}-${c}`}
                      r={r}
                      c={c}
                      cell={cell}
                      rows={rows}
                      cols={cols}
                      onMouseDown={handleMouseDown}
                      onMouseEnter={handleMouseEnter}
                      onMouseUp={handleMouseUp}
                      animatedPath={animatedPath}
                      currentStep={currentStep}
                      dp={dp}
                      showDpValues={showDpValues && !shortestMode} // Only show DP values in unique paths mode
                      shortestMode={shortestMode}
                      start={start}
                      end={end}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Info Display */}
          {!shortestMode && (
            <InfoCard
              title="Total Unique Paths"
              value={paths}
              subtitle={
                animatedPath.length > 0
                  ? `Current path: ${animatedPath.length} steps ${
                      isAnimating ? "(animating...)" : ""
                    }`
                  : undefined
              }
            />
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            {/* --- FIX START: Button logic is now updated --- */}
            <Button
              onClick={animatePath}
              disabled={
                isAnimating || !isPathPossible || rows <= 0 || cols <= 0
              }
              variant="success"
              className="hover:scale-105 active:scale-95"
            >
              ▶️{" "}
              {isAnimating
                ? "Animating..."
                : shortestMode
                ? "Find Shortest Path"
                : "Show Random Path"}
            </Button>
            {/* --- FIX END --- */}

            {!shortestMode && (
              <Button
                onClick={() => setShowDpValues(!showDpValues)}
                variant="secondary"
                className="hover:scale-105 active:scale-95"
                disabled={rows <= 0 || cols <= 0}
              >
                {showDpValues ? "🙈 Hide" : "👁️ Show"} Path Counts
              </Button>
            )}
            <Button
              onClick={resetGrid}
              className="hover:scale-105 active:scale-95"
              disabled={rows <= 0 || cols <= 0}
            >
              🔄 Clear Grid
            </Button>
          </div>

          {/* Instructions */}
          <InstructionsCard />
        </div>
      </div>
   <footer
  className="text-center mt-12 text-sm text-gray-500 
             flex flex-col md:flex-row items-center justify-center gap-2"
>
  <a
    href="https://github.com/GreenMarioh/"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-1 underline hover:text-gray-300 
               transition-colors duration-200"
  >
    🐙 <span>Created by @GreenMarioh</span>
  </a>

  <a
    href="https://github.com/GreenMarioh/unique-paths-visualizer/"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-1 underline hover:text-gray-300 
               transition-colors duration-200"
  >
    🥀 <span>Source Code</span>
  </a>
</footer>


    </div>
    
  );
}
