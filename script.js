let selectedTimeLabel = null;
const snapshots = [
  {
    src: "hurricane_24h.png",
    label: "24 hours before landfall",
    date: "Sep 27, 2022 · 19:06 UTC"
  },
  {
    src: "hurricane_12h.png",
    label: "12.1 hours before landfall",
    date: "Sep 28, 2022 · 07:01 UTC"
  },
  {
    src: "hurricane_1h.png",
    label: "0.1 hours before landfall",
    date: "Sep 28, 2022 · 19:01 UTC"
  }
];

let selectedTimeLine = null;
let chartXScale = null;

const slider = d3.select("#timeSlider");

function update() {
  const i = +slider.property("value");
  const snapshot = snapshots[i];

  const insights = [
    "24 hours before landfall: Cold cloud coverage was already widespread. The 240 K threshold covered approximately 800,000 km².",

    "12 hours before landfall: Cold cloud coverage increased compared with several hours earlier, suggesting changes in the storm's cloud structure.",

    "Near landfall: Cold cloud coverage was lower than at 24 hours before landfall across all three temperature thresholds."
  ];

  d3.select("#insightText").text(insights[i]);


  d3.select("#stormImage")
    .attr("src", snapshot.src);

  d3.select("#timeLabel")
    .text(snapshot.label);

  d3.select("#dateLabel")
    .text(snapshot.date);

  d3.select("#previous")
    .property("disabled", i === 0);

  d3.select("#next")
    .property("disabled", i === snapshots.length - 1);
  // Update the selected time on the D3 chart
  if (selectedTimeLine && chartXScale) {
    const selectedHours = [23.9786, 12.0619, 0.0619][i];

    selectedTimeLine
      .attr("x1", chartXScale(selectedHours))
      .attr("x2", chartXScale(selectedHours));

    selectedTimeLabel
      .attr("x", chartXScale(selectedHours))
      .text(`${selectedHours.toFixed(1)} hours before landfall`);

  }
}

slider.on("input", update);

d3.select("#previous").on("click", () => {
  slider.property("value", Math.max(0, +slider.property("value") - 1));
  update();
});

d3.select("#next").on("click", () => {
  slider.property("value", Math.min(2, +slider.property("value") + 1));
  update();
});

update();


// D3.js Cold Cloud Area Line Chart

d3.csv("ian_cold_cloud_area.csv", d => ({
  hours: +d.hours_before_landfall,
  area220: +d.area_below_220K_km2,
  area230: +d.area_below_230K_km2,
  area240: +d.area_below_240K_km2
})).then(data => {

  data.sort((a, b) => a.hours - b.hours);

  const margin = { top: 30, right: 100, bottom: 55, left: 85 };
  const width = 750;
  const height = 400;

  const svg = d3.select("#cloudChart")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("width", "100%")
    .style("height", "auto");

  const x = d3.scaleLinear()
    .domain([24, 0])
    .range([margin.left, width - margin.right]);
  chartXScale = x;

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.area240) * 1.1])
    .range([height - margin.bottom, margin.top]);

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(6).tickFormat(d3.format(".2s")));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .text("Hours Before Landfall");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .text("Cold Cloud Area (km²)");

  const series = [
    { key: "area220", label: "220 K", color: "#2563eb" },
    { key: "area230", label: "230 K", color: "#f97316" },
    { key: "area240", label: "240 K", color: "#16a34a" }
  ];

  series.forEach(s => {
    const line = d3.line()
      .x(d => x(d.hours))
      .y(d => y(d[s.key]));

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", s.color)
      .attr("stroke-width", 2.5)
      .attr("d", line);
  });

  // Vertical marker showing the selected satellite snapshot
  selectedTimeLine = svg.append("line")
    .attr("y1", margin.top)
    .attr("y2", height - margin.bottom)
    .attr("stroke", "#dc2626")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "6,4")
    .style("pointer-events", "none");

  selectedTimeLabel = svg.append("text")
    .attr("y", margin.top - 10)
    .attr("text-anchor", "middle")
    .attr("fill", "#dc2626")
    .attr("font-size", 13)
    .attr("font-weight", "bold")
    .style("pointer-events", "none");


  // Show the initial selected time
  update();

  // Legend
  series.forEach((s, i) => {
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 85},${45 + i * 25})`);

    legend.append("line")
      .attr("x2", 20)
      .attr("stroke", s.color)
      .attr("stroke-width", 3);

    legend.append("text")
      .attr("x", 27)
      .attr("y", 4)
      .attr("font-size", 13)
      .text(s.label);
  });


  // Interactive hover tooltip
  const tooltip = d3.select("body")
    .append("div")
    .style("position", "fixed")
    .style("background", "#1e293b")
    .style("color", "white")
    .style("padding", "10px 14px")
    .style("border-radius", "8px")
    .style("font-size", "13px")
    .style("pointer-events", "none")
    .style("z-index", "1000")
    .style("display", "none");

  const bisect = d3.bisector(d => d.hours).center;

  const hoverLine = svg.append("line")
    .attr("stroke", "#64748b")
    .attr("stroke-dasharray", "4,4")
    .attr("y1", margin.top)
    .attr("y2", height - margin.bottom)
    .style("display", "none");

  svg.append("rect")
    .attr("x", margin.left)
    .attr("y", margin.top)
    .attr("width", width - margin.left - margin.right)
    .attr("height", height - margin.top - margin.bottom)
    .attr("fill", "transparent")
    .style("cursor", "crosshair")
    .on("click", function (event) {
      console.log("Chart clicked!");
      const [mouseX] = d3.pointer(event, this);
      const hours = Math.max(0, Math.min(24, x.invert(mouseX)));

      const snapshotHours = [23.9786, 12.0619, 0.0619];

      let closestIndex = 0;
      let smallestDifference = Infinity;

      snapshotHours.forEach((h, i) => {
        const difference = Math.abs(hours - h);

        if (difference < smallestDifference) {
          smallestDifference = difference;
          closestIndex = i;
        }
      });

      slider.property("value", closestIndex);
      update();
    })
    .on("mousemove", function (event) {
      const [mouseX] = d3.pointer(event, this);
      const hours = Math.max(0, Math.min(24, x.invert(mouseX)));
      const index = bisect(data, hours);
      const d = data[index];

      if (!d) return;

      hoverLine
        .attr("x1", x(d.hours))
        .attr("x2", x(d.hours))
        .style("display", null);

      tooltip
        .style("display", "block")
        .html(`
                    <strong>${d.hours.toFixed(1)} hours before landfall</strong>
                    <div>220 K: ${d3.format(",.0f")(d.area220)} km²</div>
                    <div>230 K: ${d3.format(",.0f")(d.area230)} km²</div>
                    <div>240 K: ${d3.format(",.0f")(d.area240)} km²</div>
                `)
        .style("left", `${Math.min(event.clientX + 15, window.innerWidth - 230)}px`)
        .style("top", `${Math.max(10, event.clientY - 85)}px`);
    })
    .on("mouseleave", function () {
      tooltip.style("display", "none");
      hoverLine.style("display", "none");
    });


}).catch(error => {
  console.error("Error loading cloud area CSV:", error);
});

