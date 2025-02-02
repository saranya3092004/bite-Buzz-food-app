# 🍽️ Bite Buzz – Food Ordering App  

Bite Buzz is a dynamic **food ordering application** where users can browse through categories, manage their cart, track their orders, and search for food items with an intelligent search feature. The app also includes an **admin panel** for managing categories, food items, and top sales dynamically.  

---

## 🏗️ Project Overview  

### 🔹 Client (User Side)  

Users can:  
- ✅ Browse through food categories and available items  
- ✅ Search for food items with a **smart search** that detects **spelling errors** and **partial matches**  
- ✅ Add/remove items from their **cart**  
- ✅ Manage their **orders**  
- ✅ Sign in using **Firebase authentication**  
- ✅ Check **food availability** before placing an order  
- ✅ When an item is ordered, its **quantity decreases dynamically** in the database  

---

### 🔹 Admin Panel  

Admins can:  
- ✅ **Add new food categories** with images  
- ✅ **Add, edit, and delete** food items dynamically  
- ✅ **Feature food items** in the **Top Sale** section  
- ✅ Manage all operations in real-time  

---

## 🔧 Tech Stack Used  

| **Technology** | **Purpose** |
|---------------|------------|
| **React.js** | Frontend framework |
| **Firebase Authentication** | User authentication |
| **Firebase Realtime Database** | Data storage and updates |
| **CSS3** | Styling and responsiveness |
| **Vite** | Fast development server |
| **NPM Packages** | Additional dependencies |

---

## 🚀 Getting Started  

### 1️⃣ Clone the Repository  
```sh
git clone https://github.com/saranya3092004/bite-Buzz-food-app.git
cd bite-Buzz-food-app
```

### 2️⃣ Setup Environment Variables
🟢 Client Side (/client/.env)
Create a .env file inside the client folder and add the following Firebase credentials:
env
Copy
Edit
```sh
VITE_REACT_APP_ADMIN_EMAIL_1="your_admin_email"
VITE_REACT_APP_FIREBASE_API_KEY="your_api_key"
VITE_REACT_APP_FIREBASE_AUTH_DOMAIN="your_auth_domain"
VITE_REACT_APP_FIREBASE_DATABASEURL="your_database_url"
VITE_REACT_APP_FIREBASE_PROJECT_ID="your_project_id"
VITE_REACT_APP_FIREBASE_STORAGE_BUCKET="your_storage_bucket"
VITE_REACT_APP_FIREBASE_MESSAGING_SENDER_ID="your_messaging_sender_id"
VITE_REACT_APP_FIREBASE_APP_ID="your_app_id"
```
🔵 Admin Side (/admin/.env)
Create a .env file inside the admin folder and add:

env
Copy
Edit
```sh
VITE_REACT_APP_FIREBASE_API_KEY="your_api_key"
VITE_REACT_APP_FIREBASE_AUTH_DOMAIN="your_auth_domain"
VITE_REACT_APP_FIREBASE_DATABASEURL="your_database_url"
VITE_REACT_APP_FIREBASE_PROJECT_ID="your_project_id"
VITE_REACT_APP_FIREBASE_STORAGE_BUCKET="your_storage_bucket"
VITE_REACT_APP_FIREBASE_MESSAGING_SENDER_ID="your_messaging_sender_id"
VITE_REACT_APP_FIREBASE_APP_ID="your_app_id"
```
###3️⃣ Install Dependencies & Run the Project
🟢 Start Client
Copy
Edit
```sh
cd client
npm install
npm i vite@latest
npm run dev
```
🔵 Start Admin Panel
sh
Copy
Edit
```sh
cd admin
npm install
npm i vite@latest
npm run dev
```

### 🌐 Access the Application

- **Client (User Side)**: [http://localhost:5173](http://localhost:5173)  
- **Admin Panel**: [http://localhost:5174](http://localhost:5174) (or another Vite-assigned port)

### 📌 Key Features & Functionality

#### ✅ User Features (Client Side)
- ✔ **Browse Food Items & Categories**: Users can navigate through different food categories and items.
- ✔ **Smart Search**: A search bar that corrects spelling mistakes and finds partial matches.
- ✔ **Cart Management**: Users can add or remove items from their cart dynamically.
- ✔ **Order Tracking**: Users can manage their orders and check their status.
- ✔ **Real-Time Availability Check**: Items update dynamically when ordered, reducing available quantity.
- ✔ **Secure Authentication**: Users sign in securely using Firebase authentication.

#### ✅ Admin Features (Admin Panel)
- ✔ **Category Management**: Admins can add, edit, or delete food categories with images.
- ✔ **Food Item Management**: Admins can add, update, and remove food items dynamically.
- ✔ **Top Sales Section**: Admins can highlight best-selling items.
- ✔ **Firebase Integration**: All operations are handled dynamically via Firebase Realtime Database.

### 🎯 Future Enhancements
- 🔹 Add **Order History** feature for users.
- 🔹 Implement **payment gateway** integration.
- 🔹 Improve **UI/UX design** with animations and better responsiveness.
- 🔹 Introduce **push notifications** for order updates.






