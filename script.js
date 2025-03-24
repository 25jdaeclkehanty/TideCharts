<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <!-- Ensure proper scaling on mobile devices -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Palm City Tide Times</title>
  <link rel="stylesheet" href="styles.css" />
  <!-- Include Chart.js -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <!-- Include Chart.js annotation plugin -->
  <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation@1.1.0"></script>
  <!-- Include Luxon and the Chart.js adapter for time scales -->
  <script src="https://cdn.jsdelivr.net/npm/luxon@3"></script>
  <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-luxon"></script>
</head>
<body>
  <header>
    <h1>Palm City Tide Times</h1>
    <p id="date"></p>
  </header>

  <section id="tide-info">
    <h2>Tide Predictions</h2
