class Todo {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.searchTerm = '';
        this.init();
    }

    init() {
        this.draw();
        document.getElementById('add-task-btn').addEventListener('click', () => this.addTask());
        document.getElementById('search').addEventListener('input', (e) => {
            this.searchTerm = e.target.value;
            if (this.searchTerm.length >= 2 || this.searchTerm.length === 0) {
                this.draw();
            }
        });
    }


    draw() {
        const todoList = document.getElementById('todo-list');
        todoList.innerHTML = '';

        const filteredTasks = this.searchTerm.length >= 2
            ? this.tasks.filter(task => task.name.toLowerCase().includes(this.searchTerm.toLowerCase()))
            : this.tasks;

        filteredTasks.forEach((task, index) => {
            const li = document.createElement('li');

            const taskName = document.createElement('span');
            taskName.innerHTML = this.highlightSearchTerm(task.name);
            taskName.addEventListener('click', () => this.editTask(index));

            const taskDeadline = document.createElement('span');
            taskDeadline.classList.add('task-deadline');
            taskDeadline.innerHTML = task.deadline ? `&nbsp;Termin: ${this.formatDate(task.deadline)}` : '&nbsp;Bez terminu';


            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-btn');
            deleteButton.innerHTML = '&nbsp;<i class="fas fa-trash-alt"></i>';
            deleteButton.addEventListener('click', () => this.removeTask(index));

            li.append(taskName, taskDeadline, deleteButton);
            todoList.appendChild(li);
        });
    }


    formatDate(deadline) {
        const options = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(deadline).toLocaleDateString('pl-PL', options);
    }

    highlightSearchTerm(taskName) {
        if (!this.searchTerm) return taskName;
        const regex = new RegExp(`(${this.searchTerm})`, 'gi');
        return taskName.replace(regex, "<mark>$1</mark>");
    }

    addTask() {
        const taskName = document.getElementById('new-task').value.trim();
        const taskDeadline = document.getElementById('task-deadline').value;

        if (taskName.length < 3 || taskName.length > 255) {
            alert("Nazwa zadania musi mieć od 3 do 255 znaków.");
            return;
        }

        const deadlineDate = new Date(taskDeadline);
        if (taskDeadline && deadlineDate < new Date()) {
            alert("Data musi być w przyszłości.");
            return;
        }

        this.tasks.push({ name: taskName, deadline: taskDeadline });
        this.updateStorage();
        this.draw();
        document.getElementById('new-task').value = '';
        document.getElementById('task-deadline').value = '';
    }

    removeTask(index) {
        this.tasks.splice(index, 1);
        this.updateStorage();
        this.draw();
    }

    editTask(index) {
        const taskRow = document.querySelectorAll('#todo-list li')[index];
        const originalName = this.tasks[index].name;
        const originalDeadline = this.tasks[index].deadline;

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = originalName;
        nameInput.classList.add('edit-input');

        const dateInput = document.createElement('input');
        dateInput.type = 'datetime-local';
        dateInput.value = originalDeadline ? new Date(originalDeadline).toISOString().slice(0, 16) : '';
        dateInput.classList.add('edit-date-input');

        taskRow.innerHTML = '';
        taskRow.append(nameInput, dateInput);

        let isNameBlurred = false;
        let isDateBlurred = false;

        const saveChanges = () => {
            const newName = nameInput.value.trim();
            const newDeadline = dateInput.value;

            if (newName.length >= 3 && newName.length <= 255) {
                this.tasks[index].name = newName;
                this.tasks[index].deadline = newDeadline ? new Date(newDeadline).toISOString() : '';
                this.updateStorage();
                this.draw();
            } else {
                alert("Nazwa zadania musi mieć od 3 do 255 znaków.");
                this.draw();
            }
        };

        nameInput.addEventListener('blur', () => {
            isNameBlurred = true;
            if (isDateBlurred) saveChanges();
        });

        dateInput.addEventListener('blur', () => {
            isDateBlurred = true;
            if (isNameBlurred) saveChanges();
        });

        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') saveChanges();
        });

        dateInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') saveChanges();
        });

        nameInput.focus();
    }
    updateStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
}

document.addEventListener('DOMContentLoaded', () => new Todo());

