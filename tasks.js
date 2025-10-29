document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const searchBar = document.getElementById('search-bar');
    const filterPriority = document.getElementById('filter-priority');
    const taskColumns = document.querySelectorAll('.task-column');
    const editModalElement = document.getElementById('editTaskModal');
    const editTaskForm = document.getElementById('edit-task-form');
    const editTaskModal = new bootstrap.Modal(editModalElement);
    
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let draggedTaskId = null;

    const saveTasks = () => localStorage.setItem('tasks', JSON.stringify(tasks));
    const formatTime = (timeString) => {
        if (!timeString) return ''; const [hour, minute] = timeString.split(':'); const hourNum = parseInt(hour, 10);
        const ampm = hourNum >= 12 ? 'PM' : 'AM'; const formattedHour = hourNum % 12 || 12;
        return `at ${formattedHour}:${minute} ${ampm}`;
    };

    const renderTasks = () => {
        document.querySelectorAll('.task-list').forEach(list => list.innerHTML = '');
        const searchTerm = searchBar.value.toLowerCase(); const priorityFilter = filterPriority.value;
        const filteredTasks = tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchTerm) || (task.description && task.description.toLowerCase().includes(searchTerm));
            const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
            return matchesSearch && matchesPriority;
        });
        filteredTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task card card-body mb-3 shadow-sm ${task.priority}`;
            taskElement.setAttribute('draggable', 'true'); taskElement.dataset.id = task.id;
            const resourceLink = task.resourceUrl ? `<a href="${task.resourceUrl}" target="_blank" class="btn btn-sm btn-outline-secondary"><i class="bi bi-link-45deg"></i></a>` : '';
            taskElement.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <h6 class="card-title mb-1">${task.title}</h6>
                    <div class="task-actions d-flex gap-2">
                        ${resourceLink}
                        <button class="btn btn-sm btn-outline-secondary edit-btn"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-outline-danger delete-btn"><i class="bi bi-trash"></i></button>
                    </div>
                </div>
                <p class="card-text small text-muted">${task.description || '&nbsp;'}</p>
                <div class="small text-muted">Due: ${task.dueDate} ${formatTime(task.dueTime)}</div>`;
            taskElement.addEventListener('dragstart', () => { draggedTaskId = task.id; taskElement.classList.add('is-dragging'); });
            taskElement.addEventListener('dragend', () => { taskElement.classList.remove('is-dragging'); draggedTaskId = null; });
            taskElement.querySelector('.edit-btn').addEventListener('click', () => openEditModal(task));
            taskElement.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));
            document.getElementById(`${task.status}-tasks`).appendChild(taskElement);
        });
    };

    const openEditModal = (task) => {
        document.getElementById('edit-task-id').value = task.id;
        document.getElementById('edit-task-title').value = task.title;
        document.getElementById('edit-task-description').value = task.description;
        document.getElementById('edit-task-due-date').value = task.dueDate;
        document.getElementById('edit-task-due-time').value = task.dueTime;
        document.getElementById('edit-task-resource-url').value = task.resourceUrl;
        document.getElementById('edit-task-category').value = task.category;
        document.getElementById('edit-task-priority').value = task.priority;
        editTaskModal.show();
    };
    const deleteTask = (taskId) => {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(t => t.id !== taskId); saveTasks(); renderTasks();
        }
    };

    editTaskForm.addEventListener('submit', (e) => {
        e.preventDefault(); const taskId = parseInt(document.getElementById('edit-task-id').value);
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
            tasks[taskIndex] = {
                ...tasks[taskIndex], title: document.getElementById('edit-task-title').value,
                description: document.getElementById('edit-task-description').value, dueDate: document.getElementById('edit-task-due-date').value,
                dueTime: document.getElementById('edit-task-due-time').value, resourceUrl: document.getElementById('edit-task-resource-url').value,
                category: document.getElementById('edit-task-category').value, priority: document.getElementById('edit-task-priority').value,
            };
            saveTasks(); renderTasks(); editTaskModal.hide();
        }
    });

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTask = {
            id: Date.now(), title: document.getElementById('task-title').value, description: document.getElementById('task-description').value,
            dueDate: document.getElementById('task-due-date').value, dueTime: document.getElementById('task-due-time').value,
            resourceUrl: document.getElementById('task-resource-url').value, category: document.getElementById('task-category').value,
            priority: document.getElementById('task-priority').value, status: 'todo'
        };
        tasks.push(newTask); saveTasks(); renderTasks(); taskForm.reset();
        new bootstrap.Collapse(document.getElementById('collapseOne'), { toggle: false }).hide();
    });
    
    searchBar.addEventListener('input', renderTasks); filterPriority.addEventListener('change', renderTasks);
    taskColumns.forEach(column => {
        const list = column.querySelector('.task-list');
        column.addEventListener('dragenter', (e) => { e.preventDefault(); column.classList.add('drag-over'); });
        column.addEventListener('dragover', (e) => { e.preventDefault(); });
        column.addEventListener('dragleave', () => { column.classList.remove('drag-over'); });
        column.addEventListener('drop', (e) => {
            e.preventDefault(); column.classList.remove('drag-over'); if (!draggedTaskId) return;
            const task = tasks.find(t => t.id === draggedTaskId);
            if (task) {
                const newStatus = list.dataset.status; const oldStatus = task.status;
                if (oldStatus !== 'done' && newStatus === 'done') {
                    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
                }
                task.status = newStatus; task.completedDate = newStatus === 'done' ? new Date().toISOString() : null;
                saveTasks(); renderTasks();
            }
        });
    });
    renderTasks();
});