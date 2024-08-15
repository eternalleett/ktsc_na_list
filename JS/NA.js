document.addEventListener('DOMContentLoaded', () => {
    const nameSelect = document.getElementById('nameSelect');
    const monthSelect = document.getElementById('month');
    const calendarContainer = document.getElementById('calendarContainer');
    const form = document.getElementById('availabilityForm');
    const messageDisplay = document.getElementById('result');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const checkAllBtn = document.getElementById('checkAllBtn');

    // Populate nameSelect with names from the positions object
    function populateNameSelect() {
        const allNames = Object.keys(positions);
        allNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            nameSelect.appendChild(option);
        });
    }

    // Call the function to populate the name select box
    populateNameSelect();

    // Set the default selected month to the current month
    function setDefaultMonth() {
        const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-11
        monthSelect.value = currentMonth.toString().padStart(2, '0');
    }

    function loadSavedData() {
        const name = nameSelect.value;
        const month = monthSelect.value;
        const savedTimeSlots = getAvailability(name, month);
        
        // Clear all checkboxes
        document.querySelectorAll('tbody input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
        
        // Check saved time slots
        savedTimeSlots.forEach(slot => {
            const checkbox = document.querySelector(`input[value="${slot}"]`);
            if (checkbox) checkbox.checked = true;
        });
        
        if (savedTimeSlots.length > 0) {
            messageDisplay.innerHTML = `Loaded saved availability for ${name} in ${month}.`;
        } else {
            messageDisplay.innerHTML = `No saved availability for ${name} in ${month}.`;
        }
    }

    function updateCalendar() {
        const selectedMonthIndex = monthSelect.value - 1; // Adjust for zero-based index
        const selectedMonth = new Date(new Date().getFullYear(), selectedMonthIndex, 1);
        const monthName = selectedMonth.toLocaleString('default', { month: 'long' });
        const year = selectedMonth.getFullYear();

        calendarContainer.innerHTML = `<h2 class="text-center">${monthName} ${year}</h2>`;
        calendarContainer.appendChild(createDaysTable(selectedMonth));
        loadSavedData(); // Load saved data after creating the calendar
    }

    function clearAllCheckboxes() {
        document.querySelectorAll('tbody input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
    }

    function checkAllCheckboxes() {
        document.querySelectorAll('tbody input[type="checkbox"]').forEach(checkbox => checkbox.checked = true);
    }

    monthSelect.addEventListener('change', updateCalendar);
    nameSelect.addEventListener('change', loadSavedData);
    clearAllBtn.addEventListener('click', clearAllCheckboxes);
    checkAllBtn.addEventListener('click', checkAllCheckboxes);

    // Set the default month and trigger the change event to load the calendar for the current month
    setDefaultMonth();
    updateCalendar();

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const name = nameSelect.value;
        const month = monthSelect.value;
        const year = new Date().getFullYear();
        const checkedCheckboxes = document.querySelectorAll('tbody input[type="checkbox"]:checked');
        const selectedTimeSlots = Array.from(checkedCheckboxes).map(function(checkbox) {
            return checkbox.value;
        });

        try {
            saveAvailability(name, month, selectedTimeSlots);
            const message = `Hello, ${name}! Your availability for ${month}/${year} has been saved.<br>Selected time slots:<br>${selectedTimeSlots.join('<br>')}`;
            messageDisplay.innerHTML = message;
        } catch (error) {
            console.error('Error:', error);
            messageDisplay.innerHTML = 'An error occurred while saving your availability.';
        }
    });
});

const getSelectedMonth = (selectedMonthIndex) => {
    const currentYear = new Date().getFullYear();
    return new Date(currentYear, parseInt(selectedMonthIndex), 1);
};

const createDaysTable = (month) => {
    const table = document.createElement('table');
    table.classList.add('table', 'table-bordered', 'text-center');
    table.appendChild(createTableHeader());
    table.appendChild(createTableBody(month));
    return table;
};

const createTableHeader = () => {
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr><th>Timeslot</th>
            ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => `<th>${day}</th>`).join('')}
        </tr>
    `;
    return thead;
};

function createTableCell(content = '', isHeader = false) {
    const cell = document.createElement(isHeader ? 'th' : 'td');
    if (content instanceof HTMLElement) {
        cell.appendChild(content);
    } else {
        cell.innerHTML = content;
    }
    return cell;
}

function formatDate(year, month, day) {
    const formattedMonth = month.toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
    return `${year}-${formattedMonth}-${formattedDay}`;
}

function createCheckbox(year, month, day, timeSlot) {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    const formattedDate = formatDate(year, month, day);
    checkbox.name = `availability_${formattedDate}_${timeSlot}`;
    checkbox.value = `${formattedDate} ${timeSlot === '0' ? '19:00-20:00' : '20:00-22:00'}`;
    return checkbox;
}

const createTableBody = (month) => {
    const tbody = document.createElement('tbody');
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    let currentDate = 1;
    const firstDay = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7;
    const weeks = Math.ceil((daysInMonth + firstDay) / 7);

    for (let i = 0; i < weeks; i++) {
        const tr = document.createElement('tr');
        tr.appendChild(createTableCell()); // Placeholder cell

        for (let j = 0; j < 7; j++) {
            if ((i === 0 && j < firstDay)) {
                tr.appendChild(createTableCell());
            } else {
                const dateDisplay = `${month.getMonth() + 1}/${currentDate}`;
                tr.appendChild(createTableCell(dateDisplay));
                currentDate++;
                if (currentDate > daysInMonth) {
                    lastday = j + 1;
                    break;}
                
            }
        }
        
        tbody.appendChild(tr);

        for (let k = 0; k < 2; k++) {
            const emptyRow = document.createElement('tr');
            const timeSlotLabel = k === 0 ? '19:00-20:00' : '20:00-22:00';
            emptyRow.appendChild(createTableCell(timeSlotLabel, true));
            for (let l = 0; l < 7; l++) {
                let day = currentDate - (7 - l);
                if (currentDate > daysInMonth) {
                    day = currentDate - (lastday - l);
                    };
                const monthNumber = month.getMonth() + 1;
                const year = month.getFullYear();
                const cell = createTableCell();

                if (!(day < 1 || day > new Date(year, monthNumber, 0).getDate() 
                    || (l === 1 || l === 3 || l === 5 || l === 6))) {
                    cell.appendChild(createCheckbox(year, monthNumber, day, k.toString()));
                }

                emptyRow.appendChild(cell);
            }
            tbody.appendChild(emptyRow);
        }
    }
    return tbody;
};