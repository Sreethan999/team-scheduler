// ======================================================
// TEAM SCHEDULER
// MEETING REQUEST MODULE
// ======================================================

const MEETINGS_API = API + "/meetings";

let editingMeetingId = null;

let isEditingMeeting = false;

let currentMeetingPage = 1;

const meetingPageSize = 5;


// ======================================================
// LOAD MEETING PAGE
// ======================================================

async function loadMeetingsPage(){

    document.getElementById("pageContent").innerHTML = `

<div class="meetings-page">

    <div class="meetings-header">

        <div>

            <h2>

                <i class="fa-solid fa-calendar-plus"></i>

                Meeting Requests

            </h2>

            <p class="subtitle">

                Create and manage meeting requests.

            </p>

        </div>

    </div>



    <!-- ================================================= -->
    <!-- MEETING FORM -->
    <!-- ================================================= -->

    <div class="card shadow-sm mb-4">

        <div class="card-body">

            <h5 class="mb-3">

                Add / Update Meeting

            </h5>

            <div class="row g-3">

                <div class="col-md-3">

                    <input

                        id="meetingTitle"

                        type="text"

                        class="form-control"

                        placeholder="Meeting Title"

                    >

                </div>



                <div class="col-md-2">

                    <input

                        id="meetingDuration"

                        type="number"

                        class="form-control"

                        placeholder="Duration (minutes)"

                    >

                </div>



                <div class="col-md-3">

                    <input

                        id="meetingStartDate"

                        type="date"

                        class="form-control"

                    >

                </div>



                <div class="col-md-3">

                    <input

                        id="meetingEndDate"

                        type="date"

                        class="form-control"

                    >

                </div>

            </div>



            <div class="mt-4 d-flex gap-2">

                <button

                    id="meetingActionBtn"

                    class="btn btn-primary"

                >

                    <i class="fa-solid fa-plus"></i>

                    Add Meeting

                </button>



                <button

                    id="cancelMeetingBtn"

                    class="btn btn-secondary"

                    style="display:none"

                >

                    Cancel

                </button>

            </div>

        </div>

    </div>



    <!-- ================================================= -->
    <!-- SEARCH / SORT -->
    <!-- ================================================= -->

    <div class="card shadow-sm mb-4">

        <div class="card-body">

            <div class="row g-3">

                <div class="col-md-4">

                    <input

                        type="text"

                        id="meetingSearch"

                        class="form-control"

                        placeholder="Search meetings..."

                    >

                </div>



                <div class="col-md-3">

                    <select

                        id="meetingSort"

                        class="form-select"

                    >

                        <option value="id">

                            Sort by ID

                        </option>

                        <option value="title">

                            Sort by Title

                        </option>

                        <option value="duration">

                            Sort by Duration

                        </option>

                        <option value="preferred_start_date">

                            Sort by Start Date

                        </option>

                        <option value="preferred_end_date">

                            Sort by End Date

                        </option>

                        <option value="status">

                            Sort by Status

                        </option>

                    </select>

                </div>



                <div class="col-md-2">

                    <select

                        id="meetingOrder"

                        class="form-select"

                    >

                        <option value="asc">

                            Ascending

                        </option>

                        <option value="desc">

                            Descending

                        </option>

                    </select>

                </div>



                <div class="col-md-3 d-grid">

                    <button

                        id="meetingSearchBtn"

                        class="btn btn-primary"

                    >

                        <i class="fa-solid fa-magnifying-glass"></i>

                        Search

                    </button>

                </div>

            </div>

        </div>

    </div>



    <!-- ================================================= -->
    <!-- TABLE -->
    <!-- ================================================= -->

    <div class="card shadow-sm">

        <div class="card-body">

            <h5 class="mb-3">

                Meeting Requests

            </h5>

            <div class="table-responsive">

                <table class="table table-hover align-middle">

                    <thead>

                        <tr>

                            <th>ID</th>

                            <th>Title</th>

                            <th>Duration</th>

                            <th>Start Date</th>

                            <th>End Date</th>

                            <th>Status</th>

                            <th width="180">

                                Actions

                            </th>

                        </tr>

                    </thead>

                    <tbody id="meetingsTable">

                    </tbody>

                </table>

                <nav class="mt-4">

                    <ul

                        class="pagination justify-content-center"

                        id="meetingsPagination"

                    >

                    </ul>

                </nav>

            </div>

        </div>

    </div>

</div>

`;

    document
        .getElementById("meetingActionBtn")
        .addEventListener(
            "click",
            handleMeetingButton
        );

    document
        .getElementById("cancelMeetingBtn")
        .addEventListener(
            "click",
            resetMeetingForm
        );

    document
        .getElementById("meetingSearchBtn")
        .addEventListener(
            "click",
            searchMeetings
        );

    document
        .getElementById("meetingSort")
        .addEventListener(
            "change",
            sortMeetings
        );

    document
        .getElementById("meetingOrder")
        .addEventListener(
            "change",
            sortMeetings
        );

    await loadMeetings();

}

// ======================================================
// BUTTON CONTROLLER
// ======================================================

function handleMeetingButton(){

    if(isEditingMeeting){

        updateMeeting();

    }

    else{

        createMeeting();

    }

}



// ======================================================
// CREATE MEETING
// ======================================================

async function createMeeting(){

    const meeting = {

        title:

            document
                .getElementById("meetingTitle")
                .value
                .trim(),

        duration: parseInt(

            document
                .getElementById("meetingDuration")
                .value

        ),

        preferred_start_date:

            document
                .getElementById("meetingStartDate")
                .value,

        preferred_end_date:

            document
                .getElementById("meetingEndDate")
                .value

    };

    if(

        meeting.title === "" ||

        isNaN(meeting.duration) ||

        meeting.preferred_start_date === "" ||

        meeting.preferred_end_date === ""

    ){

        alert(

            "Please fill all fields."

        );

        return;

    }

    if(

        meeting.preferred_start_date >

        meeting.preferred_end_date

    ){

        alert(

            "Start date cannot be after End date."

        );

        return;

    }

    try{

        const response = await fetch(

            MEETINGS_API,

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json"

                },

                body: JSON.stringify(

                    meeting

                )

            }

        );

        if(!response.ok){

            throw new Error(

                "Unable to create meeting."

            );

        }

        alert(

            "Meeting created successfully."

        );

        resetMeetingForm();

        currentMeetingPage = 1;

        await loadMeetings();

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}



// ======================================================
// RESET FORM
// ======================================================

function resetMeetingForm(){

    editingMeetingId = null;

    isEditingMeeting = false;

    document
        .getElementById("meetingTitle")
        .value = "";

    document
        .getElementById("meetingDuration")
        .value = "";

    document
        .getElementById("meetingStartDate")
        .value = "";

    document
        .getElementById("meetingEndDate")
        .value = "";

    const button =

        document.getElementById(

            "meetingActionBtn"

        );

    button.innerHTML = `

        <i class="fa-solid fa-plus"></i>

        Add Meeting

    `;

    button.classList.remove(

        "btn-success"

    );

    button.classList.add(

        "btn-primary"

    );

    document
        .getElementById("cancelMeetingBtn")
        .style.display = "none";

}



// ======================================================
// LOAD MEETINGS
// ======================================================

async function loadMeetings(

    page = currentMeetingPage

){

    const search =

        document
            .getElementById("meetingSearch")
            ?.value || "";

    const sortBy =

        document
            .getElementById("meetingSort")
            ?.value || "id";

    const order =

        document
            .getElementById("meetingOrder")
            ?.value || "asc";

    try{

        const response = await fetch(

            `${MEETINGS_API}?page=${page}&page_size=${meetingPageSize}&search=${encodeURIComponent(search)}&sort_by=${sortBy}&order=${order}`

        );

        if(!response.ok){

            throw new Error(

                "Unable to load meetings."

            );

        }

        const data = await response.json();

        renderMeetingsTable(

            data.items

        );

        renderMeetingsPagination(

            data.total,

            data.page,

            data.page_size

        );

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}



// ======================================================
// SEARCH
// ======================================================

async function searchMeetings(){

    currentMeetingPage = 1;

    await loadMeetings();

}



// ======================================================
// SORT
// ======================================================

async function sortMeetings(){

    currentMeetingPage = 1;

    await loadMeetings();

}

// ======================================================
// RENDER MEETINGS TABLE
// ======================================================

function renderMeetingsTable(meetings){

    const table =

        document.getElementById(

            "meetingsTable"

        );

    table.innerHTML = "";

    if(meetings.length === 0){

        table.innerHTML = `

            <tr>

                <td

                    colspan="7"

                    class="text-center"

                >

                    No Meeting Requests Found

                </td>

            </tr>

        `;

        return;

    }

    meetings.forEach(meeting=>{

        table.innerHTML += `

            <tr>

                <td>

                    ${meeting.id}

                </td>

                <td>

                    ${meeting.title}

                </td>

                <td>

                    ${meeting.duration}

                </td>

                <td>

                    ${meeting.preferred_start_date}

                </td>

                <td>

                    ${meeting.preferred_end_date}

                </td>

                <td>

                    ${meeting.status}

                </td>

                <td>

                    <button

                        class="btn btn-warning btn-sm me-2"

                        onclick="editMeeting(${meeting.id})"

                    >

                        <i class="fa-solid fa-pen"></i>

                        Edit

                    </button>

                    <button

                        class="btn btn-danger btn-sm"

                        onclick="deleteMeeting(${meeting.id})"

                    >

                        <i class="fa-solid fa-trash"></i>

                        Delete

                    </button>

                </td>

            </tr>

        `;

    });

}



// ======================================================
// PAGINATION
// ======================================================

function renderMeetingsPagination(

    total,

    page,

    pageSize

){

    const pagination =

        document.getElementById(

            "meetingsPagination"

        );

    pagination.innerHTML = "";

    const totalPages = Math.ceil(

        total / pageSize

    );

    if(totalPages <= 1){

        return;

    }

    // Previous Button

    pagination.innerHTML += `

        <li class="page-item ${page===1 ? "disabled" : ""}">

            <button

                class="page-link"

                onclick="goToMeetingPage(${page-1})"

            >

                Previous

            </button>

        </li>

    `;

    // Page Numbers

    for(

        let i = 1;

        i <= totalPages;

        i++

    ){

        pagination.innerHTML += `

            <li class="page-item ${i===page ? "active" : ""}">

                <button

                    class="page-link"

                    onclick="goToMeetingPage(${i})"

                >

                    ${i}

                </button>

            </li>

        `;

    }

    // Next Button

    pagination.innerHTML += `

        <li class="page-item ${page===totalPages ? "disabled" : ""}">

            <button

                class="page-link"

                onclick="goToMeetingPage(${page+1})"

            >

                Next

            </button>

        </li>

    `;

}



// ======================================================
// CHANGE PAGE
// ======================================================

async function goToMeetingPage(page){

    currentMeetingPage = page;

    await loadMeetings();

}

// ======================================================
// EDIT MEETING
// ======================================================

async function editMeeting(id){

    try{

        const response = await fetch(

            `${MEETINGS_API}/${id}`

        );

        if(!response.ok){

            throw new Error(

                "Unable to load meeting."

            );

        }

        const meeting = await response.json();

        document
            .getElementById("meetingTitle")
            .value = meeting.title;

        document
            .getElementById("meetingDuration")
            .value = meeting.duration;

        document
            .getElementById("meetingStartDate")
            .value = meeting.preferred_start_date;

        document
            .getElementById("meetingEndDate")
            .value = meeting.preferred_end_date;

        editingMeetingId = meeting.id;

        isEditingMeeting = true;

        const button =

            document.getElementById(

                "meetingActionBtn"

            );

        button.innerHTML = `

            <i class="fa-solid fa-floppy-disk"></i>

            Update Meeting

        `;

        button.classList.remove(

            "btn-primary"

        );

        button.classList.add(

            "btn-success"

        );

        document
            .getElementById("cancelMeetingBtn")
            .style.display = "inline-block";

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}



// ======================================================
// UPDATE MEETING
// ======================================================

async function updateMeeting(){

    const meeting = {

        title:

            document
                .getElementById("meetingTitle")
                .value
                .trim(),

        duration: parseInt(

            document
                .getElementById("meetingDuration")
                .value

        ),

        preferred_start_date:

            document
                .getElementById("meetingStartDate")
                .value,

        preferred_end_date:

            document
                .getElementById("meetingEndDate")
                .value

    };

    if(

        meeting.title === "" ||

        isNaN(meeting.duration) ||

        meeting.preferred_start_date === "" ||

        meeting.preferred_end_date === ""

    ){

        alert(

            "Please fill all fields."

        );

        return;

    }

    if(

        meeting.preferred_start_date >

        meeting.preferred_end_date

    ){

        alert(

            "Start date cannot be after End date."

        );

        return;

    }

    try{

        const response = await fetch(

            `${MEETINGS_API}/${editingMeetingId}`,

            {

                method:"PUT",

                headers:{

                    "Content-Type":"application/json"

                },

                body: JSON.stringify(

                    meeting

                )

            }

        );

        if(!response.ok){

            throw new Error(

                "Unable to update meeting."

            );

        }

        alert(

            "Meeting updated successfully."

        );

        resetMeetingForm();

        await loadMeetings(currentMeetingPage);

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}



// ======================================================
// DELETE MEETING
// ======================================================

async function deleteMeeting(id){

    const confirmDelete = confirm(

        "Are you sure you want to delete this meeting?"

    );

    if(!confirmDelete){

        return;

    }

    try{

        const response = await fetch(

            `${MEETINGS_API}/${id}`,

            {

                method:"DELETE"

            }

        );

        if(!response.ok){

            throw new Error(

                "Unable to delete meeting."

            );

        }

        alert(

            "Meeting deleted successfully."

        );

        await loadMeetings(currentMeetingPage);

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}