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
const newTaskDue = document.querySelector("[data-new-task-input-date]");
const newTaskDescription = document.querySelector(
  "[data-new-task-input-description]"
);
const newTaskPriority = document.querySelector(
  "[data-new-task-input-priority]"
);
const clearCompleteTaskButton = document.querySelector(
  "[data-clear-complete-task-button]"
);

const defaultProject = document.querySelector("[data-project-default]");

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

defaultProject.addEventListener("click", (e) => {
  const { target } = e;
  const isProjectItem = target.matches("li");
  if (isProjectItem) {
    selectedProjectId = target.dataset.projectId;
    // console.log(selectedProjectId);
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
  const taskDue = newTaskDue.value;
  const taskPrioriry = newTaskPriority.value;
  const taskDescription = newTaskDescription.value;
  if (taskName == null || taskName === "") return;
  const task = createTask(taskName, taskDue, taskPrioriry, taskDescription);
  newTaskInput.value = null;
  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId
  );
  selectedProject.tasks.push(task);
  saveAndRender();
});

taskContainer.addEventListener("click", (e) => {
  let selectedTask = "";
  if (selectedProjectId === "default" && e.target.type === "checkbox") {
    for (const project of projects) {
      selectedTask = project.tasks.find((task) => task.id === e.target.id);
      if (selectedTask) break;
    }
    selectedTask.complete = e.target.checked;
    save();
    renderTaskCount("All");
    return;
  }

  if (e.target.type === "checkbox") {
    const selectedProject = projects.find(
      (project) => project.id === selectedProjectId
    );

    selectedTask = selectedProject.tasks.find(
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
const createTask = (name, due, priority, description) => {
  return {
    id: Date.now().toString(),
    name: name,
    complete: false,
    dueDate: due,
    priority: priority,
    description: description,
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

  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) || projects;

  if (selectedProjectId == null) {
    taskDisplayContainer.style.display = "none";
  } else if (selectedProjectId === "default") {
    taskDisplayContainer.style.display = "";
    taskTitleElement.innerText = "ALL TASKS";
    renderTaskCount(selectedProject);
    clearElement(taskContainer);
    renderAllTasks();
  } else {
    taskDisplayContainer.style.display = "";
    taskTitleElement.innerText = selectedProject.name.toUpperCase();
    renderTaskCount(selectedProject);
    clearElement(taskContainer);
    renderTasks(selectedProject);
    // console.log(selectedProject);
  }
};

const renderAllTasks = () => {
  projects.forEach((project) => {
    renderTasks(project);
  });
};

const renderTasks = (selectedProject) => {
  selectedProject.tasks.forEach((task) => {
    const taskElement = document.importNode(taskTemplate.content, true);
    const checkbox = taskElement.querySelector("input");
    checkbox.id = task.id;
    checkbox.checked = task.complete;
    const label = taskElement.querySelector("label");
    const taskTitle = taskElement.querySelector("[data-task-title]");
    const descriptionArea = taskElement.querySelector(
      "[data-task-description]"
    );
    const due = taskElement.querySelector("[data-task-due-date]");
    const priority = taskElement.querySelector("[data-task-priority]");
    const editBtn = taskElement.querySelector("[data-edit-button]");
    label.htmlFor = task.id;
    taskTitle.value = task.name;
    due.append(task.dueDate);
    priority.append(task.priority);
    !task.description
      ? (descriptionArea.style.display = "none")
      : descriptionArea.append(task.description);
    taskContainer.appendChild(taskElement);
  });
};

const renderTaskCount = (selectedProject) => {
  // Come up with a function that can count all tasks that are not completed.
  // Maybe using reduce
  if (selectedProjectId === "default") {
    const allIncompleteTaskCount = projects
      .flatMap((project) => project.tasks)
      .filter((task) => !task.complete).length;
    const allTasksString = allIncompleteTaskCount <= 1 ? "task" : "tasks";
    taskCountElement.innerText = `${allIncompleteTaskCount} ${allTasksString} remaining`;
  } else {
    const incompleteTaskCount = selectedProject.tasks.filter(
      (task) => !task.complete
    ).length;
    const tasksString = incompleteTaskCount <= 1 ? "task" : "tasks";
    taskCountElement.innerText = `${incompleteTaskCount} ${tasksString} remaining`;
  }
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
