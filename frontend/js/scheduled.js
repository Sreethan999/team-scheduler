// ==========================================================
// GLOBAL VARIABLES
// ==========================================================

let scheduledMeetingsList = [];

let currentScheduledPage = 1;

let currentScheduledPageSize = 10;

let currentScheduledSearch = "";

let currentScheduledSort = "id";

let currentScheduledOrder = "asc";

let totalScheduledMeetings = 0;


// ==========================================================
// SCHEDULED MEETINGS PAGE
// ==========================================================

function loadScheduledPage() {

    document.getElementById("pageContent").innerHTML = `

        <div class="scheduled-page">

            <div class="page-header">

                <h2>

                    <i class="fa-solid fa-calendar-check"></i>

                    Scheduled Meetings

                </h2>

                <p>

                    View, search, sort and manage scheduled meetings.

                </p>

            </div>

            <!-- ===================================================== -->
            <!-- SEARCH / SORT CONTROLS -->
            <!-- ===================================================== -->

            <div class="card shadow-sm mb-4">

                <div class="card-body">

                    <div class="row g-3">

                        <div class="col-md-4">

                            <input
                                id="scheduledSearch"
                                class="form-control"
                                placeholder="Search status...">

                        </div>

                        <div class="col-md-3">

                            <select
                                id="scheduledSort"
                                class="form-select">

                                <option value="id">

                                    ID

                                </option>

                                <option value="scheduled_date">

                                    Date

                                </option>

                                <option value="start_time">

                                    Start Time

                                </option>

                                <option value="end_time">

                                    End Time

                                </option>

                                <option value="status">

                                    Status

                                </option>

                            </select>

                        </div>

                        <div class="col-md-2">

                            <button
                                id="scheduledOrderBtn"
                                class="btn btn-outline-primary w-100">

                                Asc ↑

                            </button>

                        </div>

                        <div class="col-md-3">

                            <button
                                id="scheduledResetBtn"
                                class="btn btn-secondary w-100">

                                Reset Filters

                            </button>

                        </div>

                    </div>

                </div>

            </div>

            <!-- ===================================================== -->
            <!-- TABLE -->
            <!-- ===================================================== -->

            <div class="card shadow-sm">

                <div class="card-body">

                    <div id="scheduledTable">

                        Loading...

                    </div>

                </div>

            </div>

            <!-- ===================================================== -->
            <!-- PAGINATION -->
            <!-- ===================================================== -->

            <div
                id="scheduledPagination"
                class="mt-4">

            </div>

        </div>

    `;

    loadMeetingTitles()
        .then(() => {

            loadScheduledMeetings();

        });

    // ======================================================
    // SEARCH
    // ======================================================

    document
        .getElementById("scheduledSearch")
        .addEventListener(
            "keyup",
            handleScheduledSearch
        );

    // ======================================================
    // SORT
    // ======================================================

    document
        .getElementById("scheduledSort")
        .addEventListener(
            "change",
            handleScheduledSort
        );

    // ======================================================
    // ORDER
    // ======================================================

    document
        .getElementById("scheduledOrderBtn")
        .addEventListener(
            "click",
            toggleScheduledOrder
        );

    // ======================================================
    // RESET
    // ======================================================

    document
        .getElementById("scheduledResetBtn")
        .addEventListener(
            "click",
            resetScheduledFilters
        );

}

// ==========================================================
// LOAD MEETING TITLES
// ==========================================================

async function loadMeetingTitles() {

    try {

        const response = await fetch(
            `${API}/meetings?page=1&page_size=100`
        );

        const data = await response.json();

        scheduledMeetingsList = data.items || [];

    }

    catch (error) {

        console.error(error);

    }

}


// ==========================================================
// LOAD SCHEDULED MEETINGS
// ==========================================================

async function loadScheduledMeetings() {

    try {

        const response = await fetch(

            `${API}/scheduled-meetings?page=${currentScheduledPage}&page_size=${currentScheduledPageSize}&search=${encodeURIComponent(currentScheduledSearch)}&sort_by=${currentScheduledSort}&order=${currentScheduledOrder}`

        );

        if (!response.ok) {

            throw new Error("Unable to load meetings.");

        }

        const data = await response.json();

        totalScheduledMeetings = data.total;

        renderScheduledTable(data.items);

        renderScheduledPagination();

    }

    catch (error) {

        console.error(error);

    }

}


// ==========================================================
// RENDER TABLE
// ==========================================================

function renderScheduledTable(meetings) {

    const table = document.getElementById(
        "scheduledTable"
    );

    if (meetings.length === 0) {

        table.innerHTML = `

            <div class="alert alert-info text-center">

                <h5>

                    No Scheduled Meetings Found

                </h5>

            </div>

        `;

        return;

    }

    let html = `

        <table class="table table-striped table-hover">

            <thead>

                <tr>

                    <th>ID</th>

                    <th>Meeting</th>

                    <th>Date</th>

                    <th>Start</th>

                    <th>End</th>

                    <th>Status</th>

                    <th>Actions</th>

                </tr>

            </thead>

            <tbody>

    `;

    meetings.forEach(meeting => {

        const meetingTitle =

            scheduledMeetingsList.find(

                m => m.id === meeting.request_id

            );

        html += `

            <tr>

                <td>

                    ${meeting.id}

                </td>

                <td>

                    ${meetingTitle ? meetingTitle.title : "Unknown"}

                </td>

                <td>

                    ${meeting.scheduled_date}

                </td>

                <td>

                    ${meeting.start_time}

                </td>

                <td>

                    ${meeting.end_time}

                </td>

                <td>

                    <span class="badge ${getStatusBadge(meeting.status)}">

                        ${meeting.status}

                    </span>

                </td>

                <td>

                    <button
                        class="btn btn-danger btn-sm delete-btn"
                        onclick="deleteScheduledMeeting(${meeting.id})">

                        Delete

                    </button>

                </td>

            </tr>

        `;

    });

    html += `

            </tbody>

        </table>

    `;

    table.innerHTML = html;

}

// ==========================================================
// SEARCH
// ==========================================================

function handleScheduledSearch() {

    currentScheduledSearch = document
        .getElementById("scheduledSearch")
        .value
        .trim();

    currentScheduledPage = 1;

    loadScheduledMeetings();

}

// ==========================================================
// SORT
// ==========================================================

function handleScheduledSort() {

    currentScheduledSort = document
        .getElementById("scheduledSort")
        .value;

    currentScheduledPage = 1;

    loadScheduledMeetings();

}

// ==========================================================
// ORDER
// ==========================================================

function toggleScheduledOrder() {

    if (currentScheduledOrder === "asc") {

        currentScheduledOrder = "desc";

        document
            .getElementById("scheduledOrderBtn")
            .innerHTML = "Desc ↓";

    }

    else {

        currentScheduledOrder = "asc";

        document
            .getElementById("scheduledOrderBtn")
            .innerHTML = "Asc ↑";

    }

    loadScheduledMeetings();

}

// ==========================================================
// RESET FILTERS
// ==========================================================

function resetScheduledFilters() {

    currentScheduledSearch = "";

    currentScheduledSort = "id";

    currentScheduledOrder = "asc";

    currentScheduledPage = 1;

    document.getElementById(
        "scheduledSearch"
    ).value = "";

    document.getElementById(
        "scheduledSort"
    ).value = "id";

    document.getElementById(
        "scheduledOrderBtn"
    ).innerHTML = "Asc ↑";

    loadScheduledMeetings();

}

// ==========================================================
// PAGINATION
// ==========================================================

function renderScheduledPagination() {

    const totalPages = Math.ceil(

        totalScheduledMeetings /

        currentScheduledPageSize

    );

    const container = document.getElementById(
        "scheduledPagination"
    );

    if (totalPages <= 1) {

        container.innerHTML = "";

        return;

    }

    let html = `

        <nav>

            <ul class="pagination justify-content-center">

    `;

    html += `

        <li class="page-item ${currentScheduledPage === 1 ? "disabled" : ""}">

            <button
                class="page-link"
                onclick="changeScheduledPage(${currentScheduledPage - 1})">

                Previous

            </button>

        </li>

    `;

    for (

        let page = 1;

        page <= totalPages;

        page++

    ) {

        html += `

            <li class="page-item ${page === currentScheduledPage ? "active" : ""}">

                <button
                    class="page-link"
                    onclick="changeScheduledPage(${page})">

                    ${page}

                </button>

            </li>

        `;

    }

    html += `

        <li class="page-item ${currentScheduledPage === totalPages ? "disabled" : ""}">

            <button
                class="page-link"
                onclick="changeScheduledPage(${currentScheduledPage + 1})">

                Next

            </button>

        </li>

    `;

    html += `

            </ul>

        </nav>

    `;

    container.innerHTML = html;

}

// ==========================================================
// CHANGE PAGE
// ==========================================================

function changeScheduledPage(page) {

    const totalPages = Math.ceil(

        totalScheduledMeetings /

        currentScheduledPageSize

    );

    if (

        page < 1 ||

        page > totalPages

    ) {

        return;

    }

    currentScheduledPage = page;

    loadScheduledMeetings();

}

// ==========================================================
// DELETE SCHEDULED MEETING
// ==========================================================

async function deleteScheduledMeeting(id) {

    if (!confirm("Delete this scheduled meeting?")) {

        return;

    }

    try {

        const response = await fetch(

            `${API}/scheduled-meetings/${id}`,

            {
                method: "DELETE"
            }

        );

        if (!response.ok) {

            const error = await response.json();

            alert(

                error.detail ||

                "Unable to delete meeting."

            );

            return;

        }

        // Refresh current page

        loadScheduledMeetings();

    }

    catch (error) {

        console.error(error);

    }

}


// ==========================================================
// STATUS BADGE
// ==========================================================

function getStatusBadge(status) {

    switch (status) {

        case "Scheduled":

            return "bg-success";

        case "Pending":

            return "bg-warning text-dark";

        case "Completed":

            return "bg-primary";

        case "Cancelled":

            return "bg-danger";

        default:

            return "bg-secondary";

    }

}