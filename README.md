# JAMB Study Hub 📚

A comprehensive web-based platform for JAMB (Joint Admissions and Matriculation Board) exam preparation, featuring detailed study materials, progress tracking, and mock examinations for all four core subjects.

## Features ✨

### 📖 Comprehensive Study Materials
- **Four Core Subjects**: English, Physics, Chemistry, and Mathematics
- **Detailed Topic Coverage**: Each topic includes:
  - Simple explanations for quick understanding
  - Comprehensive detailed notes
  - Worked examples with solutions
  - Practice exercises with instant feedback
  - Past JAMB questions with explanations

### 📊 Progress Tracking
- Track completion status for each topic
- Monitor time spent studying
- View overall progress across all subjects
- Subject-specific progress indicators

### 🎯 Mock Examinations
- Timed mock exams for each subject
- Auto-graded results with detailed feedback
- Question-by-question review
- Performance analysis showing strengths and weaknesses
- Suggested topics for improvement

### 📈 Personalized Dashboard
- Overall progress visualization
- Subject-wise completion percentages
- Strengths and weaknesses analysis
- Recommended next topics
- Recent activity timeline
- Mock exam history

### 🎨 Modern User Interface
- Clean, responsive design
- Smooth animations and transitions
- Mobile-friendly layout
- Premium typography for enhanced readability
- Color-coded subjects for easy navigation

## Tech Stack 🛠️

- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Template Engine**: EJS (Embedded JavaScript)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Authentication**: Session-based with bcrypt password hashing
- **Styling**: Custom CSS with modern design system

## Installation 🚀

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Setup Steps

1. **Clone or navigate to the project directory**
   ```bash
   cd "c:\Users\hp\Desktop\jamb scheduler"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   The `.env` file is already created with default values. Update if needed:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/jamb-study
   SESSION_SECRET=your-secret-key-change-this-in-production-12345
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

5. **Seed the database**
   
   Populate the database with subjects and topics:
   ```bash
   npm run seed
   ```

6. **Start the application**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

7. **Access the application**
   
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage Guide 📝

### Getting Started

1. **Register an Account**
   - Click "Register" in the navigation bar
   - Fill in your username, email, and password
   - Submit the form to create your account

2. **Browse Subjects**
   - View all four subjects on the homepage
   - Click on any subject to see its syllabus and topics

3. **Study Topics**
   - Select a topic to view detailed content
   - Read explanations and notes
   - Work through examples
   - Practice with exercises
   - Test yourself with past questions
   - Mark topics as complete when finished

4. **Take Mock Exams**
   - Navigate to "Mock Exam" from the menu
   - Select a subject
   - Complete the timed exam (40 questions, 60 minutes)
   - Review your results and performance analysis

5. **Track Progress**
   - Visit your Dashboard to see:
     - Overall completion percentage
     - Progress per subject
     - Strengths and weaknesses
     - Suggested topics to study next
     - Recent activity

## Project Structure 📁

```
jamb-scheduler/
├── models/              # MongoDB schemas
│   ├── User.js
│   ├── Subject.js
│   ├── Topic.js
│   ├── Progress.js
│   └── Score.js
├── routes/              # Express routes
│   ├── auth.js
│   ├── home.js
│   ├── subjects.js
│   ├── topics.js
│   ├── mockExam.js
│   └── dashboard.js
├── views/               # EJS templates
│   ├── partials/
│   │   ├── header.ejs
│   │   └── footer.ejs
│   ├── home.ejs
│   ├── subject.ejs
│   ├── topic.ejs
│   ├── login.ejs
│   ├── register.ejs
│   └── dashboard.ejs
├── public/              # Static assets
│   ├── css/
│   │   ├── main.css
│   │   ├── typography.css
│   │   ├── components.css
│   │   └── animations.css
│   └── js/
│       ├── main.js
│       └── exercises.js
├── seed/                # Database seeding
│   ├── subjects.json
│   ├── topics/
│   │   ├── english.json
│   │   ├── physics.json
│   │   ├── chemistry.json
│   │   └── mathematics.json
│   └── seedDatabase.js
├── middleware/          # Custom middleware
│   └── auth.js
├── .env                 # Environment variables
├── .gitignore
├── package.json
├── server.js            # Application entry point
└── README.md
```

## API Endpoints 🔌

### Authentication
- `GET /register` - Registration page
- `POST /register` - Create new user
- `GET /login` - Login page
- `POST /login` - Authenticate user
- `GET /logout` - Logout user

### Content
- `GET /` - Homepage
- `GET /subjects/:slug` - Subject page
- `GET /topics/:id` - Topic page
- `POST /topics/:id/complete` - Toggle topic completion
- `POST /topics/:id/time` - Track time spent

### Mock Exams
- `GET /mock-exam` - Mock exam selection
- `GET /mock-exam/:slug` - Start exam
- `POST /mock-exam/:slug/submit` - Submit exam
- `GET /mock-exam/results/:scoreId` - View results

### Dashboard
- `GET /dashboard` - User dashboard

## Features in Detail 🔍

### Progress Tracking System
- Automatic time tracking on topic pages
- Completion status with visual checkmarks
- Persistent progress across sessions
- Real-time progress updates

### Mock Exam System
- Randomized question selection from topic exercises and past questions
- Countdown timer with auto-submit
- Instant grading with detailed feedback
- Performance analytics
- Topic-based strength/weakness identification

### Educational Content
- Structured learning path
- Progressive difficulty
- Real JAMB past questions
- Detailed explanations for all answers
- Formula references and examples

## Customization 🎨

### Adding More Content

1. **Add Topics**: Edit JSON files in `seed/topics/`
2. **Update Syllabus**: Modify `seed/subjects.json`
3. **Re-seed Database**: Run `npm run seed`

### Styling
- Modify CSS variables in `public/css/main.css`
- Customize colors, fonts, and spacing
- All styles are organized by purpose

## Troubleshooting 🔧

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify MongoDB is accessible on the specified port

### Port Already in Use
- Change `PORT` in `.env` file
- Or stop the process using port 3000

### Seeding Errors
- Ensure MongoDB is running
- Check JSON file syntax
- Verify file paths are correct

## Contributing 🤝

Contributions are welcome! Areas for improvement:
- Additional subject content
- More practice questions
- Enhanced analytics
- Mobile app version
- Offline mode support

## License 📄

MIT License - feel free to use this project for educational purposes.

## Support 💬

For issues or questions:
- Check the troubleshooting section
- Review the code documentation
- Ensure all dependencies are installed

## Acknowledgments 🙏

- Built for Nigerian JAMB candidates
- Content based on official JAMB syllabus
- Designed with student success in mind

---

**Good luck with your JAMB preparation! 🎓**
