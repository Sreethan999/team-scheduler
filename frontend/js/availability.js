// ======================================================
// TEAM SCHEDULER
// AVAILABILITY MODULE
// ======================================================

const AVAILABILITY_API = API + "/availability";

let editingAvailabilityId = null;

let isEditingAvailability = false;

// Pagination
let currentAvailabilityPage = 1;

const availabilityPageSize = 5;


// ======================================================
// LOAD AVAILABILITY PAGE
// ======================================================

async function loadAvailabilityPage(){

    document.getElementById("pageContent").innerHTML = `

<div class="availability-page">

    <div class="availability-header">

        <div>

            <h2>

                <i class="fa-solid fa-clock"></i>

                Team Availability

            </h2>

            <p class="subtitle">

                Manage member availability.

            </p>

        </div>

    </div>



    <!-- ================================================= -->
    <!-- AVAILABILITY FORM -->
    <!-- ================================================= -->

    <div class="card shadow-sm mb-4">

        <div class="card-body">

            <h5 class="mb-3">

                Add / Update Availability

            </h5>

            <div class="row g-3">

                <div class="col-md-3">

                    <select
                        id="availabilityMember"
                        class="form-select"
                    >

                        <option value="">

                            Select Member

                        </option>

                    </select>

                </div>



                <div class="col-md-3">

                    <input
                        id="availabilityDate"
                        type="date"
                        class="form-control"
                    >

                </div>



                <div class="col-md-3">

                    <input
                        id="availabilityStart"
                        type="time"
                        class="form-control"
                    >

                </div>



                <div class="col-md-3">

                    <input
                        id="availabilityEnd"
                        type="time"
                        class="form-control"
                    >

                </div>

            </div>



            <div class="mt-4 d-flex gap-2">

                <button
                    id="availabilityActionBtn"
                    class="btn btn-primary"
                >

                    <i class="fa-solid fa-plus"></i>

                    Add Availability

                </button>



                <button
                    id="cancelAvailabilityBtn"
                    class="btn btn-secondary"
                    style="display:none"
                >

                    Cancel

                </button>

            </div>

        </div>

    </div>

<!-- ================================================= -->
<!-- SEARCH / SORT TOOLBAR -->
<!-- ================================================= -->

<div class="card shadow-sm mb-4">

    <div class="card-body">

        <div class="row g-3">

            <div class="col-md-4">

                <input
                    type="text"
                    id="availabilitySearch"
                    class="form-control"
                    placeholder="Search availability..."
                >

            </div>

            <div class="col-md-3">

                <select
                    id="availabilitySort"
                    class="form-select"
                >

                    <option value="id">Sort by ID</option>

                    <option value="member_id">Sort by Member</option>

                    <option value="date">Sort by Date</option>

                    <option value="start_time">Sort by Start Time</option>

                    <option value="end_time">Sort by End Time</option>

                </select>

            </div>

            <div class="col-md-2">

                <select
                    id="availabilityOrder"
                    class="form-select"
                >

                    <option value="asc">Ascending</option>

                    <option value="desc">Descending</option>

                </select>

            </div>

            <div class="col-md-3 d-grid">

                <button
                    id="availabilitySearchBtn"
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
    <!-- AVAILABILITY TABLE -->
    <!-- ================================================= -->

    <div class="card shadow-sm">

        <div class="card-body">

            <h5 class="mb-3">

                Availability Records

            </h5>

            <div class="table-responsive">

                <table class="table table-hover align-middle">

                    <thead>

                        <tr>

                            <th>ID</th>

                            <th>Member ID</th>

                            <th>Date</th>

                            <th>Start Time</th>

                            <th>End Time</th>

                            <th width="180">

                                Actions

                            </th>

                        </tr>

                    </thead>

                    <tbody id="availabilityTable">

                    </tbody>

                </table>
                <nav class="mt-4">

    <ul

        class="pagination justify-content-center"

        id="availabilityPagination"

    >

    </ul>

</nav>

            </div>

        </div>

    </div>

</div>

`;

    await loadMemberDropdown();

    await loadAvailability();

    document

        .getElementById("availabilityActionBtn")

        .addEventListener(

            "click",

            handleAvailabilityButton

        );

    document

        .getElementById("cancelAvailabilityBtn")

        .addEventListener(

            "click",

            resetAvailabilityForm

        );
    
    document
    .getElementById("availabilitySearchBtn")
    .addEventListener(
        "click",
        searchAvailability
    );

    document
    .getElementById("availabilitySort")
    .addEventListener(
        "change",
        sortAvailability
    );

    document
    .getElementById("availabilityOrder")
    .addEventListener(
        "change",
        sortAvailability
    );

}



// ======================================================
// BUTTON CONTROLLER
// ======================================================

function handleAvailabilityButton(){

    if(isEditingAvailability){

        updateAvailability();

    }

    else{

        createAvailability();

    }

}



// ======================================================
// MEMBER DROPDOWN
// ======================================================

async function loadMemberDropdown(){

    try{

        const response = await fetch(

            MEMBERS_API

        );

        if(!response.ok){

            throw new Error(

                "Unable to load members."

            );

        }

        const data = await response.json();

        const members = data.items;

        const dropdown =

            document.getElementById(

                "availabilityMember"

            );

        dropdown.innerHTML =

            `<option value="">Select Member</option>`;

        members.forEach(member=>{

            dropdown.innerHTML += `

                <option value="${member.id}">

                    ${member.name}

                </option>

            `;

        });

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}

// ======================================================
// CREATE AVAILABILITY
// ======================================================

async function createAvailability(){

    const availability = {

        member_id: parseInt(
            document
                .getElementById("availabilityMember")
                .value
        ),

        date:
            document
                .getElementById("availabilityDate")
                .value,

        start_time:
            document
                .getElementById("availabilityStart")
                .value,

        end_time:
            document
                .getElementById("availabilityEnd")
                .value

    };

    if(

        !availability.member_id ||

        availability.date === "" ||

        availability.start_time === "" ||

        availability.end_time === ""

    ){

        alert("Please fill all fields.");

        return;

    }

    if(

        availability.start_time >=

        availability.end_time

    ){

        alert("Start time must be before End time.");

        return;

    }

    try{

        const response = await fetch(

            AVAILABILITY_API,

            {

                method: "POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body: JSON.stringify(
                    availability
                )

            }

        );

        if(!response.ok){

            throw new Error(
                "Unable to create availability."
            );

        }

        alert("Availability added successfully.");

        resetAvailabilityForm();

        currentAvailabilityPage = 1;

        await loadAvailability();

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}


// ======================================================
// LOAD AVAILABILITY
// ======================================================

async function loadAvailability(

    page = currentAvailabilityPage

){

    const search =

        document
            .getElementById("availabilitySearch")
            ?.value || "";

    const sortBy =

        document
            .getElementById("availabilitySort")
            ?.value || "id";

    const order =

        document
            .getElementById("availabilityOrder")
            ?.value || "asc";

    try{

        const response = await fetch(

            `${AVAILABILITY_API}?page=${page}&page_size=${availabilityPageSize}&search=${encodeURIComponent(search)}&sort_by=${sortBy}&order=${order}`

        );

        if(!response.ok){

            throw new Error(

                "Unable to load availability."

            );

        }

        const data = await response.json();

        renderAvailabilityTable(

            data.items

        );

        renderAvailabilityPagination(

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
// SEARCH AVAILABILITY
// ======================================================

async function searchAvailability(){

    currentAvailabilityPage = 1;

    await loadAvailability();

}

// ======================================================
// SORT AVAILABILITY
// ======================================================

async function sortAvailability(){

    currentAvailabilityPage = 1;

    await loadAvailability();

}

// ======================================================
// RENDER PAGINATION
// ======================================================

function renderAvailabilityPagination(

    total,

    page,

    pageSize

){

    const pagination =

        document.getElementById(

            "availabilityPagination"

        );

    pagination.innerHTML = "";

    const totalPages =

        Math.ceil(

            total / pageSize

        );

    if(totalPages <= 1){

        return;

    }

    for(

        let i = 1;

        i <= totalPages;

        i++

    ){

        pagination.innerHTML += `

            <li class="page-item ${i===page ? "active" : ""}">

                <button

                    class="page-link"

                    onclick="goToAvailabilityPage(${i})"

                >

                    ${i}

                </button>

            </li>

        `;

    }

}

// ======================================================
// CHANGE PAGE
// ======================================================

async function goToAvailabilityPage(page){

    currentAvailabilityPage = page;

    await loadAvailability();

}

// ======================================================
// RENDER AVAILABILITY TABLE
// ======================================================

function renderAvailabilityTable(records){

    const table =

        document.getElementById(
            "availabilityTable"
        );

    table.innerHTML = "";

    if(records.length === 0){

        table.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="text-center"
                >

                    No Availability Found

                </td>

            </tr>

        `;

        return;

    }

    records.forEach(record=>{

        table.innerHTML += `

            <tr>

                <td>${record.id}</td>

                <td>${record.member_id}</td>

                <td>${record.date}</td>

                <td>${record.start_time}</td>

                <td>${record.end_time}</td>

                <td>

                    <button

                        class="btn btn-warning btn-sm me-2"

                        onclick="editAvailability(${record.id})"

                    >

                        <i class="fa-solid fa-pen"></i>

                        Edit

                    </button>

                    <button

                        class="btn btn-danger btn-sm"

                        onclick="deleteAvailability(${record.id})"

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
// EDIT AVAILABILITY
// ======================================================

async function editAvailability(id){

    try{

        const response = await fetch(

            `${AVAILABILITY_API}/${id}`

        );

        if(!response.ok){

            throw new Error(

                "Unable to load availability."

            );

        }

        const availability = await response.json();

        document
            .getElementById("availabilityMember")
            .value = availability.member_id;

        document
            .getElementById("availabilityDate")
            .value = availability.date;

        document
            .getElementById("availabilityStart")
            .value = availability.start_time;

        document
            .getElementById("availabilityEnd")
            .value = availability.end_time;

        editingAvailabilityId = availability.id;

        isEditingAvailability = true;

        const button =

            document.getElementById(
                "availabilityActionBtn"
            );

        button.innerHTML = `

            <i class="fa-solid fa-floppy-disk"></i>

            Update Availability

        `;

        button.classList.remove(
            "btn-primary"
        );

        button.classList.add(
            "btn-success"
        );

        document
            .getElementById("cancelAvailabilityBtn")
            .style.display = "inline-block";

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}



// ======================================================
// UPDATE AVAILABILITY
// ======================================================

async function updateAvailability(){

    const availability = {

        member_id: parseInt(

            document
                .getElementById("availabilityMember")
                .value

        ),

        date:

            document
                .getElementById("availabilityDate")
                .value,

        start_time:

            document
                .getElementById("availabilityStart")
                .value,

        end_time:

            document
                .getElementById("availabilityEnd")
                .value

    };

    if(

        !availability.member_id ||

        availability.date === "" ||

        availability.start_time === "" ||

        availability.end_time === ""

    ){

        alert(

            "Please fill all fields."

        );

        return;

    }

    if(

        availability.start_time >=

        availability.end_time

    ){

        alert(

            "Start time must be before End time."

        );

        return;

    }

    try{

        const response = await fetch(

            `${AVAILABILITY_API}/${editingAvailabilityId}`,

            {

                method: "PUT",

                headers:{

                    "Content-Type":"application/json"

                },

                body: JSON.stringify(

                    availability

                )

            }

        );

        if(!response.ok){

            throw new Error(

                "Unable to update availability."

            );

        }

        alert(

            "Availability updated successfully."

        );

        resetAvailabilityForm();

        await loadAvailability(currentAvailabilityPage);

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}

// ======================================================
// DELETE AVAILABILITY
// ======================================================

async function deleteAvailability(id){

    const confirmDelete = confirm(

        "Are you sure you want to delete this availability?"

    );

    if(!confirmDelete){

        return;

    }

    try{

        const response = await fetch(

            `${AVAILABILITY_API}/${id}`,

            {

                method: "DELETE"

            }

        );

        if(!response.ok){

            throw new Error(

                "Unable to delete availability."

            );

        }

        alert(

            "Availability deleted successfully."

        );

        await loadAvailability(currentAvailabilityPage);

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}



// ======================================================
// RESET AVAILABILITY FORM
// ======================================================

function resetAvailabilityForm(){

    editingAvailabilityId = null;

    isEditingAvailability = false;

    document
        .getElementById("availabilityMember")
        .value = "";

    document
        .getElementById("availabilityDate")
        .value = "";

    document
        .getElementById("availabilityStart")
        .value = "";

    document
        .getElementById("availabilityEnd")
        .value = "";

    const button =

        document.getElementById(

            "availabilityActionBtn"

        );

    button.innerHTML = `

        <i class="fa-solid fa-plus"></i>

        Add Availability

    `;

    button.classList.remove(

        "btn-success"

    );

    button.classList.add(

        "btn-primary"

    );

    document
        .getElementById("cancelAvailabilityBtn")
        .style.display = "none";

}



// ======================================================
// REFRESH AVAILABILITY
// ======================================================

async function refreshAvailability(){

    await loadAvailability();

}

