document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');

    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-bs-theme', theme);
        localStorage.setItem('theme', theme);
        themeIcon.className = theme === 'dark' ? 'bi bi-sun-fill me-2' : 'bi bi-moon-stars-fill me-2';
    };

    themeToggle.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    const exportBtn = document.getElementById('export-data');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const dataToExport = {
                tasks: localStorage.getItem('tasks') || '[]',
                goals: localStorage.getItem('goals') || '[]',
                theme: localStorage.getItem('theme') || 'light'
            };
            const dataStr = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url;
            a.download = 'study-planner-data.json'; a.click(); URL.revokeObjectURL(url);
        });
    }

    const importFile = document.getElementById('import-file');
    if (importFile) {
        importFile.addEventListener('change', (e) => {
            const file = e.target.files[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    localStorage.setItem('tasks', data.tasks || '[]');
                    localStorage.setItem('goals', data.goals || '[]');
                    setTheme(data.theme || 'light');
                    alert('Data imported successfully!'); window.location.reload();
                } catch (error) { alert('Error importing data.'); }
            };
            reader.readAsText(file);
        });
    }
    
    const clearDataBtn = document.getElementById('clear-data');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete ALL data?')) {
                localStorage.removeItem('tasks'); localStorage.removeItem('goals');
                alert('All data has been cleared.'); window.location.href = 'index.html';
            }
        });
    }

    if (document.getElementById('progress-chart')) {
        renderDashboard();
        initializePomodoro();
    }
});

function renderDashboard() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const today = new Date().toISOString().slice(0, 10);
    const todayTasksList = document.getElementById('today-tasks-list');
    const todayTaskCount = document.getElementById('today-task-count');
    const dashboardFilter = document.getElementById('dashboard-task-filter');
    
    const renderFilteredTasks = () => {
        todayTasksList.innerHTML = '';
        const filterText = dashboardFilter.value.toLowerCase();
        const todayTasks = tasks.filter(task => task.dueDate === today && task.status !== 'done' && task.title.toLowerCase().includes(filterText));
        todayTaskCount.textContent = todayTasks.length;

        if (todayTasks.length > 0) {
            todayTasks.forEach(task => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.textContent = task.title;
                todayTasksList.appendChild(li);
            });
        } else {
            todayTasksList.innerHTML = '<li class="list-group-item text-muted">No tasks found.</li>';
        }
    };

    dashboardFilter.addEventListener('input', renderFilteredTasks);
    renderFilteredTasks();

    const todo = tasks.filter(t => t.status === 'todo').length;
    const inprogress = tasks.filter(t => t.status === 'inprogress').length;
    const done = tasks.filter(t => t.status === 'done').length;

    const ctx = document.getElementById('progress-chart').getContext('2d');
    if(window.myChart) window.myChart.destroy();
    window.myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['To-Do', 'In Progress', 'Done'],
            datasets: [{
                data: [todo, inprogress, done],
                backgroundColor: ['#dc3545', '#ffc107', '#198754'],
                borderColor: document.documentElement.getAttribute('data-bs-theme') === 'dark' ? '#212529' : '#fff',
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

function initializePomodoro() {
    const display = document.getElementById('pomodoro-display');
    const startBtn = document.getElementById('pomodoro-start');
    const resetBtn = document.getElementById('pomodoro-reset');
    let timer, minutes = 25, seconds = 0, isRunning = false;
    const updateDisplay = () => { display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`; };
    const startTimer = () => {
        if (isRunning) return; isRunning = true; startBtn.innerHTML = '<i class="bi bi-pause-fill"></i> Pause';
        timer = setInterval(() => {
            if (seconds === 0) { if (minutes === 0) { clearInterval(timer); alert("Time's up!"); resetTimer(); return; } minutes--; seconds = 59; } else { seconds--; }
            updateDisplay();
        }, 1000);
    };
    const pauseTimer = () => { isRunning = false; startBtn.innerHTML = '<i class="bi bi-play-fill"></i> Start'; clearInterval(timer); };
    const resetTimer = () => { pauseTimer(); minutes = 25; seconds = 0; updateDisplay(); };
    startBtn.addEventListener('click', () => { isRunning ? pauseTimer() : startTimer(); });
    resetBtn.addEventListener('click', resetTimer);
}