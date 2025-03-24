// script.js
document.addEventListener("DOMContentLoaded", () => {
  const dateDisplay = document.getElementById("date");
  const dateInput = document.getElementById("date-input");
  const refreshButton = document.getElementById("refresh-button");
  // Replace with the correct NOAA station ID for Palm City, FL
  const stationId = "8722357";

  // Function to fetch and display tide data for a given date (expected format: YYYY-MM-DD)
  function fetchTideData(selectedDateStr) {
    // Default to today's date if no date is provided.
    let selectedDate = selectedDateStr ? new Date(selectedDateStr) : new Date();
    const today = new Date();

    // Compare the selected date and today (ignoring time)
    const selectedDateStrFormatted = selectedDate.toDateString();
    const todayStr = today.toDateString();

    // NOAA's tide predictions API for this station only accepts "today", "latest", or "recent"
    if (selectedDateStrFormatted !== todayStr) {
      alert("NOAA API tide predictions for future (or past) dates are not supported for this station. Defaulting to today's data.");
      selectedDate = today;
    }
    dateDisplay.innerText = selectedDate.toDateString();

    // Build the API URL – use the "today" parameter since that's what NOAA supports
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
            // Format the time for table display as "HH:MM AM/PM"
            const formattedTime = dateObj.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: true
            });
            const tideType = pred.type === "H" ? "High Tide" : "Low Tide";

            // Append a row to the table
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${tideType}</td><td>${formattedTime}</td><td>${pred.v} ft</td>`;
            tbody.appendChild(tr);

            // Add a data point for the chart (using the Date object as x value)
            chartData.push({ x: dateObj, y: parseFloat(pred.v) });
          });

          // Set chart x-axis boundaries to span the full day (midnight to 11:59 PM)
          const xMin = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0);
          const xMax = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59);

          // Create an annotation for the current time if we're showing today's data
          let
