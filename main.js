document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');

    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-bs-theme', theme);
        localStorage.setItem('theme', theme);
        themeIcon.className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
    };

    themeToggle.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    const exportBtn = document.getElementById('export-data');
    const importFile = document.getElementById('import-file');
    const clearDataBtn = document.getElementById('clear-data');

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
            const a = document.createElement('a');
            a.href = url;
            a.download = 'study-planner-data.json';
            a.click();
            URL.revokeObjectURL(url);
        });
    }

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
                    alert('Data imported successfully! The page will now reload.');
                    window.location.reload();
                } catch (error) { alert('Error importing data.'); }
            };
            reader.readAsText(file);
        });
    }
    
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
                localStorage.removeItem('tasks');
                localStorage.removeItem('goals');
                alert('All tasks and goals have been cleared.');
                window.location.href = 'index.html';
            }
        });
    }

    if (document.getElementById('progress-chart')) {
        renderDashboard();
    }
    
    const quickAddForm = document.getElementById('quick-add-form');
    if (quickAddForm) {
        quickAddForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('quick-task-title').value;
            const dueDate = document.getElementById('quick-task-due-date').value;
            const dueTime = document.getElementById('quick-task-due-time').value; 
            
            const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            const newTask = {
                id: Date.now(), title, description: '', 
                dueDate: dueDate || new Date().toISOString().slice(0, 10),
                dueTime: dueTime, // Save time
                category: 'study', priority: 'medium', status: 'todo'
            };
            tasks.push(newTask);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            quickAddForm.reset();
            renderDashboard();
        });
    }
});

function renderDashboard() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const today = new Date().toISOString().slice(0, 10);

    const todayTasksList = document.getElementById('today-tasks-list');
    todayTasksList.innerHTML = '';
    const todayTasks = tasks.filter(task => task.dueDate === today && task.status !== 'done');
    
    if (todayTasks.length > 0) {
        todayTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = task.title;
            todayTasksList.appendChild(li);
        });
    } else {
        todayTasksList.innerHTML = '<li class="list-group-item">No tasks due today. Great job!</li>';
    }

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
                borderColor: document.documentElement.getAttribute('data-bs-theme') === 'dark' ? '#2b3035' : '#fff',
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}