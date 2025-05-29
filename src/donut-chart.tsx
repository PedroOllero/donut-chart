import React, { useEffect, useRef } from "react";
import { select } from "d3-selection";
import "d3-transition"; // Import d3-transition para transiciones
import { arc, pie } from "d3-shape";
import { interpolateNumber } from "d3-interpolate"; // Importar interpolateNumber para la animación
import type { Selection } from "d3-selection";

interface DonutChartProps {
  percentage: number; // El valor a mostrar (0–100)
  width?: number; // Ancho del SVG (opcional)
  height?: number; // Alto del SVG (opcional)
  thickness?: number; // Grosor del anillo (opcional)
  historicPercentage: number;
}

const DonutChart: React.FC<DonutChartProps> = ({
  percentage,
  width = 300,
  height = 300,
  thickness = 30,
  historicPercentage,
}) => {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const radius = Math.min(width - 50, height - 50) / 2;
    const innerRadius = radius - thickness; // Radio interno del gráfico actual
    const outerRadius = radius; // Radio externo del gráfico actual

    const historicInnerRadius = outerRadius + 5; // Radio interno del gráfico histórico (mayor que el externo del actual)
    const historicOuterRadius = historicInnerRadius + 5; // Radio externo del gráfico histórico

    const svg = select(ref.current).attr("width", width).attr("height", height);

    const arcGenerator = arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    const historicArcGenerator = arc()
      .innerRadius(historicInnerRadius)
      .outerRadius(historicOuterRadius);

    const pieGenerator = pie<number>()
      .value((d) => d)
      .sort(null);

    const data = [percentage, 100 - percentage];
    const historicData = [historicPercentage, 100 - historicPercentage];

    // Grupo para el gráfico actual
    const currentGroup: Selection<SVGGElement, unknown, null, undefined> = svg
      .select("g.current")
      .empty()
      ? svg.append("g").attr("class", "current")
      : svg.select("g.current");

    currentGroup.attr("transform", `translate(${width / 2}, ${height / 2})`);

    const arcs = currentGroup
      .selectAll("path")
      .data(pieGenerator(data))
      .enter()
      .append("path")
      .attr("fill", (d, i) => (i === 0 ? "green" : "#ccc"))
      .attr("d", (d) => arcGenerator(d) as string);

    // Grupo para el gráfico histórico
    const historicGroup: Selection<SVGGElement, unknown, null, undefined> = svg
      .select("g.historic")
      .empty()
      ? svg.append("g").attr("class", "historic")
      : svg.select("g.historic");

    historicGroup.attr("transform", `translate(${width / 2}, ${height / 2})`);

    const historicArc = historicGroup
      .selectAll("path")
      .data(pieGenerator(historicData))
      .enter()
      .append("path")
      .attr("fill", (d, i) => (i === 0 ? "lightblue" : "transparent"))
      .attr("d", (d) => historicArcGenerator(d) as string);

    // Animación
    arcs
      .transition()
      .duration(1000)
      .attrTween("d", function (d) {
        const interpolateStart = interpolateNumber(0, d.endAngle);
        return function (t) {
          d.endAngle = interpolateStart(t);
          return arcGenerator(d) as string;
        };
      });

    historicArc
      .transition()
      .duration(3000)
      .attrTween("d", function (d) {
        const interpolateStart = interpolateNumber(0, d.endAngle);
        return function (t) {
          d.endAngle = interpolateStart(t);
          return historicArcGenerator(d) as string;
        };
      });

    currentGroup
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "32px")
      .style("font-weight", "bold")
      .style("fill", "#2e7d32") // también en verde oscuro
      .text(`${percentage}%`);
    currentGroup
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "2.2em")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "lightblue") // también en verde oscuro
      .text(`${historicPercentage}%`);
  }, [percentage, width, height, thickness, historicPercentage]);

  return <svg ref={ref}></svg>;
};

export default DonutChart;
