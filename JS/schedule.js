document.addEventListener('DOMContentLoaded', () => {
    const scheduleForm = document.getElementById('scheduleForm');
    const classstart= document.getElementById('classStart');
    const classEnd = document.getElementById('classEnd');
    const coachesSelect = document.getElementById('coaches');
    const assistantCoachesSelect = document.getElementById('assistantCoaches');

    populateNameSelect()

    coachesSelect.addEventListener('change', function() {
        const selectedCoaches = Array.from(this.selectedOptions).map(option => option.text);
        $('#selectedCoaches').empty();
        selectedCoaches.forEach(coach => {
            $('#selectedCoaches').append(`<span class="badge badge-primary mr-2">${coach} <button class="remove-btn">x</button></span>`);
        });
    });

    assistantCoachesSelect.addEventListener('change', function() {
        const selectedAssistantCoaches = Array.from(this.selectedOptions).map(option => option.text);
        $('#selectedAssistantCoaches').empty();
        selectedAssistantCoaches.forEach(assistantcoach => {
            $('#selectedAssistantCoaches').append(`<span class="badge badge-primary mr-2">${assistantcoach} <button class="remove-btn">x</button></span>`);
        });
    });

    scheduleForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const classType = document.getElementById('classType').value;
        const className = document.getElementById('className').value;
        const start = classstart.value;
        const end = classEnd.value;
        const examDate = document.getElementById('examDate').value;
        const coaches = Array.from(coachesSelect.selectedOptions).map(option => option.value);
        const assistantCoaches = Array.from(assistantCoachesSelect.selectedOptions).map(option => option.value);
        const numStudents = document.getElementById('numStudents').value;

        const classData = {
            classType,
            className,
            start,
            end,
            examDate,
            coaches,
            assistantCoaches,
            numStudents
        };

        saveClassData(classData);
        alert('Class scheduled successfully!');
        scheduleForm.reset();
    });

    function saveClassData(data) {
        const key = `class_${data.className}_${data.examDate}`;
        localStorage.setItem(key, JSON.stringify(data));
        console.log(`Class data saved: ${key}`, data);
    }

    function populateNameSelect() {
        const allNames = Object.keys(positions);
        allNames.forEach(name => {
            if (positions[name] === '教練') {
            console.log(name);
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            coachesSelect.appendChild(option);
            }
            else if (positions[name] === '助教') {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                assistantCoachesSelect.appendChild(option);
            }
        });
    }
});