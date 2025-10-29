document.addEventListener('DOMContentLoaded', () => {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentTasks = tasks.filter(task => 
        task.status === 'done' && 
        task.completedDate && 
        new Date(task.completedDate) >= sevenDaysAgo
    );

    document.getElementById('completed-count').textContent = recentTasks.length;

    const dayCounts = {};
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    recentTasks.forEach(task => {
        const dayName = daysOfWeek[new Date(task.completedDate).getDay()];
        dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
    });

    let mostProductiveDay = '-';
    let maxTasks = 0;
    for (const day in dayCounts) {
        if (dayCounts[day] > maxTasks) {
            maxTasks = dayCounts[day];
            mostProductiveDay = day;
        }
    }
    document.getElementById('productive-day').textContent = mostProductiveDay;

    const categoryCounts = {};
    recentTasks.forEach(task => {
        const category = task.category || 'Uncategorized';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const categoryLabels = Object.keys(categoryCounts);
    const categoryData = Object.values(categoryCounts);
    
    const ctx = document.getElementById('category-chart').getContext('2d');
    if(window.categoryChart) window.categoryChart.destroy();
    window.categoryChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categoryLabels,
            datasets: [{
                data: categoryData,
                backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#dc3545'],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
});