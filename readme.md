# MISIÓN FUTURO — Interactive Quiz Runner

![WordPress](https://img.shields.io/badge/WordPress-21759B?style=for-the-badge&logo=wordpress&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

**Misión Futuro** transforms traditional data collection into an engaging **2D
pixel-art runner game**. Designed as a WordPress plugin, it gamifies the
questionnaire experience, increasing user engagement and completion rates.

## 🚀 Key Features

### 🎮 Gamified Experience

- **Interactive Gameplay**: Users control a character in a retro-style
  environment, dodging obstacles to reach "question stations."
- **Seamless Flow**: The entire experience—gameplay, questions, and final
  form—happens on a single canvas without page reloads.
- **Responsive Design**: Optimized controls for both **Desktop** (keyboard) and
  **Mobile** (touch/joystick).

### 📋 Smart Data Collection

- **Integrated Form**: Collects user details (Name, Phone, Email) upon
  completion.
- **Auto-Grading**: Logic to recommend specific academies based on user answers.
- **CSV Export**: Automatically saves all submissions to a CSV file for easy
  data management.

### 🔌 Easy Integration

- **Shortcode System**: Embed the game anywhere using `[quiz_runner]`.
- **Standalone Plugin**: No complex configuration required—just install and
  activate.

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript (Canvas API) for the game engine and physics.
- **Backend**: PHP (WordPress Plugin API) for handling AJAX requests and CSV
  operations.
- **Styling**: Responsive CSS for layout and retro aesthetics.

## 📁 Project Structure

```
mision-futuro/
├── quiz-runner.php          # Plugin entry point
├── includes/
│   ├── class-qr-plugin.php      # Core plugin setup
│   ├── class-qr-assets.php      # Script & style enqueue
│   ├── class-qr-ajax.php        # AJAX handler (lead capture + CSV)
│   ├── class-qr-mailer.php      # SMTP email integration
│   └── class-qr-shortcode.php   # [quiz_runner] shortcode
├── templates/
│   └── app.php                  # Game HTML template
└── assets/
    ├── css/app.css              # All styles (responsive + retro theme)
    ├── js/
    │   ├── vendor/microloop.js  # Minimal game loop & input lib
    │   ├── data.js              # Questions, scoring engine & academy matching
    │   ├── game.js              # Game engine (physics, rendering, logic)
    │   ├── ui.js                # UI modals (start, select, question, form, ceremony)
    │   ├── bootstrap.js         # Initialization & asset loading
    │   ├── audio.js             # Sound manager
    │   ├── fs.js                # Fullscreen manager (iOS/Android)
    │   ├── viewport.js          # Responsive viewport scaling
    │   └── virtualpad.js        # Touch controls
    ├── audio/                   # Music & SFX
    ├── img/                     # Sprites, backgrounds & logos
    └── fonts/                   # Game Over pixel font
```

## 📦 Installation

1. **Download** the repository and compress the folder into a `.zip` file.
2. Go to your **WordPress Admin** > **Plugins** > **Add New**.
3. Click **Upload Plugin** and select your `.zip` file.
4. **Activate** the plugin.
5. Add the shortcode `[quiz_runner]` to any page or post.

## 📄 License

This project is open-source and available for personal and educational use.
