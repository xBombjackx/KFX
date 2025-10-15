let state = {};

// StreamElements widget lifecycle event
window.addEventListener('onWidgetLoad', function (obj) {
    const fieldData = obj.detail.fieldData;
    init(fieldData);
});

// Initialize the widget state and render the initial view
function init(fieldData) {
    // Set up the initial state from StreamElements configuration
    state = {
        streamerSummary: fieldData.streamerSummary,
        streamerTasks: parseStreamerTasks(fieldData.streamerTasks),
        viewerTasks: {
            pending: [],
            approved: []
        },
        progress: 0,
        config: {
            taskLimit: fieldData.taskLimit,
            textColor: fieldData.textColor,
            backgroundColor: fieldData.backgroundColor,
            progressBarColor: fieldData.progressBarColor
        }
    };

    renderStreamerTasks();
    renderViewerTasks();
    renderProgressBar();
    applyStyles();
}

// Parse the streamer's tasks from the config field (one task per line)
function parseStreamerTasks(tasksString) {
    return tasksString.split('\n').map(task => ({
        title: task.trim(),
        completed: false
    })).filter(task => task.title !== '');
}

// Render the streamer's task list to the HTML
function renderStreamerTasks() {
    const summaryElement = document.getElementById('streamer-summary');
    const taskListElement = document.getElementById('streamer-task-list');

    summaryElement.innerText = state.streamerSummary;
    taskListElement.innerHTML = '';

    state.streamerTasks.forEach(task => {
        const li = document.createElement('li');
        li.innerText = task.title;
        if (task.completed) {
            li.classList.add('completed');
        }
        taskListElement.appendChild(li);
    });
}

// Apply custom styles from the widget configuration
function applyStyles() {
    const body = document.body;
    body.style.color = state.config.textColor;
    body.style.backgroundColor = state.config.backgroundColor;

    const progressBar = document.getElementById('progress-bar');
    progressBar.style.backgroundColor = state.config.progressBarColor;
}

// StreamElements event listener for chat commands
window.addEventListener('onEventReceived', function (obj) {
    if (obj.detail.listener === 'viewer-joined') {
        handleViewerPresence(obj.detail.event.username, 'join');
        return;
    }

    if (obj.detail.listener === 'viewer-left') {
        handleViewerPresence(obj.detail.event.username, 'part');
        return;
    }

    if (obj.detail.listener !== 'message') return;
    const data = obj.detail.event.data;
    const command = data.text.split(' ')[0];
    const args = data.text.substring(command.length + 1);
    const user = data.displayName;
    const userState = {
        isMod: data.tags.mod === "1",
        isStreamer: user.toLowerCase() === obj.detail.channel.username.toLowerCase()
    };

    if (command === '!donestreamer' && (userState.isMod || userState.isStreamer)) {
        completeStreamerTaskByTitle(args);
    } else if (command === '!task') {
        addViewerTask(user, args);
    } else if (command === '!approve' && (userState.isMod || userState.isStreamer)) {
        approveViewerTask(args);
    } else if (command === '!reject' && (userState.isMod || userState.isStreamer)) {
        rejectViewerTask(args);
    } else if (command === '!status') {
        updateViewerTaskStatus(user, args);
    } else if (command === '!resetday' && (userState.isMod || userState.isStreamer)) {
        resetDay();
    }
});

function updateViewerTaskStatus(user, status) {
    const task = state.viewerTasks.approved.find(t => t.user.toLowerCase() === user.toLowerCase());
    if (!task) {
        sendChatMessage(`@${user}, you do not have an active task to update.`);
        return;
    }

    const newStatus = status.toLowerCase();
    if (newStatus !== 'complete' && newStatus !== 'pause') {
        sendChatMessage(`@${user}, invalid status. Use 'complete' or 'pause'.`);
        return;
    }

    if (newStatus === 'pause') {
        task.status = 'paused';
        sendChatMessage(`@${user}, your task is now paused.`);
    } else if (newStatus === 'complete') {
        task.status = 'completed';
        sendChatMessage(`@${user}, congratulations on completing your task!`);
        incrementProgress();
    }

    renderViewerTasks();
}

function approveViewerTask(viewerName) {
    if (state.viewerTasks.approved.length >= state.config.taskLimit) {
        sendChatMessage(`Approval failed: Viewer task list is full (max ${state.config.taskLimit}).`);
        return;
    }

    const pendingIndex = state.viewerTasks.pending.findIndex(t => t.user.toLowerCase() === viewerName.toLowerCase());
    if (pendingIndex === -1) {
        sendChatMessage(`Approval failed: No pending task found for "${viewerName}".`);
        return;
    }

    const [taskToApprove] = state.viewerTasks.pending.splice(pendingIndex, 1);
    taskToApprove.status = 'approved';
    state.viewerTasks.approved.push(taskToApprove);

    sendChatMessage(`@${taskToApprove.user}, your task has been approved!`);
    renderViewerTasks();
}

function renderViewerTasks() {
    const taskListElement = document.getElementById('viewer-task-list');
    taskListElement.innerHTML = '';

    state.viewerTasks.approved.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="viewer-name">[${task.user}]</span> ${task.title}`;

        if (task.status === 'completed') {
            li.classList.add('completed');
        } else if (task.status === 'paused') {
            li.classList.add('paused');
        }
        if (task.offline) {
            li.classList.add('offline');
        }

        taskListElement.appendChild(li);
    });
}

function rejectViewerTask(viewerName) {
    const pendingIndex = state.viewerTasks.pending.findIndex(t => t.user.toLowerCase() === viewerName.toLowerCase());
    if (pendingIndex === -1) {
        sendChatMessage(`Rejection failed: No pending task found for "${viewerName}".`);
        return;
    }

    const [rejectedTask] = state.viewerTasks.pending.splice(pendingIndex, 1);
    sendChatMessage(`@${rejectedTask.user}, your task has been rejected.`);
}

function addViewerTask(user, taskTitle) {
    if (!taskTitle) return; // Ignore empty tasks

    // Prevent duplicate tasks from the same user
    const existingTask = state.viewerTasks.pending.find(t => t.user === user);
    if (existingTask) {
        sendChatMessage(`@${user}, you already have a task pending approval.`);
        return;
    }
    const existingApprovedTask = state.viewerTasks.approved.find(t => t.user === user);
    if(existingApprovedTask) {
        sendChatMessage(`@${user}, you already have an active task.`);
        return;
    }


    state.viewerTasks.pending.push({
        user: user,
        title: taskTitle,
        status: 'pending', // pending, approved, completed, paused
        offline: false
    });

    sendChatMessage(`@${user}, your task "${taskTitle}" has been received and is pending approval!`);
    // In a real environment, you'd also need a way for mods to see the pending queue.
    // For now, we'll just add it to the state.
}

function sendChatMessage(message) {
    // SE.api.get('chatbot.say', { message: message });
    console.log(`CHATBOT: ${message}`); // Keep for local testing
}

function completeStreamerTaskByTitle(taskTitle) {
    const task = state.streamerTasks.find(t => t.title.toLowerCase() === taskTitle.toLowerCase());
    if (task && !task.completed) {
        task.completed = true;
        incrementProgress();
        renderStreamerTasks();
    }
}

// This function is intended to be triggered by a custom field in the widget config
function completeStreamerTaskByIndex(index) {
    if (state.streamerTasks[index] && !state.streamerTasks[index].completed) {
        state.streamerTasks[index].completed = true;
        incrementProgress();
        renderStreamerTasks();
    }
}

function incrementProgress() {
    state.progress++;
    renderProgressBar();
}

function renderProgressBar() {
    const maxProgress = 12; // As per PDD
    const percentage = Math.min((state.progress / maxProgress) * 100, 100);

    const progressBar = document.getElementById('progress-bar');
    const progressBarText = document.getElementById('progress-bar-text');

    progressBar.style.width = `${percentage}%`;
    progressBarText.innerText = `${state.progress}/${maxProgress} Tasks Completed`;

    // PDD: Tier Completion Feedback (basic version)
    if (state.progress === 3 || state.progress === 7 || state.progress === 12) {
        sendChatMessage(`Focus Bar TIER REACHED! (${state.progress}/${maxProgress})`);
        // Visual effect for tier completion can be added here
    }
}


function handleViewerPresence(username, action) {
    const task = state.viewerTasks.approved.find(t => t.user.toLowerCase() === username.toLowerCase());
    if (!task) return;

    task.offline = (action === 'part');
    renderViewerTasks();
}

function resetDay() {
    state.streamerTasks.forEach(t => t.completed = false);
    state.viewerTasks.pending = [];
    state.viewerTasks.approved = [];
    state.progress = 0;

    renderStreamerTasks();
    renderViewerTasks();
    renderProgressBar();
    sendChatMessage('A new day has begun! All tasks have been reset.');
}

console.log('CST Widget Logic Loaded');