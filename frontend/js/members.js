// ======================================================
// TEAM SCHEDULER
// MEMBERS MODULE
// ======================================================


// ======================================================
// API CONFIGURATION
// ======================================================

const MEMBERS_API = API + "/members";


// ======================================================
// GLOBAL VARIABLES
// ======================================================

let editingMemberId = null;

let isEditing = false;

let currentPage = 1;

const pageSize = 10;


// ======================================================
// SEARCH / SORT
// ======================================================

let currentSearch = "";

let currentSort = "id";

let currentOrder = "asc";


// ======================================================
// LOAD MEMBERS PAGE
// ======================================================

function loadMembersPage() {

    document.getElementById("pageContent").innerHTML = `

<div class="members-page">

    <div class="members-header">

        <div>

            <h2>

                <i class="fa-solid fa-users"></i>

                Team Members

            </h2>

            <p class="subtitle">

                Manage all team members.

            </p>

        </div>

    </div>



    <!-- MEMBER FORM -->

    <div class="card shadow-sm mb-4">

        <div class="card-body">

            <h5 class="mb-3">

                Add / Update Member

            </h5>

            <div class="row g-3">

                <div class="col-md-4">

                    <input

                        id="memberName"

                        class="form-control"

                        placeholder="Full Name"

                    >

                </div>

                <div class="col-md-4">

                    <input

                        id="memberEmail"

                        type="email"

                        class="form-control"

                        placeholder="Email"

                    >

                </div>

                <div class="col-md-4">

                    <input

                        id="memberDepartment"

                        class="form-control"

                        placeholder="Department"

                    >

                </div>

            </div>

            <div class="mt-4 d-flex gap-2">

                <button

                    id="memberActionBtn"

                    class="btn btn-primary"

                >

                    <i class="fa-solid fa-user-plus"></i>

                    Add Member

                </button>

                <button

                    id="cancelEditBtn"

                    class="btn btn-secondary"

                    style="display:none"

                >

                    Cancel

                </button>

            </div>

        </div>

    </div>



    <!-- SEARCH + SORT -->

    <div class="card shadow-sm mb-4">

        <div class="card-body">

            <div class="row g-3">

                <div class="col-md-6">

                    <input

                        id="searchBox"

                        class="form-control"

                        placeholder="Search by Name, Email or Department"

                    >

                </div>

                <div class="col-md-3">

                    <select

                        id="sortSelect"

                        class="form-select"

                    >

                        <option value="id">

                            Sort by ID

                        </option>

                        <option value="name">

                            Sort by Name

                        </option>

                        <option value="email">

                            Sort by Email

                        </option>

                        <option value="department">

                            Sort by Department

                        </option>

                    </select>

                </div>

                <div class="col-md-3">

                    <button

                        id="orderBtn"

                        class="btn btn-outline-primary w-100"

                    >

                        Ascending

                    </button>

                </div>

            </div>

        </div>

    </div>



    <!-- MEMBERS TABLE -->

    <div class="card shadow-sm">

        <div class="card-body">

            <div class="table-responsive">

                <table class="table table-hover align-middle">

                    <thead>

                        <tr>

                            <th>ID</th>

                            <th>Name</th>

                            <th>Email</th>

                            <th>Department</th>

                            <th width="180">

                                Actions

                            </th>

                        </tr>

                    </thead>

                    <tbody id="memberTable">

                    </tbody>

                </table>

            </div>

            <div

                id="pagination"

                class="mt-4 d-flex justify-content-center"

            >

            </div>

        </div>

    </div>

</div>

`;



    //----------------------------------------------------
    // EVENT LISTENERS
    //----------------------------------------------------

    document

        .getElementById("memberActionBtn")

        .addEventListener(

            "click",

            handleMemberButton

        );



    document

        .getElementById("cancelEditBtn")

        .addEventListener(

            "click",

            resetMemberForm

        );



    document

        .getElementById("searchBox")

        .addEventListener(

            "keyup",

            handleSearch

        );



    document

        .getElementById("sortSelect")

        .addEventListener(

            "change",

            handleSort

        );



    document

        .getElementById("orderBtn")

        .addEventListener(

            "click",

            toggleSortOrder

        );



    //----------------------------------------------------
    // INITIAL LOAD
    //----------------------------------------------------

    loadMembers();

}



// ======================================================
// BUTTON CONTROLLER
// ======================================================

function handleMemberButton() {

    if (isEditing) {

        updateMember();

    }

    else {

        createMember();

    }

}

// ======================================================
// LOAD MEMBERS
// ======================================================

async function loadMembers() {

    try {

        let response;

        // -----------------------------
        // SEARCH
        // -----------------------------

        if (currentSearch !== "") {

            response = await fetch(

                `${MEMBERS_API}/search?keyword=${encodeURIComponent(currentSearch)}`

            );

            if (!response.ok) {

                throw new Error("Unable to search members.");

            }

            const members = await response.json();

            renderMembersTable(members);

            document.getElementById("pagination").innerHTML = "";

            return;

        }

        // -----------------------------
        // SORT
        // -----------------------------

        if (

            currentSort !== "id" ||

            currentOrder !== "asc"

        ) {

            response = await fetch(

                `${MEMBERS_API}/sort?sort_by=${currentSort}&order=${currentOrder}`

            );

            if (!response.ok) {

                throw new Error("Unable to sort members.");

            }

            const members = await response.json();

            renderMembersTable(members);

            document.getElementById("pagination").innerHTML = "";

            return;

        }

        // -----------------------------
        // PAGINATION
        // -----------------------------

        response = await fetch(

            `${MEMBERS_API}/paginate?page=${currentPage}&page_size=${pageSize}`

        );

        if (!response.ok) {

            throw new Error("Unable to load members.");

        }

        const data = await response.json();

        renderMembersTable(data.items);

        renderPagination(data.total);

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

}



// ======================================================
// RENDER MEMBERS TABLE
// ======================================================

function renderMembersTable(members) {

    const table =

        document.getElementById("memberTable");

    table.innerHTML = "";

    if (members.length === 0) {

        table.innerHTML = `

            <tr>

                <td colspan="5" class="text-center">

                    No Members Found

                </td>

            </tr>

        `;

        return;

    }

    members.forEach(member => {

        table.innerHTML += `

            <tr>

                <td>${member.id}</td>

                <td>${member.name}</td>

                <td>${member.email}</td>

                <td>${member.department}</td>

                <td>

                    <button

                        class="btn btn-warning btn-sm me-2"

                        onclick="editMember(${member.id})"

                    >

                        <i class="fa-solid fa-pen"></i>

                        Edit

                    </button>

                    <button

                        class="btn btn-danger btn-sm"

                        onclick="deleteMember(${member.id})"

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

function renderPagination(totalRecords) {

    const pagination =

        document.getElementById("pagination");

    pagination.innerHTML = "";

    const totalPages =

        Math.ceil(

            totalRecords / pageSize

        );

    pagination.innerHTML += `

        <button

            class="btn btn-outline-primary me-2"

            ${currentPage === 1 ? "disabled" : ""}

            onclick="previousPage()"

        >

            Previous

        </button>

    `;

    for (

        let i = 1;

        i <= totalPages;

        i++

    ) {

        pagination.innerHTML += `

            <button

                class="btn ${i === currentPage ? "btn-primary" : "btn-outline-primary"} me-1"

                onclick="goToPage(${i})"

            >

                ${i}

            </button>

        `;

    }

    pagination.innerHTML += `

        <button

            class="btn btn-outline-primary ms-2"

            ${currentPage === totalPages ? "disabled" : ""}

            onclick="nextPage()"

        >

            Next

        </button>

    `;

}

// ======================================================
// SEARCH
// ======================================================

function handleSearch() {

    currentSearch =

        document
            .getElementById("searchBox")
            .value
            .trim();

    currentPage = 1;

    loadMembers();

}



// ======================================================
// SORT
// ======================================================

function handleSort() {

    currentSort =

        document
            .getElementById("sortSelect")
            .value;

    currentPage = 1;

    loadMembers();

}



// ======================================================
// TOGGLE SORT ORDER
// ======================================================

function toggleSortOrder() {

    if (currentOrder === "asc") {

        currentOrder = "desc";

        document
            .getElementById("orderBtn")
            .innerHTML = "Descending";

    }

    else {

        currentOrder = "asc";

        document
            .getElementById("orderBtn")
            .innerHTML = "Ascending";

    }

    loadMembers();

}



// ======================================================
// GO TO PAGE
// ======================================================

function goToPage(page) {

    currentPage = page;

    loadMembers();

}



// ======================================================
// PREVIOUS PAGE
// ======================================================

function previousPage() {

    if (currentPage > 1) {

        currentPage--;

        loadMembers();

    }

}



// ======================================================
// NEXT PAGE
// ======================================================

function nextPage() {

    currentPage++;

    loadMembers();

}

// ======================================================
// EDIT MEMBER
// ======================================================

async function editMember(memberId) {

    try {

        const response = await fetch(

            `${MEMBERS_API}/${memberId}`

        );

        if (!response.ok) {

            throw new Error("Unable to load member.");

        }

        const member = await response.json();

        document.getElementById("memberName").value =
            member.name;

        document.getElementById("memberEmail").value =
            member.email;

        document.getElementById("memberDepartment").value =
            member.department;

        editingMemberId = member.id;

        isEditing = true;

        const button =

            document.getElementById(

                "memberActionBtn"

            );

        button.innerHTML = `

            <i class="fa-solid fa-floppy-disk"></i>

            Update Member

        `;

        button.classList.remove(

            "btn-primary"

        );

        button.classList.add(

            "btn-success"

        );

        document.getElementById(

            "cancelEditBtn"

        ).style.display = "inline-block";

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}



// ======================================================
// CREATE MEMBER
// ======================================================

async function createMember() {

    const member = {

        name:

            document

                .getElementById("memberName")

                .value

                .trim(),

        email:

            document

                .getElementById("memberEmail")

                .value

                .trim(),

        department:

            document

                .getElementById("memberDepartment")

                .value

                .trim()

    };

    if (

        member.name === "" ||

        member.email === "" ||

        member.department === ""

    ){

        alert(

            "Please fill all fields."

        );

        return;

    }

    try{

        const response = await fetch(

            MEMBERS_API,

            {

                method:"POST",

                headers:{

                    "Content-Type":

                        "application/json"

                },

                body:

                    JSON.stringify(member)

            }

        );

        if(!response.ok){

            throw new Error(

                "Unable to create member."

            );

        }

        resetMemberForm();

        loadMembers();

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}



// ======================================================
// UPDATE MEMBER
// ======================================================

async function updateMember() {

    const member = {

        name:

            document

                .getElementById("memberName")

                .value

                .trim(),

        email:

            document

                .getElementById("memberEmail")

                .value

                .trim(),

        department:

            document

                .getElementById("memberDepartment")

                .value

                .trim()

    };

    if (

        member.name === "" ||

        member.email === "" ||

        member.department === ""

    ){

        alert(

            "Please fill all fields."

        );

        return;

    }

    try{

        const response = await fetch(

            `${MEMBERS_API}/${editingMemberId}`,

            {

                method:"PUT",

                headers:{

                    "Content-Type":

                        "application/json"

                },

                body:

                    JSON.stringify(member)

            }

        );

        if(!response.ok){

            throw new Error(

                "Unable to update member."

            );

        }

        resetMemberForm();

        loadMembers();

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}



// ======================================================
// DELETE MEMBER
// ======================================================

async function deleteMember(memberId){

    if(

        !confirm(

            "Delete this member?"

        )

    ){

        return;

    }

    try{

        const response = await fetch(

            `${MEMBERS_API}/${memberId}`,

            {

                method:"DELETE"

            }

        );

        if(!response.ok){

            throw new Error(

                "Unable to delete member."

            );

        }

        if(

            editingMemberId === memberId

        ){

            resetMemberForm();

        }

        loadMembers();

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}

// ======================================================
// RESET MEMBER FORM
// ======================================================

function resetMemberForm() {

    editingMemberId = null;

    isEditing = false;

    document.getElementById("memberName").value = "";

    document.getElementById("memberEmail").value = "";

    document.getElementById("memberDepartment").value = "";

    const button =
        document.getElementById("memberActionBtn");

    button.innerHTML = `

        <i class="fa-solid fa-user-plus"></i>

        Add Member

    `;

    button.classList.remove("btn-success");

    button.classList.add("btn-primary");

    document.getElementById(
        "cancelEditBtn"
    ).style.display = "none";

}



// ======================================================
// REFRESH MEMBERS
// ======================================================

function refreshMembers() {

    loadMembers();

}



// ======================================================
// CLEAR SEARCH
// ======================================================

function clearSearch() {

    currentSearch = "";

    document.getElementById(
        "searchBox"
    ).value = "";

    currentPage = 1;

    loadMembers();

}



// ======================================================
// RESET SORT
// ======================================================

function resetSort() {

    currentSort = "id";

    currentOrder = "asc";

    document.getElementById(
        "sortSelect"
    ).value = "id";

    document.getElementById(
        "orderBtn"
    ).innerHTML = "Ascending";

}



// ======================================================
// RESET ALL FILTERS
// ======================================================

function resetFilters() {

    clearSearch();

    resetSort();

    currentPage = 1;

    loadMembers();

}



// ======================================================
// RELOAD CURRENT VIEW
// ======================================================

function reloadCurrentView() {

    loadMembers();

}