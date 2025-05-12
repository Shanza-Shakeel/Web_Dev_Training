document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('taskInput');
    const taskDate = document.getElementById('taskDate');
    const taskPriority = document.getElementById('taskPriority');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    
    // Initialize the app
    loadTasks();
    
    // Add task function
    function addTask() {
        const taskText = taskInput.value.trim();
        const dueDate = taskDate.value;
        const priority = taskPriority.value;
        
        if (!taskText) {
            showNotification('Please enter a task!', true);
            return;
        }
        
        createTaskElement({
            id: Date.now(),
            text: taskText,
            completed: false,
            dueDate: dueDate,
            priority: priority
        });
        
        saveTasks();
        showNotification('Task added successfully!');
        taskInput.value = '';
    }
    
    // Create task element
    function createTaskElement(task) {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item priority-${task.priority}`;
        taskItem.dataset.id = task.id;
        
        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', function() {
            taskTextElement.classList.toggle('completed');
            saveTasks();
        });
        
        // Task content container
        const taskContent = document.createElement('div');
        taskContent.className = 'task-content';
        
        // Task text
        const taskTextElement = document.createElement('span');
        taskTextElement.className = 'task-text';
        taskTextElement.textContent = task.text;
        if (task.completed) {
            taskTextElement.classList.add('completed');
        }
        
        // Due date
        if (task.dueDate) {
            const dueDateElement = document.createElement('span');
            dueDateElement.className = 'task-due';
            dueDateElement.textContent = formatDate(task.dueDate);
            taskContent.appendChild(dueDateElement);
        }
        
        // Task actions
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';
        
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', function() {
            editTask(taskItem, taskTextElement);
        });
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', function() {
            taskItem.remove();
            saveTasks();
            showNotification('Task deleted!');
        });
        
        // Append elements
        taskContent.prepend(taskTextElement);
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        
        taskItem.appendChild(checkbox);
        taskItem.appendChild(taskContent);
        taskItem.appendChild(actionsDiv);
        
        taskList.appendChild(taskItem);
    }
    
    // Edit task function
    function editTask(taskItem, taskTextElement) {
        const existingInput = taskItem.querySelector('.edit-input');
        if (existingInput) return;
        
        const currentText = taskTextElement.textContent;
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.className = 'edit-input';
        editInput.value = currentText;
        
        taskTextElement.replaceWith(editInput);
        editInput.focus();
        
        const editBtn = taskItem.querySelector('.edit-btn');
        editBtn.textContent = 'Save';
        
        const saveHandler = function() {
            const newText = editInput.value.trim();
            if (!newText) {
                showNotification('Task cannot be empty!', true);
                return;
            }
            
            taskTextElement.textContent = newText;
            editInput.replaceWith(taskTextElement);
            editBtn.textContent = 'Edit';
            saveTasks();
            showNotification('Task updated!');
            
            editBtn.removeEventListener('click', saveHandler);
            editBtn.addEventListener('click', function() {
                editTask(taskItem, taskTextElement);
            });
        };
        
        editInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') saveHandler();
        });
        
        editBtn.removeEventListener('click', arguments.callee);
        editBtn.addEventListener('click', saveHandler);
    }
    
    // Save tasks to localStorage
    function saveTasks() {
        const tasks = [];
        document.querySelectorAll('.task-item').forEach(taskItem => {
            tasks.push({
                id: taskItem.dataset.id,
                text: taskItem.querySelector('.task-text').textContent,
                completed: taskItem.querySelector('.task-checkbox').checked,
                dueDate: taskItem.querySelector('.task-due')?.textContent ? 
                    taskDate.value : '',
                priority: Array.from(taskItem.classList).find(cls => 
                    cls.startsWith('priority-'))?.replace('priority-', '') || 'medium'
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Load tasks from localStorage
    function loadTasks() {
        const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        savedTasks.forEach(task => {
            createTaskElement(task);
        });
    }
    
    // Format date for display
    function formatDate(dateString) {
        if (!dateString) return '';
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        return `Due: ${new Date(dateString).toLocaleDateString(undefined, options)}`;
    }
    
    // Show notification
    function showNotification(message, isError = false) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = isError ? 'notification error show' : 'notification show';
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Event listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
    
    // Set minimum date to today
    taskDate.min = new Date().toISOString().split('T')[0];
});