document.addEventListener('DOMContentLoaded', () => {
    const monthSelect = document.getElementById('month');
    const calendarContainer = document.getElementById('calendarContainer');
    
    // Get the current month number (0 for January, 11 for December)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Populate monthSelect with month names starting from the current month
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];
    
    // Rotate the monthNames array so it starts from the current month
    const rotatedMonthNames = monthNames.slice(currentMonth).concat(monthNames.slice(0, currentMonth));
    const messageDisplay = document.getElementById('result');
    let examdate = new Date().toISOString().split('T')[0];
    const examDate = document.getElementById('examDate');
    const examType = document.getElementById('examType');
    examDate.value = examdate;
    const deleteButton = document.getElementById("delete_exam");
    rotatedMonthNames.forEach((name, index) => {
        const option = document.createElement('option');
        option.value = (currentMonth + index) % 12 + 1; // Adjust value to match month number considering rotation
        option.textContent = name;
        monthSelect.appendChild(option);
    });

    // Set the default selected option to the current month
    monthSelect.value = currentMonth + 1;

    monthSelect.addEventListener('change', () => {
        const selectedMonthIndex = monthSelect.value - 1; // Adjust for zero-based index
        const selectedMonth = new Date(currentYear, selectedMonthIndex, 1);
        const monthName = selectedMonth.toLocaleString('default', { month: 'long' });
        const year = selectedMonth.getFullYear();

        calendarContainer.innerHTML = `<h2 class="text-center">${monthName} ${year}</h2>`;
        calendarContainer.appendChild(createDaysTable(selectedMonth));
        highlightCurrentDate(selectedMonth);
        //change default exam date to current date
        
    });

    // Trigger the change event to load the calendar for the current month
     monthSelect.dispatchEvent(new Event('change'));

    // Handle exam form submission
    examForm.addEventListener('submit', function(event) {
        event.preventDefault();

        try {
            const exam_type = examType.value;
            saveExam(examDate.value, exam_type);
            //reload the page
            monthSelect.dispatchEvent(new Event('change'));
        } catch (error) {
            console.error('Error:', error);
            messageDisplay.innerHTML = 'An error occurred while saving your exam.';
        }
    });

    // Handle delete button click
    deleteButton.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent the default form submission behavior
        deleteExam(examDate.value);
        monthSelect.dispatchEvent(new Event('change')); // Refresh the calendar
    });

});

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
        <tr>
            ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => `<th>${day}</th>`).join('')}
        </tr>
    `;
    return thead;
};

const createTableBody = (month) => {
    const tbody = document.createElement('tbody');
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    let currentDate = 1;
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
    const weeks = Math.ceil((daysInMonth + firstDay) / 7);
    const allData = getAllSavedData();
    console.log('All saved data:', allData);
    const examData = getAllexam();
    console.log('Exam data:', examData);
    for (let i = 0; i < weeks; i++) {
        const tr = document.createElement('tr');
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');
            if (i === 0 && j < firstDay) {
                cell.textContent = '';
            } else if (currentDate > daysInMonth) {
                cell.textContent = '';
            } else {
                cell.textContent = currentDate;
                cell.setAttribute('data-day', currentDate);

                // Display exam data

                if (j === 1 || j === 3 || j === 5) { // Monday, Wednesday, Friday
                    const attendees = getAttendees(month.getFullYear(), month.getMonth() + 1, currentDate);
                    console.log(`Attendees for ${month.getFullYear()}-${month.getMonth() + 1}-${currentDate}:`, attendees); // Log attendees
                    const datekey = `${month.getFullYear()}-${(month.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.toString().padStart(2, '0')}`;
                    console.log(datekey);
                    const examKey = `exam_${datekey}`;
                    exam_on_that_day = examData[examKey];
                    if (exam_on_that_day) {
                        const examInfo = document.createElement('div');
                        console.log(exam_on_that_day);
                        examInfo.textContent = `${exam_on_that_day} exam: ${getExamTime(exam_on_that_day)}`;
                        if (exam_on_that_day === 'BM') {
                            examInfo.style.backgroundColor = 'blue';
                            examInfo.style.color = 'white';
                        } else if (exam_on_that_day === 'REPLGA') {
                            examInfo.style.backgroundColor = 'yellow';
                            examInfo.style.color = 'black';
                        }
                        cell.appendChild(examInfo);    
                    }    
                    if (attendees) {
                        cell.appendChild(createAttendeeSummary(attendees));
                    }

                    cell.addEventListener('click', () => {
                        examDate.value = datekey;
                        examType.value = examData[`exam_${datekey}`];
                    });
                }
                
                currentDate++;
            }
            tr.appendChild(cell);
        }
        tbody.appendChild(tr);
    }

    return tbody;
};

function highlightCurrentDate(month) {
    const today = new Date();
    if (today.getMonth() === month.getMonth() && today.getFullYear() === month.getFullYear()) {
        const day = today.getDate();
        const dayCell = document.querySelector(`td[data-day="${day}"]`);
        if (dayCell) {
            dayCell.classList.add('current-date');
        }
    }
}

function getAttendees(year, month, day) {
    const month_string = month.toString().padStart(2, '0');
    const formattedDate = `${year}-${month_string}-${day.toString().padStart(2, '0')}`;
    const allData = getAllSavedData();
    const attendees = {
        '教練': [],
        '助教': []
    };

    for (const name in allData) {
        if (allData[name][month_string]) {
            allData[name][month_string].forEach(slot => {
                if (slot.startsWith(formattedDate) && slot.endsWith('20:00-22:00')) {
                    const position = getPosition(name);
                    attendees[position].push(name);
                }
            });
        }
    }

    return attendees;
}

function createAttendeeSummary(attendees) {
    const summary = document.createElement('div');
    summary.className = 'attendee-summary';
    summary.innerHTML = `
        <div><strong>教練:</strong> ${attendees['教練'].join(', ')}</div>
        <div><strong>助教:</strong> ${attendees['助教'].join(', ')}</div>
    `;
    return summary;
}

// 取得考試時間
function getExamTime(examType) {
    switch (examType) {
        case 'BM':
            return '19:00';
        case 'REPLGA':
            return '19:30';
        case 'AQFA':
            return '18:30';
        default:
            return '';
    }
}