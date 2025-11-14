// =================================================================
// 1. CONFIGURATION & DATA (Live URL and Local Sample Data)
// =================================================================

// *** YOUR SHEET MONKEY FORM URL IS HERE ***
const FORM_SUBMISSION_ENDPOINT = 'https://api.sheetmonkey.io/form/f9exnjD2ZH24sodCB23y9q'; 

// Sample data for the 'MY DAILY WORK' table. Status updates work ONLY on this local array.
let dailyWorkInvoices = [
    { id: 1, Client: 'Sample Client', Status: 'Completed', Date: '2025-11-14' }, // Status changed to completed for initial demo
    { id: 2, Client: 'Example Co', Status: 'Completed', Date: '2025-11-13' },
    { id: 3, Client: 'Logistics Inc', Status: 'Completed', Date: '2025-11-12' }
];

// --- Static Data Arrays ---
const unappliedReceiptsData = [
    { ReceiptID: 1012, Customer: "ABC Corp", Amount: "$1,500.00", Date: "2025-10-20", Status: "UNAPPLIED" },
    { ReceiptID: 1013, Customer: "XYZ Ltd", Amount: "$4,250.00", Date: "2025-10-21", Status: "PENDING" },
    { ReceiptID: 1014, Customer: "PQR Co.", Amount: "$980.50", Date: "2025-10-22", Status: "UNAPPLIED" }
];

const stationeryDetailData = [
    { Item: "Notebook A4", Quantity: 50, UnitPrice: "$2.50", TotalValue: "$125.00" },
    { Item: "Pens Blue Ink", Quantity: 200, UnitPrice: "$0.75", TotalValue: "$150.00" },
    { Item: "Stapler (Heavy Duty)", Quantity: 5, UnitPrice: "$15.00", TotalValue: "$75.00" }
];

const personalData = [
    { ID: 1, Name: "Adil Z.", Phone: "555-1234", Designation: "Manager", Status: "Active" },
    { ID: 2, Name: "Jane D.", Phone: "555-5678", Designation: "Analyst", Status: "Inactive" },
    { ID: 3, Name: "John S.", Phone: "555-9012", Designation: "Clerk", Status: "Active" }
];

// --- Navigation Structure ---
const sheets = [
    { name: "ADD NEW INVOICE", id: "addNewInvoice" },
    { name: "MY DAILY WORK", id: "dailyWork" },
    { name: "Unapplied Receipts", id: "unappliedReceipts" },
    { name: "Stationery Detail", id: "stationeryDetail" },
    { name: "Rajni Ruksana CHQ's", id: "rajniRuksanaChqs" },
    { name: "MSQ Receipt's", id: "msqReceipts" },
    { name: "CHQ TO BE COLLECT", id: "chqToCollect" },
    { name: "Personal Data", id: "personalData" }
];


// =================================================================
// 2. LOCAL STATUS UPDATE FUNCTION (Working Tick)
// =================================================================

/**
 * Toggles the status of an invoice item in the local array.
 */
function toggleStatusLocal(itemId, currentStatus) {
    const index = dailyWorkInvoices.findIndex(item => item.id === itemId);

    if (index > -1) {
        const newStatus = (currentStatus === 'Completed' ? 'Pending' : 'Completed');
        dailyWorkInvoices[index].Status = newStatus;
        
        loadSheet('dailyWork', 'MY DAILY WORK');
    }
}


// =================================================================
// 3. BACKGROUND FORM SUBMISSION 
// =================================================================
async function submitInvoiceForm() {
    const form = document.getElementById('newInvoiceForm');
    const formData = new FormData(form);
    const submitBtn = form.querySelector('.submit-btn');
    const container = document.getElementById('dataContainer');
    
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;

    try {
        // Send data to the Sheet Monkey endpoint silently
        await fetch(FORM_SUBMISSION_ENDPOINT, {
            method: 'POST',
            body: formData,
            mode: 'no-cors' 
        });
        
        // Show the success message on the current page with two buttons
        container.innerHTML = `
            <div class="form-container" style="text-align: center;">
                <h2>✅ Task Submitted Successfully!</h2>
                <p>Your new task has been saved to the Google Sheet.</p>
                <div style="display: flex; justify-content: center; gap: 15px; margin-top: 20px;">
                    <button onclick="loadSheet('dailyWork', 'MY DAILY WORK')" 
                            class="submit-btn" 
                            style="width: auto; background-color: #3498db;">
                        View Daily Work
                    </button>
                    <button onclick="loadSheet('addNewInvoice', 'ADD NEW INVOICE')" 
                            class="submit-btn" 
                            style="width: auto;">
                        Submit New Task
                    </button>
                </div>
            </div>
        `;
        
        form.reset();
        
    } catch (error) {
        alert("Error saving data. Please check your network connection or the Sheet Monkey URL.");
        console.error('Submission Error:', error);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}


// =================================================================
// 4. CORE TABLE GENERATION FUNCTION (STREAMLINED)
// =================================================================
function generateTableHTML(data, title, sheetId) { 
    if (!data || data.length === 0) {
        return `<h2>${title}</h2><p>No data available for this sheet.</p>`;
    }
    
    let headers;
    if (sheetId === 'dailyWork') {
        // Streamlined Headers
        headers = ["Date", "Client", "Status", "Action"]; 
    } else {
        headers = Object.keys(data[0]);
    }

    let tableHTML = `<h2>${title}</h2><table class="data-table" id="data-table-${sheetId}"><thead><tr>`;
    
    headers.forEach(header => {
        tableHTML += `<th>${header}</th>`;
    });
    tableHTML += `</tr></thead><tbody>`;

    data.forEach(item => {
        tableHTML += `<tr>`;

        if (sheetId === 'dailyWork') {
            const isCompleted = item.Status === 'Completed';

            // Display Streamlined Columns
            tableHTML += `<td>${item.Date}</td>`; 
            tableHTML += `<td>${item.Client}</td>`;
            
            tableHTML += `<td class="status-cell ${isCompleted ? 'status-complete-text' : 'status-pending-text'}">
                                ${item.Status.toUpperCase()}
                            </td>`;
            
            tableHTML += `<td>`;
            if (!isCompleted) {
                // Calls the local toggle function with the item's temporary ID
                tableHTML += `<button class="action-btn check-btn" 
                                     data-id="${item.id}" 
                                     onclick="toggleStatusLocal(${item.id}, 'Pending')" 
                                     title="Mark Complete">
                                     &#10003; 
                                 </button>`;
            } else {
                // Checkmark is always pending unless clicked (since data is lost on refresh)
                tableHTML += `<span class="completed-text">✅ Done</span>`; 
            }
            tableHTML += `</td>`;

        } else {
            // Logic for static tables
            Object.keys(item).forEach(key => {
                tableHTML += `<td>${item[key]}</td>`;
            });
        }
        
        tableHTML += `</tr>`;
    });

    tableHTML += `</tbody></table>`;
    
    // --- NEW QUICK ADD BUTTON ---
    // Added button logic here to display below the table
    tableHTML += `
        <div style="margin-top: 20px; text-align: left;">
            <button 
                onclick="loadSheet('addNewInvoice', 'ADD NEW INVOICE')" 
                class="submit-btn" 
                style="width: auto; padding: 10px 20px; background-color: #3498db; font-size: 1.1em;"
                title="Quick Add New Task">
                + Add New Task
            </button>
        </div>
    `;

    return tableHTML;
}


// =================================================================
// 5. SHEET LOADING & SWITCHING LOGIC
// =================================================================
function loadSheet(sheetId, sheetName) {
    const container = document.getElementById('dataContainer');
    const mainHeader = document.getElementById('mainTitleHeader'); 
    
    // Function to get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Manage Header Visibility (Hide animation when loading a sheet)
    if (mainHeader) {
        mainHeader.style.display = 'none';
    }

    // 2. Reset Nav Links
    document.querySelectorAll('.sidebar li a').forEach(link => {
        link.classList.remove('active');
    });

    // Set the clicked link as active
    const activeLink = document.getElementById(sheetId);
    if (activeLink) activeLink.classList.add('active');

    // 3. Load Content 
    if (sheetId === 'addNewInvoice') {
        // Streamlined Form with Auto-Date
        container.innerHTML = `
            <h2>ADD NEW TASK</h2>
            <div class="form-container">
                <form id="newInvoiceForm" onsubmit="event.preventDefault(); submitInvoiceForm();">
                    
                    <div class="form-group" style="display:none;">
                        <label for="newDate">Date (Auto):</label>
                        <input type="date" id="newDate" name="Date" value="${today}" required>
                    </div>

                    <div class="form-group">
                        <label for="newClientName">Task/Client Name:</label>
                        <input type="text" id="newClientName" name="Client Name" required placeholder="e.g., Complete Report for John">
                    </div>
                    
                    <button type="submit" class="submit-btn">Save Task</button>
                </form>
            </div>
        `;
    } 
    // Data Tables
    else if (sheetId === 'dailyWork') {
        container.innerHTML = generateTableHTML(dailyWorkInvoices, sheetName, sheetId);
    } else if (sheetId === 'personalData') {
        container.innerHTML = generateTableHTML(personalData, sheetName, sheetId);
    } else if (sheetId === 'unappliedReceipts') {
        container.innerHTML = generateTableHTML(unappliedReceiptsData, sheetName, sheetId);
    } else if (sheetId === 'stationeryDetail') {
        container.innerHTML = generateTableHTML(stationeryDetailData, sheetName, sheetId);
    }
    // Default Content for non-data sheets
    else {
        container.innerHTML = `<h2>${sheetName}</h2><p>Content for ${sheetName} will be structured here.</p>`;
    }
}


// =================================================================
// 6. TYPING ANIMATION LOGIC
// =================================================================

const textElement = document.getElementById('typewriterText');
const textToType = "Welcome to the AD Data Manager";
const typingSpeed = 100; // ms per character
const pauseTime = 5000; // 5 seconds pause

let charIndex = 0;

function typeWriter() {
    if (!textElement) return; 

    if (charIndex < textToType.length) {
        textElement.textContent += textToType.charAt(charIndex);
        charIndex++;
        setTimeout(typeWriter, typingSpeed);
    } else {
        setTimeout(startDeleting, pauseTime);
    }
}

function startDeleting() {
    if (charIndex > 0) {
        textElement.textContent = textToType.substring(0, charIndex - 1);
        charIndex--;
        setTimeout(startDeleting, typingSpeed / 2); 
    } else {
        setTimeout(typeWriter, 500); 
    }
}


// =================================================================
// 7. INITIALIZATION (Runs when the page finishes loading)
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    
    const sheetList = document.getElementById('sheetList');
    
    // Build the Navigation Links
    sheets.forEach(sheet => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        
        link.href = "#"; 
        link.id = sheet.id;
        link.textContent = sheet.name;
        
        link.addEventListener('click', (e) => {
            e.preventDefault(); 
            loadSheet(sheet.id, sheet.name);
        });

        listItem.appendChild(link);
        sheetList.appendChild(listItem);
    });

    // Set the initial state: Animated Title is visible.
    const initialLink = document.getElementById('dailyWork');
    if (initialLink) initialLink.classList.add('active');
    
    const mainHeader = document.getElementById('mainTitleHeader');
    if (mainHeader) mainHeader.style.display = 'block'; 

    // Start the typing effect
    typeWriter(); 
});