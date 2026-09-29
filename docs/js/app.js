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

    const openModalBtn =
        document.getElementById("open-modal");

    const modal =
        document.getElementById("task-modal");

    const closeModalBtn =
        document.getElementById("close-modal");

    const cancelModalBtn =
        document.getElementById("cancel-modal");

    const taskForm =
        document.getElementById("task-form");

    const taskList =
        document.querySelector(".task-list");

    const taskTitle =
        document.getElementById("task-title");

    const taskDescription =
        document.getElementById("task-description");

    const taskPriority =
        document.getElementById("task-priority");

    const taskDate =
        document.getElementById("task-date");

    const searchInput =
        document.getElementById("task-search");

    const statusFilter =
        document.getElementById("status-filter");

    const priorityFilter =
        document.getElementById("priority-filter");


    // =========================
    // SECTIONS
    // =========================

    const dashboardSection =
        document.getElementById("dashboard-section");

    const tasksSection =
        document.getElementById("tasks-section");

    const importantSection =
        document.getElementById("important-section");

    const completedSection =
        document.getElementById("completed-section");

    const settingsSection =
        document.getElementById("settings-section");

    const importantTaskList =
        document.getElementById("important-task-list");

    const completedTaskList =
        document.getElementById("completed-task-list");

    const pageTitle =
        document.querySelector(".page-title");

    const taskSectionTitle =
        document.getElementById("task-section-title");


    // =========================
    // NAVIGATION
    // =========================

    const navLinks =
        document.querySelectorAll(".nav-link");

    navLinks.forEach(link => {

        link.addEventListener("click", event => {

            const section =
                link.dataset.section;

            if (!section) {
                return;
            }

            event.preventDefault();

            navLinks.forEach(item => {
                item.classList.remove("active");
            });

            link.classList.add("active");

            showSection(section);

        });

    });


    // =========================
    // SHOW SECTION
    // =========================

    function showSection(section) {

        if (dashboardSection) {
            dashboardSection.style.display = "none";
        }

        if (tasksSection) {
            tasksSection.style.display = "none";
        }

        if (importantSection) {
            importantSection.style.display = "none";
        }

        if (completedSection) {
            completedSection.style.display = "none";
        }

        if (settingsSection) {
            settingsSection.style.display = "none";
        }


        // DASHBOARD

        if (section === "dashboard") {

            if (dashboardSection) {
                dashboardSection.style.display = "block";
            }

            if (tasksSection) {
                tasksSection.style.display = "block";
            }

            if (pageTitle) {
                pageTitle.textContent =
                    "Dashboard";
            }

            if (taskSectionTitle) {
                taskSectionTitle.textContent =
                    "My Tasks";
            }

            displayTasks(allTasks);

        }


        // MY TASKS

        else if (section === "tasks") {

            if (tasksSection) {
                tasksSection.style.display = "block";
            }

            if (pageTitle) {
                pageTitle.textContent =
                    "My Tasks";
            }

            if (taskSectionTitle) {
                taskSectionTitle.textContent =
                    "All Tasks";
            }

            displayTasks(allTasks);

        }


        // IMPORTANT

        else if (section === "important") {

            if (importantSection) {
                importantSection.style.display = "block";
            }

            if (pageTitle) {
                pageTitle.textContent =
                    "Important Tasks";
            }

            displayImportantTasks();

        }


        // COMPLETED

        else if (section === "completed") {

            if (completedSection) {
                completedSection.style.display = "block";
            }

            if (pageTitle) {
                pageTitle.textContent =
                    "Completed Tasks";
            }

            displayCompletedTasks();

        }


        // SETTINGS

        else if (section === "settings") {

            if (settingsSection) {
                settingsSection.style.display = "block";
            }

            if (pageTitle) {
                pageTitle.textContent =
                    "Settings";
            }

        }

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
                                "hira@taskflow.com",

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
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );


            const data =
                await response.json();


            if (!data.success) {

                console.error(
                    data.message
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


            displayTasks(allTasks);

            displayImportantTasks();

            displayCompletedTasks();

            updateStatistics();

        } catch (error) {

            console.error(
                "Failed to load tasks:",
                error
            );

        }

    }


    // =========================
    // ESCAPE HTML
    // =========================

    function escapeHTML(text) {

        if (!text) {
            return "";
        }

        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    // =========================
    // CREATE TASK CARD
    // =========================

    function createTaskCard(task) {

        const taskCard =
            document.createElement("div");

        taskCard.className =
            "task-card";

        taskCard.dataset.id =
            task._id;

        taskCard.dataset.status =
            task.status || "Pending";

        taskCard.dataset.dueDate =
            task.dueDate || "";

        taskCard.dataset.priority =
            task.priority || "Medium";


        const formattedDate =
            task.dueDate
                ? new Date(
                    task.dueDate
                ).toLocaleDateString(
                    "en-US",
                    {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                    }
                )
                : "No due date";


        const priority =
            task.priority || "Medium";

        const status =
            task.status || "Pending";


        let statusClass =
            "pending";


        if (status === "Completed") {

            statusClass =
                "completed";

        }

        else if (status === "In Progress") {

            statusClass =
                "progress";

        }


        taskCard.innerHTML = `

            <div class="task-check">

                <input
                    type="checkbox"
                    ${status === "Completed"
                        ? "checked"
                        : ""}
                >

            </div>


            <div class="task-content">

                <div class="task-top">

                    <h3>
                        ${escapeHTML(task.title)}
                    </h3>

                    <span
                        class="priority ${priority.toLowerCase()}"
                    >
                        ${priority}
                    </span>

                </div>


                <p>
                    ${
                        escapeHTML(
                            task.description
                        ) ||
                        "No description provided."
                    }
                </p>


                <div class="task-meta">

                    <span>
                        📅 ${formattedDate}
                    </span>

                    <span
                        class="status ${statusClass}"
                    >
                        ${status}
                    </span>

                </div>

            </div>


            <div class="task-actions">

                <button
                    class="edit-btn"
                    title="Edit Task"
                    type="button"
                >
                    ✏️
                </button>


                <button
                    class="delete-btn"
                    title="Delete Task"
                    type="button"
                >
                    🗑️
                </button>

            </div>

        `;


        if (status === "Completed") {

            taskCard.classList.add(
                "completed-task"
            );

        }


        return taskCard;

    }


    // =========================
    // DISPLAY MAIN TASKS
    // =========================

    function displayTasks(tasks) {

        if (!taskList) {
            return;
        }


        taskList.innerHTML = "";


        if (!tasks.length) {

            taskList.innerHTML = `

                <div class="empty-state">

                    <h3>No tasks yet</h3>

                    <p>
                        Add your first task to get started.
                    </p>

                </div>

            `;

            updateStatistics();

            return;
        }


        tasks.forEach(task => {

            taskList.appendChild(
                createTaskCard(task)
            );

        });


        updateStatistics();

        applyFilters();

    }


    // =========================
    // DISPLAY IMPORTANT TASKS
    // =========================

    function displayImportantTasks() {

        if (!importantTaskList) {
            return;
        }


        importantTaskList.innerHTML = "";


        const importantTasks =
            allTasks.filter(task =>
                task.priority === "High"
            );


        if (!importantTasks.length) {

            importantTaskList.innerHTML = `

                <div class="empty-state">

                    <h3>No important tasks</h3>

                    <p>
                        High priority tasks will appear here.
                    </p>

                </div>

            `;

            return;
        }


        importantTasks.forEach(task => {

            importantTaskList.appendChild(
                createTaskCard(task)
            );

        });

    }


    // =========================
    // DISPLAY COMPLETED TASKS
    // =========================

    function displayCompletedTasks() {

        if (!completedTaskList) {
            return;
        }


        completedTaskList.innerHTML = "";


        const completedTasks =
            allTasks.filter(task =>
                task.status === "Completed"
            );


        if (!completedTasks.length) {

            completedTaskList.innerHTML = `

                <div class="empty-state">

                    <h3>No completed tasks</h3>

                    <p>
                        Completed tasks will appear here.
                    </p>

                </div>

            `;

            return;
        }


        completedTasks.forEach(task => {

            completedTaskList.appendChild(
                createTaskCard(task)
            );

        });

    }


    // =========================
    // STATISTICS
    // =========================

    function updateStatistics() {

        const total =
            allTasks.length;


        const pending =
            allTasks.filter(
                task =>
                    task.status === "Pending"
            ).length;


        const progress =
            allTasks.filter(
                task =>
                    task.status === "In Progress"
            ).length;


        const completed =
            allTasks.filter(
                task =>
                    task.status === "Completed"
            ).length;


        const totalElement =
            document.getElementById(
                "total-tasks"
            );

        const pendingElement =
            document.getElementById(
                "pending-tasks"
            );

        const progressElement =
            document.getElementById(
                "progress-tasks"
            );

        const completedElement =
            document.getElementById(
                "completed-tasks"
            );


        if (totalElement) {
            totalElement.textContent =
                total;
        }

        if (pendingElement) {
            pendingElement.textContent =
                pending;
        }

        if (progressElement) {
            progressElement.textContent =
                progress;
        }

        if (completedElement) {
            completedElement.textContent =
                completed;
        }

    }


    // =========================
    // OPEN MODAL
    // =========================

    if (openModalBtn) {

        openModalBtn.addEventListener(
            "click",
            () => {

                editingTask = null;


                if (taskForm) {
                    taskForm.reset();
                }


                const modalTitle =
                    document.getElementById(
                        "modal-title"
                    );


                const submitBtn =
                    taskForm
                        ? taskForm.querySelector(
                            ".save-btn"
                        )
                        : null;


                if (modalTitle) {

                    modalTitle.textContent =
                        "Add New Task";

                }


                if (submitBtn) {

                    submitBtn.textContent =
                        "Add Task";

                }


                if (modal) {

                    modal.classList.add(
                        "show"
                    );

                }


                if (taskTitle) {

                    taskTitle.focus();

                }

            }
        );

    }


    // =========================
    // CLOSE MODAL
    // =========================

    function closeModal() {

        if (modal) {

            modal.classList.remove(
                "show"
            );

        }


        if (taskForm) {

            taskForm.reset();

        }


        editingTask = null;


        const modalTitle =
            document.getElementById(
                "modal-title"
            );


        const submitBtn =
            taskForm
                ? taskForm.querySelector(
                    ".save-btn"
                )
                : null;


        if (modalTitle) {

            modalTitle.textContent =
                "Add New Task";

        }


        if (submitBtn) {

            submitBtn.textContent =
                "Add Task";

        }

    }


    if (closeModalBtn) {

        closeModalBtn.addEventListener(
            "click",
            closeModal
        );

    }


    if (cancelModalBtn) {

        cancelModalBtn.addEventListener(
            "click",
            closeModal
        );

    }


    if (modal) {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {

                    closeModal();

                }

            }
        );

    }


    // =========================
    // CREATE / UPDATE TASK
    // =========================

    if (taskForm) {

        taskForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                if (
                    !taskTitle ||
                    !taskDescription ||
                    !taskPriority ||
                    !taskDate
                ) {

                    console.error(
                        "Task form elements are missing."
                    );

                    return;

                }


                const title =
                    taskTitle.value.trim();


                const description =
                    taskDescription.value.trim();


                const priority =
                    taskPriority.value
                        .charAt(0)
                        .toUpperCase() +
                    taskPriority.value
                        .slice(1)
                        .toLowerCase();


                const dueDate =
                    taskDate.value;


                if (!title) {

                    alert(
                        "Please enter a task title."
                    );

                    return;

                }


                const taskData = {

                    title,

                    description,

                    priority,

                    status:
                        editingTask
                            ? (
                                editingTask.dataset.status ||
                                "Pending"
                            )
                            : "Pending",

                    dueDate:
                        dueDate || null

                };


                try {

                    let response;


                    // UPDATE

                    if (editingTask) {

                        const taskId =
                            editingTask.dataset.id;


                        response =
                            await fetch(
                                `${API_URL}/api/tasks/${taskId}`,
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

                    }


                    // CREATE

                    else {

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


                    if (!data.success) {

                        alert(
                            data.message ||
                            "Task operation failed."
                        );

                        return;

                    }


                    closeModal();

                    await loadTasks();


                } catch (error) {

                    console.error(
                        "Task save error:",
                        error
                    );

                    alert(
                        "Unable to save task."
                    );

                }

            }
        );

    }


    // =========================
    // EDIT / DELETE / COMPLETE
    // =========================

    document.addEventListener(
        "click",
        async event => {

            const editButton =
                event.target.closest(
                    ".edit-btn"
                );


            const deleteButton =
                event.target.closest(
                    ".delete-btn"
                );


            // =========================
            // EDIT
            // =========================

            if (editButton) {

                const card =
                    editButton.closest(
                        ".task-card"
                    );


                if (!card) {
                    return;
                }


                const taskId =
                    card.dataset.id;


                const task =
                    allTasks.find(
                        item =>
                            item._id === taskId
                    );


                if (!task) {
                    return;
                }


                editingTask = card;


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


                if (taskDate) {

                    if (task.dueDate) {

                        const date =
                            new Date(
                                task.dueDate
                            );


                        if (
                            !isNaN(
                                date.getTime()
                            )
                        ) {

                            taskDate.value =
                                date
                                    .toISOString()
                                    .split("T")[0];

                        }

                    }

                    else {

                        taskDate.value = "";

                    }

                }


                const modalTitle =
                    document.getElementById(
                        "modal-title"
                    );


                const submitBtn =
                    taskForm
                        ? taskForm.querySelector(
                            ".save-btn"
                        )
                        : null;


                if (modalTitle) {

                    modalTitle.textContent =
                        "Edit Task";

                }


                if (submitBtn) {

                    submitBtn.textContent =
                        "Save Changes";

                }


                if (modal) {

                    modal.classList.add(
                        "show"
                    );

                }


                if (taskTitle) {

                    taskTitle.focus();

                }

            }


            // =========================
            // DELETE
            // =========================

            if (deleteButton) {

                const card =
                    deleteButton.closest(
                        ".task-card"
                    );


                if (!card) {
                    return;
                }


                const taskId =
                    card.dataset.id;


                const task =
                    allTasks.find(
                        item =>
                            item._id === taskId
                    );


                if (!task) {
                    return;
                }


                const confirmDelete =
                    confirm(
                        `Delete "${task.title}"?`
                    );


                if (!confirmDelete) {
                    return;
                }


                try {

                    const response =
                        await fetch(
                            `${API_URL}/api/tasks/${taskId}`,
                            {
                                method: "DELETE",

                                headers: {
                                    "Authorization":
                                        `Bearer ${token}`
                                }
                            }
                        );


                    const data =
                        await response.json();


                    if (!data.success) {

                        alert(
                            data.message ||
                            "Unable to delete task."
                        );

                        return;

                    }


                    await loadTasks();


                } catch (error) {

                    console.error(
                        "Delete error:",
                        error
                    );

                    alert(
                        "Unable to delete task."
                    );

                }

            }

        }
    );


    // =========================
    // COMPLETE TASK
    // =========================

    document.addEventListener(
        "change",
        async event => {

            if (
                !event.target.matches(
                    '.task-card input[type="checkbox"]'
                )
            ) {
                return;
            }


            const card =
                event.target.closest(
                    ".task-card"
                );


            if (!card) {
                return;
            }


            const taskId =
                card.dataset.id;


            if (!taskId) {
                return;
            }


            const newStatus =
                event.target.checked
                    ? "Completed"
                    : "Pending";


            try {

                const response =
                    await fetch(
                        `${API_URL}/api/tasks/${taskId}`,
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


                if (!data.success) {

                    alert(
                        data.message ||
                        "Unable to update task."
                    );

                    return;

                }


                await loadTasks();


            } catch (error) {

                console.error(
                    "Status update error:",
                    error
                );

                alert(
                    "Unable to update task."
                );

            }

        }
    );


    // =========================
    // SEARCH & FILTER
    // =========================

    function applyFilters() {

        if (
            !searchInput ||
            !statusFilter ||
            !priorityFilter
        ) {
            return;
        }


        const searchText =
            searchInput.value
                .toLowerCase()
                .trim();


        const selectedStatus =
            statusFilter.value;


        const selectedPriority =
            priorityFilter.value;


        const tasks =
            document.querySelectorAll(
                ".task-list .task-card"
            );


        tasks.forEach(task => {

            const title =
                task.querySelector(
                    ".task-top h3"
                );


            const description =
                task.querySelector(
                    ".task-content > p"
                );


            const priority =
                task.dataset.priority
                    ? task.dataset.priority.toLowerCase()
                    : "medium";


            const status =
                task.dataset.status
                    ? task.dataset.status.toLowerCase()
                    : "pending";


            if (!title || !description) {
                return;
            }


            const titleText =
                title.textContent
                    .toLowerCase();


            const descriptionText =
                description.textContent
                    .toLowerCase();


            const matchesSearch =
                titleText.includes(
                    searchText
                ) ||
                descriptionText.includes(
                    searchText
                );


            const matchesStatus =
                selectedStatus === "all" ||
                status === selectedStatus;


            const matchesPriority =
                selectedPriority === "all" ||
                priority === selectedPriority;


            task.style.display =
                matchesSearch &&
                matchesStatus &&
                matchesPriority
                    ? "flex"
                    : "none";

        });

    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyFilters
        );

    }


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    if (priorityFilter) {

        priorityFilter.addEventListener(
            "change",
            applyFilters
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
            event => {

                event.preventDefault();


                const confirmLogout =
                    confirm(
                        "Are you sure you want to logout?"
                    );


                if (!confirmLogout) {
                    return;
                }


                localStorage.removeItem(
                    "taskflow_token"
                );


                token = null;

                allTasks = [];


                alert(
                    "You have been logged out."
                );


                location.reload();

            }
        );

    }


    // =========================
    // START APPLICATION
    // =========================

    showSection("dashboard");

    loadTasks();

});