`use strict`;

const addTodoBtn = document.getElementById("add-task-button");
const todoInput = document.getElementById("task-description");
const todosList = document.querySelector(".todos-wrapper");
const todoPriority = document.getElementById("todo-priority-select");
const completedFilter = document.getElementById("checkbox-completed");
const highFilter = document.getElementById("checkbox-high");
const mediumFilter = document.getElementById("checkbox-medium");
const lowFilter = document.getElementById("checkbox-low");

let completedFlag = true;
let highFlag = true;
let mediumFlag = true;
let lowFlag = true;

let tasks;

!localStorage.tasks
  ? (tasks = [])
  : (tasks = JSON.parse(localStorage.getItem("tasks")));

let copyTasks = [];

class Task {
  constructor(description, priority = "Low") {
    this.description = description;
    this.done = false;
    this.priority = priority;
    this.date = new Date().toLocaleString();
  }
}

const createTemplate = (task, index) => {
  return `
    <div class="todo-card">
        <div class="todo-info">
            <p class="todo-card-priority">${task.priority}</p>
            <p class="todo-card-text">${task.description}</p>
            <p class="todo-card-date">Создано:
            ${task.date}
            </p>
        </div>
        ${
          !task.done
            ? `<div class="todo-buttons">
            <button onclick="completeTodo(${index})" class="fa fa-check fa-lg" id="done-task-button"></button>
            <button onclick="cancelTodo(${index})" class="fa fa-times fa-lg" id="cancel-task-button"></button>
            <button onclick="deleteTodo(${index})" class="fa fa-trash fa-lg" id="delete-task-button"></button>
        </div>`
            : `
            <div class="todo-buttons">
                <button onclick="deleteTodo(${index})" class="fa fa-trash fa-lg" id="delete-task-button"></button>
            </div>`
        }
    </div>
    `;
};

const fillTodoList = () => {
  todosList.innerHTML = "";
  if (
    tasks.length > 0 &&
    completedFilter.checked &&
    highFilter.checked &&
    mediumFilter.checked &&
    lowFilter.checked
  ) {
    tasks.forEach((item, index) => {
      todosList.innerHTML += createTemplate(item, index);
    });
  } else {
    copyTasks.forEach((item, index) => {
      todosList.innerHTML += createTemplate(item, index);
    });
  }
};

fillTodoList();

const todoDate = document.querySelector(".todo-card-date");

const updateLocal = () => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("copyTasks", JSON.stringify(copyTasks));
};

const completeTodo = (index) => {
  tasks[index].date += `<br> Выполнено: ${new Date().toLocaleString()}`;
  tasks[index].done = true;
  updateLocal();
  fillTodoList();
};

const cancelTodo = (index) => {
  tasks[index].date += `<br> Отменено: ${new Date().toLocaleString()}`;
  tasks[index].done = true;
  updateLocal();
  fillTodoList();
};

const deleteTodo = (index) => {
  tasks.splice(index, 1);
  updateLocal();
  fillTodoList();
};

addTodoBtn.addEventListener("click", () => {
  if (todoInput.value) {
    tasks.push(new Task(todoInput.value, todoPriority.value));
    updateLocal();
    fillTodoList();
    todoInput.value = "";
  }
});

const filterTodoList = () => {
  copyTasks = [];
  if (completedFilter.checked) {
    copyTasks = copyTasks.concat(
      tasks.filter((item, index) => {
        return tasks[index].done == true;
      })
    );
  }
  if (highFilter.checked) {
    copyTasks = copyTasks.concat(
      tasks.filter((item, index) => {
        return tasks[index].priority == "High" && tasks[index].done == false;
      })
    );
  }
  if (mediumFilter.checked) {
    copyTasks = copyTasks.concat(
      tasks.filter((item, index) => {
        return tasks[index].priority == "Medium" && tasks[index].done == false;
      })
    );
  }
  if (lowFilter.checked) {
    copyTasks = copyTasks.concat(
      tasks.filter((item, index) => {
        return tasks[index].priority == "Low" && tasks[index].done == false;
      })
    );
  }
  updateLocal();
  fillTodoList();
};
