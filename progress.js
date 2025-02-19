<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>Progress - Dad & Alex Workout</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-gray-100">
    <div class="app-container">
        <!-- Header -->
        <header class="sticky top-0 bg-white border-b z-10 mb-4">
            <div class="flex items-center justify-between p-4">
                <button onclick="location.href='index.html'" 
                        class="p-2 bg-gray-200 rounded-lg">
                    ← Back
                </button>
                <h1 class="text-lg font-bold">Progress</h1>
                <div class="flex gap-2">
                    <button id="dadButton" class="px-3 py-1 bg-blue-500 text-white rounded">Dad</button>
                    <button id="alexButton" class="px-3 py-1 bg-gray-200 rounded">Alex</button>
                </div>
            </div>
        </header>

        <!-- Time Range Selector -->
        <section class="bg-white rounded-lg shadow-sm p-4 mb-4">
            <select id="timeRange" class="w-full p-2 border rounded">
                <option value="1">Last Month</option>
                <option value="3">Last 3 Months</option>
                <option value="6">Last 6 Months</option>
                <option value="12">Last Year</option>
                <option value="all">All Time</option>
            </select>
        </section>

        <!-- Strength Progress -->
        <section class="bg-white rounded-lg shadow-sm p-4 mb-4">
            <h2 class="text-lg font-bold mb-2">Strength Progress</h2>
            <div class="chart-container">
                <canvas id="strengthChart"></canvas>
            </div>
        </section>

        <!-- Personal Bests -->
        <section class="bg-white rounded-lg shadow-sm p-4 mb-4">
            <h2 class="text-lg font-bold mb-2">Personal Bests</h2>
            <div id="personalBests" class="space-y-2">
                <!-- Populated by JS -->
            </div>
        </section>

        <!-- Exercise Details -->
        <section class="bg-white rounded-lg shadow-sm p-4 mb-4">
            <h2 class="text-lg font-bold mb-2">Exercise Details</h2>
            <select id="exerciseSelect" class="w-full p-2 border rounded mb-4">
                <!-- Populated by JS -->
            </select>
            <div id="exerciseDetail">
                <!-- Populated by JS -->
            </div>
        </section>

        <!-- Recent Activity -->
        <section class="bg-white rounded-lg shadow-sm p-4 mb-20">
            <h2 class="text-lg font-bold mb-2">Recent Activity</h2>
            <div id="recentActivity" class="space-y-2">
                <!-- Populated by JS -->
            </div>
        </section>

        <!-- Export Data Button -->
        <div class="fixed bottom-0 left-0 right-0 bg-white border-t p-4" 
             style="max-width: inherit; margin: 0 auto;">
            <button id="exportDataBtn" 
                    class="w-full py-3 bg-blue-500 text-white rounded-lg">
                Export Progress Data
            </button>
        </div>
    </div>

    <!-- Loading Overlay -->
    <div id="loadingOverlay" 
         class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center">
        <div class="bg-white p-4 rounded-lg">
            <p class="text-center">Loading...</p>
        </div>
    </div>

    <script type="module" src="js/dataManager.js"></script>
    <script type="module" src="js/workoutLibrary.js"></script>
    <script type="module" src="js/progressTracker.js"></script>
</body>
</html>
