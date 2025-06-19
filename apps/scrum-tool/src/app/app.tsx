import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingDown, TrendingUp, Copy, Download, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface DayData {
  day: string;
  plannedScore: number;
  madeScore: number;
}

interface ChartData {
  day: string;
  actual: number;
  planned: number;
  ideal: number;
  goal?: number;
}

type ChartType = 'burndown' | 'burnup';

interface ProgressEvaluation {
  status: 'on-track' | 'at-risk' | 'behind';
  message: string;
  recommendations: string[];
  velocity: number;
  projectedCompletion: number;
  efficiency: number;
}

const App: React.FC = () => {
  const [chartType, setChartType] = useState<ChartType>('burndown');
  const [totalScope, setTotalScope] = useState<number>(50);
  const [sprintDays, setSprintDays] = useState<number>(10);
  const [dailyData, setDailyData] = useState<DayData[]>([]);
  const [gridInput, setGridInput] = useState<string>('');
  const [evaluation, setEvaluation] = useState<ProgressEvaluation | null>(null);

  // Initialize default data
  useEffect(() => {
    initializeDefaultData();
  }, [sprintDays, totalScope]);

  const initializeDefaultData = () => {
    const defaultData: DayData[] = [];
    for (let i = 0; i <= sprintDays; i++) {
      const plannedDaily = totalScope / sprintDays;
      defaultData.push({
        day: i === 0 ? 'Start' : `Day ${i}`,
        plannedScore: Math.round(plannedDaily * i),
        madeScore: Math.round(plannedDaily * i * (0.8 + Math.random() * 0.4))
      });
    }
    setDailyData(defaultData);
  };

  const parseGridData = (input: string) => {
    try {
      const lines = input.trim().split('\n');
      const newData: DayData[] = [];
      
      lines.forEach((line, index) => {
        const cells = line.split('\t').map(cell => cell.trim());
        if (cells.length >= 3) {
          const day = cells[0] || (index === 0 ? 'Start' : `Day ${index}`);
          const plannedScore = parseFloat(cells[1]) || 0;
          const madeScore = parseFloat(cells[2]) || 0;
          
          newData.push({ day, plannedScore, madeScore });
        }
      });
      
      if (newData.length > 0) {
        setDailyData(newData);
        setSprintDays(newData.length - 1);
        const maxScope = Math.max(...newData.map(d => Math.max(d.plannedScore, d.madeScore)));
        setTotalScope(Math.max(maxScope, totalScope));
      }
    } catch (error) {
      alert('Error parsing grid data. Please ensure format: Day\\tPlanned\\tMade');
    }
  };

  const generateChartData = (): ChartData[] => {
    return dailyData.map((data, index) => {
      const idealProgress = (totalScope / sprintDays) * index;
      
      if (chartType === 'burndown') {
        return {
          day: data.day,
          actual: totalScope - data.madeScore,
          planned: totalScope - data.plannedScore,
          ideal: totalScope - idealProgress,
          goal: 0
        };
      } else {
        return {
          day: data.day,
          actual: data.madeScore,
          planned: data.plannedScore,
          ideal: idealProgress,
          goal: totalScope
        };
      }
    });
  };

  const evaluateProgress = (): ProgressEvaluation => {
    if (dailyData.length < 2) {
      return {
        status: 'on-track',
        message: 'Insufficient data for evaluation',
        recommendations: ['Add more daily progress data'],
        velocity: 0,
        projectedCompletion: 0,
        efficiency: 0
      };
    }

    const currentDay = dailyData.length - 1;
    const currentProgress = dailyData[currentDay].madeScore;
    const plannedProgress = dailyData[currentDay].plannedScore;
    const idealProgress = (totalScope / sprintDays) * currentDay;
    
    // Calculate velocity (points per day)
    const completedPoints = currentProgress;
    const velocity = completedPoints / currentDay;
    
    // Project completion
    const remainingPoints = totalScope - currentProgress;
    const projectedCompletion = remainingPoints / velocity;
    
    // Calculate efficiency
    const efficiency = (currentProgress / idealProgress) * 100;
    
    let status: 'on-track' | 'at-risk' | 'behind';
    let message: string;
    let recommendations: string[] = [];
    
    if (efficiency >= 90) {
      status = 'on-track';
      message = 'Sprint is progressing well! Team is meeting or exceeding expectations.';
      recommendations = [
        'Continue current pace',
        'Consider taking on additional scope if capacity allows',
        'Share successful practices with other teams'
      ];
    } else if (efficiency >= 70) {
      status = 'at-risk';
      message = 'Sprint is slightly behind schedule but recoverable with focused effort.';
      recommendations = [
        'Identify and remove blockers',
        'Consider pair programming for complex tasks',
        'Daily check-ins on progress',
        'Reassess remaining scope priorities'
      ];
    } else {
      status = 'behind';
      message = 'Sprint is significantly behind schedule. Immediate action required.';
      recommendations = [
        'Emergency team meeting to identify issues',
        'Consider scope reduction',
        'Escalate blockers to management',
        'Implement daily standups if not already doing so',
        'Review and adjust task estimates'
      ];
    }
    
    return {
      status,
      message,
      recommendations,
      velocity: Math.round(velocity * 10) / 10,
      projectedCompletion: Math.round(projectedCompletion * 10) / 10,
      efficiency: Math.round(efficiency)
    };
  };

  useEffect(() => {
    setEvaluation(evaluateProgress());
  }, [dailyData, totalScope, sprintDays]);

  const copyExampleData = () => {
    const exampleData = [
      'Day\tPlanned\tMade',
      'Start\t0\t0',
      'Day 1\t5\t3',
      'Day 2\t10\t8',
      'Day 3\t15\t12',
      'Day 4\t20\t18',
      'Day 5\t25\t22',
      'Day 6\t30\t28',
      'Day 7\t35\t32',
      'Day 8\t40\t38',
      'Day 9\t45\t44',
      'Day 10\t50\t48'
    ].join('\n');
    
    navigator.clipboard.writeText(exampleData);
    alert('Example data copied to clipboard! You can modify it in Excel and paste it back.');
  };

  const exportData = () => {
    const csvData = [
      'Day,Planned Score,Made Score',
      ...dailyData.map(d => `${d.day},${d.plannedScore},${d.madeScore}`)
    ].join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sprint-data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'at-risk': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'behind': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'border-green-500 bg-green-50';
      case 'at-risk': return 'border-yellow-500 bg-yellow-50';
      case 'behind': return 'border-red-500 bg-red-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const chartData = generateChartData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Configurable Scrum Charts
          </h1>
          <p className="text-gray-600">
            Advanced sprint tracking with Excel integration and progress evaluation
          </p>
        </div>

        {/* Configuration Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chart Type
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setChartType('burndown')}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    chartType === 'burndown'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Burndown
                </button>
                <button
                  onClick={() => setChartType('burnup')}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    chartType === 'burnup'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Burnup
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Scope (Story Points)
              </label>
              <input
                type="number"
                value={totalScope}
                onChange={(e) => setTotalScope(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sprint Days
              </label>
              <input
                type="number"
                value={sprintDays}
                onChange={(e) => setSprintDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="30"
              />
            </div>
          </div>

          {/* Excel Import Section */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Excel Data Import</h3>
              <div className="flex space-x-2">
                <button
                  onClick={copyExampleData}
                  className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Example
                </button>
                <button
                  onClick={exportData}
                  className="flex items-center px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste from Excel (Tab-separated: Day, Planned, Made)
                </label>
                <textarea
                  value={gridInput}
                  onChange={(e) => setGridInput(e.target.value)}
                  placeholder="Day	Planned	Made&#10;Start	0	0&#10;Day 1	5	3&#10;Day 2	10	8"
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
                <button
                  onClick={() => parseGridData(gridInput)}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Import Data
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions
                </label>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>1. Click "Copy Example" to get sample data</p>
                  <p>2. Paste into Excel and modify as needed</p>
                  <p>3. Select your data in Excel and copy (Ctrl+C)</p>
                  <p>4. Paste here and click "Import Data"</p>
                  <p className="text-blue-600 font-medium">Format: Day [TAB] Planned [TAB] Made</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Evaluation */}
        {evaluation && (
          <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${getStatusColor(evaluation.status)}`}>
            <div className="flex items-center mb-4">
              {getStatusIcon(evaluation.status)}
              <h2 className="text-xl font-semibold ml-2">Progress Evaluation</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{evaluation.velocity}</div>
                <div className="text-sm text-gray-600">Points/Day</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{evaluation.efficiency}%</div>
                <div className="text-sm text-gray-600">Efficiency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{evaluation.projectedCompletion}</div>
                <div className="text-sm text-gray-600">Days to Complete</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  evaluation.status === 'on-track' ? 'text-green-600' :
                  evaluation.status === 'at-risk' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {evaluation.status.toUpperCase()}
                </div>
                <div className="text-sm text-gray-600">Status</div>
              </div>
            </div>
            
            <p className="text-gray-700 mb-3">{evaluation.message}</p>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recommendations:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {evaluation.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {chartType === 'burndown' ? '📉 Burndown Chart' : '📈 Burnup Chart'}
            </h2>
            <div className="text-sm text-gray-600">
              {chartType === 'burndown' 
                ? 'Shows remaining work decreasing over time'
                : 'Shows completed work increasing over time'
              }
            </div>
          </div>
          
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis 
                  label={{ 
                    value: 'Story Points', 
                    angle: -90, 
                    position: 'insideLeft' 
                  }} 
                />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value} points`,
                    name === 'actual' ? 'Actual' :
                    name === 'planned' ? 'Planned' :
                    name === 'ideal' ? 'Ideal' : 'Goal'
                  ]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  name="Actual"
                />
                <Line 
                  type="monotone" 
                  dataKey="planned" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  strokeDasharray="8 8"
                  name="Planned"
                />
                <Line 
                  type="monotone" 
                  dataKey="ideal" 
                  stroke="#6b7280" 
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  name="Ideal"
                />
                {chartType === 'burnup' && (
                  <Line 
                    type="monotone" 
                    dataKey="goal" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    strokeDasharray="12 4"
                    name="Sprint Goal"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart Description */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-3">
            {chartType === 'burndown' ? 'Burndown Chart Analysis' : 'Burnup Chart Analysis'}
          </h3>
          
          {chartType === 'burndown' ? (
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Burndown charts</strong> show the amount of work remaining over time. 
                The line should trend downward as tasks are completed.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Actual line above planned:</strong> Team is behind schedule</li>
                <li><strong>Actual line below planned:</strong> Team is ahead of schedule</li>
                <li><strong>Flat actual line:</strong> No progress being made, investigate blockers</li>
                <li><strong>Steep drops:</strong> Significant work completed quickly</li>
              </ul>
              <p>
                <strong>Goal:</strong> The actual line should reach zero by the end of the sprint.
              </p>
            </div>
          ) : (
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Burnup charts</strong> show the amount of work completed over time. 
                The line should trend upward as work is finished.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Actual line below planned:</strong> Team is behind schedule</li>
                <li><strong>Actual line above planned:</strong> Team is ahead of schedule</li>
                <li><strong>Gap to goal line:</strong> Shows remaining work to complete</li>
                <li><strong>Goal line movement:</strong> Indicates scope changes during sprint</li>
              </ul>
              <p>
                <strong>Goal:</strong> The actual line should reach the sprint goal line by the end.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;

// import { Route, Routes, Link } from 'react-router-dom';

// export function App() {
//   return (
//     <div>
//       <NxWelcome title="@scrum-tool/scrum-tool" />

//       {/* START: routes */}
//       {/* These routes and navigation have been generated for you */}
//       {/* Feel free to move and update them to fit your needs */}
//       <br />
//       <hr />
//       <br />
//       <div role="navigation">
//         <ul>
//           <li>
//             <Link to="/">Home</Link>
//           </li>
//           <li>
//             <Link to="/page-2">Page 2</Link>
//           </li>
//         </ul>
//       </div>
//       <Routes>
//         <Route
//           path="/"
//           element={
//             <div>
//               This is the generated root route.{' '}
//               <Link to="/page-2">Click here for page 2.</Link>
//             </div>
//           }
//         />
//         <Route
//           path="/page-2"
//           element={
//             <div>
//               <Link to="/">Click here to go back to root page.</Link>
//             </div>
//           }
//         />
//       </Routes>
//       {/* END: routes */}
//     </div>
//   );
// }

// export default App;
