
# MangoDesk: AI-Powered Employee Database Agent

MangoDesk is a robust full-stack application designed to revolutionize how organizations manage employee data. Instead of complex SQL queries or rigid dashboards, MangoDesk allows users to interact with their database using **natural language**.

Powered by **Google Gemini AI** and **MongoDB**, the system intelligently understands user intent, translates English into database commands, and executes them securely.

## 🚀 Key Features

* **🗣️ Natural Language Interface:** Ask questions like *"Who in Engineering earns more than $100k?"* or *"Give me a list of remote workers."*
* **🧠 Intelligent Intent Classification:** Uses Google Gemini to distinguish between database reads, updates, and general queries.
* **🛡️ Secure Query Engine:** Translates AI intents into strict MongoDB operations to prevent unsafe access.
* **📊 Synthetic Data Seeder:** Comes with a built-in script to populate the database with realistic, rich employee profiles (salary, performance scores, remote work %, etc.).
* **⚡ Monorepo Structure:** Clean separation between the React Frontend and Node.js/Express Backend.

---

## 🛠️ Tech Stack

### Backend
* **Runtime:** Node.js & Express.js
* **Language:** JavaScript (ES6+)
* **Database:** MongoDB (via Mongoose ODM)
* **AI Engine:** Google Gemini (`@google/generative-ai`)
* **Utils:** `csv-parser` for data ingestion, `dotenv` for security.

### Frontend
* **Framework:** React.js
* **Styling:** CSS / Components

---

## 📂 Project Structure

```text
mangodesk/
├── Backend/                 # API & AI Agent Logic
│   ├── controllers/         # Request handlers (AgentController)
│   ├── models/              # Mongoose Schemas (Employee.js)
│   ├── routes/              # API Route definitions
│   ├── services/            # Business Logic
│   │   ├── intentClassifier.js  # Talk to Gemini
│   │   ├── intentToMongo.js     # Translate AI -> DB
│   │   └── queryEngine.js       # Execute DB operations
│   ├── scripts/             # Utilities (seed.js)
│   ├── data/                # Raw datasets (employees.csv)
│   └── index.js             # Server entry point
│
└── Frontend/                # React User Interface
    ├── public/
    └── src/
````

-----

## ⚡ Getting Started

### 1\. Prerequisites

  * Node.js (v18 or higher)
  * MongoDB (Local running on port `27017` or MongoDB Atlas URI)
  * Google Gemini API Key

### 2\. Installation

Clone the repository:

```bash
git clone [https://github.com/CoderAg21/mangodesk.git](https://github.com/CoderAg21/mangodesk.git)
cd mangodesk
```

#### Setup Backend

```bash
cd Backend
npm install
```

#### Setup Frontend

```bash
cd ../Frontend
npm install
```

### 3\. Configuration (.env)

Create a `.env` file inside the `Backend/` folder. **Do not commit this file.**

```env
# Backend/.env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mangodesk
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 4\. Seeding the Database

Before running the agent, populate your local MongoDB with the sample data:

```bash
# Inside Backend/ folder
node scripts/seed.js
```

*Output: ` Database successfully seeded!`*

-----

## 🏃‍♂️ Running the Application

### Start the Backend Server

The server runs on `http://localhost:5000`.

```bash
cd Backend
node index.js
```

### Start the Frontend Client

The React app runs on `http://localhost:3000`.

```bash
cd Frontend
npm start
```

-----

## 🧠 AI Agent API Usage

The core AI brain is exposed via a REST API. You can test it using cURL or Postman.

**Endpoint:** `POST /api/brain/command`

**Request Body:**

```json
{
  "prompt": "Find all employees in the Sales department with a performance score above 4"
}
```

**Response:**

```json
{
  "status": "Success",
  "action": "find",
  "data": [
    {
      "name": "Jane Doe",
      "department": "Sales",
      "performance_score": 4.5,
      "salary_usd": 120000
    },
    
  ]
}
```

-----

## 🤝 Contributors

  * **AI & NLP Processing:** [@dhairya0910](https://github.com/dhairya0910)
  * **Frontend & UI/UX:**[ @anoshum](https://github.com/anoshum)
  * **Database & AI logic:** [@Aviral580](https://github.com/Aviral580)
  * **Core Backend:** [@CoderAg21](https://github.com/CoderAg21)
    
## 📜 License

This project is licensed under the ISC License.

