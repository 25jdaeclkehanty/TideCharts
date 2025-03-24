// script.js
document.addEventListener("DOMContentLoaded", () => {
  const dateDisplay = document.getElementById("date");
  const dateInput = document.getElementById("date-input");
  const refreshButton = document.getElementById("refresh-button");

  // Function to fetch and display tide data for a given date (format: YYYY-MM-DD)
  function fetchTideData(selectedDateStr) {
    // If no date is provided, default to today.
    let selectedDate = selectedDateStr ? new Date(selectedDateStr) : new Date();
    dateDisplay.innerText = selectedDate.toDateString();

    // Format the selected date as YYYYMMDD (NOAA API expects this)
    const year = selectedDate.getFullYear();
    const month = ("0" + (selectedDate.getMonth() + 1)).slice(-2);
    const day = ("0" + selectedDate.getDate()).slice(-2);
    const formattedDate = `${year}${month}${day}`;

    // Use the formatted date as the "date" parameter.
    const dateParam = formattedDate;

    // Replace with the correct NOAA station ID for Palm City, FL
    const stationId = "8722357";
    const apiUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?date=${dateParam}&station=${stationId}&product=predictions&datum=MLLW&time_zone=lst_ldt&interval=hilo&units=english&format=json`;

    // Clear previous table rows
    const tbody = document.querySelector("#tide-table tbody");
    tbody.innerHTML = "";

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched data:", data);
        if (data && data.predictions && Array.isArray(data.predictions)) {
          const predictions = data.predictions;
          // Prepare chart data as an array of objects with x and y values
          const chartData = [];

          predictions.forEach((pred) => {
            // Manually parse the time string "YYYY-MM-DD HH:MM"
            const [datePart, timePart] = pred.t.split(" ");
            const [year, month, day] = datePart.split("-");
            const [hour, minute] = timePart.split(":");
            const dateObj = new Date(year, month - 1, day, hour, minute);
            // Format the time for table display as "HH:MM AM/PM"
            const formattedTime = dateObj.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: true
            });
            const tideType = pred.type === "H" ? "High Tide" : "Low Tide";

            // Append a new row to the table
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${tideType}</td><td>${formattedTime}</td><td>${pred.v} ft</td>`;
            tbody.appendChild(tr);

            // Add a data point for the chart
            chartData.push({ x: dateObj, y: parseFloat(pred.v) });
          });

          // Prepare annotation for the current time if the selected date is today
          const todayStr = new Date().toDateString();
          const selectedDateStrFormatted = selectedDate.toDateString();
          let annotationConfig = {};
          if (todayStr === selectedDateStrFormatted) {
            const now = new Date();
            annotationConfig = {
              type: 'line',
              scaleID: 'x',
              value: now,
              borderColor: 'red',
              borderWidth: 2,
              label: {
                enabled: true,
                content: 'Now'
              }
            };
          }

          // Create a time-based line chart with Chart.js
          const ctx = document.getElementById("tide-chart").getContext("2d");
          // Destroy previous chart instance if exists
          if (window.myChart) {
            window.myChart.destroy();
          }
          window.myChart = new Chart(ctx, {
            type: "line",
            data: {
              datasets: [
                {
                  label: "Tide Level (ft)",
                  data: chartData,
                  borderColor: "blue",
                  backgroundColor: "rgba(0, 0, 255, 0.1)",
                  fill: true,
                  tension: 0.1,
                  parsing: false // because data is in {x, y} format
                }
              ]
            },
            options: {
              responsive: true,
              scales: {
                x: {
                  type: 'time',
                  time: {
                    unit: 'hour',
                    displayFormats: { hour: 'h:mm a' }
                  },
                  title: { display: true, text: "Time" }
                },
                y: {
                  title: { display: true, text: "Tide Level (ft)" }
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
      .catch((error) => {
        console.error("Error fetching tide data:", error);
      });
  }

  // Initial load: fetch data for today's date
  fetchTideData();

  // Refresh data when the refresh button is clicked
  refreshButton.addEventListener("click", () => {
    const selectedDate = dateInput.value; // expected in YYYY-MM-DD format
    fetchTideData(selectedDate);
  });
});
