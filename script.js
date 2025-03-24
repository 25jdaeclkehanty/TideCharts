// script.js
document.addEventListener("DOMContentLoaded", () => {
  // Set today's date in the header
  const today = new Date();
  document.getElementById("date").innerText = today.toDateString();

  // Replace with the correct NOAA station ID for Palm City, FL
  const stationId = "8722357";
  // Build the API URL – request tide predictions (high/low) for today
  const apiUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?date=today&station=${stationId}&product=predictions&datum=MLLW&time_zone=lst_ldt&interval=hilo&units=english&format=json`;

  // Fetch tide data from NOAA
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      console.log("Fetched data:", data); // Debug log

      if (data && data.predictions && Array.isArray(data.predictions)) {
        const predictions = data.predictions;
        const tbody = document.querySelector("#tide-table tbody");
        const times = [];
        const levels = [];

        predictions.forEach((pred) => {
          // Manually parse the time string "YYYY-MM-DD HH:MM"
          const [datePart, timePart] = pred.t.split(" ");
          const [year, month, day] = datePart.split("-");
          const [hour, minute] = timePart.split(":");
          // Create a Date object (month is 0-indexed)
          const dateObj = new Date(year, month - 1, day, hour, minute);
          // Format time as "HH:MM AM/PM"
          const formattedTime = dateObj.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true
          });

          // Determine tide type from pred.type ("H" or "L")
          const tideType = pred.type === "H" ? "High Tide" : "Low Tide";

          // Append a new row to the table
          const tr = document.createElement("tr");
          tr.innerHTML = `<td>${tideType}</td><td>${formattedTime}</td><td>${pred.v} ft</td>`;
          tbody.appendChild(tr);

          // For chart labels, use the formatted time
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
