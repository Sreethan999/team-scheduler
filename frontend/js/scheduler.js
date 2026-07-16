// ==========================================================
// AUTO SCHEDULER PAGE
// ==========================================================

function loadSchedulerPage() {

    document.getElementById("pageContent").innerHTML = `

    <div class="scheduler-page">

        <div class="page-header">

            <h2>

                <i class="fa-solid fa-robot"></i>

                Automatic Meeting Scheduler

            </h2>

            <p>

                Automatically find the best meeting time.

            </p>

        </div>

        <div class="card shadow-sm">

            <div class="card-body">

                <div class="mb-3">

                    <label class="form-label">

                        Meeting

                    </label>

                    <select
                        id="schedulerMeeting"
                        class="form-select">

                    </select>

                </div>

                <button
                    id="scheduleBtn"
                    class="btn btn-success">

                    Schedule Meeting

                </button>

            </div>

        </div>

        <div
            id="scheduleResult"
            class="mt-4">

        </div>

    </div>

    `;

    loadSchedulerMeetings();

    document
        .getElementById("scheduleBtn")
        .addEventListener(
            "click",
            scheduleMeeting
        );

}

// ==========================================================
// LOAD MEETINGS
// ==========================================================

async function loadSchedulerMeetings() {

    try {

        const response = await fetch(
            `${API}/meetings`
        );

        const data = await response.json();

        const meetings = data.items;

        const select =
            document.getElementById("schedulerMeeting");

        select.innerHTML =
            '<option value="">Select Meeting</option>';

        meetings.forEach(meeting => {

            select.innerHTML += `

                <option value="${meeting.id}">
                    ${meeting.title}
                </option>

            `;

        });

    }

    catch (error) {

        console.error(error);

    }

}

// ==========================================================
// SCHEDULE MEETING
// ==========================================================

async function scheduleMeeting() {

    const meetingId =
        document.getElementById("schedulerMeeting").value;

    if (!meetingId) {

        alert("Please select a meeting.");

        return;

    }

    try {

        const response = await fetch(

            `${API}/meetings/${meetingId}/schedule`,

            {
                method: "POST"
            }

        );

        const result =
            await response.json();
        
        console.log(result);

        if (!response.ok) {

            alert(result.detail);

            return;

        }

        document.getElementById(
            "scheduleResult"
        ).innerHTML = `

            <div class="alert alert-success">

                <h5>

                    Meeting Scheduled Successfully

                </h5>

                <hr>

                <p>

                    <strong>ID:</strong>
                    ${result.id}

                </p>

                <p>

                    <strong>Meeting ID:</strong>
                    ${result.request_id}

                </p>

                <p>

                    <strong>Date:</strong>
                    ${result.scheduled_date}

                </p>

                <p>

                    <strong>Start:</strong>
                    ${result.start_time}

                </p>

                <p>

                    <strong>End:</strong>
                    ${result.end_time}

                </p>

                <p>

                    <strong>Status:</strong>
                    ${result.status}

                </p>

            </div>

        `;

    }

    catch (error) {

        console.error(error);

    }

}