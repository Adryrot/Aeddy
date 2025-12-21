// 1. Insert student name, credit hour and current GPA as existing student
// Format: [Name, Credit Hour, GPA]
let studentData = [
    ["Abdul Wahab", 15, 3.75],
    ["Abdul Dudu", 14, 3.40],
    ["Abdul Wahib", 18, 4.00],
    ["Ahmad Sinema Agung", 12, 3.50],
    ["Abdul Wahub", 16, 2.95]
];

// 2. Check new student Dean's List eligibility
function checkDeanList(creditHour, gpa) {
    if (creditHour >= 12 && gpa >= 3.50) {
        return "<span class='eligible'>Dean's List Eligible</span>";
    } else {
        return "<span class='not-eligible'>Not Dean's List Eligible</span>";
    }
}

// 3. Delete if have wrong information
function deleteStudent(index) {
    studentData.splice(index, 1);
    displayStudents();
}

// 4. Double confirm for deletion
function deleteStudent(index) {
    if (confirm("Are you sure you want to delete this student?")) {
        studentData.splice(index, 1);
        displayStudents();
    }
}


// Display all students
function displayStudents() {
    let output = document.getElementById("output");
    output.innerHTML = "";

    for (let i = 0; i < studentData.length; i++) {

        let status = checkDeanList(studentData[i][1], studentData[i][2]);

        output.innerHTML += `
            <div class="student">
                <b>Name:</b> ${studentData[i][0]}<br>
                <b>Current GPA:</b> ${studentData[i][2]}<br>
                <b>Status:</b> ${status}<br>

                <button onclick="deleteStudent(${i})">Delete</button>
            </div>
            <hr>
        `;
    }
}


// Initial display for existing student data
displayStudents();

// 5. Form handling
document.getElementById("studentForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let name = document.getElementById("name").value;
    let creditHour = parseInt(document.getElementById("creditHour").value);
    let gpa = parseFloat(document.getElementById("gpa").value);


    // Min & Max value for credit hour & gpa
    if (creditHour < 1 || creditHour > 20) {
        alert("Credit hours must be between 1 and 20.");
        return;
    }

    if (gpa < 0 || gpa > 4) {
        alert("GPA must be between 0.00 and 4.00.");
        return;
    }

    // Store new student data
    studentData.push([name, creditHour, gpa]);

    function deleteStudent(index) {
    if (confirm("Are you sure you want to delete this student?")) {
        studentData.splice(index, 1);
    }
}


    // Update display after new student insert a data
    displayStudents();

    // Clear form
    this.reset();
});
