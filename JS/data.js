document.addEventListener('DOMContentLoaded', () => {
    const yearSelect = document.getElementById('yearSelect');
    const monthSelect = document.getElementById('monthSelect');
    const tableView = document.getElementById('tableView');
    const chartView = document.getElementById('chartView');
    const toggleViewBtn = document.getElementById('toggleViewBtn');
    const attendanceChart = document.getElementById('attendanceChart').getContext('2d');

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Populate yearSelect with the current year and the previous 5 years
    for (let i = 0; i < 6; i++) {
        const option = document.createElement('option');
        option.value = currentYear - i;
        option.textContent = currentYear - i;
        yearSelect.appendChild(option);
    }

    // Populate monthSelect with month names
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];
    monthNames.forEach((name, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = name;
        monthSelect.appendChild(option);
    });

    // Set the default selected options to the current year and month
    yearSelect.value = currentYear;
    monthSelect.value = currentMonth;

    yearSelect.addEventListener('change', loadUserData);
    monthSelect.addEventListener('change', loadUserData);
    toggleViewBtn.addEventListener('click', toggleView);

    loadUserData();

    function loadUserData() {
        const year = yearSelect.value;
        const month = monthSelect.value.toString().padStart(2, '0');
        const allData = getAllSavedData();
        console.log('All saved data:', allData); // Log all saved data
        const userData = {};

        // Calculate the total number of 20:00-22:00 time slots in the selected month
        const totalSlots = getTotalSlots(year, month);
        

        for (const name in allData) {
            const monthData = allData[name][month] || [];
            const attendances = monthData.filter(slot => slot.includes(`${year}-${month.padStart(2, '0')}`) && slot.includes('20:00-22:00')).length;
            const percentage = (attendances / totalSlots) * 100;

            userData[name] = {
                attendances,
                percentage: percentage.toFixed(2)
            };
        }

        // Ensure all users are displayed, even those with no attendances
        for (const name in positions) {
            if (!userData[name]) {
                userData[name] = {
                    attendances: 0,
                    percentage: '0.00'
                };
            }
        }
        console.log('User data:', userData); // Log user data
        displayTable(userData);
        displayChart(userData);
    }

    function getTotalSlots(year, month) {
        console.log(month);
        const daysInMonth = new Date(year, month, 0).getDate();
        let totalSlots = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day);
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) { // Mon, Wed, Fri
                totalSlots++;
            }
        }

        return totalSlots;
    }

    function displayTable(userData) {
        tableView.innerHTML = `
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Attendances</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.keys(userData).map(name => `
                        <tr>
                            <td>${name}</td>
                            <td>${userData[name].attendances}</td>
                            <td>${userData[name].percentage}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    function displayChart(userData) {
        const labels = Object.keys(userData);
        const data = labels.map(name => userData[name].attendances);

        new Chart(attendanceChart, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Attendances',
                    data,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) { if (Number.isInteger(value)) { return value; } }
                        }
                    }
                }
            }
        });
    }

    function toggleView() {
        if (tableView.style.display === 'none') {
            tableView.style.display = 'block';
            chartView.style.display = 'none';
            toggleViewBtn.textContent = 'Switch to Chart View';
        } else {
            tableView.style.display = 'none';
            chartView.style.display = 'block';
            toggleViewBtn.textContent = 'Switch to Table View';
        }
    }
});