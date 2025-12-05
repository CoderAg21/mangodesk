# MangoDesk: AI-Powered Employee Database

MangoDesk is a student project designed to make employee management easier. Instead of writing complex database queries, you can just ask questions in plain English, and our AI Agent handles the rest.

## 🚀 What it does
* **Talk to your Data:** Ask "Who is in the Engineering team?" and get an instant answer.
* **Smart Translation:** Converts your English questions into MongoDB commands automatically.
* **Synthetic Data:** Comes with a script to generate realistic test data (employees, salaries, scores).
* **Full Stack:** Built with React (Frontend) and Node.js (Backend).

---

## 🛠️ Tech Stack
* **Frontend:** React.js
* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **AI Model:** Google Gemini 1.5 Flash

---

## ⚙️ How to Run It

### 1. Clone & Install
```bash
git clone [https://github.com/CoderAg21/mangodesk.git](https://github.com/CoderAg21/mangodesk.git)
cd mangodesk

# Install Backend Deps
cd Backend
npm install

# Install Frontend Deps
cd ../Frontend
npm install
````

### 2\. Setup Keys

Create a `.env` file in the `Backend` folder:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mangodesk
GEMINI_API_KEY=your_key_here
```

### 3\. Seed Data (Important\!)

Run this once to fill the database with dummy employees:

```bash
cd Backend
node scripts/seed.js
```

### 4\. Start Servers

  * **Backend:** `node index.js` (Runs on port 5000)
  * **Frontend:** `npm start` (Runs on port 3000)

-----

## 👥 Contributors

  * **AI & NLP Processing:** [@dhairya9160](https://github.com/dhairya0910)
  * **Database & AI Logic:** [@Aviral580](https://github.com/Aviral580)
  * **Frontend & UI/UX:** [@anoshum](https://github.com/anoshum)
  * **Core Backend :** [@CoderAg21](https://github.com/CoderAg21)
