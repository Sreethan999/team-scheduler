let statusMeetings = [];
let statusMeetingTitles = [];

// ==========================================================
// MEETING STATUS PAGE
// ==========================================================

function loadStatusPage() {

    document.getElementById("pageContent").innerHTML = `

        <div class="status-page">

            <div class="page-header">

                <h2>

                    <i class="fa-solid fa-list-check"></i>

                    Meeting Status

                </h2>

                <p>

                    Manage the status of scheduled meetings.

                </p>

            </div>

            <div class="card shadow-sm">

                <div class="card-body">

                    <div id="statusMessage"></div>

                    <div id="statusTable">

                        Loading...

                    </div>

                </div>

            </div>

        </div>

    `;

    loadStatusMeetingTitles()
        .then(() => {

            loadStatusMeetings();

        });

}

// ==========================================================
// LOAD MEETING TITLES
// ==========================================================

async function loadStatusMeetingTitles() {

    try {

        const response = await fetch(
            `${API}/meetings?page=1&page_size=100`
        );

        const data = await response.json();

        statusMeetingTitles = data.items;

    }

    catch (error) {

        console.error(error);

    }

}

// ==========================================================
// LOAD SCHEDULED MEETINGS
// ==========================================================

// ==========================================================
// LOAD SCHEDULED MEETINGS
// ==========================================================

async function loadStatusMeetings() {

    try {

        const response = await fetch(

            `${API}/scheduled-meetings?page=1&page_size=100`

        );

        if (!response.ok) {

            throw new Error("Unable to load scheduled meetings.");

        }

        const data = await response.json();

        statusMeetings = data.items || [];

        renderStatusTable();

    }

    catch (error) {

        console.error(error);

    }

}

// ==========================================================
// RENDER STATUS TABLE
// ==========================================================

function renderStatusTable() {

    const table =
        document.getElementById("statusTable");

    if (statusMeetings.length === 0) {

        table.innerHTML = `

            <div class="alert alert-info text-center">

                <h5>No Scheduled Meetings</h5>

                <p>

                    Schedule a meeting from the
                    <strong>Auto Scheduler</strong>
                    page.

                </p>

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

                <th>Current Status</th>

                <th>New Status</th>

                <th>Action</th>

            </tr>

        </thead>

        <tbody>

    `;

    statusMeetings.forEach(meeting => {

        const meetingTitle =

            statusMeetingTitles.find(

                m => m.id === meeting.request_id

            );

        html += `

            <tr>

                <td>${meeting.id}</td>

                <td>

                    ${meetingTitle ? meetingTitle.title : "Unknown Meeting"}

                </td>

                <td>

                    <span class="badge ${getStatusBadge(meeting.status)}">

                        ${meeting.status}

                    </span>

                </td>

                <td>

                    <select
                        class="form-select"
                        id="status-${meeting.id}">

                        <option
                            value="Pending"
                            ${meeting.status === "Pending" ? "selected" : ""}>

                            Pending

                        </option>

                        <option
                            value="Scheduled"
                            ${meeting.status === "Scheduled" ? "selected" : ""}>

                            Scheduled

                        </option>

                        <option
                            value="Completed"
                            ${meeting.status === "Completed" ? "selected" : ""}>

                            Completed

                        </option>

                        <option
                            value="Cancelled"
                            ${meeting.status === "Cancelled" ? "selected" : ""}>

                            Cancelled

                        </option>

                    </select>

                </td>

                <td>

                    <button
                        class="btn btn-primary btn-sm"
                        onclick="updateMeetingStatus(${meeting.id})">

                        Update

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
// UPDATE MEETING STATUS
// ==========================================================

async function updateMeetingStatus(meetingId) {

    const selectedStatus = document.getElementById(
        `status-${meetingId}`
    ).value;

    const meeting = statusMeetings.find(
        m => m.id === meetingId
    );

    if (meeting.status === selectedStatus) {

        showStatusMessage(
            "Meeting already has this status.",
            "warning"
        );

        return;

    }

    try {

        const response = await fetch(

            `${API}/scheduled-meetings/${meetingId}`,

            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    status: selectedStatus

                })

            }

        );

        if (!response.ok) {

            const error = await response.json();

            showStatusMessage(

                error.detail || "Unable to update meeting status.",

                "danger"

            );

            return;

        }

        showStatusMessage(

            "Meeting status updated successfully."

        );

        loadStatusMeetings();

    }

    catch (error) {

        console.error(error);

        showStatusMessage(

            "Server error.",

            "danger"

        );

    }

}

// ==========================================================
// SHOW STATUS MESSAGE
// ==========================================================

function showStatusMessage(message, type = "success") {

    document.getElementById("statusMessage").innerHTML = `

        <div class="alert alert-${type} alert-dismissible fade show">

            ${message}

            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="alert">
            </button>

        </div>

    `;

}