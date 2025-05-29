import "./App.css";
import DonutChart from "./donut-chart";

function App() {
  return (
    <>
      <h1>Pantano de la viñuela</h1>
      <DonutChart percentage={65} historicPercentage={40} />
    </>
  );
}

export default App;
