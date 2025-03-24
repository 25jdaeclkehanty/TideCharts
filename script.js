// script.js
document.addEventListener("DOMContentLoaded", () => {
  const dateDisplay = document.getElementById("date");
  const dateInput = document.getElementById("date-input");
  const refreshButton = document.getElementById("refresh-button");
  // Replace with the correct NOAA station ID for Palm City, FL
  const stationId = "8722357";

  // Function to fetch and display tide data for a given date (expected format: YYYY-MM-DD)
  function fetchTideData(selectedDateStr) {
    // If no date is provided, default to today.
    let selectedDate = selectedDateStr ? new Date(selectedDateStr) : new Date();
    const today = new Date();

    // Compare the selected date (ignoring time) to today's date
    if (selectedDate.toDateString() !== today.toDateString()) {
      alert("NOAA API tide predictions for future (or past) dates are not supported for this station. Defaulting to today's data.");
      selectedDate = today;
    }
    // At this point, selectedDate is always today.
    dateDisplay.innerText = selectedDate.toDateString();
    // Since we're defaulting to today, set a flag accordingly.
    const isToday = true;

    // Build the API URL using "date=today" because only today's data is supported.
    const apiUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?date=today&station=${stationId}&product=predictions&datum=MLLW&time_zone=lst_ldt&interval=hilo&units=english&format=json`;
    console.log("Fetching data from:", apiUrl);

    // Clear previous table rows
    const tbody = document.querySelector("#tide-table tbody");
    tbody.innerHTML = "";

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        console.log("Fetched data:", data);
        if (data && data.predictions && Array.isArray(data.predictions)) {
          const predictions = data.predictions;
          const chartData = [];

          predictions.forEach(pred => {
            // Manually parse the time string "YYYY-MM-DD HH:MM"
            const [datePart, timePart] = pred.t.split(" ");
            const [yr, mon, dy] = datePart.split("-");
            const [hr, min] = timePart.split(":");
            const dateObj = new Date(yr, mon - 1, dy, hr, min);
            // Format time for table display as "HH:MM AM/PM"
            const formattedTime = dateObj.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            });
            const tideType = pred.type === "H" ? "High Tide" : "Low Tide";

            // Append a row to the table
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${tideType}</td><td>${formattedTime}</td><td>${pred.v} ft</td>`;
            tbody.appendChild(tr);

            // Add data point for chart (using Date object as x value)
            chartData.push({ x: dateObj, y: parseFloat(pred.v) });
          });

          // Set x-axis boundaries: from midnight to 11:59 PM today
          const xMin = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0);
          const xMax = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59);

          // Prepare annotation for the current time if we're showing today's data
          let annotationConfig = {};
          if (isToday) {
            const now = new Date();
            annotationConfig = {
              type: "line",
              scaleID: "x",
              value: now,
              borderColor: "red",
              borderWidth: 2,
              label: {
                enabled: true,
                content: "Now"
              }
            };
          }

          // Create a time-based line chart with Chart.js
          const ctx = document.getElementById("tide-chart").getContext("2d");
          // Destroy previous chart instance if exists
          if (window.myChart) { window.myChart.destroy(); }
          window.myChart = new Chart(ctx, {
            type: "line",
            data: {
              datasets: [{
                label: "Tide Level (ft)",
                data: chartData,
                borderColor: "blue",
                backgroundColor: "rgba(0, 0, 255, 0.1)",
                fill: true,
                tension: 0.1,
                parsing: false, // we supply {x, y} data directly
              }]
            },
            options: {
              responsive: true,
              scales: {
                x: {
                  type: "time",
                  time: {
                    unit: "hour",
                    displayFormats: { hour: "h:mm a" },
                  },
                  title: { display: true, text: "Time" },
                  min: xMin,
                  max: xMax,
                },
                y: {
                  title: { display: true, text: "Tide Level (ft)" },
                }
              },
              plugins: {
                annotation: {
                  annotations: annotationConfig && Object.keys(annotationConfig).length
                    ? { currentTimeLine: annotationConfig }
                    : {}
                }
              }
            }
          });
        } else {
          console.error("Invalid data format:", data);
        }
      })
      .catch(error => {
        console.error("Error fetching tide data:", error);
      });
  }

  // Initial load: fetch today's data
  fetchTideData();

  // Refresh data when the refresh button is clicked
  refreshButton.addEventListener("click", () => {
    const selectedDate = dateInput.value; // expected in YYYY-MM-DD format
    fetchTideData(selectedDate);
  });
});
