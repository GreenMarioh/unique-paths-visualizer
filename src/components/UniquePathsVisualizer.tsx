import React, { useState, useEffect } from "react";

const Button = ({ children, variant = "primary", ...props }) => {
  const baseClasses =
    "px-4 py-2 rounded-xl font-semibold transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-700 text-white hover:bg-gray-600",
    success: "bg-green-600 text-white hover:bg-green-700",
  };

  return (
    <button className={`${baseClasses} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
};

export default function UniquePathsVisualizer() {
  const [rows, setRows] = useState(6);
  const [cols, setCols] = useState(6);
  const [grid, setGrid] = useState(
    Array.from({ length: 6 }, () => Array(6).fill(0))
  );
  const [dp, setDp] = useState([]);
  const [paths, setPaths] = useState(0);
  const [animatedPath, setAnimatedPath] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDpValues, setShowDpValues] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(null); // 'add' or 'remove'

  const toggleCell = (r, c) => {
    if ((r === 0 && c === 0) || (r === rows - 1 && c === cols - 1)) return;
    const newGrid = grid.map((row) => [...row]);
    newGrid[r][c] = grid[r][c] === 0 ? 1 : 0;
    setGrid(newGrid);
    setAnimatedPath([]);
    setCurrentStep(-1);
  };

  const handleMouseDown = (r, c) => {
    if ((r === 0 && c === 0) || (r === rows - 1 && c === cols - 1)) return;

    setIsDragging(true);
    const newMode = grid[r][c] === 0 ? "add" : "remove";
    setDragMode(newMode);

    const newGrid = grid.map((row) => [...row]);
    newGrid[r][c] = newMode === "add" ? 1 : 0;
    setGrid(newGrid);
    setAnimatedPath([]);
    setCurrentStep(-1);
  };

  const handleMouseEnter = (r, c) => {
    if (
      !isDragging ||
      (r === 0 && c === 0) ||
      (r === rows - 1 && c === cols - 1)
    )
      return;

    const newGrid = grid.map((row) => [...row]);
    newGrid[r][c] = dragMode === "add" ? 1 : 0;
    setGrid(newGrid);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragMode(null);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setDragMode(null);
    };

    document.addEventListener("mouseup", handleGlobalMouseUp);
    return () => document.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  const findRandomPath = (dpTable) => {
    if (dpTable[rows - 1][cols - 1] === 0) return [];

    const path = [];
    let r = rows - 1;
    let c = cols - 1;

    while (r > 0 || c > 0) {
      path.unshift([r, c]);

      const canGoUp = r > 0 && dpTable[r - 1][c] > 0;
      const canGoLeft = c > 0 && dpTable[r][c - 1] > 0;

      if (canGoUp && canGoLeft) {
        // Randomly choose between up and left based on probability
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

  const computeDP = () => {
    const dpTable = Array.from({ length: rows }, () => Array(cols).fill(0));
    if (grid[0][0] === 1) {
      setDp(dpTable);
      setPaths(0);
      setAnimatedPath([]);
      setCurrentStep(-1);
      return;
    }

    dpTable[0][0] = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === 1) {
          dpTable[r][c] = 0;
        } else {
          if (r > 0) dpTable[r][c] += dpTable[r - 1][c];
          if (c > 0) dpTable[r][c] += dpTable[r][c - 1];
        }
      }
    }

    setDp(dpTable);
    setPaths(dpTable[rows - 1][cols - 1]);
  };

  const animatePath = async () => {
    if (dp.length === 0 || paths === 0) return;

    setIsAnimating(true);
    setAnimatedPath([]);
    setCurrentStep(-1);

    const path = findRandomPath(dp);

    for (let i = 0; i < path.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setAnimatedPath((prev) => [...prev, path[i]]);
      setCurrentStep(i);
    }

    setIsAnimating(false);
  };

  useEffect(() => {
    updateDimensions();
  }, [rows, cols]);

  useEffect(() => {
    computeDP();
  }, [grid]);

  const resetGrid = () => {
    setGrid(Array.from({ length: rows }, () => Array(cols).fill(0)));
    setAnimatedPath([]);
    setCurrentStep(-1);
  };

  const updateDimensions = () => {
    const newGrid = Array.from({ length: rows }, () => Array(cols).fill(0));
    setGrid(newGrid);
    setAnimatedPath([]);
    setCurrentStep(-1);
    setDp([]);
    setPaths(0);
  };

  const isInPath = (r, c) => {
    return animatedPath.some(([pr, pc]) => pr === r && pc === c);
  };

  const getPathIndex = (r, c) => {
    return animatedPath.findIndex(([pr, pc]) => pr === r && pc === c);
  };

  const getCellClasses = (r, c, cell) => {
    const isStart = r === 0 && c === 0;
    const isEnd = r === rows - 1 && c === cols - 1;
    const isObstacle = cell === 1;
    const inPath = isInPath(r, c);
    const pathIndex = getPathIndex(r, c);
    const isCurrentStep = pathIndex === currentStep;

    let classes =
      "w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center cursor-pointer border-2 font-mono text-sm select-none transition-all duration-300 relative";

    if (isStart) {
      classes +=
        " bg-green-600 text-white font-bold shadow-lg border-green-400";
      if (inPath) classes += " ring-4 ring-purple-400 ring-opacity-60";
    } else if (isEnd) {
      classes += " bg-blue-600 text-white font-bold shadow-lg border-blue-400";
      if (inPath) classes += " ring-4 ring-purple-400 ring-opacity-60";
    } else if (isObstacle) {
      classes += " bg-red-600 border-red-500 text-white";
    } else {
      classes += " bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700";
      if (inPath) {
        classes += " bg-purple-600 border-purple-400 shadow-lg";
        if (isCurrentStep) {
          classes += " ring-4 ring-yellow-400 ring-opacity-80 scale-110";
        }
      }
    }

    return classes;
  };

  const getCellContent = (r, c, cell) => {
    const isStart = r === 0 && c === 0;
    const isEnd = r === rows - 1 && c === cols - 1;
    const isObstacle = cell === 1;
    const pathIndex = getPathIndex(r, c);

    if (pathIndex >= 0) {
      return (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 text-black text-xs rounded-full flex items-center justify-center font-bold z-10">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 p-6">
      <div className="flex flex-col items-center gap-8">
        <div className="bg-gray-800/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl w-full max-w-5xl flex flex-col items-center gap-8 border border-gray-700/50">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Unique Paths II Visualizer
            </h1>
            <p className="text-gray-400">
              Dynamic Programming Path Finding. Based on{" "}
              <u>
                <a href="https://leetcode.com/problems/unique-paths-ii/description/">
                  the LeetCode Question.
                </a>
              </u>{" "}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 items-end justify-center">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-300 mb-1">
                Rows
              </label>
              <input
                type="number"
                min={2}
                max={12}
                value={rows}
                onChange={(e) => setRows(Number(e.target.value))}
                className="w-24 p-2 rounded-lg border border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-300 mb-1">
                Columns
              </label>
              <input
                type="number"
                min={2}
                max={12}
                value={cols}
                onChange={(e) => setCols(Number(e.target.value))}
                className="w-24 p-2 rounded-lg border border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <Button onClick={updateDimensions}>Apply Size</Button>
          </div>

          <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {grid.map((row, r) =>
                row.map((cell, c) => (
                  <div
                    key={`${r}-${c}`}
                    onMouseDown={() => handleMouseDown(r, c)}
                    onMouseEnter={() => handleMouseEnter(r, c)}
                    onMouseUp={handleMouseUp}
                    className={getCellClasses(r, c, cell)}
                    style={{ userSelect: "none" }}
                  >
                    {getCellContent(r, c, cell)}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="text-center bg-gray-900/50 p-4 rounded-xl border border-gray-700/50">
            <p className="text-xl text-gray-300 mb-2">
              Total Unique Paths:{" "}
              <span className="font-bold text-blue-400 text-2xl">{paths}</span>
            </p>
            {animatedPath.length > 0 && (
              <p className="text-sm text-purple-400">
                Current path: {animatedPath.length} steps{" "}
                {isAnimating && "(animating...)"}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={animatePath}
              disabled={isAnimating || paths === 0}
              variant="success"
            >
              ▶️ {isAnimating ? "Animating..." : "Show Random Path"}
            </Button>
            <Button
              onClick={() => setShowDpValues(!showDpValues)}
              variant="secondary"
            >
              {showDpValues ? "🙈" : "👁️"} {showDpValues ? "Hide" : "Show"} Path
              Counts
            </Button>
            <Button onClick={resetGrid}>🔄 Clear Grid</Button>
          </div>

          <div className="text-sm text-gray-400 text-center max-w-2xl bg-gray-900/30 p-4 rounded-xl border border-gray-700/30">
            <p className="mb-2">
              <strong>How to use:</strong>
            </p>
            <p>
              • <strong>Click</strong> any cell to toggle obstacles, or{" "}
              <strong>click and drag</strong> to paint/erase multiple cells
            </p>
            <p>
              • <span className="text-green-400">Green (S)</span> = Start,{" "}
              <span className="text-blue-400">Blue (E)</span> = End,{" "}
              <span className="text-red-400">Red (✕)</span> = Obstacle
            </p>
            <p>
              • <span className="text-purple-400">Purple path</span> shows one
              possible route,{" "}
              <span className="text-yellow-400">yellow numbers</span> show DP
              values
            </p>
          </div>
        </div>
      </div>

      <footer className="text-center mt-12 text-sm text-gray-500 flex items-center justify-center gap-2">
        <a
          href="https://github.com/GreenMarioh"
          className="flex items-center gap-1 underline hover:text-gray-300 transition-colors"
        >
          🐙 <span>Created by @GreenMarioh</span>
        </a>
      </footer>
    </div>
  );
}
