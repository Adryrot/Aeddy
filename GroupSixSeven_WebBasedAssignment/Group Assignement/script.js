let currentPage = 'home';
let tasks = [];
let editingTaskId = null;


// Pomodoro Timer Variables - CONSOLIDATED
let timerMinutes = 25;
let timerSeconds = 0;
let isTimerActive = false;
let timerInterval = null;
let sessionType = 'focus';
let cycleCount = 0;
let sessionCount = 0;
let isInCycleMode = false;
let currentCyclePhase = 'focus';

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    initializeNavigation();
    initializePomodoro();
    initializeTodo();
    renderTasks();
});

// Navigation
function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const featureCards = document.querySelectorAll('.feature-card');

    navButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const page = this.getAttribute('data-page');
            navigateToPage(page);
        });
    });

    featureCards.forEach(card => {
        card.addEventListener('click', function () {
            const page = this.getAttribute('data-navigate');
            navigateToPage(page);
        });
    });
}

function navigateToPage(page) {
    currentPage = page;

    // Update active nav button
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-page') === page) {
            btn.classList.add('active');
        }
    });

    // Show active page
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    document.getElementById(page + '-page').classList.add('active');
}

// Pomodoro Timer -- adjusted
// Pomodoro Timer
function initializePomodoro() {
    const sessionButtons = document.querySelectorAll('.session-btn');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const resetBtn = document.getElementById('reset-btn');
    const cycleResetBtn = document.getElementById('cycle-reset-btn');
    const resetSessionBtn = document.getElementById('reset-session-btn');
    const decreaseBtn = document.getElementById('decrease-min');
    const increaseBtn = document.getElementById('increase-min');
    const decreaseCycleBtn = document.getElementById('decrease-cycle');
    const increaseCycleBtn = document.getElementById('increase-cycle');
    
    sessionButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            sessionButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            sessionType = this.getAttribute('data-session');
            stopTimer();
            
            // Check if Custom Cycle mode
            if (sessionType === 'custom-cycle') {
                isInCycleMode = true;
                currentCyclePhase = 'focus';
                showCycleMode();
                timerMinutes = 25;
            } else {
                isInCycleMode = false;
                hideCycleMode();
                
                // Set different durations based on session type
                if (sessionType === 'focus') {
                    timerMinutes = 25;
                } else if (sessionType === 'short-break') {
                    timerMinutes = 5;
                } else if (sessionType === 'long-break') {
                    timerMinutes = 15;
                }
            }
            
            timerSeconds = 0;
            updateTimerDisplay();
        });
    });
    
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    stopBtn.addEventListener('click', stopTimerAndCount);
    resetBtn.addEventListener('click', resetTimer);
    cycleResetBtn.addEventListener('click', resetCycleCount);
    resetSessionBtn.addEventListener('click', resetSessionCount);
    decreaseBtn.addEventListener('click', () => adjustMinutes(-1));
    increaseBtn.addEventListener('click', () => adjustMinutes(1));
    decreaseCycleBtn.addEventListener('click', () => adjustCycle(-1));
    increaseCycleBtn.addEventListener('click', () => adjustCycle(1));
}

function showCycleMode() {
    document.getElementById('cycle-display').style.display = 'block';
    document.getElementById('time-adjust-controls').style.display = 'none';
    document.getElementById('reset-btn').classList.add('hidden');
    document.getElementById('cycle-reset-btn').classList.remove('hidden');
    document.getElementById('stop-btn').classList.remove('hidden');
}

function hideCycleMode() {
    document.getElementById('cycle-display').style.display = 'none';
    document.getElementById('time-adjust-controls').style.display = 'flex';
    document.getElementById('reset-btn').classList.remove('hidden');
    document.getElementById('cycle-reset-btn').classList.add('hidden');
    
    // Show stop button only for focus session
    if (sessionType === 'focus') {
        document.getElementById('stop-btn').classList.remove('hidden');
    } else {
        document.getElementById('stop-btn').classList.add('hidden');
    }
}

function adjustCycle(delta) {
    cycleCount = Math.max(0, Math.min(99, cycleCount + delta));
    updateCycleDisplay();
}

function updateCycleDisplay() {
    document.getElementById('cycle-count').textContent = String(cycleCount).padStart(2, '0');
}

function updateSessionCount() {
    document.getElementById('session-count').textContent = sessionCount;
}

function resetSessionCount() {
    sessionCount = 0;
    updateSessionCount();
}
function startTimer() {
    isTimerActive = true;
    document.getElementById('start-btn').classList.add('hidden');
    document.getElementById('pause-btn').classList.remove('hidden');
    
    timerInterval = setInterval(() => {
        if (timerSeconds === 0) {
            if (timerMinutes === 0) {
                handleTimerComplete();
            } else {
                timerMinutes--;
                timerSeconds = 59;
            }
        } else {
            timerSeconds--;
        }
        updateTimerDisplay();
    }, 1000);
}

function handleTimerComplete() {
    stopTimer();
    
    if (isInCycleMode) {
        if (currentCyclePhase === 'focus') {
            // Focus phase complete, increment session count
            sessionCount++;
            updateSessionCount();
            
            // Switch to break phase
            currentCyclePhase = 'break';
            timerMinutes = 5;
            timerSeconds = 0;
            updateTimerDisplay();
            alert('Focus session complete! Starting short break.');
            startTimer(); // Auto-start break
        } else {
            // Break phase complete, decrement cycle and check if more cycles remain
            handleCycleComplete();
        }
    } else if (sessionType === 'focus') {
        // Regular focus session complete
        sessionCount++;
        updateSessionCount();
        alert('Session complete!');
    } else {
        // Break session complete
        alert('Session complete!');
    }
}

function handleCycleComplete() {
    // Decrement cycle count by 1
    if (cycleCount > 0) {
        cycleCount--;
        updateCycleDisplay();
    }
    
    // Check if there are more cycles to complete
    if (cycleCount > 0) {
        // Continue with next cycle
        currentCyclePhase = 'focus';
        timerMinutes = 25;
        timerSeconds = 0;
        updateTimerDisplay();
        alert('Break complete! Starting next focus session.');
        startTimer(); // Auto-start next focus session
    } else {
        // All cycles complete
        currentCyclePhase = 'focus';
        timerMinutes = 25;
        timerSeconds = 0;
        updateTimerDisplay();
        alert('All cycles complete! Great work!');
    }
}

function pauseTimer() {
    stopTimer();
}

function stopTimer() {
    isTimerActive = false;
    clearInterval(timerInterval);
    document.getElementById('start-btn').classList.remove('hidden');
    document.getElementById('pause-btn').classList.add('hidden');
}

function stopTimerAndCount() {
    stopTimer();
    
    if (isInCycleMode) {
        // In custom cycle mode
        if (currentCyclePhase === 'focus') {
            // Stop button clicked during focus phase
            sessionCount++;
            updateSessionCount();
            
            // Switch to break phase
            currentCyclePhase = 'break';
            timerMinutes = 5;
            timerSeconds = 0;
            updateTimerDisplay();
            alert('Focus session stopped! Starting short break.');
            startTimer(); // Auto-start break
        } else {
            // Stop button clicked during break phase
            // Break phase complete, decrement cycle and check if more cycles remain
            handleCycleComplete();
        }
    } else if (sessionType === 'focus') {
        // Regular focus session - just add session count
        sessionCount++;
        updateSessionCount();
        timerMinutes = 25;
        timerSeconds = 0;
        updateTimerDisplay();
    }
}

function resetTimer() {
    stopTimer();
    
    // Reset to the appropriate default time based on session type
    if (sessionType === 'focus') {
        timerMinutes = 25;
    } else if (sessionType === 'short-break') {
        timerMinutes = 5;
    } else if (sessionType === 'long-break') {
        timerMinutes = 15;
    }
    
    timerSeconds = 0;
    updateTimerDisplay();
}

function resetCycleCount() {
    cycleCount = 0;
    updateCycleDisplay();
}
function adjustMinutes(delta) {
    timerMinutes = Math.max(0, Math.min(99, timerMinutes + delta));
    updateTimerDisplay();
}

function updateTimerDisplay() {
    document.getElementById('minutes').textContent = String(timerMinutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(timerSeconds).padStart(2, '0');
}

// To-Do List
function initializeTodo() {
    // Load tasks from localStorage
    loadTasks();

    const showAddTaskBtn = document.getElementById('show-add-task');
    const addTaskBtn = document.getElementById('add-task-btn');
    const cancelTaskBtn = document.getElementById('cancel-task-btn');
    const addTaskForm = document.getElementById('add-task-form');

    showAddTaskBtn.addEventListener('click', () => {
        showAddTaskBtn.classList.add('hidden');
        addTaskForm.classList.remove('hidden');
        editingTaskId = null;
        document.querySelector('#add-task-form h3').textContent = 'Add New Task';
        document.getElementById('add-task-btn').textContent = 'Add Task';
        clearTaskForm();
    });

    addTaskBtn.addEventListener('click', () => {
        if (editingTaskId) {
            updateTask();
        } else {
            addTask();
        }
    });

    cancelTaskBtn.addEventListener('click', () => {
        addTaskForm.classList.add('hidden');
        document.getElementById('show-add-task').classList.remove('hidden');
        clearTaskForm();
        editingTaskId = null;
        document.querySelector('#add-task-form h3').textContent = 'Add New Task';
        document.getElementById('add-task-btn').textContent = 'Add Task';
    });
}

// Load tasks from localStorage
function loadTasks() {
    const savedTasks = localStorage.getItem('productivityTasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('productivityTasks', JSON.stringify(tasks));
}

function addTask() {
    const textInput = document.getElementById('task-text');
    const dateInput = document.getElementById('task-date');
    const priorityInput = document.getElementById('task-priority');
    const reminderInput = document.getElementById('task-reminder');

    const text = textInput.value.trim();

    if (text) {
        const newTask = {
            id: Date.now(),
            text: text,
            completed: false,
            date: dateInput.value,
            priority: priorityInput.value,
            reminder: reminderInput.value
        };

        tasks.push(newTask);
        saveTasks(); // Save to localStorage
        renderTasks();

        // Hide form and show add button
        document.getElementById('add-task-form').classList.add('hidden');
        document.getElementById('show-add-task').classList.remove('hidden');
        clearTaskForm();
    }
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    editingTaskId = id;

    // Fill form with task data
    document.getElementById('task-text').value = task.text;
    document.getElementById('task-date').value = task.date || '';
    document.getElementById('task-priority').value = task.priority || '';
    document.getElementById('task-reminder').value = task.reminder || '';

    // Update form title and button text
    document.querySelector('#add-task-form h3').textContent = 'Edit Task';
    document.getElementById('add-task-btn').textContent = 'Update Task';

    // Show form and hide add button
    document.getElementById('show-add-task').classList.add('hidden');
    document.getElementById('add-task-form').classList.remove('hidden');
}

function updateTask() {
    const textInput = document.getElementById('task-text');
    const dateInput = document.getElementById('task-date');
    const priorityInput = document.getElementById('task-priority');
    const reminderInput = document.getElementById('task-reminder');

    const text = textInput.value.trim();

    if (text && editingTaskId) {
        tasks = tasks.map(task =>
            task.id === editingTaskId
                ? {
                    ...task,
                    text: text,
                    date: dateInput.value,
                    priority: priorityInput.value,
                    reminder: reminderInput.value
                }
                : task
        );

        saveTasks(); // Save to localStorage
        renderTasks();

        // Hide form and show add button
        document.getElementById('add-task-form').classList.add('hidden');
        document.getElementById('show-add-task').classList.remove('hidden');
        clearTaskForm();

        // Reset editing state
        editingTaskId = null;
        document.querySelector('#add-task-form h3').textContent = 'Add New Task';
        document.getElementById('add-task-btn').textContent = 'Add Task';
    }
}

function clearTaskForm() {
    document.getElementById('task-text').value = '';
    document.getElementById('task-date').value = '';
    document.getElementById('task-priority').value = '';
    document.getElementById('task-reminder').value = '';
}

function toggleTask(id) {
    tasks = tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks(); // Save to localStorage
    renderTasks();
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks(); // Save to localStorage
        renderTasks();
    }
}

function renderTasks() {
    const tasksList = document.getElementById('tasks-list');
    tasksList.innerHTML = '';

    if (tasks.length === 0) {
        tasksList.innerHTML = '<p style="text-align: center; color: #9ca3af; padding: 2rem; font-size: 1rem;">No tasks yet. Add your first task!</p>';
        return;
    }

    // Sort tasks by priority (1st -> 2nd -> 3rd -> 4th -> no priority)
    const priorityOrder = { '1st': 1, '2nd': 2, '3rd': 3, '4th': 4, '': 5 };
    const sortedTasks = [...tasks].sort((a, b) => {
        const priorityA = priorityOrder[a.priority || ''] || 5;
        const priorityB = priorityOrder[b.priority || ''] || 5;
        return priorityA - priorityB;
    });

    sortedTasks.forEach(task => {
        const taskItem = document.createElement('div');

        // Add priority class to task item
        let priorityClass = '';
        if (task.priority) {
            priorityClass = ` priority-${task.priority}`;
        }

        taskItem.className = 'task-item' + (task.completed ? ' completed' : '') + priorityClass;

        // Create priority badge if priority exists
        let priorityBadge = '';
        if (task.priority) {
            priorityBadge = `<span class="priority-badge priority-${task.priority}">${task.priority}</span>`;
        }

        // Create date badge if date exists
        let dateBadge = '';
        if (task.date) {
            const taskDate = new Date(task.date);
            const formattedDate = taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            dateBadge = `<span style="font-size: 0.875rem; color: #6b7280; margin-left: auto;">📅 ${formattedDate}</span>`;
        }

        taskItem.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask(${task.id})">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
            ${priorityBadge}
            ${dateBadge}
            <button class="task-edit" onclick="editTask(${task.id})" title="Edit task">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="task-delete" onclick="deleteTask(${task.id})" title="Delete task">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        `;

        tasksList.appendChild(taskItem);
    });
}