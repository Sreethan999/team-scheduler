let participantMeetings = [];
let participantMembers = [];

// ==========================================================
// PARTICIPANTS PAGE
// ==========================================================

function loadParticipantsPage() {

    document.getElementById("pageContent").innerHTML = `

    <div class="participants-page">

        <div class="page-header">

            <h2>
                <i class="fa-solid fa-user-group"></i>
                Meeting Participants
            </h2>

            <p>
                Assign members to meeting requests.
            </p>

        </div>

        <div class="card shadow-sm mb-4">

            <div class="card-body">

                <form id="participantForm">

                    <div class="row">

                        <div class="col-md-5">

                            <label class="form-label">
                                Meeting Request
                            </label>

                            <select
                                id="meetingSelect"
                                class="form-select"
                                required>
                            </select>

                        </div>

                        <div class="col-md-5">

                            <label class="form-label">
                                Team Member
                            </label>

                            <select
                                id="memberSelect"
                                class="form-select"
                                required>
                            </select>

                        </div>

                        <div class="col-md-2 d-flex align-items-end">

                            <button
                                class="btn btn-primary w-100"
                                type="submit">

                                Add

                            </button>

                        </div>

                    </div>

                </form>

            </div>

        </div>

        <div class="card shadow-sm">

            <div class="card-body">

                <h5 class="mb-3">

                    Current Participants

                </h5>

                <div id="participantsTable">

                    Loading...

                </div>

            </div>

        </div>

    </div>

    `;

Promise.all([
    loadMeetingOptions(),
    loadMemberOptions()
]).then(() => {
    loadParticipants();
});

document
    .getElementById("participantForm")
    .addEventListener(
        "submit",
        createParticipant
    );

}

// ==========================================================
// CREATE PARTICIPANT
// ==========================================================

async function createParticipant(event) {

    event.preventDefault();

    const meeting_id =
        document.getElementById("meetingSelect").value;

    const member_id =
        document.getElementById("memberSelect").value;

    if (!meeting_id || !member_id) {

        alert("Please select both Meeting and Member.");

        return;

    }

    try {

        const response = await fetch(
            `${API}/meeting-participants`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    meeting_id: Number(meeting_id),
                    member_id: Number(member_id)
                })

            }
        );

        if (!response.ok) {

            const error = await response.json();

            alert(error.detail);

            return;

        }

        document
            .getElementById("participantForm")
            .reset();

        loadParticipants();

    }

    catch (error) {

        console.error(error);

    }

}

// ==========================================================
// LOAD PARTICIPANTS
// ==========================================================

async function loadParticipants() {

    try {

        const response = await fetch(
            `${API}/meeting-participants`
        );

        const participants =
            await response.json();

        const table =
            document.getElementById("participantsTable");

        if (participants.length === 0) {

            table.innerHTML = `
                <p>No participants added yet.</p>
            `;

            return;

        }

        let html = `

        <table class="table table-striped">

            <thead>

                <tr>

                    <th>ID</th>
                    <th>Meeting</th>
                    <th>Member</th>
                    <th>Actions</th>

                </tr>

            </thead>

            <tbody>

        `;

        participants.forEach(participant => {

            const meeting = participantMeetings.find(

                m => m.id === participant.meeting_id

            );

            const member = participantMembers.find(

                m => m.id === participant.member_id

            );

            html += `

                <tr>

                    <td>${participant.id}</td>

                    <td>${meeting ? meeting.title : participant.meeting_id}</td>

                    <td>${member ? member.name : participant.member_id}</td>

                    <td>

                        <button
                            class="btn btn-danger btn-sm"
                            onclick="deleteParticipant(${participant.id})">

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

    catch (error) {

        console.error(error);

    }

}

// ==========================================================
// LOAD MEETING REQUESTS
// ==========================================================

async function loadMeetingOptions() {

    try {

        const response = await fetch(
            `${API}/meetings`
        );

        const data = await response.json();
        const meetings = data.items;
        participantMeetings = meetings;

        const select =
            document.getElementById("meetingSelect");

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
// LOAD TEAM MEMBERS
// ==========================================================

async function loadMemberOptions() {

    try {

        const response = await fetch(
            `${API}/members`
        );

        const data = await response.json();

        const members = data.items;
        participantMembers = members;

        const select =
            document.getElementById("memberSelect");

        select.innerHTML =
            '<option value="">Select Member</option>';

        members.forEach(member => {

            select.innerHTML += `
                <option value="${member.id}">
                    ${member.name}
                </option>
            `;

        });

    }

    catch (error) {

        console.error(error);

    }

}

// ==========================================================
// DELETE PARTICIPANT
// ==========================================================

async function deleteParticipant(id) {

    if (!confirm("Remove this participant?")) {

        return;

    }

    try {

        const response = await fetch(

            `${API}/meeting-participants/${id}`,

            {
                method: "DELETE"
            }

        );

        if (!response.ok) {

            alert("Unable to delete participant.");

            return;

        }

        loadParticipants();

    }

    catch (error) {

        console.error(error);

    }

}