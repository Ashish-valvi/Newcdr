import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { FaMoon, FaSun } from "react-icons/fa"; // ✅ Import Dark Mode Icons
import "./ChartComponent.css"; // ✅ Import custom CSS

Chart.register(ArcElement, Tooltip, Legend);

const chartColors = [
  "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
  "#FF9F40", "#C9CBCF", "#66FF66", "#FF66B2", "#6600CC"
];

const processJsonData = (jsonData) => {
  const cleanData = [];
  const firstKey = Object.keys(jsonData[0])[0];
  const firstValue = jsonData[0][firstKey];

  cleanData.push({ [firstKey]: firstValue });

  for (let obj of jsonData) {
    const bPartyNumber = obj["B PARTY NUMBER"];
    if (!bPartyNumber || /\D/.test(bPartyNumber)) continue;

    let found = false;
    for (let entry of cleanData) {
      if (entry.hasOwnProperty(bPartyNumber)) {
        entry[bPartyNumber] += 1;
        found = true;
        break;
      }
    }

    if (!found) {
      cleanData.push({ [bPartyNumber]: 1 });
    }
  }

  return cleanData;
};

const arrangeObjects = (cleanData) => {
  if (cleanData.length <= 1) return cleanData;
  const firstObject = cleanData[0];

  const sortedObjects = cleanData
    .slice(1)
    .sort((a, b) => Object.values(b)[0] - Object.values(a)[0])
    .filter((entry) => Object.keys(entry)[0].length > 0)
    .slice(0, 10);

  return [firstObject, ...sortedObjects];
};

const ChartComponent = () => {
  const { filename } = useParams();
  const [chartData, setChartData] = useState(null);
  const [topEntries, setTopEntries] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`http://localhost:5000/uploads/${filename}`);
        const jsonData = await response.json();

        const processedData = processJsonData(jsonData);
        const arrangedData = arrangeObjects(processedData);

        const labels = arrangedData.slice(1).map((entry) => Object.keys(entry)[0]);
        const values = arrangedData.slice(1).map((entry) => Object.values(entry)[0]);

        setChartData({
          labels,
          datasets: [
            {
              label: "Top 10 B PARTY NUMBERS",
              data: values,
              backgroundColor: chartColors.slice(0, labels.length),
              borderWidth: 2,
              hoverOffset: 10,
            },
          ],
        });

        setTopEntries(
          arrangedData.slice(1).map((entry, index) => ({
            number: Object.keys(entry)[0],
            count: Object.values(entry)[0],
            color: chartColors[index],
          }))
        );
      } catch (error) {
        console.error("🔥 Error fetching report:", error);
      }
    };

    fetchReport();
  }, [filename]);

  return (
    <div className={`chart-container ${darkMode ? "dark-mode" : ""}`}>
      <div className="chart-header">
        <h2 className="chart-title">Report for {filename}</h2>
        <button className="dark-mode-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
        </button>
      </div>

      {chartData ? (
        <div className="chart-box">
          <Doughnut
            data={chartData}
            options={{
              cutout: "60%",
              responsive: true,
              plugins: { legend: { position: "bottom" } },
            }}
          />
        </div>
      ) : (
        <p className="loading-text">Loading chart data...</p>
      )}

      {topEntries.length > 0 && (
        <div className="legend-container">
          <h3 className="legend-title">Top 10 Called Numbers</h3>
          <div className="legend-grid">
            {topEntries.map((entry, index) => (
              <div key={index} className="legend-item">
                <div
                  className="legend-color-box"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span>{entry.number} ({entry.count})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartComponent;
