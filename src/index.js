import "./styles.css";

// DOM Manipulation
const projectContainer = document.querySelector("[data-projects]");
const newProjectForm = document.querySelector("[data-new-project-form]");
const newProjectInput = document.querySelector("[data-new-project-input]");
const LOCAL_STORAGE_PROJECT_KEY = "task.projects";
const LOCAL_STORAGE_SELECTED_PROJECT_ID_KEY = "task.selectedProject";
const removeProjectButton = document.querySelector(
  "[data-remove-project-button]"
);
const taskDisplayContainer = document.querySelector(
  "[data-task-display-container]"
);
const taskTitleElement = document.querySelector("[data-task-title]");
const taskCountElement = document.querySelector("[data-task-count]");
const taskContainer = document.querySelector("[data-tasks");
const taskTemplate = document.getElementById("task-template");
const newTaskForm = document.querySelector("[data-new-task-form]");
const newTaskInput = document.querySelector("[data-new-task-input]");
const clearCompleteTaskButton = document.querySelector(
  "[data-clear-complete-task-button]"
);

// Function
let projects =
  JSON.parse(localStorage.getItem(LOCAL_STORAGE_PROJECT_KEY)) || [];
let selectedProjectId = localStorage.getItem(
  LOCAL_STORAGE_SELECTED_PROJECT_ID_KEY
);

projectContainer.addEventListener("click", (e) => {
  const { target } = e;
  const isProjectItem = target.matches("li");

  if (isProjectItem) {
    selectedProjectId = target.dataset.projectId;
  }
  saveAndRender();
});

newProjectForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const projectName = newProjectInput.value;
  if (projectName == null || projectName === "") return;
  const project = createProject(projectName);
  newProjectInput.value = null;
  projects.push(project);
  saveAndRender();
});

newTaskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const taskName = newTaskInput.value;
  if (taskName == null || taskName === "") return;
  const task = createTask(taskName);
  newTaskInput.value = null;
  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId
  );
  selectedProject.tasks.push(task);
  saveAndRender();
});

taskContainer.addEventListener("click", (e) => {
  if (e.target.tagName.toLowerCase() === "input") {
    const selectedProject = projects.find(
      (project) => project.id === selectedProjectId
    );
    const selectedTask = selectedProject.tasks.find(
      (task) => task.id === e.target.id
    );
    selectedTask.complete = e.target.checked;
    save();
    renderTaskCount(selectedProject);
  }
});

removeProjectButton.addEventListener("click", (e) => {
  projects = projects.filter((project) => project.id !== selectedProjectId);
  selectedProjectId = null;
  saveAndRender();
});

clearCompleteTaskButton.addEventListener("click", (e) => {
  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId
  );
  selectedProject.tasks = selectedProject.tasks.filter(
    (task) => !task.complete
  );
  saveAndRender();
});

// Creating new task
const createTask = (name) => {
  return {
    id: Date.now().toString(),
    name: name,
    complete: false,
  };
};

//Creating project and give an unique id for the project
const createProject = (name) => {
  return {
    id: Date.now().toString(),
    name: name,
    tasks: [],
  };
};

// Adding new project to the UI and clearing the previous one
const render = () => {
  clearElement(projectContainer);
  renderProject();

  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId
  );
  if (selectedProjectId == null) {
    taskDisplayContainer.style.display = "none";
  } else {
    taskDisplayContainer.style.display = "";
    taskTitleElement.innerText = selectedProject.name.toUpperCase();
    renderTaskCount(selectedProject);
    clearElement(taskContainer);
    renderTasks(selectedProject);
  }
};

const renderTasks = (selectedProject) => {
  selectedProject.tasks.forEach((task) => {
    const taskElement = document.importNode(taskTemplate.content, true);
    const checkbox = taskElement.querySelector("input");
    checkbox.id = task.id;
    checkbox.checked = task.complete;
    const label = taskElement.querySelector("label");
    label.htmlFor = task.id;
    label.append(task.name);
    taskContainer.appendChild(taskElement);
  });
};

const renderTaskCount = (selectedProject) => {
  const incompleteTaskCount = selectedProject.tasks.filter(
    (task) => !task.complete
  ).length;
  const tasksString = incompleteTaskCount <= 1 ? "task" : "tasks";
  taskCountElement.innerText = `${incompleteTaskCount} ${tasksString} remaining`;
};

const renderProject = () => {
  projects.forEach((project) => {
    const projectElement = document.createElement("li");
    projectElement.dataset.projectId = project.id;
    projectElement.classList.add("project-name");
    projectElement.innerText = project.name;
    if (project.id === selectedProjectId) {
      projectElement.classList.add("active-list");
    }
    projectContainer.appendChild(projectElement);
  });
};

const clearElement = (element) => {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
};

// Saving the Project to localStorage

const save = () => {
  localStorage.setItem(LOCAL_STORAGE_PROJECT_KEY, JSON.stringify(projects));
  localStorage.setItem(
    LOCAL_STORAGE_SELECTED_PROJECT_ID_KEY,
    selectedProjectId
  );
};

const saveAndRender = () => {
  save();
  render();
};

//Looking for data in locaStorage

// Check whether data exist

// Adding JSON methods back to your object properties once you fetch them

render();
