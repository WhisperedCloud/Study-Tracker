document.addEventListener('DOMContentLoaded', () => {
    const goalForm = document.getElementById('goal-form');
    const goalsList = document.getElementById('goals-list');
    let goals = JSON.parse(localStorage.getItem('goals')) || [];
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    const saveGoals = () => localStorage.setItem('goals', JSON.stringify(goals));
    const saveTasks = () => localStorage.setItem('tasks', JSON.stringify(tasks));

    const renderGoals = () => {
        goalsList.innerHTML = '';
        if (goals.length === 0) {
            goalsList.innerHTML = `<div class="text-center text-muted p-4">No goals set yet. Add one to get started!</div>`;
            return;
        }

        goals.forEach(goal => {
            const goalElement = document.createElement('div');
            goalElement.className = 'card shadow-sm goal-card';
            goalElement.dataset.id = goal.id;
            const unlinkedTasks = tasks.filter(task => !task.goalId);
            let taskOptions = unlinkedTasks.map(task => `<option value="${task.id}">${task.title}</option>`).join('');
            const linkedTasks = tasks.filter(task => task.goalId === goal.id);
            let linkedTasksHtml = linkedTasks.length > 0 ? '<ul class="list-group list-group-flush">' + linkedTasks.map(t => `<li class="list-group-item small">${t.title} <span class="badge bg-secondary float-end">${t.status}</span></li>`).join('') + '</ul>' : '<p class="text-muted small p-2">No tasks linked yet.</p>';
            const doneTasksCount = linkedTasks.filter(t => t.status === 'done').length;
            const progress = linkedTasks.length > 0 ? (doneTasksCount / linkedTasks.length) * 100 : 0;

            goalElement.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <h5 class="card-title">${goal.title}</h5>
                        <button class="btn-close delete-goal-btn"></button>
                    </div>
                    <p class="card-text small text-muted">${goal.description}</p>
                    <div class="progress mb-2" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">
                        <div class="progress-bar bg-success" style="width: ${progress}%;"></div>
                    </div>
                    <p class="small mb-2"><strong>Linked Tasks:</strong> (${doneTasksCount}/${linkedTasks.length})</p>
                    ${linkedTasksHtml}
                    <div class="input-group mt-3">
                         <select class="form-select task-to-link" ${unlinkedTasks.length === 0 ? 'disabled' : ''}>
                            <option value="">${unlinkedTasks.length === 0 ? 'No tasks to link' : '-- Select a task --'}</option>
                            ${taskOptions}
                        </select>
                        <button class="btn btn-outline-primary link-task-btn">Link Task</button>
                    </div>
                </div>`;
            
            goalsList.appendChild(goalElement);
        });

        document.querySelectorAll('.link-task-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const goalId = parseInt(e.target.closest('.goal-card').dataset.id);
                const selectElement = e.target.previousElementSibling;
                const taskId = parseInt(selectElement.value);
                if (!taskId) return;
                
                const task = tasks.find(t => t.id === taskId);
                if (task) {
                    task.goalId = goalId;
                    saveTasks();
                    renderGoals();
                }
            });
        });
        
        document.querySelectorAll('.delete-goal-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                if (confirm("Are you sure you want to delete this goal? This will also unlink its tasks.")) {
                    const goalId = parseInt(e.target.closest('.goal-card').dataset.id);
                    goals = goals.filter(g => g.id !== goalId);
                    tasks.forEach(t => { if (t.goalId === goalId) delete t.goalId; });
                    
                    saveGoals();
                    saveTasks();
                    renderGoals();
                }
            });
        });
    };

    goalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newGoal = {
            id: Date.now(),
            title: document.getElementById('goal-title').value,
            description: document.getElementById('goal-description').value,
        };
        goals.push(newGoal);
        saveGoals();
        renderGoals();
        goalForm.reset();
    });

    renderGoals();
});