let currentPage = 'home';
let tasks = [];
let editingTaskId = null;

// Pomodoro Timer Variables
let timerMinutes = 25;
let timerSeconds = 0;
let isTimerActive = false;
let timerInterval = null;
let sessionType = 'focus';
let cycleCount = 0;
let sessionCount = 0;
let isInCycleMode = false;
let currentCyclePhase = 'focus';

// Sound notifications
let bellSound = new Audio('bell.m4a');
let fahhSound = new Audio('fahh.m4a');

// NEW FEATURES PAVITRAN - Feedback system variables
let feedbacks = [];
let selectedRating = 0;

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    initializeNavigation();
    initializePomodoro();
    initializeTodo();
    renderTasks();
    // NEW FEATURES PAVITRAN - Initialize feedback system
    initializeFeedback();
    loadFeedbacks();
    updateFeedbackSummary();
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

// Pomodoro Timer
function initializePomodoro() {
    const sessionButtons = document.querySelectorAll('.session-btn');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const resetBtn = document.getElementById('reset-btn');
    const timerResetBtn = document.getElementById('timer-reset-btn');
    const cycleResetBtnInline = document.getElementById('cycle-reset-btn-inline');
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
            
            if (sessionType === 'custom-cycle') {
                isInCycleMode = true;
                currentCyclePhase = 'focus';
                showCycleMode();
                timerMinutes = 25;
            } else {
                isInCycleMode = false;
                hideCycleMode();
                
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
    timerResetBtn.addEventListener('click', resetTimer);
    cycleResetBtnInline.addEventListener('click', resetCycleCount);
    resetSessionBtn.addEventListener('click', resetSessionCount);
    decreaseBtn.addEventListener('click', () => adjustMinutes(-1));
    increaseBtn.addEventListener('click', () => adjustMinutes(1));
    decreaseCycleBtn.addEventListener('click', () => adjustCycle(-1));
    increaseCycleBtn.addEventListener('click', () => adjustCycle(1));
    
    document.getElementById('stop-btn').classList.remove('hidden');
    document.getElementById('stop-btn').disabled = true;
}

function showCycleMode() {
    document.getElementById('cycle-display').style.display = 'flex';
    document.getElementById('time-adjust-controls').style.display = 'none';
    document.getElementById('reset-btn').classList.add('hidden');
    document.getElementById('timer-reset-btn').classList.remove('hidden');
    document.getElementById('stop-btn').classList.remove('hidden');
    document.getElementById('stop-btn').disabled = !isTimerActive;
}

function hideCycleMode() {
    document.getElementById('cycle-display').style.display = 'none';
    document.getElementById('time-adjust-controls').style.display = 'flex';
    document.getElementById('reset-btn').classList.remove('hidden');
    document.getElementById('timer-reset-btn').classList.add('hidden');
    
    if (sessionType === 'focus') {
        document.getElementById('stop-btn').classList.remove('hidden');
        document.getElementById('stop-btn').disabled = !isTimerActive;
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
    document.getElementById('stop-btn').disabled = false;

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

function playSound(sound) {
    sound.currentTime = 0;
    sound.play().catch(error => {
        console.log('Sound play failed:', error);
    });
}

function handleTimerComplete() {
    stopTimer();

    if (isInCycleMode) {
        if (currentCyclePhase === 'focus') {
            playSound(bellSound);
            
            sessionCount++;
            updateSessionCount();

            currentCyclePhase = 'break';
            timerMinutes = 5;
            timerSeconds = 0;
            updateTimerDisplay();
            
            setTimeout(() => {
                alert('Focus session complete! Starting short break.');
                startTimer();
            }, 100);
        } else {
            playSound(fahhSound);
            
            setTimeout(() => {
                handleCycleComplete();
            }, 100);
        }
    } else if (sessionType === 'focus') {
        playSound(bellSound);
        
        sessionCount++;
        updateSessionCount();
        
        setTimeout(() => {
            alert('Session complete!');
        }, 100);
    } else if (sessionType === 'short-break' || sessionType === 'long-break') {
        playSound(fahhSound);
        
        setTimeout(() => {
            alert('Session complete!');
        }, 100);
    } else {
        alert('Session complete!');
    }
}

function handleCycleComplete() {
    if (cycleCount > 0) {
        cycleCount--;
        updateCycleDisplay();
    }

    if (cycleCount > 0) {
        currentCyclePhase = 'focus';
        timerMinutes = 25;
        timerSeconds = 0;
        updateTimerDisplay();
        
        setTimeout(() => {
            alert('Break complete! Starting next focus session.');
            startTimer();
        }, 100);
    } else {
        currentCyclePhase = 'focus';
        timerMinutes = 25;
        timerSeconds = 0;
        updateTimerDisplay();
        
        setTimeout(() => {
            alert('All cycles complete! Great work!');
        }, 100);
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
    document.getElementById('stop-btn').disabled = true;
}

function stopTimerAndCount() {
    stopTimer();

    if (isInCycleMode) {
        if (currentCyclePhase === 'focus') {
            playSound(bellSound);
            
            sessionCount++;
            updateSessionCount();

            currentCyclePhase = 'break';
            timerMinutes = 5;
            timerSeconds = 0;
            updateTimerDisplay();
            
            setTimeout(() => {
                alert('Focus session stopped! Starting short break.');
                startTimer();
            }, 100);
        } else {
            playSound(fahhSound);
            
            setTimeout(() => {
                handleCycleComplete();
            }, 100);
        }
    } else if (sessionType === 'focus') {
        playSound(bellSound);
        
        sessionCount++;
        updateSessionCount();
        timerMinutes = 25;
        timerSeconds = 0;
        updateTimerDisplay();
    }
}

function resetTimer() {
    stopTimer();

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

function loadTasks() {
    const savedTasks = localStorage.getItem('productivityTasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
}

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
        saveTasks();
        renderTasks();

        document.getElementById('add-task-form').classList.add('hidden');
        document.getElementById('show-add-task').classList.remove('hidden');
        clearTaskForm();
    }
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    editingTaskId = id;

    document.getElementById('task-text').value = task.text;
    document.getElementById('task-date').value = task.date || '';
    document.getElementById('task-priority').value = task.priority || '';
    document.getElementById('task-reminder').value = task.reminder || '';

    document.querySelector('#add-task-form h3').textContent = 'Edit Task';
    document.getElementById('add-task-btn').textContent = 'Update Task';

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

        saveTasks();
        renderTasks();

        document.getElementById('add-task-form').classList.add('hidden');
        document.getElementById('show-add-task').classList.remove('hidden');
        clearTaskForm();

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
    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
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

    const priorityOrder = { '1st': 1, '2nd': 2, '3rd': 3, '4th': 4, '': 5 };
    const sortedTasks = [...tasks].sort((a, b) => {
        const priorityA = priorityOrder[a.priority || ''] || 5;
        const priorityB = priorityOrder[b.priority || ''] || 5;
        return priorityA - priorityB;
    });

    sortedTasks.forEach(task => {
        const taskItem = document.createElement('div');

        let priorityClass = '';
        if (task.priority) {
            priorityClass = ` priority-${task.priority}`;
        }

        taskItem.className = 'task-item' + (task.completed ? ' completed' : '') + priorityClass;

        let priorityBadge = '';
        if (task.priority) {
            priorityBadge = `<span class="priority-badge priority-${task.priority}">${task.priority}</span>`;
        }

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

// NEW FEATURES PAVITRAN - Feedback System Functions
function initializeFeedback() {
    const stars = document.querySelectorAll('.star');
    const feedbackForm = document.getElementById('feedback-form');

    // Star rating interaction
    stars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.getAttribute('data-rating'));
            document.getElementById('rating-value').value = selectedRating;
            updateStarDisplay();
        });

        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            highlightStars(rating);
        });
    });

    document.getElementById('star-rating').addEventListener('mouseleave', function() {
        updateStarDisplay();
    });

    // Form submission
    feedbackForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitFeedback();
    });
}

function highlightStars(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('filled');
            star.textContent = '★';
        } else {
            star.classList.remove('filled');
            star.textContent = '☆';
        }
    });
}

function updateStarDisplay() {
    highlightStars(selectedRating);
}

function submitFeedback() {
    const name = document.getElementById('feedback-name').value.trim();
    const email = document.getElementById('feedback-email').value.trim();
    const phone = document.getElementById('feedback-phone').value.trim();
    const category = document.getElementById('feedback-category').value;
    const message = document.getElementById('feedback-message').value.trim();

    if (!name || !email || !message || selectedRating === 0) {
        alert('Please fill in all required fields and select a rating!');
        return;
    }

    const newFeedback = {
        id: Date.now(),
        name: name,
        email: email,
        phone: phone,
        category: category,
        message: message,
        rating: selectedRating,
        date: new Date().toISOString()
    };

    feedbacks.push(newFeedback);
    saveFeedbacks();
    updateFeedbackSummary();
    renderReviews();

    // Reset form
    document.getElementById('feedback-form').reset();
    selectedRating = 0;
    updateStarDisplay();

    alert('Thank you for your feedback!');
}

function saveFeedbacks() {
    localStorage.setItem('studre-feedbacks', JSON.stringify(feedbacks));
}

function loadFeedbacks() {
    const saved = localStorage.getItem('studre-feedbacks');
    if (saved) {
        feedbacks = JSON.parse(saved);
    }
    renderReviews();
}

function updateFeedbackSummary() {
    const totalReviews = feedbacks.length;
    const averageRating = totalReviews > 0 
        ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalReviews).toFixed(1)
        : '0.0';

    document.getElementById('total-reviews').textContent = totalReviews;
    document.getElementById('average-rating').textContent = averageRating;

    // Update stars display
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 >= 0.5;
    let starsHTML = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            starsHTML += '★';
        } else if (i === fullStars && hasHalfStar) {
            starsHTML += '★';
        } else {
            starsHTML += '☆';
        }
    }
    
    document.getElementById('average-stars').textContent = starsHTML;
}

function renderReviews() {
    const reviewsList = document.getElementById('reviews-list');
    
    if (feedbacks.length === 0) {
        reviewsList.innerHTML = '<p class="no-reviews">No reviews yet. Be the first to share your feedback!</p>';
        return;
    }

    // Sort by date (newest first) and take last 5
    const recentFeedbacks = [...feedbacks]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    reviewsList.innerHTML = recentFeedbacks.map(feedback => {
        const date = new Date(feedback.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });

        const stars = '★'.repeat(feedback.rating) + '☆'.repeat(5 - feedback.rating);

        return `
            <div class="review-card">
                <div class="review-header">
                    <span class="reviewer-name">${feedback.name}</span>
                    <span class="review-rating">${stars}</span>
                </div>
                <span class="review-category">${feedback.category}</span>
                <p class="review-message">${feedback.message}</p>
                <span class="review-date">${formattedDate}</span>
            </div>
        `;
    }).join('');
}