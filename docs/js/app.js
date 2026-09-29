document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // API & LOGIN
    // =========================

    const API_URL =
        "https://cloudflare-backend.23-st-028.workers.dev";

    let token = localStorage.getItem("taskflow_token");

    let allTasks = [];
    let editingTask = null;


    // =========================
    // ELEMENTS
    // =========================

    const taskList =
        document.querySelector(".task-list");

    const searchInput =
        document.getElementById("search-input");

    const statusFilter =
        document.getElementById("status-filter");

    const priorityFilter =
        document.getElementById("priority-filter");

    const taskModal =
        document.getElementById("task-modal");

    const taskForm =
        document.getElementById("task-form");

    const modalTitle =
        document.getElementById("modal-title");

    const taskTitle =
        document.getElementById("task-title");

    const taskDescription =
        document.getElementById("task-description");

    const taskPriority =
        document.getElementById("task-priority");

    const taskStatus =
        document.getElementById("task-status");

    const taskDueDate =
        document.getElementById("task-due-date");

    const addTaskBtn =
        document.getElementById("open-modal");

    const closeModalBtn =
        document.getElementById("close-modal");

    const cancelBtn =
        document.getElementById("cancel-btn");

    const menuToggle =
        document.querySelector(".menu-toggle");

    const navLinks =
        document.querySelector(".nav-links");

    const themeToggle =
        document.getElementById("theme-toggle");


    // =========================
    // SHOW SECTION
    // =========================

    function showSection(sectionName) {

        document
            .querySelectorAll(".page-section")
            .forEach(section => {

                section.classList.remove("active");

            });


        const selectedSection =
            document.getElementById(sectionName);

        if (selectedSection) {

            selectedSection.classList.add("active");

        }


        document
            .querySelectorAll(".nav-link")
            .forEach(link => {

                link.classList.remove("active");

                if (
                    link.dataset.section ===
                    sectionName
                ) {

                    link.classList.add("active");

                }

            });

    }


    // =========================
    // NAVIGATION
    // =========================

    document
        .querySelectorAll(".nav-link")
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    const section =
                        link.dataset.section;

                    if (section) {

                        showSection(section);

                    }

                    if (navLinks) {

                        navLinks.classList.remove(
                            "active"
                        );

                    }

                }
            );

        });


    // =========================
    // MOBILE MENU
    // =========================

    if (menuToggle) {

        menuToggle.addEventListener(
            "click",
            () => {

                navLinks?.classList.toggle(
                    "active"
                );

            }
        );

    }


    // =========================
    // THEME
    // =========================

    function applyTheme(theme) {

        if (theme === "dark") {

            document.body.classList.add("dark-mode");

        } else {

            document.body.classList.remove(
                "dark-mode"
            );

        }

    }


    const savedTheme =
        localStorage.getItem("theme") ||
        "light";

    applyTheme(savedTheme);


    if (themeToggle) {

        themeToggle.addEventListener(
            "click",
            () => {

                const isDark =
                    document.body.classList.contains(
                        "dark-mode"
                    );

                const newTheme =
                    isDark ? "light" : "dark";

                applyTheme(newTheme);

                localStorage.setItem(
                    "theme",
                    newTheme
                );

            }
        );

    }


    // =========================
    // LOGIN USER
    // =========================

    async function loginUser() {

        try {

            const response =
                await fetch(
                    `${API_URL}/api/auth/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            email:
                                "hira-test@taskflow.com",

                            password:
                                "123456"

                        })
                    }
                );


            const data =
                await response.json();


            if (data.success) {

                token =
                    data.token;

                localStorage.setItem(
                    "taskflow_token",
                    token
                );

                console.log(
                    "TaskFlow login successful!"
                );

                await loadTasks();

            } else {

                console.error(
                    data.message
                );

                alert(
                    data.message ||
                    "Login failed."
                );

            }

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

        }

    }


    // =========================
    // LOAD TASKS
    // =========================

    async function loadTasks() {

        if (!token) {

            await loginUser();

            return;

        }


        try {

            const response =
                await fetch(
                    `${API_URL}/api/tasks`,
                    {
                        method: "GET",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`

                        }
                    }
                );


            const data =
                await response.json();


            if (
                response.status === 401 ||
                !data.success
            ) {

                console.log(
                    "Unauthorized. Logging in again."
                );

                localStorage.removeItem(
                    "taskflow_token"
                );

                token = null;

                await loginUser();

                return;

            }


            allTasks =
                data.tasks || [];


            renderTasks();

            updateStats();

        } catch (error) {

            console.error(
                "Load tasks error:",
                error
            );

        }

    }


    // =========================
    // RENDER TASKS
    // =========================

    function renderTasks() {

        if (!taskList) return;


        const searchValue =
            searchInput?.value
                .toLowerCase()
                .trim() || "";


        const selectedStatus =
            statusFilter?.value || "All";


        const selectedPriority =
            priorityFilter?.value || "All";


        let filteredTasks =
            allTasks.filter(task => {

                const matchesSearch =
                    task.title
                        .toLowerCase()
                        .includes(searchValue) ||

                    (task.description || "")
                        .toLowerCase()
                        .includes(searchValue);


                const matchesStatus =
                    selectedStatus === "All" ||
                    task.status ===
                    selectedStatus;


                const matchesPriority =
                    selectedPriority === "All" ||
                    task.priority ===
                    selectedPriority;


                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesPriority
                );

            });


        if (filteredTasks.length === 0) {

            taskList.innerHTML = `
                <div class="empty-state">
                    <h3>No tasks found</h3>
                    <p>
                        Add a new task or change your filters.
                    </p>
                </div>
            `;

            return;

        }


        taskList.innerHTML =
            filteredTasks
                .map(task =>
                    createTaskHTML(task)
                )
                .join("");


        attachTaskEvents();

    }


    // =========================
    // CREATE TASK HTML
    // =========================

    function createTaskHTML(task) {

        const dueDate =
            task.dueDate
                ? new Date(task.dueDate)
                    .toLocaleDateString()
                : "No due date";


        return `
            <div
                class="task-card"
                data-id="${task._id}"
            >

                <div class="task-card-top">

                    <div>

                        <h3>
                            ${escapeHTML(task.title)}
                        </h3>

                        <p>
                            ${
                                escapeHTML(
                                    task.description || ""
                                )
                            }
                        </p>

                    </div>

                    <button
                        class="delete-task"
                        data-id="${task._id}"
                        title="Delete task"
                    >
                        🗑️
                    </button>

                </div>


                <div class="task-meta">

                    <span class="priority-badge ${getPriorityClass(task.priority)}">
                        ${task.priority}
                    </span>

                    <span class="status-badge ${getStatusClass(task.status)}">
                        ${task.status}
                    </span>

                </div>


                <div class="task-footer">

                    <span>
                        📅 ${dueDate}
                    </span>

                    <div class="task-actions">

                        <button
                            class="complete-task"
                            data-id="${task._id}"
                        >
                            ${
                                task.status ===
                                "Completed"
                                    ? "↩️ Reopen"
                                    : "✓ Complete"
                            }
                        </button>

                        <button
                            class="edit-task"
                            data-id="${task._id}"
                        >
                            ✏️ Edit
                        </button>

                    </div>

                </div>

            </div>
        `;

    }


    // =========================
    // ESCAPE HTML
    // =========================

    function escapeHTML(value) {

        const div =
            document.createElement("div");

        div.textContent =
            value;

        return div.innerHTML;

    }


    // =========================
    // PRIORITY CLASS
    // =========================

    function getPriorityClass(priority) {

        if (priority === "High") {

            return "priority-high";

        }

        if (priority === "Medium") {

            return "priority-medium";

        }

        return "priority-low";

    }


    // =========================
    // STATUS CLASS
    // =========================

    function getStatusClass(status) {

        if (status === "Completed") {

            return "status-completed";

        }

        if (status === "In Progress") {

            return "status-progress";

        }

        return "status-pending";

    }


    // =========================
    // ATTACH TASK EVENTS
    // =========================

    function attachTaskEvents() {

        document
            .querySelectorAll(".delete-task")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteTask(
                            button.dataset.id
                        );

                    }
                );

            });


        document
            .querySelectorAll(".edit-task")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        openEditModal(
                            button.dataset.id
                        );

                    }
                );

            });


        document
            .querySelectorAll(".complete-task")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        toggleComplete(
                            button.dataset.id
                        );

                    }
                );

            });

    }


    // =========================
    // OPEN ADD TASK MODAL
    // =========================

    function openAddModal() {

        editingTask = null;


        if (modalTitle) {

            modalTitle.textContent =
                "Add New Task";

        }


        if (taskForm) {

            taskForm.reset();

        }


        if (taskStatus) {

            taskStatus.value =
                "Pending";

        }


        if (taskPriority) {

            taskPriority.value =
                "Medium";

        }


        taskModal?.classList.add(
            "active"
        );

    }


    // =========================
    // OPEN EDIT MODAL
    // =========================

    function openEditModal(id) {

        const task =
            allTasks.find(
                item =>
                    item._id === id
            );


        if (!task) return;


        editingTask =
            task;


        if (modalTitle) {

            modalTitle.textContent =
                "Edit Task";

        }


        if (taskTitle) {

            taskTitle.value =
                task.title || "";

        }


        if (taskDescription) {

            taskDescription.value =
                task.description || "";

        }


        if (taskPriority) {

            taskPriority.value =
                task.priority || "Medium";

        }


        if (taskStatus) {

            taskStatus.value =
                task.status || "Pending";

        }


        if (taskDueDate) {

            taskDueDate.value =
                task.dueDate
                    ? formatDateForInput(
                        task.dueDate
                    )
                    : "";

        }


        taskModal?.classList.add(
            "active"
        );

    }


    // =========================
    // FORMAT DATE
    // =========================

    function formatDateForInput(date) {

        const d =
            new Date(date);


        const year =
            d.getFullYear();


        const month =
            String(
                d.getMonth() + 1
            ).padStart(2, "0");


        const day =
            String(
                d.getDate()
            ).padStart(2, "0");


        return `${year}-${month}-${day}`;

    }


    // =========================
    // CLOSE MODAL
    // =========================

    function closeModal() {

        taskModal?.classList.remove(
            "active"
        );

        editingTask = null;

    }


    // =========================
    // ADD BUTTON
    // =========================

    if (addTaskBtn) {

        addTaskBtn.addEventListener(
            "click",
            openAddModal
        );

    }


    // =========================
    // CLOSE BUTTON
    // =========================

    if (closeModalBtn) {

        closeModalBtn.addEventListener(
            "click",
            closeModal
        );

    }


    if (cancelBtn) {

        cancelBtn.addEventListener(
            "click",
            closeModal
        );

    }


    // =========================
    // CLOSE ON OUTSIDE CLICK
    // =========================

    if (taskModal) {

        taskModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    taskModal
                ) {

                    closeModal();

                }

            }
        );

    }


    // =========================
    // SAVE TASK
    // =========================

    if (taskForm) {

        taskForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const title =
                    taskTitle?.value.trim();


                const description =
                    taskDescription?.value.trim() ||
                    "";


                const priority =
                    taskPriority?.value ||
                    "Medium";


                const status =
                    taskStatus?.value ||
                    "Pending";


                const dueDate =
                    taskDueDate?.value ||
                    null;


                if (!title) {

                    alert(
                        "Please enter a task title."
                    );

                    return;

                }


                if (!token) {

                    await loginUser();

                }


                const taskData = {

                    title,

                    description,

                    priority,

                    status,

                    dueDate

                };


                try {

                    let response;


                    if (editingTask) {

                        response =
                            await fetch(
                                `${API_URL}/api/tasks/${editingTask._id}`,
                                {

                                    method: "PUT",

                                    headers: {

                                        "Content-Type":
                                            "application/json",

                                        "Authorization":
                                            `Bearer ${token}`

                                    },

                                    body:
                                        JSON.stringify(
                                            taskData
                                        )

                                }
                            );

                    } else {

                        response =
                            await fetch(
                                `${API_URL}/api/tasks`,
                                {

                                    method: "POST",

                                    headers: {

                                        "Content-Type":
                                            "application/json",

                                        "Authorization":
                                            `Bearer ${token}`

                                    },

                                    body:
                                        JSON.stringify(
                                            taskData
                                        )

                                }
                            );

                    }


                    const data =
                        await response.json();


                    if (response.status === 401) {

                        localStorage.removeItem(
                            "taskflow_token"
                        );

                        token = null;

                        alert(
                            "Session expired. Please try again."
                        );

                        await loginUser();

                        return;

                    }


                    if (!response.ok ||
                        !data.success) {

                        throw new Error(
                            data.message ||
                            "Unable to save task."
                        );

                    }


                    closeModal();

                    await loadTasks();


                    alert(
                        editingTask
                            ? "Task updated successfully!"
                            : "Task added successfully!"
                    );


                } catch (error) {

                    console.error(
                        "Task save error:",
                        error
                    );

                    alert(
                        error.message ||
                        "Unable to save task."
                    );

                }

            }
        );

    }


    // =========================
    // DELETE TASK
    // =========================

    async function deleteTask(id) {

        const confirmed =
            confirm(
                "Are you sure you want to delete this task?"
            );


        if (!confirmed) return;


        try {

            const response =
                await fetch(
                    `${API_URL}/api/tasks/${id}`,
                    {

                        method: "DELETE",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`

                        }

                    }
                );


            const data =
                await response.json();


            if (response.status === 401) {

                localStorage.removeItem(
                    "taskflow_token"
                );

                token = null;

                await loginUser();

                return;

            }


            if (!response.ok ||
                !data.success) {

                throw new Error(
                    data.message ||
                    "Unable to delete task."
                );

            }


            await loadTasks();


        } catch (error) {

            console.error(
                "Delete task error:",
                error
            );

            alert(
                error.message ||
                "Unable to delete task."
            );

        }

    }


    // =========================
    // COMPLETE / REOPEN TASK
    // =========================

    async function toggleComplete(id) {

        const task =
            allTasks.find(
                item =>
                    item._id === id
            );


        if (!task) return;


        const newStatus =
            task.status === "Completed"
                ? "Pending"
                : "Completed";


        try {

            const response =
                await fetch(
                    `${API_URL}/api/tasks/${id}`,
                    {

                        method: "PUT",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`

                        },

                        body:
                            JSON.stringify({
                                status:
                                    newStatus
                            })

                    }
                );


            const data =
                await response.json();


            if (response.status === 401) {

                localStorage.removeItem(
                    "taskflow_token"
                );

                token = null;

                await loginUser();

                return;

            }


            if (!response.ok ||
                !data.success) {

                throw new Error(
                    data.message ||
                    "Unable to update task."
                );

            }


            await loadTasks();


        } catch (error) {

            console.error(
                "Complete task error:",
                error
            );

            alert(
                error.message ||
                "Unable to update task."
            );

        }

    }


    // =========================
    // UPDATE STATS
    // =========================

    function updateStats() {

        const total =
            allTasks.length;


        const completed =
            allTasks.filter(
                task =>
                    task.status ===
                    "Completed"
            ).length;


        const pending =
            allTasks.filter(
                task =>
                    task.status ===
                    "Pending"
            ).length;


        const inProgress =
            allTasks.filter(
                task =>
                    task.status ===
                    "In Progress"
            ).length;


        const important =
            allTasks.filter(
                task =>
                    task.priority ===
                    "High"
            ).length;


        const totalElement =
            document.getElementById(
                "total-tasks"
            );


        const completedElement =
            document.getElementById(
                "completed-tasks"
            );


        const pendingElement =
            document.getElementById(
                "pending-tasks"
            );


        const progressElement =
            document.getElementById(
                "progress-tasks"
            );


        const importantElement =
            document.getElementById(
                "important-tasks"
            );


        if (totalElement) {

            totalElement.textContent =
                total;

        }


        if (completedElement) {

            completedElement.textContent =
                completed;

        }


        if (pendingElement) {

            pendingElement.textContent =
                pending;

        }


        if (progressElement) {

            progressElement.textContent =
                inProgress;

        }


        if (importantElement) {

            importantElement.textContent =
                important;

        }


        renderSpecialSections();

    }


    // =========================
    // SPECIAL SECTIONS
    // =========================

    function renderSpecialSections() {

        const importantList =
            document.getElementById(
                "important-list"
            );


        const completedList =
            document.getElementById(
                "completed-list"
            );


        if (importantList) {

            const importantTasks =
                allTasks.filter(
                    task =>
                        task.priority ===
                        "High"
                );


            importantList.innerHTML =
                importantTasks.length
                    ? importantTasks
                        .map(task =>
                            createTaskHTML(task)
                        )
                        .join("")
                    : `
                        <div class="empty-state">
                            <h3>No important tasks</h3>
                            <p>
                                High priority tasks will appear here.
                            </p>
                        </div>
                    `;

        }


        if (completedList) {

            const completedTasks =
                allTasks.filter(
                    task =>
                        task.status ===
                        "Completed"
                );


            completedList.innerHTML =
                completedTasks.length
                    ? completedTasks
                        .map(task =>
                            createTaskHTML(task)
                        )
                        .join("")
                    : `
                        <div class="empty-state">
                            <h3>No completed tasks</h3>
                            <p>
                                Completed tasks will appear here.
                            </p>
                        </div>
                    `;

        }


        document
            .querySelectorAll(
                "#important-list .delete-task, #important-list .edit-task, #important-list .complete-task, #completed-list .delete-task, #completed-list .edit-task, #completed-list .complete-task"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.id;


                        if (
                            button.classList.contains(
                                "delete-task"
                            )
                        ) {

                            deleteTask(id);

                        } else if (
                            button.classList.contains(
                                "edit-task"
                            )
                        ) {

                            openEditModal(id);

                        } else {

                            toggleComplete(id);

                        }

                    }
                );

            });

    }


    // =========================
    // SEARCH
    // =========================

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            renderTasks
        );

    }


    // =========================
    // STATUS FILTER
    // =========================

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            renderTasks
        );

    }


    // =========================
    // PRIORITY FILTER
    // =========================

    if (priorityFilter) {

        priorityFilter.addEventListener(
            "change",
            renderTasks
        );

    }


    // =========================
    // LOGOUT
    // =========================

    const logoutBtn =
        document.getElementById(
            "logout-btn"
        );


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            () => {

                localStorage.removeItem(
                    "taskflow_token"
                );

                token = null;

                alert(
                    "Logged out successfully."
                );

                location.reload();

            }
        );

    }


    // =========================
    // START APP
    // =========================

    showSection("dashboard");

    loadTasks();

});