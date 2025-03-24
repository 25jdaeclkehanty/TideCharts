// script.js
document.addEventListener("DOMContentLoaded", () => {
  const dateDisplay = document.getElementById("date");
  const dateInput = document.getElementById("date-input");
  const refreshButton = document.getElementById("refresh-button");
  // Replace with the correct NOAA station ID for Palm City, FL
  const stationId = "8722357";

  // Function to fetch and display tide data for a given date (YYYY-MM-DD)
  function fetchTideData(selectedDateStr) {
    // If no date is provided, default to today.
    let selectedDate = selectedDateStr ? new Date(selectedDateStr) : new Date();
    dateDisplay.innerText = selectedDate.toDateString();

    // Check if the selected date is today
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();

    // Format the selected date as YYYYMMDD for the API call
    const year = selectedDate.getFullYear();
    const month = ("0" + (selectedDate.getMonth() + 1)).slice(-2);
    const day = ("0" + selectedDate.getDate()).slice(-2);
    const formattedDate = `${year}${month}${day}`;

    // Build the API URL:
    // If today, we can use "date=today". Otherwise, use begin_date and end_date.
    let apiUrl;
    if (isToday) {
      apiUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?date=today&station=${stationId}&product=predictions&datum=MLLW&time_zone=lst_ldt&interval=hilo&units=english&format=json`;
    } else {
      apiUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${formattedDate}&end_date=${formattedDate}&station=${stationId}&product=predictions&datum=MLLW&time_zone=lst_ldt&interval=hilo&units=english&format=json`;
    }

    console.log("Fetching data from:", apiUrl);

    // Clear previous table rows
    const tbody = document.querySelector("#tide-table tbody");
    tbody.innerHTML = "";

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched data:", data);

        if (data && data.predictions && Array.isArray(data.predictions)) {
          const predictions = data.predictions;
          const chartData = [];

          predictions.forEach((pred) => {
            // Parse the time string "YYYY-MM-DD HH:MM" manually
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

            // Add data point for chart (use the Date object as x value)
            chartData.push({ x: dateObj, y: parseFloat(pred.v) });
          });

          // Determine the x-axis boundaries: from midnight to 11:59 PM of the selected date
          const xMin = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0);
          const xMax = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59);

          // Prepare annotation for the current time if the selected date is today
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
                content: "Now",
              },
            };
          }

          // Create the Chart.js line chart
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
                  parsing: false, // we provide {x, y} data directly
                },
              ],
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
                },
              },
              plugins: {
                annotation: {
                  annotations:
                    annotationConfig && Object.keys(annotationConfig).length
                      ? { currentTimeLine: annotationConfig }
                      : {},
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
  }

  // Initial load: fetch data for today's date
  fetchTideData();

  // Refresh data when the refresh button is clicked
  refreshButton.addEventListener("click", () => {
    const selectedDate = dateInput.value; // expected in YYYY-MM-DD format
    fetchTideData(selectedDate);
  });
});
