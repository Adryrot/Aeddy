let currentPage = 'home';
let tasks = [
    { id: 1, text: 'Task 1 Checklist button', completed: false },
    { id: 2, text: 'Task 2 Checklist button', completed: false }
];
let timerMinutes = 25;
let timerSeconds = 0;
let isTimerActive = false;
let timerInterval = null;
let sessionType = 'focus';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
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
        btn.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            navigateToPage(page);
        });
    });
    
    featureCards.forEach(card => {
        card.addEventListener('click', function() {
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

// Pomodoro Timer
function initializePomodoro() {
    const sessionButtons = document.querySelectorAll('.session-btn');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const decreaseBtn = document.getElementById('decrease-min');
    const increaseBtn = document.getElementById('increase-min');
    
    sessionButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            sessionButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            sessionType = this.getAttribute('data-session');
            stopTimer();
            timerMinutes = sessionType === 'focus' ? 25 : 5;
            timerSeconds = 0;
            updateTimerDisplay();
        });
    });
    
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    decreaseBtn.addEventListener('click', () => adjustMinutes(-1));
    increaseBtn.addEventListener('click', () => adjustMinutes(1));
}

function startTimer() {
    isTimerActive = true;
    document.getElementById('start-btn').classList.add('hidden');
    document.getElementById('pause-btn').classList.remove('hidden');
    
    timerInterval = setInterval(() => {
        if (timerSeconds === 0) {
            if (timerMinutes === 0) {
                stopTimer();
                alert('Session complete!');
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

function pauseTimer() {
    stopTimer();
}

function stopTimer() {
    isTimerActive = false;
    clearInterval(timerInterval);
    document.getElementById('start-btn').classList.remove('hidden');
    document.getElementById('pause-btn').classList.add('hidden');
}

function resetTimer() {
    stopTimer();
    timerMinutes = sessionType === 'focus' ? 25 : 5;
    timerSeconds = 0;
    updateTimerDisplay();
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
    const showAddTaskBtn = document.getElementById('show-add-task');
    const addTaskBtn = document.getElementById('add-task-btn');
    const cancelTaskBtn = document.getElementById('cancel-task-btn');
    const addTaskForm = document.getElementById('add-task-form');
    
    showAddTaskBtn.addEventListener('click', () => {
        showAddTaskBtn.classList.add('hidden');
        addTaskForm.classList.remove('hidden');
    });
    
    addTaskBtn.addEventListener('click', addTask);
    
    cancelTaskBtn.addEventListener('click', () => {
        addTaskForm.classList.add('hidden');
        document.getElementById('show-add-task').classList.remove('hidden');
        clearTaskForm();
    });
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
        renderTasks();
        
        // Hide form and show add button
        document.getElementById('add-task-form').classList.add('hidden');
        document.getElementById('show-add-task').classList.remove('hidden');
        clearTaskForm();
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
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    renderTasks();
}

function renderTasks() {
    const tasksList = document.getElementById('tasks-list');
    tasksList.innerHTML = '';
    
    tasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item' + (task.completed ? ' completed' : '');
        
        taskItem.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask(${task.id})">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
            <button class="task-delete" onclick="deleteTask(${task.id})">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        `;
        
        tasksList.appendChild(taskItem);
    });
}