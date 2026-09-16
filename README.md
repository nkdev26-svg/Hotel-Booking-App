# Raintech Hotel Booking System

A modern, responsive, and completely self-contained Hotel Management and Guest Booking System built with Next.js, React, Tailwind CSS, and Framer Motion. 

This project operates entirely in the browser using `localStorage` for state management. This means you do not need to configure any external databases, servers, or API keys to run it. It is perfectly self-contained for rapid testing and demonstrations.

---

## 🚀 How to Run the App

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your computer.

### Installation & Startup

1. **Clone the repository** (or download the files):
   ```bash
   git clone <your-repository-url>
   ```
2. **Navigate into the project folder**:
   ```bash
   cd "hotel booking app"
   ```
3. **Install the dependencies**:
   ```bash
   npm install
   ```
4. **Start the local development server**:
   ```bash
   npm run dev
   ```
5. **Open your browser** and navigate to `http://localhost:3000`.

---

## 📖 How to Operate the System (User Guide)

The app is divided into **four main sections**. Because it uses real time cross tab synchronization, you can open the Customer Booking page in one browser tab and the Admin Check-in page in another tab, and watch the data update instantly!

### 1. Customer Booking Portal (`/book`)
**URL:** [http://localhost:3000/book](http://localhost:3000/book)
This is the customer-facing side of the hotel. 
- **Step 1:** Customers select their check in and check out dates, and input the number of adults and children. The system automatically filters out rooms that are already booked for those dates or cannot accommodate the party size.
- **Step 2:** The customer enters their name and phone number and finalizes the booking.
- *Once booked, the new reservation is instantly sent to the Admin Check-in dashboard as a **Pending Approval**.*

### 2. Admin Check-in Dashboard (`/`)
**URL:** [http://localhost:3000/](http://localhost:3000/)
This is where hotel staff manage arriving guests.
- **Pending Approvals:** A Notification Bell in the header alerts staff instantly of new customer bookings. Staff can open the panel to review and **Approve** or **Reject** the reservations.
- **Select Booking:** The "Select Customer" dropdown automatically lists all expected arrivals (including recently approved bookings). 
- **Review & Update Details:** Staff can verify the room number, update the guest name, adjust the party size (adults/kids), change checkout dates, and even "upload" an ID proof.
- **Check-in:** Clicking "Confirm Guest Details" and "Complete Check-in" moves the guest from the "Expected Arrivals" list into the "Active Guests Roster" at the bottom of the page.

### 3. Admin Check-out System (`/checkout`)
**URL:** [http://localhost:3000/checkout](http://localhost:3000/checkout)
This is where staff handle departing guests and final billing.
- **Find Guest:** Search for a guest by name, ID, or room number, or select them directly from the active guest dropdown.
- **Additional Charges:** Staff can easily add extra charges to the guest's bill (e.g., Room Service, Extra Bed, Minibar) using the quick-add buttons.
- **Billing Calculation:** The system dynamically calculates the total Room Rent based on the number of nights stayed, adds a standard **18% GST**, and totals up any additional charges to generate the final bill.

### 4. Main Dashboard (`/dashboard`)
**URL:** [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
A high-level overview of the hotel's current status. 
*(Note: The main dashboard serves primarily as a UI showcase. Only the **Check-in** and **Check-out** quick action buttons are fully functional; the statistics and recent activity logs are currently hard-coded UI placeholders.)*
- **Quick Actions:** Easily navigate to the fully functional Check-in or Check-out panels.
- **Statistics & Activity:** (Hard-coded) UI mockups displaying Total Revenue, Available Rooms, and Recent Activity for demonstration purposes.

---

## 🛠️ Tech Stack

- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **State Management:** React Context API + Local Storage (Cross-tab syncing via storage event listeners)
