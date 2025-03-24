// script.js
document.addEventListener("DOMContentLoaded", () => {
  // Set today's date in the header
  const today = new Date();
  document.getElementById("date").innerText = today.toDateString();

  // Replace with the correct NOAA station ID for Palm City, FL
  const stationId = "8722357";
  // Build the API URL – requesting tide predictions (high/low) for today
  const apiUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?date=today&station=${stationId}&product=predictions&datum=MLLW&time_zone=lst_ldt&interval=hilo&units=english&format=json`;

  // Fetch tide data from NOAA
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      // The NOAA response has "predictions" at the top level
      const predictions = data.predictions;
      const tbody = document.querySelector("#tide-table tbody");
      const times = [];
      const levels = [];

      // Iterate over each tide prediction
      predictions.forEach((pred) => {
        // pred.type is "H" for high tide or "L" for low tide
        const tideType = pred.type === "H" ? "High Tide" : "Low Tide";

        // Create a table row
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${tideType}</td>
          <td>${pred.t}</td>
          <td>${pred.v} ft</td>
        `;
        tbody.appendChild(tr);

        // Collect data for the chart
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
