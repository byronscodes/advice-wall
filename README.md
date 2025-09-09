# Advice Wall

A full-stack interactive note-sharing web application where users can post, view, and interact with short pieces of advice in a dynamic, data-driven visualization.

---

## Features
- Post new notes that appear instantly using **Firebase Realtime Database**.
- Interactive **note cloud visualization** built with **D3.js**:
  - Draggable notes
  - Multiple layout modes
  - Quadtree-based collision detection for efficient rendering
- User engagement tools:
  - Like / dislike system with per-device vote tracking
  - Automatic expiration and deletion of notes
- Responsive UI built with **React** and **Material-UI**, including dialogs for note creation, viewing, and deletion.
- **Deployed on Firebase Hosting** with analytics tracking.

---

## Tech Stack
- **Frontend**: React, Material-UI, D3.js
- **Backend**: Firebase Realtime Database
- **Hosting & Analytics**: Firebase Hosting
- **Language**: JavaScript (ES6+)

---

## Project Structure

```
src/
├── components/ # React components (dialogs, note cloud, UI elements)
├── hooks/ # Custom React hooks for state & Firebase integration
├── services/ # Firebase database functions (CRUD operations)
├── App.js # Main application entry point
└── index.js # React DOM render
```

---

## ⚙Installation & Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/advice-wall.git
   cd advice-wall
   ```
   
2. Install dependencies:
  ```bash
  Copy code
  npm install
  ```

3. Create a .env file and add your Firebase config:

  ```env
  REACT_APP_API_KEY=your_api_key
  REACT_APP_AUTH_DOMAIN=your_project_id.firebaseapp.com
  REACT_APP_DATABASE_URL=https://your_project_id.firebaseio.com
  REACT_APP_PROJECT_ID=your_project_id
  REACT_APP_STORAGE_BUCKET=your_project_id.appspot.com
  REACT_APP_MESSAGING_SENDER_ID=your_sender_id
  REACT_APP_APP_ID=your_app_id
  ```

4. Run the app locally:
  ```bash
  Copy code
  npm start
  ```

5. Deploy to Firebase:
  ```bash
  Copy code
  npm run build
  firebase deploy
  ```
