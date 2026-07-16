console.log("app.js loaded");

const API = "http://127.0.0.1:8000";

// ==========================================================
// SIDEBAR ACTIVE MENU
// ==========================================================

function setActiveMenu(menuId) {

    document
        .querySelectorAll(".sidebar li")
        .forEach(item => {

            item.classList.remove("active");

        });

    document
        .getElementById(menuId)
        .classList.add("active");

}

// ==========================================================
// LOAD DASHBOARD STATISTICS
// ==========================================================

async function loadDashboardStats() {

    try {

        const response = await fetch(

            `${API}/dashboard/statistics`

        );

        if (!response.ok) {

            throw new Error(
                "Unable to load dashboard statistics."
            );

        }

        const stats = await response.json();

        document.getElementById(
            "memberCount"
        ).textContent =
            stats.total_members;

        document.getElementById(
            "meetingCount"
        ).textContent =
            stats.total_meeting_requests;

        document.getElementById(
            "scheduledCount"
        ).textContent =
            stats.total_scheduled_meetings;

        document.getElementById(
            "pendingCount"
        ).textContent =
            stats.pending_meetings;

    }

    catch (error) {

        console.error(error);

    }

}

// ==========================================================
// APPLICATION START
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("DOM Loaded");

    // ==========================================================
    // DEFAULT PAGE
    // ==========================================================

    setActiveMenu("membersBtn");

    loadMembersPage();

    loadDashboardStats();

    // ==========================================================
    // SIDEBAR NAVIGATION
    // ==========================================================

    document
        .getElementById("membersBtn")
        .addEventListener("click", () => {

            setActiveMenu("membersBtn");

            loadMembersPage();

        });

    document
        .getElementById("availabilityBtn")
        .addEventListener("click", () => {

            setActiveMenu("availabilityBtn");

            loadAvailabilityPage();

        });

    document
        .getElementById("meetingsBtn")
        .addEventListener("click", () => {

            setActiveMenu("meetingsBtn");

            loadMeetingsPage();

        });

    document
        .getElementById("participantsBtn")
        .addEventListener("click", () => {

            setActiveMenu("participantsBtn");

            loadParticipantsPage();

        });

    document
        .getElementById("schedulerBtn")
        .addEventListener("click", () => {

            setActiveMenu("schedulerBtn");

            loadSchedulerPage();

        });

    document
        .getElementById("scheduledBtn")
        .addEventListener("click", () => {

            setActiveMenu("scheduledBtn");

            loadScheduledPage();

        });

    document
        .getElementById("statusBtn")
        .addEventListener("click", () => {

            setActiveMenu("statusBtn");

            loadStatusPage();

        });

    // ==========================================================
    // DASHBOARD CARDS
    // ==========================================================

    // Members

    document
        .getElementById("dashboardMembers")
        .addEventListener("click", () => {

            setActiveMenu("membersBtn");

            loadMembersPage();

        });

    // Meeting Requests

    document
        .getElementById("dashboardAvailability")
        .addEventListener("click", () => {

            setActiveMenu("meetingsBtn");

            loadMeetingsPage();

        });

    // Scheduled Meetings

    document
        .getElementById("dashboardMeetings")
        .addEventListener("click", () => {

            setActiveMenu("scheduledBtn");

            loadScheduledPage();

        });

    // Pending Meetings

    document
        .getElementById("dashboardScheduler")
        .addEventListener("click", () => {

            setActiveMenu("statusBtn");

            loadStatusPage();

        });

    // ==========================================================
    // NEW MEETING BUTTON
    // ==========================================================

    document
        .getElementById("newMeetingBtn")
        .addEventListener("click", () => {

            setActiveMenu("meetingsBtn");

            loadMeetingsPage();

        });

});