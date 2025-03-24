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
      console.log("Fetched data:", data); // Log the full response for debugging

      // Check if 'predictions' exists and is an array before proceeding
      if (data && data.predictions && Array.isArray(data.predictions)) {
        const predictions = data.predictions;
        const tbody = document.querySelector("#tide-table tbody");
        const times = [];
        const levels = [];

        predictions.forEach((pred) => {
          // Format time: convert "YYYY-MM-DD HH:MM" into "HH:MM AM/PM"
          const formattedTime = new Date(pred.t.replace(" ", "T")).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true
          });
          
          // NOAA returns 'type' as "H" for high tide or "L" for low tide.
          const tideType = pred.type === "H" ? "High Tide" : "Low Tide";

          // Create and append a new table row with the formatted time
          const tr = document.createElement("tr");
          tr.innerHTML = `<td>${tideType}</td><td>${formattedTime}</td><td>${pred.v} ft</td>`;
          tbody.appendChild(tr);

          // Use formatted time for the chart labels as well (optional)
          times.push(formattedTime);
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
      } else {
        console.error("Invalid data format:", data);
      }
    })
    .catch((error) => {
      console.error("Error fetching tide data:", error);
    });
});
