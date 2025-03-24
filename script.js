// script.js
document.addEventListener("DOMContentLoaded", () => {
  // Set today's date in the header
  const today = new Date();
  document.getElementById("date").innerText = today.toDateString();

  // Replace with the correct NOAA station ID for Palm City, FL
  const stationId = "8722357";
  // Build the API URL – here we request tide predictions (high/low) for today
  const apiUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?date=today&station=${stationId}&product=predictions&datum=MLLW&time_zone=lst_ldt&interval=hilo&units=english&format=json`;

  // Fetch tide data from NOAA
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      const predictions = data.data;
      const tbody = document.querySelector("#tide-table tbody");
      const times = [];
      const levels = [];

      predictions.forEach((pred) => {
        // Each prediction has:
        // t: time (e.g., "2025-03-15 06:28"),
        // v: predicted tide level,
        // hi_lo: "H" for high tide or "L" for low tide.
        const type = pred.hi_lo === "H" ? "High Tide" : "Low Tide";

        // Append a row to the table
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${type}</td><td>${pred.t}</td><td>${pred.v} ft</td>`;
        tbody.appendChild(tr);

        // Prepare data for the chart (you may choose to sort or format the times as needed)
        times.push(pred.t);
        levels.push(parseFloat(pred.v));
      });

      // Create a line chart with Chart.js
      const ctx = document.getElementById("tide-chart").getContext("2d");
      new Chart(ctx, {
        type: "line",
        data: {
          labels: times,
          datasets: [
            {
              label: "Tide Level (ft)",
              data: levels,
              borderColor: "blue",
              backgroundColor: "rgba(0, 0, 255, 0.1)",
              fill: true,
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              display: true,
              title: { display: true, text: "Time" },
            },
            y: {
              display: true,
              title: { display: true, text: "Tide Level (ft)" },
            },
          },
        },
      });
    })
    .catch((error) => {
      console.error("Error fetching tide data:", error);
    });
});
