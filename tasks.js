document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const searchBar = document.getElementById('search-bar');
    const filterPriority = document.getElementById('filter-priority');
    const taskColumns = document.querySelectorAll('.task-column');
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let draggedTaskId = null;

    const saveTasks = () => localStorage.setItem('tasks', JSON.stringify(tasks));
    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hour, minute] = timeString.split(':');
        const hourNum = parseInt(hour, 10);
        const ampm = hourNum >= 12 ? 'PM' : 'AM';
        const formattedHour = hourNum % 12 || 12; 
        return `at ${formattedHour}:${minute} ${ampm}`;
    };

    const renderTasks = () => {
        document.querySelectorAll('.task-list').forEach(list => list.innerHTML = '');

        const searchTerm = searchBar.value.toLowerCase();
        const priorityFilter = filterPriority.value;

        const filteredTasks = tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchTerm) || (task.description && task.description.toLowerCase().includes(searchTerm));
            const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
            return matchesSearch && matchesPriority;
        });

        filteredTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task card card-body mb-3 shadow-sm ${task.priority}`;
            taskElement.setAttribute('draggable', 'true');
            taskElement.dataset.id = task.id;
            taskElement.innerHTML = `
                <h6 class="card-title mb-1">${task.title}</h6>
                <p class="card-text small text-muted">${task.description || '&nbsp;'}</p>
                <div class="small text-muted">Due: ${task.dueDate} ${formatTime(task.dueTime)}</div>
            `;

            taskElement.addEventListener('dragstart', () => {
                draggedTaskId = task.id;
                taskElement.classList.add('is-dragging');
            });

            taskElement.addEventListener('dragend', () => {
                taskElement.classList.remove('is-dragging');
                draggedTaskId = null;
            });

            document.getElementById(`${task.status}-tasks`).appendChild(taskElement);
        });
    };

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTask = {
            id: Date.now(),
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-description').value,
            dueDate: document.getElementById('task-due-date').value,
            dueTime: document.getElementById('task-due-time').value, 
            category: document.getElementById('task-category').value,
            priority: document.getElementById('task-priority').value,
            status: 'todo'
        };
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        taskForm.reset();
        const accordionCollapse = document.getElementById('collapseOne');
        new bootstrap.Collapse(accordionCollapse, { toggle: false }).hide();
    });
    
    searchBar.addEventListener('input', renderTasks);
    filterPriority.addEventListener('change', renderTasks);

    taskColumns.forEach(column => {
        const list = column.querySelector('.task-list');

        column.addEventListener('dragenter', (e) => {
            e.preventDefault();
            column.classList.add('drag-over');
        });

        column.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        column.addEventListener('dragleave', () => {
            column.classList.remove('drag-over');
        });

        column.addEventListener('drop', (e) => {
            e.preventDefault();
            column.classList.remove('drag-over');
            
            if (!draggedTaskId) return;

            const task = tasks.find(t => t.id === draggedTaskId);
            if (task) {
                const newStatus = list.dataset.status;
                task.status = newStatus;
                saveTasks();
                renderTasks();
            }
        });
    });

    renderTasks();
});