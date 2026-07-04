/* ==========================================================================
   LearnVerse AI â€” Main Application Script
   AI Learning Operating System
   ========================================================================== */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js';

const firebaseConfig = {
  apiKey: 'AIzaSyBgnDMRbpBc3wKPuB8OZAxPjgs8fnN0C1E',
  authDomain: 'learnverse-ai.firebaseapp.com',
  projectId: 'learnverse-ai',
  storageBucket: 'learnverse-ai.firebasestorage.app',
  messagingSenderId: '857155149610',
  appId: '1:857155149610:web:f0ab80a97f246a821f8853',
  measurementId: 'G-ZWDXS35SCQ'
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(value => value && !String(value).startsWith('REPLACE_WITH_'));
const firebaseApp = hasFirebaseConfig ? initializeApp(firebaseConfig) : null;
const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
const firebaseDb = firebaseApp ? getFirestore(firebaseApp) : null;
const firebaseStorage = firebaseApp ? getStorage(firebaseApp) : null;
const firebaseAnalytics = firebaseApp ? getAnalytics(firebaseApp) : null;
const googleProvider = firebaseAuth ? new GoogleAuthProvider() : null;
if (googleProvider) {
  googleProvider.setCustomParameters({ prompt: 'select_account' });
}

const initializeAppContent = () => {
  let googlePopupActive = false;

  function showLoadingOverlay(message = "Loading LearnVerse...") {
    let overlay = document.getElementById('auth-loading-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'auth-loading-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
      overlay.style.display = 'flex';
      overlay.style.flexDirection = 'column';
      overlay.style.justifyContent = 'center';
      overlay.style.alignItems = 'center';
      overlay.style.zIndex = '9999';
      overlay.style.transition = 'opacity 0.2s ease-in-out';
      
      const spinner = document.createElement('div');
      spinner.style.width = '40px';
      spinner.style.height = '40px';
      spinner.style.border = '4px solid #F2CFD2';
      spinner.style.borderTop = '4px solid #443025';
      spinner.style.borderRadius = '50%';
      spinner.style.animation = 'spin 1s linear infinite';
      
      const text = document.createElement('div');
      text.id = 'auth-loading-text';
      text.style.marginTop = '16px';
      text.style.fontSize = '1.1rem';
      text.style.fontFamily = "'Outfit', 'Inter', sans-serif";
      text.style.color = '#443025';
      text.style.fontWeight = '600';
      
      if (!document.getElementById('spinner-keyframes')) {
        const style = document.createElement('style');
        style.id = 'spinner-keyframes';
        style.textContent = `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `;
        document.head.appendChild(style);
      }
      
      overlay.appendChild(spinner);
      overlay.appendChild(text);
      document.body.appendChild(overlay);
    }
    const textEl = document.getElementById('auth-loading-text');
    if (textEl) textEl.textContent = message;
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'all';
  }

  function hideLoadingOverlay() {
    const overlay = document.getElementById('auth-loading-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      setTimeout(() => {
        if (overlay.style.opacity === '0') {
          overlay.remove();
        }
      }, 200);
    }
  }

  // Immediately show check overlay on startup
  showLoadingOverlay("Checking session...");

  // Initialize Lucide Icons
  function initIcons() {
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
  initIcons();

  /* ==========================================================================
     SECTION 1: TRANSLATION DICTIONARY (i18n)
  ========================================================================== */
  const translations = {
    en: {
      "nav-home": "Home",
      "nav-features": "Features",
      "nav-learning-modes": "Learning Modes",
      "nav-about": "About",
      "hero-badge": "NEW ERA OF LEARNING",
      "btn-get-started": "Get Started",
      "btn-explore": "Explore LearnVerse",
      "why-title": "Why LearnVerse?",
      "feat1-title": "Personalized Learning",
      "feat1-desc": "Adapts content dynamically to match your natural learning style.",
      "feat2-title": "AI-Powered Education",
      "feat2-desc": "Understands deep conceptual relationships in your textbook.",
      "feat3-title": "Gamified Learning",
      "feat3-desc": "Earn XP, complete educational questlines, and unlock cute avatars.",
      "feat4-title": "Exam Preparation",
      "feat4-desc": "Simulate realistic exam scenarios with custom quizzes and instant reviews.",
      "feat5-title": "Progress Tracking",
      "feat5-desc": "Visualize your strengths and focus points across chapters.",
      "feat6-title": "Multi-language Support",
      "feat6-desc": "Translate concepts into 9 regional and international languages.",
      "step1-title": "Upload Study Material",
      "upload-heading": "Drag and drop your study file here",
      "upload-subheading": "Supports PDF, PPT, DOCX, Images, or Notes",
      "browse-files": "Browse Files",
      "process-btn": "Transform Content with AI",
      "processing-title": "AI Processing",
      "proc-1": "Analyzing file contents...",
      "proc-2": "Extracting chapters and hierarchy...",
      "proc-3": "Understanding underlying concepts...",
      "proc-4": "Creating personalized learning experience...",
      "step2-title": "Choose How You Want To Learn",
      "step3-title": "Interactive Preview",
      "preview-empty-title": "Awaiting Studio Processing",
      "preview-empty-desc": "Choose a file on Home, click 'Transform Content with AI' to unlock all learning modes.",
      "about-badge": "OUR MISSION",
      "about-title": "Students should adapt less. Learning should adapt more.",
      "profile-title": "Student Profile",
      "select-avatar": "Choose Your Avatar",
      "foot-col-links": "Links",
      "foot-col-contact": "Contact",
      "foot-col-legal": "Legal",
      "foot-help": "Help Center",
      "foot-feedback": "Feedback",
      "foot-privacy": "Privacy Policy",
      "foot-terms": "Terms & Conditions",
      "foot-cookies": "Cookie Preferences",
      "mode1-name": "Teacher Mode",
      "mode1-desc": "AI conducts classroom lectures and breaks down key theories step-by-step.",
      "mode2-name": "Manga Mode",
      "mode2-desc": "Visual panels and storytelling speech bubbles translate complex details.",
      "mode3-name": "Game Mode",
      "mode3-desc": "Earn points, clear quizzes, and climb rankings in structured study raids.",
      "mode4-name": "Mind Map Mode",
      "mode4-desc": "Visual flowchart links logical entities to map out subject relationships.",
      "mode5-name": "Quick Revision",
      "mode5-desc": "Fast flashcards containing summaries, bullet points, and core definitions.",
      "mode6-name": "Quiz Mode",
      "mode6-desc": "Multiple-choice tests evaluate your grasp of the topic with immediate grading.",
      "mode7-name": "Voice Tutor",
      "mode7-desc": "An audio companion reads notes or explains concepts like an audiobook.",
      "mode8-name": "Story Mode",
      "mode8-desc": "Translates formulas and histories into metaphors and fairytale contexts.",
      "chat-online": "Study Companion â€¢ Online",
      "notif-title": "Notifications",
      "notif-clear": "Clear all",
      "newsletter-title": "Subscribe to our newsletter"
    },
    te: {
      "btn-get-started": "à°ªà±à°°à°¾à°°à°‚à°­à°¿à°‚à°šà°‚à°¡à°¿",
      "step1-title": "à°¸à±à°Ÿà°¡à±€ à°®à±†à°Ÿà±€à°°à°¿à°¯à°²à± à°…à°ªà±â€Œà°²à±‹à°¡à± à°šà±‡à°¯à°‚à°¡à°¿",
      "upload-heading": "à°®à±€ à°¸à±à°Ÿà°¡à±€ à°«à±ˆà°²à±â€Œà°¨à± à°‡à°•à±à°•à°¡ à°¡à±à°°à°¾à°ªà± à°šà±‡à°¯à°‚à°¡à°¿",
      "upload-subheading": "PDF, PPT, DOCX, à°šà°¿à°¤à±à°°à°¾à°²à± à°²à±‡à°¦à°¾ à°¨à±‹à°Ÿà±à°¸à±â€Œà°•à± à°®à°¦à±à°¦à°¤à± à°‡à°¸à±à°¤à±à°‚à°¦à°¿",
      "process-btn": "AI à°¤à±‹ à°•à°‚à°Ÿà±†à°‚à°Ÿà±â€Œà°¨à± à°®à°¾à°°à±à°šà°‚à°¡à°¿",
      "processing-title": "AI à°ªà±à°°à°¾à°¸à±†à°¸à°¿à°‚à°—à±",
      "proc-1": "à°«à±ˆà°²à± à°µà°¿à°·à°¯à°¾à°²à°¨à± à°µà°¿à°¶à±à°²à±‡à°·à°¿à°¸à±à°¤à±‹à°‚à°¦à°¿...",
      "proc-2": "à°…à°§à±à°¯à°¾à°¯à°¾à°²à± à°¸à°‚à°—à±à°°à°¹à°¿à°¸à±à°¤à±‹à°‚à°¦à°¿...",
      "proc-3": "à°…à°‚à°¤à°°à±à°—à°¤ à°­à°¾à°µà°¨à°²à°¨à± à°…à°°à±à°¥à°‚ à°šà±‡à°¸à±à°•à±à°‚à°Ÿà±‹à°‚à°¦à°¿...",
      "proc-4": "à°µà±à°¯à°•à±à°¤à°¿à°—à°¤à±€à°•à°°à°¿à°‚à°šà°¿à°¨ à°…à°­à±à°¯à°¾à°¸ à°…à°¨à±à°­à°µà°¾à°¨à±à°¨à°¿ à°¸à±ƒà°·à±à°Ÿà°¿à°¸à±à°¤à±‹à°‚à°¦à°¿...",
      "step2-title": "à°®à±€à°°à± à°Žà°²à°¾ à°¨à±‡à°°à±à°šà±à°•à±‹à°µà°¾à°²à±‹ à°Žà°‚à°šà±à°•à±‹à°‚à°¡à°¿",
      "step3-title": "à°‡à°‚à°Ÿà°°à°¾à°•à±à°Ÿà°¿à°µà± à°ªà±à°°à°¿à°µà±à°¯à±‚",
      "preview-empty-title": "à°ªà±à°°à°¾à°¸à±†à°¸à°¿à°‚à°—à± à°•à±‹à°¸à°‚ à°µà±‡à°šà°¿ à°‰à°‚à°¦à°¿",
      "preview-empty-desc": "à°¹à±‹à°®à±â€Œà°²à±‹ à°«à±ˆà°²à±â€Œà°¨à± à°Žà°‚à°šà±à°•à±à°¨à°¿, 'AI à°¤à±‹ à°•à°‚à°Ÿà±†à°‚à°Ÿà±â€Œà°¨à± à°®à°¾à°°à±à°šà°‚à°¡à°¿' à°•à±à°²à°¿à°•à± à°šà±‡à°¯à°‚à°¡à°¿.",
      "profile-title": "à°µà°¿à°¦à±à°¯à°¾à°°à±à°¥à°¿ à°ªà±à°°à±Šà°«à±ˆà°²à±",
      "select-avatar": "à°®à±€ à°…à°µà°¤à°¾à°°à±â€Œà°¨à°¿ à°Žà°‚à°šà±à°•à±‹à°‚à°¡à°¿",
      "mode1-name": "à°Ÿà±€à°šà°°à± à°®à±‹à°¡à±",
      "mode1-desc": "AI à°¤à°°à°—à°¤à°¿ à°—à°¦à°¿ à°‰à°ªà°¨à±à°¯à°¾à°¸à°¾à°²à°¨à± à°¨à°¿à°°à±à°µà°¹à°¿à°¸à±à°¤à±à°‚à°¦à°¿.",
      "mode2-name": "à°®à°‚à°—à°¾ à°®à±‹à°¡à±",
      "mode2-desc": "à°¦à±ƒà°¶à±à°¯ à°ªà±à°¯à°¾à°¨à±†à°²à±â€Œà°²à± à°¸à°‚à°•à±à°²à°¿à°·à±à°Ÿ à°µà°¿à°µà°°à°¾à°²à°¨à± à°…à°¨à±à°µà°¦à°¿à°¸à±à°¤à°¾à°¯à°¿.",
      "mode3-name": "à°—à±‡à°®à± à°®à±‹à°¡à±",
      "mode3-desc": "à°ªà°¾à°¯à°¿à°‚à°Ÿà±â€Œà°²à°¨à± à°¸à°‚à°ªà°¾à°¦à°¿à°‚à°šà°‚à°¡à°¿ à°®à°°à°¿à°¯à± à°°à±à°¯à°¾à°‚à°•à°¿à°‚à°—à±â€Œà°²à°¨à± à°…à°§à°¿à°°à±‹à°¹à°¿à°‚à°šà°‚à°¡à°¿.",
      "mode4-name": "à°®à±ˆà°‚à°¡à± à°®à±à°¯à°¾à°ªà± à°®à±‹à°¡à±",
      "mode4-desc": "à°¦à±ƒà°¶à±à°¯ à°«à±à°²à±‹à°šà°¾à°°à±à°Ÿà± à°µà°¿à°·à°¯à°¾à°² à°¸à°‚à°¬à°‚à°§à°¾à°²à°¨à± à°®à±à°¯à°¾à°ªà± à°šà±‡à°¸à±à°¤à±à°‚à°¦à°¿.",
      "mode5-name": "à°¤à±à°µà°°à°¿à°¤ à°ªà±à°¨à°°à±à°µà°¿à°®à°°à±à°¶",
      "mode5-desc": "à°¸à°¾à°°à°¾à°‚à°¶à°¾à°²à± à°®à°°à°¿à°¯à± à°ªà±à°°à°§à°¾à°¨ à°¨à°¿à°°à±à°µà°šà°¨à°¾à°²à°¨à± à°•à°²à°¿à°—à°¿ à°‰à°¨à±à°¨ à°«à±à°²à°¾à°·à±â€Œà°•à°¾à°°à±à°¡à±â€Œà°²à±.",
      "mode6-name": "à°•à±à°µà°¿à°œà± à°®à±‹à°¡à±",
      "mode6-desc": "à°®à°²à±à°Ÿà°¿à°ªà±à°²à± à°šà°¾à°¯à°¿à°¸à± à°ªà°°à±€à°•à±à°·à°²à± à°¤à°•à±à°·à°£ à°—à±à°°à±‡à°¡à°¿à°‚à°—à±â€Œà°¤à±‹.",
      "mode7-name": "à°µà°¾à°¯à°¿à°¸à± à°Ÿà±à°¯à±‚à°Ÿà°°à±",
      "mode7-desc": "à°†à°¡à°¿à°¯à±‹ à°¤à±‹à°¡à±à°—à°¾ à°¨à±‹à°Ÿà±à°¸à±â€Œà°¨à± à°šà°¦à±à°µà±à°¤à±à°‚à°¦à°¿.",
      "mode8-name": "à°¸à±à°Ÿà±‹à°°à±€ à°®à±‹à°¡à±",
      "mode8-desc": "à°¸à±‚à°¤à±à°°à°¾à°²à± à°®à°°à°¿à°¯à± à°šà°°à°¿à°¤à±à°°à°²à°¨à± à°…à°¦à±à°­à±à°¤ à°•à°¥à°² à°¸à°‚à°¦à°°à±à°­à°¾à°²à°²à±‹à°•à°¿ à°…à°¨à±à°µà°¦à°¿à°¸à±à°¤à±à°‚à°¦à°¿.",
      "chat-online": "à°¸à±à°Ÿà°¡à±€ à°­à°¾à°—à°¸à±à°µà°¾à°®à°¿ â€¢ à°†à°¨à±â€Œà°²à±ˆà°¨à±",
      "notif-title": "à°¨à±‹à°Ÿà°¿à°«à°¿à°•à±‡à°·à°¨à±à°²à±",
      "notif-clear": "à°¡à±‡à°Ÿà°¾ à°¤à±à°¡à°¿à°šà°¿à°µà±‡à°¯à°¿"
    },
    hi: {
      "btn-get-started": "à¤¶à¥à¤°à¥‚ à¤•à¤°à¥‡à¤‚",
      "step1-title": "à¤…à¤§à¥à¤¯à¤¯à¤¨ à¤¸à¤¾à¤®à¤—à¥à¤°à¥€ à¤…à¤ªà¤²à¥‹à¤¡ à¤•à¤°à¥‡à¤‚",
      "upload-heading": "à¤…à¤ªà¤¨à¥€ à¤«à¤¼à¤¾à¤‡à¤² à¤¯à¤¹à¤¾à¤ à¤–à¥€à¤‚à¤šà¥‡à¤‚ à¤”à¤° à¤›à¥‹à¤¡à¤¼à¥‡à¤‚",
      "upload-subheading": "PDF, PPT, DOCX, à¤šà¤¿à¤¤à¥à¤°, à¤¯à¤¾ à¤¨à¥‹à¤Ÿà¥à¤¸ à¤¸à¤®à¤°à¥à¤¥à¤¿à¤¤ à¤¹à¥ˆà¤‚",
      "process-btn": "AI à¤¸à¥‡ à¤¸à¤¾à¤®à¤—à¥à¤°à¥€ à¤°à¥‚à¤ªà¤¾à¤‚à¤¤à¤°à¤¿à¤¤ à¤•à¤°à¥‡à¤‚",
      "processing-title": "AI à¤ªà¥à¤°à¥‹à¤¸à¥‡à¤¸à¤¿à¤‚à¤—",
      "proc-1": "à¤«à¤¼à¤¾à¤‡à¤² à¤¸à¤¾à¤®à¤—à¥à¤°à¥€ à¤•à¤¾ à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£ à¤¹à¥‹ à¤°à¤¹à¤¾ à¤¹à¥ˆ...",
      "proc-2": "à¤…à¤§à¥à¤¯à¤¾à¤¯ à¤”à¤° à¤ªà¤¦à¤¾à¤¨à¥à¤•à¥à¤°à¤® à¤¨à¤¿à¤•à¤¾à¤²à¤¾ à¤œà¤¾ à¤°à¤¹à¤¾ à¤¹à¥ˆ...",
      "proc-3": "à¤…à¤‚à¤¤à¤°à¥à¤¨à¤¿à¤¹à¤¿à¤¤ à¤…à¤µà¤§à¤¾à¤°à¤£à¤¾à¤“à¤‚ à¤•à¥‹ à¤¸à¤®à¤à¤¾ à¤œà¤¾ à¤°à¤¹à¤¾ à¤¹à¥ˆ...",
      "proc-4": "à¤µà¥à¤¯à¤•à¥à¤¤à¤¿à¤—à¤¤ à¤¸à¥€à¤–à¤¨à¥‡ à¤•à¤¾ à¤…à¤¨à¥à¤­à¤µ à¤¬à¤¨à¤¾à¤¯à¤¾ à¤œà¤¾ à¤°à¤¹à¤¾ à¤¹à¥ˆ...",
      "step2-title": "à¤†à¤ª à¤•à¥ˆà¤¸à¥‡ à¤¸à¥€à¤–à¤¨à¤¾ à¤šà¤¾à¤¹à¤¤à¥‡ à¤¹à¥ˆà¤‚ à¤šà¥à¤¨à¥‡à¤‚",
      "step3-title": "à¤‡à¤‚à¤Ÿà¤°à¤à¤•à¥à¤Ÿà¤¿à¤µ à¤ªà¥à¤°à¥€à¤µà¥à¤¯à¥‚",
      "preview-empty-title": "à¤¸à¥à¤Ÿà¥‚à¤¡à¤¿à¤¯à¥‹ à¤ªà¥à¤°à¥‹à¤¸à¥‡à¤¸à¤¿à¤‚à¤— à¤•à¥€ à¤ªà¥à¤°à¤¤à¥€à¤•à¥à¤·à¤¾",
      "preview-empty-desc": "à¤¹à¥‹à¤® à¤ªà¤° à¤«à¤¼à¤¾à¤‡à¤² à¤šà¥à¤¨à¥‡à¤‚, 'AI à¤¸à¥‡ à¤¸à¤¾à¤®à¤—à¥à¤°à¥€ à¤°à¥‚à¤ªà¤¾à¤‚à¤¤à¤°à¤¿à¤¤ à¤•à¤°à¥‡à¤‚' à¤•à¥à¤²à¤¿à¤• à¤•à¤°à¥‡à¤‚à¥¤",
      "profile-title": "à¤›à¤¾à¤¤à¥à¤° à¤ªà¥à¤°à¥‹à¤«à¤¼à¤¾à¤‡à¤²",
      "select-avatar": "à¤…à¤ªà¤¨à¤¾ à¤…à¤µà¤¤à¤¾à¤° à¤šà¥à¤¨à¥‡à¤‚",
      "mode1-name": "à¤¶à¤¿à¤•à¥à¤·à¤• à¤®à¥‹à¤¡",
      "mode1-desc": "AI à¤•à¤•à¥à¤·à¤¾ à¤µà¥à¤¯à¤¾à¤–à¥à¤¯à¤¾à¤¨ à¤†à¤¯à¥‹à¤œà¤¿à¤¤ à¤•à¤°à¤¤à¤¾ à¤¹à¥ˆà¥¤",
      "mode2-name": "à¤®à¤‚à¤—à¤¾ à¤®à¥‹à¤¡",
      "mode2-desc": "à¤¦à¥ƒà¤¶à¥à¤¯ à¤ªà¥ˆà¤¨à¤² à¤œà¤Ÿà¤¿à¤² à¤µà¤¿à¤µà¤°à¤£à¥‹à¤‚ à¤•à¤¾ à¤…à¤¨à¥à¤µà¤¾à¤¦ à¤•à¤°à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤",
      "mode3-name": "à¤—à¥‡à¤® à¤®à¥‹à¤¡",
      "mode3-desc": "à¤…à¤‚à¤• à¤…à¤°à¥à¤œà¤¿à¤¤ à¤•à¤°à¥‡à¤‚ à¤”à¤° à¤°à¥ˆà¤‚à¤•à¤¿à¤‚à¤— à¤šà¤¢à¤¼à¥‡à¤‚à¥¤",
      "mode4-name": "à¤®à¤¾à¤‡à¤‚à¤¡ à¤®à¥ˆà¤ª à¤®à¥‹à¤¡",
      "mode4-desc": "à¤¦à¥ƒà¤¶à¥à¤¯ à¤«à¥à¤²à¥‹à¤šà¤¾à¤°à¥à¤Ÿ à¤µà¤¿à¤·à¤¯ à¤¸à¤‚à¤¬à¤‚à¤§à¥‹à¤‚ à¤•à¥‹ à¤®à¥ˆà¤ª à¤•à¤°à¤¤à¤¾ à¤¹à¥ˆà¥¤",
      "mode5-name": "à¤¤à¥à¤µà¤°à¤¿à¤¤ à¤ªà¥à¤¨à¤°à¥€à¤•à¥à¤·à¤£",
      "mode5-desc": "à¤¸à¤¾à¤°à¤¾à¤‚à¤¶ à¤”à¤° à¤ªà¤°à¤¿à¤­à¤¾à¤·à¤¾à¤“à¤‚ à¤µà¤¾à¤²à¥‡ à¤«à¥à¤²à¥ˆà¤¶à¤•à¤¾à¤°à¥à¤¡à¥¤",
      "mode6-name": "à¤•à¥à¤µà¤¿à¤œà¤¼ à¤®à¥‹à¤¡",
      "mode6-desc": "à¤¬à¤¹à¥à¤µà¤¿à¤•à¤²à¥à¤ªà¥€à¤¯ à¤ªà¤°à¥€à¤•à¥à¤·à¤£ à¤¤à¤¤à¥à¤•à¤¾à¤² à¤—à¥à¤°à¥‡à¤¡à¤¿à¤‚à¤— à¤•à¥‡ à¤¸à¤¾à¤¥à¥¤",
      "mode7-name": "à¤µà¥‰à¤¯à¤¸ à¤Ÿà¥à¤¯à¥‚à¤Ÿà¤°",
      "mode7-desc": "à¤‘à¤¡à¤¿à¤¯à¥‹ à¤¸à¤¾à¤¥à¥€ à¤¨à¥‹à¤Ÿà¥à¤¸ à¤ªà¤¢à¤¼à¤¤à¤¾ à¤¹à¥ˆà¥¤",
      "mode8-name": "à¤¸à¥à¤Ÿà¥‹à¤°à¥€ à¤®à¥‹à¤¡",
      "mode8-desc": "à¤¸à¥‚à¤¤à¥à¤°à¥‹à¤‚ à¤•à¥‹ à¤ªà¤°à¥€ à¤•à¤¥à¤¾ à¤¸à¤‚à¤¦à¤°à¥à¤­à¥‹à¤‚ à¤®à¥‡à¤‚ à¤…à¤¨à¥à¤µà¤¾à¤¦à¤¿à¤¤ à¤•à¤°à¤¤à¤¾ à¤¹à¥ˆà¥¤",
      "chat-online": "à¤…à¤§à¥à¤¯à¤¯à¤¨ à¤¸à¤¾à¤¥à¥€ â€¢ à¤‘à¤¨à¤²à¤¾à¤‡à¤¨",
      "notif-title": "à¤¸à¥‚à¤šà¤¨à¤¾à¤à¤‚",
      "notif-clear": "à¤¸à¤­à¥€ à¤¸à¤¾à¤«à¤¼ à¤•à¤°à¥‡à¤‚"
    },
    ja: {
      "btn-get-started": "å§‹ã‚ã‚‹",
      "step1-title": "å­¦ç¿’ç´ æã‚’ã‚¢ãƒƒãƒ—ãƒ­ãƒ¼ãƒ‰",
      "upload-heading": "ãƒ•ã‚¡ã‚¤ãƒ«ã‚’ã“ã“ã«ãƒ‰ãƒ©ãƒƒã‚°ï¼†ãƒ‰ãƒ­ãƒƒãƒ—",
      "upload-subheading": "PDFã€PPTã€DOCXã€ç”»åƒã€ãƒŽãƒ¼ãƒˆã«å¯¾å¿œ",
      "process-btn": "AIã§ã‚³ãƒ³ãƒ†ãƒ³ãƒ„ã‚’å¤‰æ›",
      "processing-title": "AIå‡¦ç†ä¸­",
      "proc-1": "ãƒ•ã‚¡ã‚¤ãƒ«ã®å†…å®¹ã‚’åˆ†æžä¸­...",
      "proc-2": "ç« ã¨éšŽå±¤ã‚’æŠ½å‡ºä¸­...",
      "proc-3": "æ¦‚å¿µã‚’ç†è§£ä¸­...",
      "proc-4": "å€‹äººåŒ–ã•ã‚ŒãŸå­¦ç¿’ä½“é¨“ã‚’ä½œæˆä¸­...",
      "step2-title": "å­¦ã³æ–¹ã‚’é¸ã‚“ã§ãã ã•ã„",
      "step3-title": "ã‚¤ãƒ³ã‚¿ãƒ©ã‚¯ãƒ†ã‚£ãƒ–ãƒ—ãƒ¬ãƒ“ãƒ¥ãƒ¼",
      "preview-empty-title": "å‡¦ç†å¾…ã¡",
      "preview-empty-desc": "ãƒ›ãƒ¼ãƒ ã§ãƒ•ã‚¡ã‚¤ãƒ«ã‚’é¸æŠžã—ã€ã€ŒAIã§å¤‰æ›ã€ã‚’ã‚¯ãƒªãƒƒã‚¯ã—ã¦ãã ã•ã„ã€‚",
      "profile-title": "å­¦ç”Ÿãƒ—ãƒ­ãƒ•ã‚£ãƒ¼ãƒ«",
      "select-avatar": "ã‚¢ãƒã‚¿ãƒ¼ã‚’é¸æŠž",
      "mode1-name": "å…ˆç”Ÿãƒ¢ãƒ¼ãƒ‰",
      "mode1-desc": "AIãŒæŽˆæ¥­ã‚’è¡Œã„ã€é‡è¦ãªç†è«–ã‚’æ®µéšŽçš„ã«èª¬æ˜Žã—ã¾ã™ã€‚",
      "mode2-name": "æ¼«ç”»ãƒ¢ãƒ¼ãƒ‰",
      "mode2-desc": "ãƒ“ã‚¸ãƒ¥ã‚¢ãƒ«ãƒ‘ãƒãƒ«ã§è¤‡é›‘ãªå†…å®¹ã‚’ç¿»è¨³ã—ã¾ã™ã€‚",
      "mode3-name": "ã‚²ãƒ¼ãƒ ãƒ¢ãƒ¼ãƒ‰",
      "mode3-desc": "ãƒã‚¤ãƒ³ãƒˆã‚’ç²å¾—ã—ã€ãƒ©ãƒ³ã‚­ãƒ³ã‚°ã‚’ä¸ŠãŒã‚Šã¾ã—ã‚‡ã†ã€‚",
      "mode4-name": "ãƒžã‚¤ãƒ³ãƒ‰ãƒžãƒƒãƒ—ãƒ¢ãƒ¼ãƒ‰",
      "mode4-desc": "ãƒ•ãƒ­ãƒ¼ãƒãƒ£ãƒ¼ãƒˆã§é–¢ä¿‚æ€§ã‚’ãƒžãƒƒãƒ”ãƒ³ã‚°ã€‚",
      "mode5-name": "ã‚¯ã‚¤ãƒƒã‚¯å¾©ç¿’",
      "mode5-desc": "è¦ç´„ã¨å®šç¾©ã®ãƒ•ãƒ©ãƒƒã‚·ãƒ¥ã‚«ãƒ¼ãƒ‰ã€‚",
      "mode6-name": "ã‚¯ã‚¤ã‚ºãƒ¢ãƒ¼ãƒ‰",
      "mode6-desc": "å³æ™‚æŽ¡ç‚¹ä»˜ãå¤šè‚¢é¸æŠžãƒ†ã‚¹ãƒˆã€‚",
      "mode7-name": "ãƒœã‚¤ã‚¹ãƒãƒ¥ãƒ¼ã‚¿ãƒ¼",
      "mode7-desc": "éŸ³å£°ã‚³ãƒ³ãƒ‘ãƒ‹ã‚ªãƒ³ãŒãƒŽãƒ¼ãƒˆã‚’èª­ã¿ä¸Šã’ã¾ã™ã€‚",
      "mode8-name": "ã‚¹ãƒˆãƒ¼ãƒªãƒ¼ãƒ¢ãƒ¼ãƒ‰",
      "mode8-desc": "æ•°å¼ã‚’ãƒ•ã‚¡ãƒ³ã‚¿ã‚¸ãƒ¼ã®æ–‡è„ˆã«ç¿»è¨³ã—ã¾ã™ã€‚",
      "chat-online": "å­¦ç¿’ã‚³ãƒ³ãƒ‘ãƒ‹ã‚ªãƒ³ â€¢ ã‚ªãƒ³ãƒ©ã‚¤ãƒ³",
      "notif-title": "é€šçŸ¥",
      "notif-clear": "ã™ã¹ã¦ã‚¯ãƒªã‚¢"
    }
  };

  // Fill fallback keys from English
  ['te', 'hi', 'ja'].forEach(lang => {
    Object.keys(translations.en).forEach(key => {
      if (!translations[lang][key]) {
        translations[lang][key] = translations.en[key];
      }
    });
  });

  let currentLang = 'en';

  function applyLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = translations[lang]?.[key] || translations.en[key];
      if (!val) return;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = val;
      } else {
        el.innerHTML = val;
      }
    });
    const langSpan = document.getElementById('current-lang-name');
    if (langSpan) langSpan.textContent = lang.toUpperCase();
    initIcons();
  }

  /* ==========================================================================
     SECTION 2: AVATAR DATA
  ========================================================================== */
  const avatars = {
    wise_owl: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#7F5836" opacity="0.15"/>
      <circle cx="50" cy="50" r="32" fill="#7F5836"/>
      <circle cx="38" cy="45" r="10" fill="#FFFFFF"/><circle cx="38" cy="45" r="4" fill="#443025"/>
      <circle cx="62" cy="45" r="10" fill="#FFFFFF"/><circle cx="62" cy="45" r="4" fill="#443025"/>
      <path d="M50 48 L46 56 L54 56 Z" fill="#EC9C9D"/>
      <path d="M26 30 C30 24 38 24 42 28" stroke="#AA7F66" stroke-width="3" stroke-linecap="round"/>
      <path d="M74 30 C70 24 62 24 58 28" stroke="#AA7F66" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    book_lover: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#EC9C9D" opacity="0.15"/>
      <circle cx="50" cy="42" r="26" fill="#EC9C9D"/>
      <circle cx="42" cy="40" r="8" stroke="#443025" stroke-width="2.5" fill="none"/>
      <circle cx="58" cy="40" r="8" stroke="#443025" stroke-width="2.5" fill="none"/>
      <path d="M44 56 C 46 58, 54 58, 56 56" stroke="#443025" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M32 72 C 40 70, 50 74, 50 74 C 50 74, 60 70, 68 72 L 68 84 C 60 82, 50 86, 50 86 C 50 86, 40 82, 32 84 Z" fill="#7F5836"/>
    </svg>`,
    scholar: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#AA7F66" opacity="0.15"/>
      <circle cx="50" cy="50" r="28" fill="#AA7F66"/>
      <path d="M50 20 L76 30 L50 40 L24 30 Z" fill="#443025"/>
      <rect x="42" y="36" width="16" height="12" fill="#443025"/>
      <path d="M70 32 L70 50" stroke="#EC9C9D" stroke-width="2" stroke-linecap="round"/>
      <circle cx="70" cy="51" r="2" fill="#EC9C9D"/>
      <circle cx="44" cy="54" r="2" fill="#FFFFFF"/>
      <circle cx="56" cy="54" r="2" fill="#FFFFFF"/>
    </svg>`,
    moon_reader: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#443025" opacity="0.25"/>
      <path d="M68 24 C50 24 36 38 36 56 C36 74 50 88 68 88 C74 88 80 86 84 82 C72 82 62 72 62 56 C62 40 72 30 84 30 C80 26 74 24 68 24 Z" fill="#F2CFD2"/>
      <circle cx="42" cy="50" r="16" fill="#AA7F66"/>
      <path d="M34 52 L42 50 L50 52 L50 58 L42 56 L34 58 Z" fill="#443025"/>
    </svg>`,
    cyber_student: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#7F5836" opacity="0.15"/>
      <circle cx="50" cy="46" r="28" fill="#443025"/>
      <rect x="28" y="38" width="44" height="12" rx="6" fill="#EC9C9D"/>
      <line x1="32" y1="44" x2="68" y2="44" stroke="#FFFFFF" stroke-width="1.5" stroke-dasharray="2 3"/>
      <path d="M22 46 C22 28 78 28 78 46" stroke="#AA7F66" stroke-width="4" stroke-linecap="round" fill="none"/>
      <rect x="18" y="40" width="8" height="16" rx="4" fill="#AA7F66"/>
      <rect x="74" y="40" width="8" height="16" rx="4" fill="#AA7F66"/>
    </svg>`,
    fox_spirit: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#EC9C9D" opacity="0.15"/>
      <path d="M26 44 L32 20 L48 40 Z" fill="#7F5836"/>
      <path d="M74 44 L68 20 L52 40 Z" fill="#7F5836"/>
      <path d="M30 40 L34 26 L44 38 Z" fill="#EC9C9D"/>
      <path d="M70 40 L66 26 L56 38 Z" fill="#EC9C9D"/>
      <path d="M26 44 C26 62 50 78 50 78 C 50 78 74 62 74 44 Z" fill="#7F5836"/>
      <path d="M38 52 C38 64 50 74 50 74 C 50 74 62 64 62 52 Z" fill="#FFFFFF"/>
      <circle cx="38" cy="48" r="2.5" fill="#443025"/><circle cx="62" cy="48" r="2.5" fill="#443025"/>
      <polygon points="48,58 52,58 50,62" fill="#443025"/>
    </svg>`,
    cat_learner: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#F2CFD2" opacity="0.3"/>
      <polygon points="25,46 30,22 46,38" fill="#443025"/>
      <polygon points="75,46 70,22 54,38" fill="#443025"/>
      <polygon points="28,42 32,28 42,36" fill="#EC9C9D"/>
      <polygon points="72,42 68,28 58,36" fill="#EC9C9D"/>
      <circle cx="50" cy="50" r="26" fill="#443025"/>
      <circle cx="42" cy="48" r="6" stroke="#EC9C9D" stroke-width="2" fill="none"/>
      <circle cx="58" cy="48" r="6" stroke="#EC9C9D" stroke-width="2" fill="none"/>
      <circle cx="42" cy="48" r="1.5" fill="#FFFFFF"/>
      <circle cx="58" cy="48" r="1.5" fill="#FFFFFF"/>
      <polygon points="49,54 51,54 50,56" fill="#EC9C9D"/>
    </svg>`
  };

  const avatarNames = {
    wise_owl: 'Wise Owl', book_lover: 'Book Lover', scholar: 'Scholar',
    moon_reader: 'Moon Reader', cyber_student: 'Cyber Student',
    fox_spirit: 'Fox Spirit', cat_learner: 'Cat Learner'
  };

  const avatarXPReq = {
    wise_owl: 0, book_lover: 0, scholar: 15, moon_reader: 30,
    cyber_student: 50, fox_spirit: 75, cat_learner: 100
  };

  /* ==========================================================================
     SECTION 3: USER STATE
  ========================================================================== */
  let userState = {
    name: '',
    avatarKey: 'wise_owl',
    lang: 'en',
    theme: 'light',
    goal: '',
    exam: 'ECET',
    xp: 0,
    level: 1,
    streak: 0,
    onboarded: false
  };

  const emptyActivity = {
    materials: [],
    activeMaterialId: null,
    studyLog: [],
    chatHistory: [],
    notifications: [],
    bookmarks: [],
    flashcards: [],
    quizScores: [],
    notes: [],
    achievements: [],
    streak: { count: 0, lastStudyDate: null },
    xp: 0,
    level: 1
  };

  let activityState = typeof structuredClone === 'function' ? structuredClone(emptyActivity) : JSON.parse(JSON.stringify(emptyActivity));
  let pendingFile = null;
  let currentFirebaseUser = null;
  let firestoreReady = false;
  let cloudSaveTimer = null;
  let isApplyingCloudState = false;
  let pendingRegistrationName = '';

  function cloneEmptyActivity() {
    return typeof structuredClone === 'function' ? structuredClone(emptyActivity) : JSON.parse(JSON.stringify(emptyActivity));
  }

  function normalizeActivity(data = {}) {
    const normalized = { ...cloneEmptyActivity(), ...data };
    normalized.materials ||= [];
    normalized.studyLog ||= [];
    normalized.chatHistory ||= [];
    normalized.notifications ||= [];
    normalized.bookmarks ||= [];
    normalized.flashcards ||= [];
    normalized.quizScores ||= [];
    normalized.notes ||= [];
    normalized.achievements ||= [];
    normalized.streak ||= { count: 0, lastStudyDate: null };
    return normalized;
  }

  function getUserDocRef(uid = currentFirebaseUser?.uid) {
    if (!firebaseDb || !uid) return null;
    return doc(firebaseDb, 'users', uid);
  }

  function serializeUserProfile(user = currentFirebaseUser) {
    return {
      name: userState.name || user?.displayName || '',
      avatarKey: userState.avatarKey,
      lang: userState.lang,
      theme: userState.theme,
      goal: userState.goal,
      exam: userState.exam,
      xp: userState.xp,
      level: userState.level,
      streak: userState.streak,
      onboarded: userState.onboarded,
      email: user?.email || '',
      photoURL: user?.photoURL || ''
    };
  }

  async function writeUserDocumentNow() {
    if (!firestoreReady || !currentFirebaseUser || isApplyingCloudState) return;
    const ref = getUserDocRef();
    if (!ref) return;
    await setDoc(ref, {
      profile: serializeUserProfile(),
      activity: activityState,
      settings: {
        lang: userState.lang,
        theme: userState.theme,
        exam: userState.exam,
        goal: userState.goal
      },
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  function scheduleCloudSync() {
    if (!firestoreReady || !currentFirebaseUser || isApplyingCloudState) return;
    clearTimeout(cloudSaveTimer);
    cloudSaveTimer = setTimeout(() => {
      writeUserDocumentNow().catch(err => console.error('Firestore sync failed:', err));
    }, 500);
  }

  async function loadOrCreateFirestoreUser(user) {
    currentFirebaseUser = user;
    firestoreReady = Boolean(firebaseDb && user);
    if (!firestoreReady) return false;

    const ref = getUserDocRef(user.uid);
    const snap = await getDoc(ref);
    isApplyingCloudState = true;
    try {
      if (!snap.exists()) {
        // Brand-new user: set name from provider/registration but leave onboarded=false
        // so the onboarding wizard is shown before the dashboard.
        userState.name = pendingRegistrationName || user.displayName || '';
        userState.onboarded = false;
        activityState = cloneEmptyActivity();
        await setDoc(ref, {
          uid: user.uid,
          profile: serializeUserProfile(user),
          activity: activityState,
          settings: {
            lang: userState.lang,
            theme: userState.theme,
            exam: userState.exam,
            goal: userState.goal
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        const data = snap.data();
        userState = { ...userState, ...(data.profile || {}), onboarded: Boolean(data.profile?.onboarded) };
        activityState = normalizeActivity(data.activity || {});
      }
    } finally {
      isApplyingCloudState = false;
    }
    return snap.exists();
  }

  async function signInWithGoogle() {
    console.log("[LearnVerse Auth] Google Sign-In Clicked");
    if (!firebaseAuth || !googleProvider) {
      alert('Firebase is not configured yet. Fill firebaseConfig in index.js with your Firebase project settings.');
      return;
    }
    googlePopupActive = true;
    try {
      console.log("[LearnVerse Auth] Google Popup Opened");
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      console.log("[LearnVerse Auth] Google Authentication Success");
      return result;
    } catch (err) {
      googlePopupActive = false;
      console.error("[LearnVerse Auth] Google Sign-In failed or was cancelled:", err);
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        alert(`Google sign-in failed: ${err?.message || 'Check that Google Authentication is enabled for this Firebase project.'}`);
      }
      throw err;
    }
  }

  async function registerWithEmail(fullName, email, password) {
    if (!firebaseAuth) {
      throw new Error('Firebase Authentication is not configured.');
    }
    pendingRegistrationName = fullName.trim();
    const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    if (pendingRegistrationName) {
      await updateProfile(credential.user, { displayName: pendingRegistrationName });
    }
    return credential;
  }

  async function signInWithEmail(email, password) {
    if (!firebaseAuth) {
      throw new Error('Firebase Authentication is not configured.');
    }
    return signInWithEmailAndPassword(firebaseAuth, email, password);
  }

  function saveActivity() {
    scheduleCloudSync();
  }

  function loadActivity() {
    activityState = normalizeActivity(activityState);
  }

  const todayKey = () => new Date().toISOString().slice(0, 10);
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const clamp = (num, min, max) => Math.min(max, Math.max(min, num));

  function formatDateTime(iso) {
    if (!iso) return 'Never';
    return new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  }

  function formatShortDate(iso) {
    if (!iso) return 'Unknown date';
    return new Date(iso).toLocaleDateString([], { dateStyle: 'medium' });
  }

  function formatShortTime(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function daysBetween(a, b) {
    const one = new Date(`${a}T00:00:00`);
    const two = new Date(`${b}T00:00:00`);
    return Math.round((two - one) / 86400000);
  }

  function getActiveMaterial() {
    return activityState.materials.find(m => m.id === activityState.activeMaterialId) || activityState.materials[0] || null;
  }

  function inferSubject(name, text = '') {
    const haystack = `${name} ${text}`.toLowerCase();
    const subjects = [
      ['Physics', ['physics', 'quantum', 'force', 'motion', 'energy', 'waves', 'electric', 'magnet']],
      ['Chemistry', ['chemistry', 'organic', 'bond', 'molecule', 'reaction', 'acid', 'base', 'carbon']],
      ['Mathematics', ['math', 'calculus', 'algebra', 'trigonometry', 'geometry', 'derivative', 'integral']],
      ['Biology', ['biology', 'cell', 'genetics', 'photosynthesis', 'anatomy', 'organism']],
      ['Computer Science', ['python', 'javascript', 'algorithm', 'programming', 'database', 'network']],
      ['History', ['history', 'empire', 'war', 'civilization', 'revolution']],
      ['Economics', ['economics', 'market', 'demand', 'supply', 'inflation']]
    ];
    return subjects.find(([, words]) => words.some(word => haystack.includes(word)))?.[0] || 'General Study';
  }

  function extractReadableText(raw) {
    return String(raw || '')
      .replace(/[^\x09\x0A\x0D\x20-\x7E]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 25000);
  }

  function titleFromFilename(fileName) {
    return fileName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function extractChapters(fileName, text) {
    const readable = extractReadableText(text);
    const matches = [...readable.matchAll(/\b(?:chapter|unit|module|section)\s+([0-9ivxlcdm]+)\s*[:.\-]?\s*([^.!?\n]{0,80})/gi)]
      .slice(0, 12)
      .map((m, index) => `${m[0]}`.trim() || `Chapter ${index + 1}`);
    const unique = [...new Set(matches)];
    if (unique.length) return unique;
    const base = titleFromFilename(fileName);
    return base ? [base] : ['Uploaded Material'];
  }

  function buildRoadmap(fileName, text) {
    return extractChapters(fileName, text).map((title, index) => ({
      id: `chapter-${Date.now()}-${index}`,
      title,
      progress: 0,
      estimatedMinutes: clamp(Math.ceil((title.length + (text?.length || 1200) / 900) * 4), 15, 90),
      completed: false
    }));
  }

  function keywordsFor(material) {
    const text = `${material?.subject || ''} ${material?.name || ''} ${material?.extractedText || ''}`.toLowerCase();
    return [...new Set(text.match(/[a-zA-Z]{5,}/g) || [])].filter(w => !['chapter','section','uploaded','material','notes','study'].includes(w)).slice(0, 8);
  }

  function generatedFlashcards(material) {
    if (!material) return [];
    const chapters = material.roadmap?.length ? material.roadmap : [{ title: titleFromFilename(material.name) || material.subject }];
    return chapters.slice(0, 6).map(ch => ({
      q: `What should you understand from ${ch.title}?`,
      a: `Review the uploaded ${material.subject} material for ${ch.title}, then mark progress after reading or revision.`
    }));
  }

  function generatedQuiz(material) {
    if (!material) return [];
    const terms = keywordsFor(material);
    const chapters = material.roadmap || [];
    return (chapters.length ? chapters : [{ title: material.subject }]).slice(0, 5).map((ch, index) => {
      const term = terms[index] || material.subject;
      return {
        q: `Which uploaded topic is most closely connected to "${escapeHTML(term)}"?`,
        options: [
          ch.title,
          chapters[index + 1]?.title || `General ${material.subject} revision`,
          'Unrelated outside content',
          'No active study material'
        ],
        correct: 0
      };
    });
  }

  function buildStudyReply(question, material) {
    if (!material) return 'Upload a study document first, then I can answer in that document context.';
    const q = question.toLowerCase();
    const chapter = material.roadmap?.find(ch => q.includes(ch.title.toLowerCase()) || q.includes(ch.title.match(/\d+/)?.[0] || '')) || material.roadmap?.find(ch => !ch.completed) || material.roadmap?.[0];
    const snippet = material.extractedText
      ? material.extractedText.split(/[.!?]/).find(sentence => question.toLowerCase().split(/\s+/).some(word => word.length > 4 && sentence.toLowerCase().includes(word)))?.trim()
      : '';
    if (q.includes('mcq') || q.includes('quiz')) return `I can create MCQs from <strong>${escapeHTML(material.name)}</strong>. Open Quiz Mode to answer questions tied to ${escapeHTML(chapter?.title || material.subject)}.`;
    if (q.includes('summary') || q.includes('summarize')) return `Summary focus for <strong>${escapeHTML(material.name)}</strong>: ${escapeHTML(chapter?.title || material.subject)}. ${snippet ? escapeHTML(snippet) : 'Use the roadmap chapters to revise this uploaded syllabus step by step.'}`;
    if (q.includes('chapter')) return `For <strong>${escapeHTML(chapter?.title || material.subject)}</strong>, your progress is ${chapter?.progress || 0}%. Estimated study time is ${chapter?.estimatedMinutes || 20} minutes.`;
    return `Based on your active document <strong>${escapeHTML(material.name)}</strong>, focus on <strong>${escapeHTML(chapter?.title || material.subject)}</strong>. ${snippet ? escapeHTML(snippet) : 'I only use your uploaded material and its detected roadmap for this answer.'}`;
  }

  function updateStreakForStudy(date = todayKey()) {
    const previous = activityState.streak.lastStudyDate;
    if (!previous) activityState.streak.count = 1;
    else if (previous === date) activityState.streak.count = Math.max(1, activityState.streak.count);
    else activityState.streak.count = daysBetween(previous, date) === 1 ? activityState.streak.count + 1 : 1;
    activityState.streak.lastStudyDate = date;
    userState.streak = activityState.streak.count;
  }

  function recordStudyActivity(type, points = 0, materialId = activityState.activeMaterialId, meta = {}) {
    const now = new Date().toISOString();
    updateStreakForStudy(todayKey());
    activityState.studyLog.push({ id: `study-${Date.now()}`, type, points, materialId, at: now, ...meta });
    const material = activityState.materials.find(m => m.id === materialId);
    if (material) {
      material.lastOpenedAt = now;
      const increment = type === 'quiz' ? 12 : type === 'revision' ? 10 : type === 'voice' ? 6 : type === 'chat' ? 4 : 5;
      material.progress = clamp((material.progress || 0) + increment, 0, 100);
      const chapter = material.roadmap?.find(ch => ch.progress < 100);
      if (chapter) {
        chapter.progress = clamp((chapter.progress || 0) + increment, 0, 100);
        chapter.completed = chapter.progress >= 100;
      }
    }
    if (points > 0) updateXP(points, false);
    saveActivity();
    saveState();
    refreshActivityUI();
  }

  function saveState() {
    scheduleCloudSync();
  }

  function loadState() {
    return Boolean(currentFirebaseUser && firestoreReady);
  }

  function renderRecentMaterials() {
    const list = document.querySelector('.recent-list');
    if (!list) return;
    list.innerHTML = '';
    if (!activityState.materials.length) {
      list.innerHTML = `<div class="lv-empty-state">No study materials yet.</div>`;
      return;
    }
    [...activityState.materials]
      .sort((a, b) => new Date(b.lastOpenedAt || b.uploadedAt) - new Date(a.lastOpenedAt || a.uploadedAt))
      .forEach(material => {
        const row = document.createElement('div');
        row.className = 'recent-pdf-item';
        row.innerHTML = `
          <div class="recent-pdf-icon"><i data-lucide="file-text"></i></div>
          <div class="recent-pdf-meta">
            <h5>${escapeHTML(material.name)}</h5>
            <span>Uploaded ${formatShortDate(material.uploadedAt)} at ${formatShortTime(material.uploadedAt)} â€¢ ${escapeHTML(material.subject)} â€¢ ${material.progress || 0}% studied â€¢ Last opened ${formatDateTime(material.lastOpenedAt)}</span>
          </div>
          <button class="btn btn-secondary btn-sm continue-btn" data-material-id="${material.id}">Study</button>
          <button class="remove-file-btn" title="Delete material" data-delete-material="${material.id}"><i data-lucide="trash-2"></i></button>`;
        list.appendChild(row);
      });
    list.querySelectorAll('[data-material-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        activityState.activeMaterialId = btn.getAttribute('data-material-id');
        const material = getActiveMaterial();
        if (material) material.lastOpenedAt = new Date().toISOString();
        saveActivity();
        renderActiveDocumentSelectors();
        renderRecentMaterials();
        switchTab('tutor');
        triggerModePreview(document.querySelector('.mode-card.active')?.getAttribute('data-mode') || 'teacher');
      });
    });
    list.querySelectorAll('[data-delete-material]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.getAttribute('data-delete-material');
        const material = activityState.materials.find(m => m.id === id);
        if (material?.storagePath && firebaseStorage) {
          deleteObject(storageRef(firebaseStorage, material.storagePath)).catch(err => console.warn('Storage delete failed:', err));
        }
        activityState.materials = activityState.materials.filter(m => m.id !== id);
        if (activityState.activeMaterialId === id) activityState.activeMaterialId = activityState.materials[0]?.id || null;
        saveActivity();
        refreshActivityUI();
      });
    });
    initIcons();
  }

  function renderRecommendations() {
    const grid = document.querySelector('.recommendations-grid');
    if (!grid) return;
    const material = getActiveMaterial();
    if (!material) {
      grid.innerHTML = `<div class="rec-card rec-yellow lv-empty-wide"><div class="rec-tag">No Material</div><h4>No recommendations yet</h4><p>Upload and transform a study file to receive recommendations based on your own syllabus.</p></div>`;
      return;
    }
    const weak = material.roadmap?.find(ch => ch.progress > 0 && ch.progress < 60) || material.roadmap?.find(ch => ch.progress === 0);
    const next = material.roadmap?.find(ch => !ch.completed) || material.roadmap?.[0];
    grid.innerHTML = `
      <div class="rec-card rec-red">
        <div class="rec-tag">Focus Area</div>
        <h4>${escapeHTML(weak?.title || material.subject)}</h4>
        <p>Continue this ${escapeHTML(material.subject)} section from your uploaded material. Current progress is ${weak?.progress ?? material.progress}%.</p>
        <button class="btn btn-secondary btn-sm rec-action-btn" data-go-tab="tracker">Open Roadmap</button>
      </div>
      <div class="rec-card rec-green">
        <div class="rec-tag">Practice</div>
        <h4>Generate ${escapeHTML(material.subject)} MCQs</h4>
        <p>Quiz questions will be generated from the active document: ${escapeHTML(material.name)}.</p>
        <button class="btn btn-secondary btn-sm rec-action-btn" data-mode-jump="quiz">Start MCQ</button>
      </div>
      <div class="rec-card rec-yellow">
        <div class="rec-tag">Revision</div>
        <h4>${escapeHTML(next?.title || 'Revision schedule')}</h4>
        <p>Estimated study time: ${next?.estimatedMinutes || 20} minutes. Your roadmap updates as you study.</p>
        <button class="btn btn-secondary btn-sm rec-action-btn" data-mode-jump="revision">Revise</button>
      </div>`;
    grid.querySelectorAll('[data-go-tab]').forEach(btn => btn.addEventListener('click', () => switchTab(btn.getAttribute('data-go-tab'))));
    grid.querySelectorAll('[data-mode-jump]').forEach(btn => {
      btn.addEventListener('click', () => {
        switchTab('tutor');
        const mode = btn.getAttribute('data-mode-jump');
        document.querySelectorAll('.mode-card').forEach(card => card.classList.toggle('active', card.getAttribute('data-mode') === mode));
        triggerModePreview(mode);
      });
    });
  }

  function renderActiveDocumentSelectors() {
    document.querySelectorAll('.active-doc-select').forEach(select => {
      select.innerHTML = activityState.materials.length
        ? activityState.materials.map(m => `<option value="${m.id}" ${m.id === activityState.activeMaterialId ? 'selected' : ''}>${escapeHTML(m.name)}</option>`).join('')
        : `<option value="">No uploaded materials</option>`;
    });
  }

  function ensureChatDocumentSelectors() {
    ['tab-chat-body', 'chatbot-body'].forEach(id => {
      const body = document.getElementById(id);
      if (!body || body.querySelector('.active-doc-wrap')) return;
      const wrap = document.createElement('div');
      wrap.className = 'active-doc-wrap';
      wrap.innerHTML = `<span>Active document</span><select class="active-doc-select"></select>`;
      const chips = body.querySelector('.chat-prompt-chips');
      body.insertBefore(wrap, chips || body.firstChild);
    });
    document.querySelectorAll('.active-doc-select').forEach(select => {
      select.addEventListener('change', () => {
        activityState.activeMaterialId = select.value || null;
        const material = getActiveMaterial();
        if (material) material.lastOpenedAt = new Date().toISOString();
        saveActivity();
        refreshActivityUI();
      });
    });
    renderActiveDocumentSelectors();
  }

  function renderTrackerAndProgress() {
    const material = getActiveMaterial();
    const totalMinutes = activityState.studyLog.reduce((sum, item) => sum + (item.minutes || (item.type === 'voice' ? 1 : 0)), 0);
    const quizAttempts = activityState.quizScores.length;
    const avgAccuracy = quizAttempts
      ? Math.round(activityState.quizScores.reduce((sum, q) => sum + q.accuracy, 0) / quizAttempts)
      : 0;
    const readiness = material ? Math.round(material.progress || 0) : 0;

    const streakDisplay = document.getElementById('streak-display');
    if (streakDisplay) streakDisplay.textContent = `${activityState.streak.count || 0} ${activityState.streak.count === 1 ? 'Day' : 'Days'}`;

    const metricVals = document.querySelectorAll('.analytics-metric-val');
    if (metricVals[0]) metricVals[0].textContent = `${(totalMinutes / 60).toFixed(1)} hrs`;
    if (metricVals[1]) metricVals[1].textContent = `${avgAccuracy}%`;
    if (metricVals[2]) metricVals[2].textContent = `${activityState.streak.count || 0} ðŸ”¥`;

    const gaugeFill = document.querySelector('.gauge-fill');
    const gaugeLabel = document.querySelector('.gauge-label-center');
    if (gaugeFill) gaugeFill.setAttribute('stroke-dasharray', `${readiness}, 100`);
    if (gaugeLabel) gaugeLabel.textContent = `${readiness}%`;
    const rank = document.getElementById('expected-rank-num');
    if (rank) rank.textContent = readiness ? Math.max(1, 1000 - readiness * 8) : 'N/A';
    const countdown = document.getElementById('countdown-days');
    if (countdown) countdown.textContent = material ? `${material.roadmap?.filter(ch => !ch.completed).length || 0}` : '0';
    document.querySelector('.countdown-seg label')?.replaceChildren(document.createTextNode(material ? 'Open Chapters' : 'No Syllabus'));

    const coach = document.querySelector('.coach-speech-bubble p');
    if (coach) coach.innerHTML = material
      ? `Your active syllabus is <strong>${escapeHTML(material.name)}</strong>. Continue ${escapeHTML(material.roadmap?.find(ch => !ch.completed)?.title || material.subject)} to improve readiness.`
      : 'Upload and transform a study file to create a real exam roadmap.';

    const taskList = document.querySelector('.coach-task-list');
    if (taskList) {
      taskList.innerHTML = material
        ? (material.roadmap || []).slice(0, 3).map(ch => `<label class="coach-task-item"><input type="checkbox" ${ch.completed ? 'checked' : ''} data-roadmap-task="${ch.id}"><span>${escapeHTML(ch.title)} (${ch.estimatedMinutes} mins)</span></label>`).join('')
        : `<div class="lv-empty-state">No roadmap yet.</div>`;
      taskList.querySelectorAll('[data-roadmap-task]').forEach(input => {
        input.addEventListener('change', () => {
          const ch = material.roadmap.find(item => item.id === input.getAttribute('data-roadmap-task'));
          if (ch) {
            ch.completed = input.checked;
            ch.progress = input.checked ? 100 : ch.progress;
            material.progress = Math.round(material.roadmap.reduce((sum, item) => sum + item.progress, 0) / material.roadmap.length);
            recordStudyActivity('roadmap', input.checked ? 10 : 0, material.id);
          }
        });
      });
    }

    const milestoneRows = document.querySelector('.milestone-rows');
    if (milestoneRows) {
      milestoneRows.innerHTML = material
        ? material.roadmap.map(ch => `<div class="milestone-row"><label>${escapeHTML(ch.title)}</label><div class="milestone-track"><div class="milestone-fill" style="width:${ch.progress || 0}%"></div></div><span>${ch.completed ? 'Completed' : `${ch.progress || 0}%`}</span></div>`).join('')
        : `<div class="lv-empty-state">No exam roadmap yet.</div>`;
    }

    const goalRows = document.querySelector('.goal-progress-section');
    if (goalRows) {
      const todayActivities = activityState.studyLog.filter(item => item.at?.slice(0,10) === todayKey()).length;
      const weekActivities = activityState.studyLog.filter(item => Date.now() - new Date(item.at).getTime() < 7 * 86400000).length;
      const monthActivities = activityState.studyLog.filter(item => Date.now() - new Date(item.at).getTime() < 30 * 86400000).length;
      const goals = [
        ['Daily Goal', clamp(todayActivities * 25, 0, 100)],
        ['Weekly Goal', clamp(weekActivities * 10, 0, 100)],
        ['Monthly Goal', clamp(monthActivities * 4, 0, 100)]
      ];
      goalRows.innerHTML = goals.map(([label, pct]) => `<div class="goal-row"><label>${label}</label><div class="goal-track"><div class="goal-fill" style="width:${pct}%"></div></div><span>${pct}%</span></div>`).join('');
    }

    const badges = document.querySelector('.badges-grid');
    if (badges) {
      const unlocked = new Set(activityState.achievements);
      if (activityState.materials.length) unlocked.add('First Upload');
      if ((activityState.streak.count || 0) >= 3) unlocked.add('Streak Builder');
      if (activityState.quizScores.some(q => q.accuracy === 100)) unlocked.add('Quiz Champion');
      if (activityState.studyLog.filter(s => s.type === 'mindmap').length >= 5) unlocked.add('Map Master');
      badges.innerHTML = [
        ['First Upload', 'Process a file', 'award'],
        ['Streak Builder', '3 day streak', 'flame'],
        ['Quiz Champion', 'Get 100% in MCQ', 'swords'],
        ['Map Master', 'Explore 5 maps', 'git-fork']
      ].map(([name, desc, icon]) => `<div class="badge-item ${unlocked.has(name) ? 'unlocked' : 'locked'}"><div class="badge-icon-box"><i data-lucide="${icon}"></i></div><h5>${name}</h5><span>${desc}</span></div>`).join('');
      activityState.achievements = [...unlocked];
      saveActivity();
    }
  }

  function refreshActivityUI() {
    renderRecentMaterials();
    renderRecommendations();
    ensureChatDocumentSelectors();
    renderTrackerAndProgress();
    updateNotificationsUI();
    initIcons();
  }

  /* ==========================================================================
     SECTION 4: THEME SYSTEM
  ========================================================================== */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    userState.theme = theme;
  }

  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const settingsThemeToggle = document.getElementById('settings-theme-toggle');

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
    saveState();
  }

  if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
  if (settingsThemeToggle) settingsThemeToggle.addEventListener('click', toggleTheme);

  /* ==========================================================================
     SECTION 5: SCREEN ROUTING
  ========================================================================== */
  const screenWelcome    = document.getElementById('welcome-screen');
  const screenAuth       = document.getElementById('auth-screen');
  const screenOnboarding = document.getElementById('onboarding-screen');
  const screenDashboard  = document.getElementById('dashboard-screen');
  let requestedScreen = null;

  function showScreen(screen) {
    [screenWelcome, screenAuth, screenOnboarding, screenDashboard].forEach(s => {
      if (!s) return;
      s.classList.add('hidden');
    });
    if (screen) {
      screen.classList.remove('hidden');
      // For dashboard, remove fixed positioning
      if (screen === screenDashboard) {
        screen.style.position = 'relative';
      }
    }
  }

  /* ==========================================================================
     SECTION 6: ONBOARDING WIZARD
  ========================================================================== */
  let currentSlide = 1;
  const totalSlides = 4;
  let selectedAvatarKey = 'wise_owl';
  let selectedExam = 'ECET';
  let selectedThemePref = 'light';

  const obBackBtn = document.getElementById('ob-back-btn');
  const obNextBtn = document.getElementById('ob-next-btn');
  const slideCounter = document.getElementById('slide-counter');

  function renderOnboardingAvatars() {
    const grid = document.getElementById('ob-avatar-grid');
    if (!grid) return;
    grid.innerHTML = '';
    Object.keys(avatars).forEach(key => {
      const item = document.createElement('div');
      item.className = `ob-avatar-item ${key === selectedAvatarKey ? 'selected' : ''}`;
      item.innerHTML = avatars[key];
      item.addEventListener('click', () => {
        selectedAvatarKey = key;
        grid.querySelectorAll('.ob-avatar-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
      });
      grid.appendChild(item);
    });
  }

  function updateStepperDots() {
    for (let i = 1; i <= totalSlides; i++) {
      const dot = document.getElementById(`sdot-${i}`);
      const line = document.getElementById(`sline-${i}`);
      if (!dot) continue;
      if (i < currentSlide) {
        dot.classList.remove('active');
        dot.classList.add('completed');
        dot.textContent = 'âœ“';
      } else if (i === currentSlide) {
        dot.classList.add('active');
        dot.classList.remove('completed');
        dot.textContent = '';
      } else {
        dot.classList.remove('active', 'completed');
        dot.textContent = '';
      }
      if (line) {
        line.classList.toggle('filled', i < currentSlide);
      }
    }
    if (slideCounter) slideCounter.textContent = `${currentSlide} of ${totalSlides}`;
  }

  function goToSlide(n) {
    const prev = document.getElementById(`wslide-${currentSlide}`);
    const next = document.getElementById(`wslide-${n}`);
    if (prev) prev.classList.remove('active');
    if (next) next.classList.add('active');
    currentSlide = n;
    updateStepperDots();
    if (obBackBtn) obBackBtn.disabled = currentSlide === 1;
    if (obNextBtn) {
      if (currentSlide === totalSlides) {
        obNextBtn.innerHTML = `Let's Begin ðŸŒ¸`;
      } else {
        obNextBtn.innerHTML = `Continue <i data-lucide="chevron-right"></i>`;
      }
    }
    if (n === 2) renderOnboardingAvatars();
    initIcons();
  }

  function validateCurrentSlide() {
    if (currentSlide === 1) {
      const nameInput = document.getElementById('ob-name');
      if (!nameInput || !nameInput.value.trim()) {
        nameInput && nameInput.focus();
        nameInput && (nameInput.style.borderColor = 'var(--color-sakura)');
        setTimeout(() => nameInput && (nameInput.style.borderColor = ''), 1500);
        return false;
      }
    }
    return true;
  }

  if (obNextBtn) {
    obNextBtn.addEventListener('click', async () => {
      if (!validateCurrentSlide()) return;

      if (currentSlide === totalSlides) {
        // Save all onboarding data
        const nameInput = document.getElementById('ob-name');
        const goalInput = document.getElementById('ob-goal');
        const langSelect = document.getElementById('ob-lang');

        userState.name      = nameInput ? (nameInput.value.trim() || 'Student') : 'Student';
        userState.avatarKey = selectedAvatarKey;
        userState.lang      = langSelect ? langSelect.value : 'en';
        userState.theme     = selectedThemePref;
        userState.goal      = goalInput ? goalInput.value.trim() : '';
        userState.exam      = selectedExam;
        userState.onboarded = true;

        // Persist to Firestore BEFORE launching dashboard
        await writeUserDocumentNow();
        applyTheme(userState.theme);
        applyLanguage(userState.lang);
        launchDashboard();
      } else {
        goToSlide(currentSlide + 1);
      }
    });
  }

  if (obBackBtn) {
    obBackBtn.addEventListener('click', () => {
      if (currentSlide > 1) goToSlide(currentSlide - 1);
    });
  }

  // Exam chip selection in onboarding
  document.querySelectorAll('#ob-exam-grid .exam-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#ob-exam-grid .exam-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedExam = chip.getAttribute('data-exam');
    });
  });

  // Theme preference in onboarding
  document.querySelectorAll('.theme-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.theme-option-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedThemePref = btn.getAttribute('data-theme-opt');
      applyTheme(selectedThemePref);
    });
  });

  // Settings exam picker
  document.querySelectorAll('#settings-exam-grid .exam-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#settings-exam-grid .exam-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      userState.exam = chip.getAttribute('data-exam');
      updateExamTracker();
      saveState();
    });
  });

  /* ==========================================================================
     SECTION 7: DASHBOARD LAUNCH & PERSONALIZATION
  ========================================================================== */
  function launchDashboard() {
    showScreen(screenDashboard);
    userXP = activityState.xp || userState.xp || 0;
    userLevel = activityState.level || userState.level || Math.floor(userXP / 100) + 1;
    userState.streak = activityState.streak.count || 0;

    // Personalize
    const greetEl = document.getElementById('greeting-name');
    if (greetEl) greetEl.textContent = userState.name || 'Student';

    const chatTabUser = document.getElementById('chat-tab-username');
    if (chatTabUser) chatTabUser.textContent = userState.name || 'there';

    const sidebarName = document.getElementById('sidebar-user-name');
    if (sidebarName) sidebarName.textContent = userState.name || 'Student';

    updateExamTracker();
    selectAvatar(userState.avatarKey, false);
    renderAvatarPicker();
    applyLanguage(userState.lang);
    startBlossomFall();
    initIcons();
    updateXP(0); // refresh XP display
    refreshActivityUI();
  }

  function updateExamTracker() {
    const badge = document.getElementById('tracker-exam-label');
    const title = document.getElementById('tracker-exam-title');
    if (badge) badge.textContent = `${userState.exam} EXAM TRACKER`;
    if (title) title.textContent = `${userState.exam} Target Countdown`;

    // Update settings exam chips to reflect current
    document.querySelectorAll('#settings-exam-grid .exam-chip').forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-exam') === userState.exam);
    });
  }

  /* ==========================================================================
     SECTION 8: AVATAR SYSTEM & XP
  ========================================================================== */
  let userXP    = 0;
  let userLevel = 1;
  let currentAvatarKey = 'wise_owl';

  function renderAvatarPicker() {
    const picker = document.getElementById('avatar-grid-picker');
    if (!picker) return;
    picker.innerHTML = '';
    Object.keys(avatars).forEach(key => {
      const locked = userXP < avatarXPReq[key];
      const btn = document.createElement('button');
      btn.className = `avatar-picker-item ${key === currentAvatarKey ? 'active' : ''}`;
      btn.setAttribute('aria-label', avatarNames[key]);
      if (locked) {
        btn.style.opacity = '0.4';
        btn.innerHTML = avatars[key];
        btn.title = `Unlock at ${avatarXPReq[key]} XP`;
      } else {
        btn.innerHTML = avatars[key];
        btn.addEventListener('click', () => selectAvatar(key, true));
      }
      picker.appendChild(btn);
    });
  }

  function selectAvatar(key, persist = true) {
    currentAvatarKey = key;

    const navHolder     = document.getElementById('navbar-avatar-holder');
    const sidebarHolder = document.getElementById('sidebar-avatar-display');
    const nameEl        = document.getElementById('user-display-name');

    if (navHolder) navHolder.innerHTML = avatars[key];
    if (sidebarHolder) sidebarHolder.innerHTML = avatars[key];
    if (nameEl) nameEl.textContent = avatarNames[key];

    if (persist) {
      userState.avatarKey = key;
      saveState();
    }

    renderAvatarPicker();
    initIcons();
  }

  function updateXP(amount, shouldRecord = true) {
    userXP += amount;
    const newLevel = Math.floor(userXP / 100) + 1;

    if (newLevel > userLevel) {
      userLevel = newLevel;
      addNotification('Level Up! ðŸŽ‰', `Congratulations! You reached Level ${userLevel}. New avatars may be unlocked!`);
    }

    userState.xp    = userXP;
    userState.level = userLevel;
    activityState.xp = userXP;
    activityState.level = userLevel;
    saveState();
    saveActivity();

    const levelXP = userXP % 100;
    const fillEl  = document.getElementById('xp-fill');
    const curEl   = document.getElementById('xp-label-current');
    const nxtEl   = document.getElementById('xp-label-next');
    const sideXP  = document.getElementById('sidebar-user-xp');

    if (fillEl) fillEl.style.width = `${levelXP}%`;
    if (curEl)  curEl.textContent  = `${levelXP} / 100 XP`;
    if (nxtEl)  nxtEl.textContent  = `Next: Level ${userLevel + 1}`;
    if (sideXP) sideXP.textContent = `Level ${userLevel} â€¢ ${userXP} XP`;

    renderAvatarPicker();
  }

  /* ==========================================================================
     SECTION 9: SIDEBAR COLLAPSE & TAB ROUTING
  ========================================================================== */
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  let sidebarCollapsed = false;

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      sidebarCollapsed = !sidebarCollapsed;
      sidebar.classList.toggle('collapsed', sidebarCollapsed);
    });
  }

  // Tab switching
  const tabLinks = document.querySelectorAll('.sidebar-link[data-tab]');
  const tabPanes = document.querySelectorAll('.tab-pane');

  function switchTab(tabId) {
    tabLinks.forEach(link => link.classList.toggle('active', link.getAttribute('data-tab') === tabId));
    tabPanes.forEach(pane => pane.classList.toggle('hidden', pane.id !== `tab-${tabId}`));
    tabPanes.forEach(pane => {
      if (pane.id === `tab-${tabId}`) pane.classList.remove('hidden');
    });
  }

  tabLinks.forEach(link => {
    link.addEventListener('click', () => {
      const tab = link.getAttribute('data-tab');
      switchTab(tab);
    });
  });

  // Recommendation card "go to tab" buttons
  document.querySelectorAll('[data-go-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-go-tab')));
  });

  // AI shortcut btn â†’ go to chat tab
  const aiShortcutBtn = document.getElementById('ai-shortcut-btn');
  if (aiShortcutBtn) {
    aiShortcutBtn.addEventListener('click', () => switchTab('chat'));
  }

  /* ==========================================================================
     SECTION 10: WELCOME SCREEN
  ========================================================================== */
  const welcomeStartBtn = document.getElementById('welcome-start-btn');
  if (welcomeStartBtn) {
    welcomeStartBtn.addEventListener('click', () => {
      requestedScreen = screenAuth;
      showAuthMode('signin');
    });
  }

  document.getElementById('auth-back-btn')?.addEventListener('click', () => {
    requestedScreen = screenWelcome;
    showScreen(screenWelcome);
    initIcons();
  });

  document.querySelectorAll('[data-auth-mode]').forEach(btn => {
    btn.addEventListener('click', () => showAuthMode(btn.getAttribute('data-auth-mode')));
  });

  document.querySelectorAll('[data-auth-google]').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try {
        await signInWithGoogle();
      } catch (err) {
        console.log("[LearnVerse Auth] Google Sign-In was cancelled or failed, staying on Auth Screen.");
      } finally {
        btn.disabled = false;
        googlePopupActive = false;
      }
    });
  });

  document.getElementById('signin-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('signin-email')?.value.trim();
    const password = document.getElementById('signin-password')?.value;
    setAuthMessage('signin', 'Signing in...', 'loading');
    try {
      await signInWithEmail(email, password);
      setAuthMessage('signin', 'Signed in. Opening dashboard...', 'success');
    } catch (err) {
      setAuthMessage('signin', humanAuthError(err), 'error');
    }
  });

  document.getElementById('register-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const fullName = document.getElementById('register-name')?.value.trim();
    const email = document.getElementById('register-email')?.value.trim();
    const password = document.getElementById('register-password')?.value;
    const confirmPassword = document.getElementById('register-confirm-password')?.value;
    if (password !== confirmPassword) {
      setAuthMessage('register', 'Passwords do not match.', 'error');
      return;
    }
    setAuthMessage('register', 'Creating your account...', 'loading');
    try {
      await registerWithEmail(fullName, email, password);
      setAuthMessage('register', 'Account created. Opening dashboard...', 'success');
    } catch (err) {
      setAuthMessage('register', humanAuthError(err), 'error');
    }
  });

  document.getElementById('forgot-password-btn')?.addEventListener('click', async () => {
    const email = document.getElementById('signin-email')?.value.trim();
    if (!email) {
      setAuthMessage('signin', 'Enter your email first.', 'error');
      return;
    }
    try {
      await sendPasswordResetEmail(firebaseAuth, email);
      setAuthMessage('signin', 'Password reset email sent.', 'success');
    } catch (err) {
      setAuthMessage('signin', humanAuthError(err), 'error');
    }
  });

  /* ==========================================================================
     SECTION 11: LANGUAGE DROPDOWN
  ========================================================================== */
  const langBtn       = document.getElementById('lang-btn');
  const langContainer = document.getElementById('lang-selector-container');

  if (langBtn) {
    langBtn.addEventListener('click', e => {
      e.stopPropagation();
      closeAllDropdowns();
      langContainer.classList.toggle('open');
    });
  }

  document.querySelectorAll('.dropdown-item[data-lang]').forEach(item => {
    item.addEventListener('click', () => {
      const lang = item.getAttribute('data-lang');
      applyLanguage(lang);
      userState.lang = lang;
      saveState();
      langContainer.classList.remove('open');
    });
  });

  /* ==========================================================================
     SECTION 12: PROFILE & NOTIFICATIONS DROPDOWNS
  ========================================================================== */
  const profileTrigger  = document.getElementById('profile-trigger-btn');
  const profileContainer = document.getElementById('profile-container');
  const notifBtn         = document.getElementById('notif-btn');
  const notifContainer   = document.getElementById('notif-container');

  function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-container.open').forEach(c => c.classList.remove('open'));
  }

  document.addEventListener('click', closeAllDropdowns);
  document.querySelectorAll('.dropdown-menu').forEach(menu => {
    menu.addEventListener('click', e => e.stopPropagation());
  });

  if (profileTrigger) {
    profileTrigger.addEventListener('click', e => {
      e.stopPropagation();
      closeAllDropdowns();
      profileContainer.classList.toggle('open');
    });
  }

  if (notifBtn) {
    notifBtn.addEventListener('click', e => {
      e.stopPropagation();
      closeAllDropdowns();
      notifContainer.classList.toggle('open');
    });
  }

  // Notifications
  let notifications = activityState.notifications || [];

  const notifList  = document.getElementById('notif-list');
  const notifBadge = document.getElementById('notif-badge');
  const clearNotifBtn = document.getElementById('clear-notif-btn');

  function updateNotificationsUI() {
    notifications = activityState.notifications || [];
    if (!notifList) return;
    notifList.innerHTML = '';
    if (notifications.length === 0) {
      notifList.innerHTML = `<div class="notif-empty">No new notifications ðŸŒ¸</div>`;
      if (notifBadge) notifBadge.classList.remove('active');
    } else {
      notifications.forEach(n => {
        const row = document.createElement('div');
        row.className = 'notif-item';
        row.innerHTML = `<strong>${n.title}</strong><span>${n.message}</span>`;
        notifList.appendChild(row);
      });
      if (notifBadge) notifBadge.classList.add('active');
    }
  }

  function addNotification(title, message) {
    notifications.unshift({ title, message });
    if (notifications.length > 6) notifications.pop();
    activityState.notifications = notifications;
    saveActivity();
    updateNotificationsUI();
  }

  if (clearNotifBtn) {
    clearNotifBtn.addEventListener('click', () => {
      notifications = [];
      activityState.notifications = [];
      saveActivity();
      updateNotificationsUI();
    });
  }

  /* ==========================================================================
     SECTION 13: SEARCH FILTER
  ========================================================================== */
  const navSearch = document.getElementById('nav-search-input');
  if (navSearch) {
    navSearch.addEventListener('input', () => {
      const q = navSearch.value.toLowerCase().trim();
      document.querySelectorAll('.mode-card').forEach(card => {
        const title = card.querySelector('h4')?.textContent.toLowerCase() || '';
        const desc  = card.querySelector('p')?.textContent.toLowerCase()  || '';
        card.style.display = (!q || title.includes(q) || desc.includes(q)) ? 'flex' : 'none';
      });
    });
  }

  /* ==========================================================================
     SECTION 14: CHERRY BLOSSOM PARTICLE SYSTEM
  ========================================================================== */
  const blossomsContainer  = document.getElementById('cherry-blossoms-container');
  const blossomRetriggerBtn = document.getElementById('blossom-retrigger');

  function createPetal(continuous = false) {
    if (!blossomsContainer) return;
    const petal = document.createElement('div');
    petal.className = 'cherry-petal';
    const size = Math.random() * 8 + 8;
    petal.style.width  = `${size}px`;
    petal.style.height = `${size}px`;
    petal.style.left   = `${Math.random() * 100}%`;
    const dur   = continuous ? Math.random() * 6 + 8 : Math.random() * 3 + 4;
    const delay = Math.random() * 2;
    petal.style.animation = `fall ${dur}s linear ${delay}s ${continuous ? 'infinite' : '1'}`;
    petal.style.opacity = (Math.random() * 0.4 + 0.4).toFixed(2);
    petal.style.borderRadius = `${Math.random() * 30 + 40}% 0 ${Math.random() * 30 + 40}% 0`;
    blossomsContainer.appendChild(petal);
    if (!continuous) setTimeout(() => petal.remove(), (dur + delay + 1) * 1000);
  }

  function startBlossomFall() {
    if (!blossomsContainer) return;
    // Clear old burst petals
    blossomsContainer.querySelectorAll('.cherry-petal:not(.continuous)').forEach(p => p.remove());

    // Dense initial burst
    for (let i = 0; i < 30; i++) createPetal(false);

    // Always maintain 8 continuous petals
    const existing = blossomsContainer.querySelectorAll('.cherry-petal.continuous');
    if (existing.length < 8) {
      for (let i = 0; i < 8 - existing.length; i++) {
        const p = document.createElement('div');
        p.className = 'cherry-petal continuous';
        const size = Math.random() * 8 + 8;
        p.style.width  = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left   = `${Math.random() * 100}%`;
        const dur   = Math.random() * 6 + 8;
        const delay = Math.random() * 4;
        p.style.animation = `fall ${dur}s linear ${delay}s infinite`;
        p.style.opacity = (Math.random() * 0.3 + 0.3).toFixed(2);
        blossomsContainer.appendChild(p);
      }
    }
  }

  if (blossomRetriggerBtn) {
    blossomRetriggerBtn.addEventListener('click', startBlossomFall);
  }

  // Start continuous petals immediately
  startBlossomFall();

  /* ==========================================================================
     SECTION 15: FILE UPLOAD SYSTEM
  ========================================================================== */
  const uploadZone         = document.getElementById('upload-zone');
  const fileInput          = document.getElementById('file-input');
  const idleState          = document.getElementById('upload-idle-state');
  const selectedState      = document.getElementById('file-selected-indicator');
  const selectedNameEl     = document.getElementById('selected-file-name');
  const removeFileBtn      = document.getElementById('remove-file-btn');
  const processBt          = document.getElementById('process-file-btn');
  const processingOverlay  = document.getElementById('processing-overlay');
  const browseBtn          = document.getElementById('browse-btn');
  const studioOutput       = document.getElementById('studio-output-area');

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
    uploadZone?.addEventListener(evt, e => { e.preventDefault(); e.stopPropagation(); });
  });

  uploadZone?.addEventListener('dragenter', () => uploadZone.classList.add('dragover'));
  uploadZone?.addEventListener('dragover', () => uploadZone.classList.add('dragover'));
  uploadZone?.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));

  uploadZone?.addEventListener('drop', e => {
    uploadZone.classList.remove('dragover');
    const files = e.dataTransfer?.files;
    if (files?.length > 0) handleFileSelect(files[0]);
  });

  browseBtn?.addEventListener('click', e => {
    e.stopPropagation();
    fileInput?.click();
  });

  fileInput?.addEventListener('change', () => {
    if (fileInput.files.length > 0) handleFileSelect(fileInput.files[0]);
  });

  function handleFileSelect(file) {
    pendingFile = file;
    uploadZone?.classList.add('has-file');
    if (selectedNameEl) selectedNameEl.textContent = file.name;
    idleState?.classList.add('hidden');
    selectedState?.classList.remove('hidden');
  }

  removeFileBtn?.addEventListener('click', e => {
    e.stopPropagation();
    resetUpload();
  });

  function resetUpload() {
    uploadZone?.classList.remove('has-file');
    pendingFile = null;
    if (fileInput) fileInput.value = '';
    idleState?.classList.remove('hidden');
    selectedState?.classList.add('hidden');
  }

  processBt?.addEventListener('click', () => {
    if (!pendingFile) {
      addNotification('No file selected', 'Choose a study file before transforming content.');
      fileInput?.click();
      return;
    }
    runProcessingAnimation();
  });

  function readPendingFileText() {
    return new Promise(resolve => {
      if (!pendingFile) return resolve('');
      const reader = new FileReader();
      reader.onload = () => resolve(extractReadableText(reader.result || ''));
      reader.onerror = () => resolve('');
      reader.readAsText(pendingFile);
    });
  }

  async function savePendingMaterial() {
    if (!pendingFile) return null;
    if (!currentFirebaseUser || !firebaseStorage) {
      addNotification('Sign in required', 'Google sign-in and Firebase Storage are required to save study files.');
      return null;
    }
    const now = new Date().toISOString();
    const extractedText = await readPendingFileText();
    const existing = activityState.materials.find(m => m.name === pendingFile.name && m.size === pendingFile.size);
    if (existing) {
      const filePath = `users/${currentFirebaseUser.uid}/materials/${existing.id}/${pendingFile.name}`;
      const fileRef = storageRef(firebaseStorage, filePath);
      await uploadBytes(fileRef, pendingFile, { contentType: pendingFile.type || 'application/octet-stream' });
      existing.name = pendingFile.name;
      existing.updatedAt = now;
      existing.lastOpenedAt = now;
      existing.storagePath = filePath;
      existing.downloadURL = await getDownloadURL(fileRef);
      existing.extractedText = extractedText || existing.extractedText || '';
      existing.subject = inferSubject(pendingFile.name, existing.extractedText);
      if (!existing.roadmap?.length) existing.roadmap = buildRoadmap(pendingFile.name, existing.extractedText);
      activityState.activeMaterialId = existing.id;
      saveActivity();
      return existing;
    }
    const materialId = `mat-${Date.now()}`;
    const filePath = `users/${currentFirebaseUser.uid}/materials/${materialId}/${pendingFile.name}`;
    const fileRef = storageRef(firebaseStorage, filePath);
    await uploadBytes(fileRef, pendingFile, { contentType: pendingFile.type || 'application/octet-stream' });
    const material = {
      id: materialId,
      name: pendingFile.name,
      type: pendingFile.type || 'application/octet-stream',
      size: pendingFile.size || 0,
      storagePath: filePath,
      downloadURL: await getDownloadURL(fileRef),
      uploadedAt: now,
      updatedAt: now,
      lastOpenedAt: now,
      subject: inferSubject(pendingFile.name, extractedText),
      progress: 0,
      extractedText,
      roadmap: buildRoadmap(pendingFile.name, extractedText)
    };
    activityState.materials.unshift(material);
    activityState.activeMaterialId = material.id;
    saveActivity();
    return material;
  }

  function runProcessingAnimation() {
    if (!processingOverlay) return;
    processingOverlay.classList.remove('hidden');

    const steps = [
      document.getElementById('proc-step-1'),
      document.getElementById('proc-step-2'),
      document.getElementById('proc-step-3'),
      document.getElementById('proc-step-4')
    ];

    steps.forEach(s => {
      if (!s) return;
      s.className = 'proc-step';
      s.querySelector('.step-icon')?.setAttribute('data-lucide', 'circle-dashed');
    });
    initIcons();

    let idx = 0;

    function animateStep() {
      if (idx > 0 && steps[idx - 1]) {
        steps[idx - 1].className = 'proc-step complete';
        steps[idx - 1].querySelector('.step-icon')?.setAttribute('data-lucide', 'check-circle-2');
      }
      if (idx < steps.length) {
        if (steps[idx]) {
          steps[idx].className = 'proc-step active';
          steps[idx].querySelector('.step-icon')?.setAttribute('data-lucide', 'loader-2');
        }
        initIcons();
        idx++;
        setTimeout(animateStep, 900);
      } else {
        setTimeout(async () => {
          const material = await savePendingMaterial();
          processingOverlay.classList.add('hidden');
          if (material) {
            addNotification('Material processed', `"${material.name}" is now available in Recent Materials.`);
            recordStudyActivity('upload', 5, material.id);
          }
          resetUpload();
          // Auto-switch to tutor tab & load active mode
          switchTab('tutor');
          const activeCard = document.querySelector('.mode-card.active');
          triggerModePreview(activeCard ? activeCard.getAttribute('data-mode') : 'teacher');
        }, 400);
      }
    }

    animateStep();
  }

  /* ==========================================================================
     SECTION 16: INTERACTIVE MODE PREVIEW ENGINE
  ========================================================================== */
  const modeCards  = document.querySelectorAll('.mode-card');
  const previewInner = document.getElementById('preview-inner');

  modeCards.forEach(card => {
    card.addEventListener('click', () => {
      modeCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      triggerModePreview(card.getAttribute('data-mode'));
    });
  });

  function triggerModePreview(mode) {
    if (!previewInner) return;
    previewInner.style.opacity = '0';
    setTimeout(() => {
      switch(mode) {
        case 'teacher':  renderTeacherMode();  break;
        case 'manga':    renderMangaMode();    break;
        case 'game':     renderGameMode();     break;
        case 'mindmap':  renderMindMapMode();  break;
        case 'revision': renderRevisionMode(); break;
        case 'quiz':     renderQuizMode();     break;
        case 'voice':    renderVoiceMode();    break;
        case 'story':    renderStoryMode();    break;
        default:         renderPreviewEmpty();
      }
      previewInner.style.opacity = '1';
      initIcons();
    }, 200);
  }

  function renderPreviewEmpty() {
    if (!previewInner) return;
    previewInner.innerHTML = `
      <div class="preview-empty-state">
        <i data-lucide="binary" class="preview-empty-icon pulse-icon"></i>
        <h4 data-i18n="preview-empty-title">Awaiting Studio Processing</h4>
        <p data-i18n="preview-empty-desc">Choose a file on Home, click 'Transform Content with AI' to unlock all learning modes.</p>
      </div>`;
    applyLanguage(currentLang);
    initIcons();
  }

  // â”€â”€ Teacher Mode â”€â”€
  function renderTeacherMode() {
    const material = getActiveMaterial();
    if (!material) {
      previewInner.innerHTML = `<div class="preview-empty-state"><i data-lucide="file-text" class="preview-empty-icon pulse-icon"></i><h4>No active study document</h4><p>Upload and transform a file before opening Teacher Mode.</p></div>`;
      return;
    }
    const currentChapter = material.roadmap?.find(ch => !ch.completed) || material.roadmap?.[0];
    previewInner.innerHTML = `
      <div class="chat-preview">
        <div class="teacher-info">
          <i data-lucide="award"></i>
          <span>AI Instructor â€¢ ${escapeHTML(material.subject)} â€¢ ${escapeHTML(material.name)}</span>
        </div>
        <div class="chat-bubbles-container" id="chat-bubbles-container">
          <div class="chat-bubble bubble-teacher">
            Your active document is <strong>${escapeHTML(material.name)}</strong>. Current roadmap focus: <strong>${escapeHTML(currentChapter?.title || material.subject)}</strong>.
          </div>
          <div class="chat-bubble bubble-teacher">
            Ask about a chapter, heading, topic, or quiz question from this uploaded material.
          </div>
        </div>
        <div class="chat-composer">
          <input type="text" class="chat-input" id="chat-input-box" placeholder="Ask a clarifying question...">
          <button class="btn btn-primary btn-sm" id="chat-send-btn">
            <i data-lucide="send"></i>
          </button>
        </div>
      </div>`;

    const sendBtn = document.getElementById('chat-send-btn');
    const inputBox = document.getElementById('chat-input-box');
    const container = document.getElementById('chat-bubbles-container');

    if (sendBtn && inputBox) {
      const handleSend = () => {
        const text = inputBox.value.trim();
        if (!text) return;
        const stuBubble = document.createElement('div');
        stuBubble.className = 'chat-bubble bubble-student';
        stuBubble.textContent = text;
        container.appendChild(stuBubble);
        inputBox.value = '';
        container.scrollTop = container.scrollHeight;
        setTimeout(() => {
          const teachBubble = document.createElement('div');
          teachBubble.className = 'chat-bubble bubble-teacher';
          teachBubble.innerHTML = buildStudyReply(text, material);
          container.appendChild(teachBubble);
          container.scrollTop = container.scrollHeight;
          recordStudyActivity('teacher', 5, material.id);
        }, 900);
      };
      sendBtn.addEventListener('click', handleSend);
      inputBox.addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });
    }
  }

  // â”€â”€ Manga Mode â”€â”€
  function renderMangaMode() {
    const material = getActiveMaterial();
    if (!material) {
      previewInner.innerHTML = `<div class="preview-empty-state"><i data-lucide="panels-top-left" class="preview-empty-icon pulse-icon"></i><h4>No visual panels yet</h4><p>Upload and transform a study file to create panels from your material.</p></div>`;
      return;
    }
    const chapters = material.roadmap || [];
    previewInner.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:12px;height:100%;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <h4 style="font-size:0.92rem;">${escapeHTML(chapters[0]?.title || material.subject)}</h4>
          <span style="font-size:0.65rem;background:var(--bg-tertiary);padding:2px 8px;border-radius:4px;font-weight:700;">MANGA PANEL LAYOUT</span>
        </div>
        <div class="manga-preview" style="flex:1;">
          <div class="manga-panel">
            <div class="manga-bubble">Start with the first key idea from your uploaded material.</div>
            <div class="manga-desc">Panel 1: ${escapeHTML(chapters[0]?.title || material.subject)}</div>
          </div>
          <div class="manga-panel">
            <div class="manga-bubble manga-bubble-right">Connect it to the next detected topic and revise the relationship.</div>
            <div class="manga-desc">Panel 2: ${escapeHTML(chapters[1]?.title || 'Next topic')}</div>
          </div>
        </div>
        <div style="font-size:0.72rem;color:var(--text-muted);text-align:center;">
          <i data-lucide="sparkles" style="width:0.75rem;height:0.75rem;vertical-align:middle;"></i>
          AI generated visual manga panels from your PDF content.
        </div>
      </div>`;
  }

  // â”€â”€ Game Mode â”€â”€
  function renderGameMode() {
    const material = getActiveMaterial();
    if (!material) {
      previewInner.innerHTML = `<div class="preview-empty-state"><i data-lucide="swords" class="preview-empty-icon pulse-icon"></i><h4>No quests yet</h4><p>Upload and transform a study file to build quests from your roadmap.</p></div>`;
      return;
    }
    const openChapter = material.roadmap?.find(ch => !ch.completed) || material.roadmap?.[0];
    previewInner.innerHTML = `
      <div class="game-preview">
        <div class="game-stats">
          <div class="stat-pill"><label>Current Rank</label><div>Level ${userLevel}</div></div>
          <div class="stat-pill"><label>Study Streak</label><div>${activityState.streak.count || 0} days</div></div>
          <div class="stat-pill"><label>Completed</label><div>${material.roadmap?.filter(ch => ch.completed).length || 0} / ${material.roadmap?.length || 0}</div></div>
        </div>
        <div style="font-size:0.82rem;font-weight:600;margin:8px 0 4px;">Questboard: ${escapeHTML(material.name)}</div>
        <div class="quest-list">
          <div class="quest-card">
            <div class="quest-check"><i data-lucide="book-open" style="width:0.65rem;height:0.65rem;color:white;"></i></div>
            <div class="quest-info"><h5>${escapeHTML(openChapter?.title || material.subject)}</h5><p>Read and revise this section from your uploaded material.</p></div>
            <div class="quest-xp">+10 XP</div>
          </div>
          <div class="quest-card" id="interactive-quest-btn">
            <div class="quest-check" id="quest-check-box"></div>
            <div class="quest-info"><h5>Complete active roadmap task</h5><p>Mark progress for ${escapeHTML(openChapter?.title || material.subject)}.</p></div>
            <div class="quest-xp">+25 XP</div>
          </div>
        </div>
      </div>`;

    const questBtn = document.getElementById('interactive-quest-btn');
    if (questBtn) {
      questBtn.addEventListener('click', () => {
        if (questBtn.classList.contains('completed')) return;
        questBtn.classList.add('completed');
        const box = document.getElementById('quest-check-box');
        if (box) box.innerHTML = '<i data-lucide="check" style="width:0.65rem;height:0.65rem;color:white;"></i>';
        initIcons();
        addNotification('Quest complete', `${openChapter?.title || material.subject} progress updated.`);
        recordStudyActivity('quest', 25, material.id);
      });
    }
  }
  // Mind Map Mode
  function renderMindMapMode() {
    const material = getActiveMaterial();
    if (!material) {
      previewInner.innerHTML = `<div class="preview-empty-state"><i data-lucide="git-fork" class="preview-empty-icon pulse-icon"></i><h4>No mind map yet</h4><p>Upload and transform a study file to create a map from detected chapters.</p></div>`;
      return;
    }
    const nodesData = (material.roadmap || []).slice(0, 4);
    const labels = [
      material.subject,
      nodesData[0]?.title || 'Topic 1',
      nodesData[1]?.title || 'Topic 2',
      nodesData[2]?.title || 'Topic 3',
      nodesData[3]?.title || 'Topic 4'
    ];
    previewInner.innerHTML = `
      <div style="display:flex;flex-direction:column;height:100%;">
        <div style="font-size:0.82rem;font-weight:600;margin-bottom:8px;">Interactive Mind Map: ${escapeHTML(material.name)}</div>
        <div class="mindmap-preview" id="mindmap-container" style="flex:1;min-height:200px;">
          <svg class="mindmap-canvas">
            <line x1="50%" y1="50%" x2="20%" y2="22%" class="mindmap-line"/>
            <line x1="50%" y1="50%" x2="80%" y2="22%" class="mindmap-line"/>
            <line x1="50%" y1="50%" x2="15%" y2="78%" class="mindmap-line"/>
            <line x1="50%" y1="50%" x2="85%" y2="78%" class="mindmap-line"/>
          </svg>
          <div class="mindmap-node node-center active" data-node="0">${escapeHTML(labels[0])}</div>
          <div class="mindmap-node node-branch-1" data-node="1">${escapeHTML(labels[1])}</div>
          <div class="mindmap-node node-branch-2" data-node="2">${escapeHTML(labels[2])}</div>
          <div class="mindmap-node node-branch-3" data-node="3">${escapeHTML(labels[3])}</div>
          <div class="mindmap-node node-branch-4" data-node="4">${escapeHTML(labels[4])}</div>
        </div>
        <div id="mindmap-info-card" style="margin-top:12px;padding:10px 14px;background:var(--bg-secondary);border-radius:10px;border:1px solid var(--border-color);font-size:0.78rem;line-height:1.5;">
          <strong>Concept Highlight:</strong> Click any node to inspect roadmap progress.
        </div>
      </div>`;

    const nodes = previewInner.querySelectorAll('.mindmap-node');
    const infoCard = document.getElementById('mindmap-info-card');
    nodes.forEach(node => {
      node.addEventListener('click', () => {
        nodes.forEach(n => n.classList.remove('active'));
        node.classList.add('active');
        const idx = Number(node.getAttribute('data-node')) - 1;
        const chapter = nodesData[idx];
        if (infoCard) infoCard.innerHTML = `<strong>Concept Highlight:</strong> ${escapeHTML(chapter?.title || material.subject)} ${chapter ? `is ${chapter.progress || 0}% complete.` : 'is the detected subject for this material.'}`;
        recordStudyActivity('mindmap', 2, material.id);
      });
    });
  }
  // Revision / Flashcards Mode
  let currentCardIndex = 0;
  function renderRevisionMode() {
    const material = getActiveMaterial();
    const cards = generatedFlashcards(material);
    if (!material || !cards.length) {
      previewInner.innerHTML = `<div class="preview-empty-state"><i data-lucide="layers" class="preview-empty-icon pulse-icon"></i><h4>No flashcards yet</h4><p>Upload and transform a study file to create revision cards from your material.</p></div>`;
      return;
    }
    currentCardIndex = currentCardIndex % cards.length;
    const card = cards[currentCardIndex];
    previewInner.innerHTML = `
      <div class="revision-preview">
        <div style="font-size:0.7rem;text-transform:uppercase;color:var(--text-muted);font-weight:700;">Flashcard ${currentCardIndex + 1} of ${cards.length} â€¢ ${escapeHTML(material.subject)}</div>
        <div class="flashcard" id="flashcard-element">
          <div class="flashcard-inner">
            <div class="flashcard-front">
              <label>Question</label>
              <p>${card.q}</p>
              <div class="card-tip">Click card to reveal answer</div>
            </div>
            <div class="flashcard-back">
              <label>Answer</label>
              <p>${card.a}</p>
              <div class="card-tip">Click to show question</div>
            </div>
          </div>
        </div>
        <div style="display:flex;gap:12px;">
          <button class="btn btn-secondary btn-sm" id="prev-card-btn"><i data-lucide="chevron-left"></i> Previous</button>
          <button class="btn btn-primary btn-sm" id="next-card-btn">Next <i data-lucide="chevron-right"></i></button>
        </div>
      </div>`;

    document.getElementById('flashcard-element')?.addEventListener('click', () => {
      document.getElementById('flashcard-element')?.classList.toggle('flipped');
      recordStudyActivity('revision', 1, material.id);
    });

    document.getElementById('next-card-btn')?.addEventListener('click', () => {
      currentCardIndex = (currentCardIndex + 1) % cards.length;
      renderRevisionMode();
      initIcons();
    });

    document.getElementById('prev-card-btn')?.addEventListener('click', () => {
      currentCardIndex = (currentCardIndex - 1 + cards.length) % cards.length;
      renderRevisionMode();
      initIcons();
    });
  }

  // â”€â”€ Quiz Mode â”€â”€
  let currentQuizIndex = 0;
  let quizScore = 0;
  function renderQuizMode() {
    const material = getActiveMaterial();
    const questions = generatedQuiz(material);
    if (!material || !questions.length) {
      previewInner.innerHTML = `<div class="preview-empty-state"><i data-lucide="check-square" class="preview-empty-icon pulse-icon"></i><h4>No MCQs yet</h4><p>Upload and transform a study file to generate questions from your content.</p></div>`;
      return;
    }
    currentQuizIndex = currentQuizIndex % questions.length;
    const qData = questions[currentQuizIndex];
    previewInner.innerHTML = `
      <div class="quiz-preview">
        <div class="quiz-question-num">Question ${currentQuizIndex + 1} of ${questions.length} â€¢ ${escapeHTML(material.name)}</div>
        <div class="quiz-question">${qData.q}</div>
        <div class="quiz-options" id="quiz-options-box">
          ${qData.options.map((opt, i) => `<button class="quiz-option" data-idx="${i}">${opt}</button>`).join('')}
        </div>
        <div class="quiz-score-indicator" id="quiz-score-box">Score: ${quizScore} pts</div>
      </div>`;

    const opts = previewInner.querySelectorAll('.quiz-option');
    opts.forEach(opt => {
      opt.addEventListener('click', e => {
        opts.forEach(o => o.style.pointerEvents = 'none');
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
        if (idx === qData.correct) {
          e.currentTarget.classList.add('correct');
          quizScore += 10;
          activityState.quizScores.push({ materialId: material.id, at: new Date().toISOString(), accuracy: 100, question: qData.q });
          recordStudyActivity('quiz', 15, material.id);
          document.getElementById('quiz-score-box').textContent = `âœ… Correct! +15 XP. Total: ${quizScore} pts`;
        } else {
          e.currentTarget.classList.add('incorrect');
          opts[qData.correct].classList.add('correct');
          activityState.quizScores.push({ materialId: material.id, at: new Date().toISOString(), accuracy: 0, question: qData.q });
          recordStudyActivity('quiz', 0, material.id);
          document.getElementById('quiz-score-box').textContent = `âŒ Incorrect. Correct answer highlighted. Total: ${quizScore} pts`;
        }
        setTimeout(() => {
          currentQuizIndex = (currentQuizIndex + 1) % questions.length;
          renderQuizMode();
        }, 1800);
      });
    });
  }

  // â”€â”€ Voice Tutor Mode â”€â”€
  let audioPlaying = false;
  let audioTimer = null;
  let progressPct = 0;

  function renderVoiceMode() {
    const material = getActiveMaterial();
    if (!material) {
      previewInner.innerHTML = `<div class="preview-empty-state"><i data-lucide="headphones" class="preview-empty-icon pulse-icon"></i><h4>No summary audio yet</h4><p>Upload and transform a study file before using Voice Tutor.</p></div>`;
      return;
    }
    progressPct = material.voiceProgress || 0;
    const currentChapter = material.roadmap?.find(ch => !ch.completed) || material.roadmap?.[0];
    previewInner.innerHTML = `
      <div class="voice-preview">
        <div style="font-size:0.68rem;text-transform:uppercase;color:var(--text-muted);font-weight:700;">AI Audiobook Narrator</div>
        <div class="audio-waveform-container ${audioPlaying ? 'playing' : ''}" id="waveform-wrap">
          ${Array.from({length:22}, (_,i) => {
            const h = [12,25,40,15,30,48,10,22,35,52,14,20,45,38,15,28,50,12,24,42,18,30][i] || 20;
            return `<div class="wave-bar" style="height:${h}px;"></div>`;
          }).join('')}
        </div>
        <div class="audio-details-panel">
          <h5 style="font-size:0.88rem;margin-bottom:2px;">${escapeHTML(currentChapter?.title || material.subject)}</h5>
          <span id="audio-timer-label" style="font-size:0.7rem;color:var(--text-muted);">0:00 / 2:30</span>
        </div>
        <div class="audio-progress"><div class="audio-progress-bar" id="audio-progress-fill" style="width:${progressPct}%"></div></div>
        <div class="audio-controls">
          <button class="btn-circle" id="prev-skip-btn"><i data-lucide="skip-back"></i></button>
          <button class="btn-circle btn-circle-lg" id="voice-play-btn"><i data-lucide="${audioPlaying ? 'pause' : 'play'}"></i></button>
          <button class="btn-circle" id="next-skip-btn"><i data-lucide="skip-forward"></i></button>
        </div>
        <div style="display:flex;gap:8px;align-items:center;font-size:0.72rem;">
          <span style="color:var(--text-muted);">Speed:</span>
          <button id="speed-btn" style="padding:2px 8px;border-radius:4px;font-weight:700;background:var(--bg-tertiary);font-size:0.72rem;">1.0x</button>
        </div>
      </div>`;

    const playBtn   = document.getElementById('voice-play-btn');
    const waveWrap  = document.getElementById('waveform-wrap');
    const fillBar   = document.getElementById('audio-progress-fill');
    const timerLbl  = document.getElementById('audio-timer-label');
    const speedBtn  = document.getElementById('speed-btn');

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        audioPlaying = !audioPlaying;
        if (audioPlaying) {
          playBtn.innerHTML = '<i data-lucide="pause"></i>';
          waveWrap?.classList.add('playing');
          audioTimer = setInterval(() => {
            if (progressPct < 100) {
              progressPct++;
              if (fillBar) fillBar.style.width = `${progressPct}%`;
              material.voiceProgress = progressPct;
              const secs = Math.floor((progressPct / 100) * 150);
              const m = Math.floor(secs / 60);
              const s = String(secs % 60).padStart(2, '0');
              if (timerLbl) timerLbl.textContent = `${m}:${s} / 2:30`;
              if (secs % 10 === 0) recordStudyActivity('voice', 2, material.id);
            } else {
              clearInterval(audioTimer);
              audioPlaying = false;
              waveWrap?.classList.remove('playing');
              playBtn.innerHTML = '<i data-lucide="play"></i>';
            }
            initIcons();
          }, 1000);
        } else {
          playBtn.innerHTML = '<i data-lucide="play"></i>';
          waveWrap?.classList.remove('playing');
          clearInterval(audioTimer);
        }
        initIcons();
      });
    }

    const speeds = ['1.0x', '1.25x', '1.5x', '2.0x'];
    let speedIdx = 0;
    speedBtn?.addEventListener('click', () => {
      speedIdx = (speedIdx + 1) % speeds.length;
      if (speedBtn) speedBtn.textContent = speeds[speedIdx];
    });
  }

  // â”€â”€ Story Mode â”€â”€
  function renderStoryMode() {
    const material = getActiveMaterial();
    if (!material) {
      previewInner.innerHTML = `<div class="preview-empty-state"><i data-lucide="book-marked" class="preview-empty-icon pulse-icon"></i><h4>No story path yet</h4><p>Upload and transform a study file to create a story-based revision path.</p></div>`;
      return;
    }
    const chapter = material.roadmap?.find(ch => !ch.completed) || material.roadmap?.[0];
    previewInner.innerHTML = `
      <div class="story-preview">
        <div class="story-meta">
          <span>${escapeHTML(material.subject)} Revision</span>
          <span>Reading time: ${chapter?.estimatedMinutes || 20} mins</span>
        </div>
        <div class="story-narrative">
          Study path for <strong>${escapeHTML(chapter?.title || material.subject)}</strong>: read the section, explain it in your own words, answer one generated MCQ, then mark the chapter complete when you can recall the key points without looking.
        </div>
        <div class="story-actions">
          <button class="btn btn-secondary btn-sm" id="story-explain-btn"><i data-lucide="help-circle"></i> Explain Step</button>
          <button class="btn btn-primary btn-sm" id="story-complete-btn"><i data-lucide="check"></i> Read & Completed</button>
        </div>
      </div>`;

    document.getElementById('story-explain-btn')?.addEventListener('click', () => {
      alert(`Focus on ${chapter?.title || material.subject}. Use Teacher Mode for explanation and Quiz Mode for recall.`);
      recordStudyActivity('story', 5, material.id);
    });

    document.getElementById('story-complete-btn')?.addEventListener('click', () => {
      if (chapter) {
        chapter.progress = 100;
        chapter.completed = true;
        material.progress = Math.round(material.roadmap.reduce((sum, item) => sum + item.progress, 0) / material.roadmap.length);
      }
      addNotification('Story path complete', `${chapter?.title || material.subject} marked complete.`);
      recordStudyActivity('story', 20, material.id);
    });
  }

  /* ==========================================================================
     SECTION 17: CHATBOT PANELS (Floating + Tab)
  ========================================================================== */
  const chatbotPanel     = document.getElementById('ai-chatbot-panel');
  const chatMinimizeBtn  = document.getElementById('chat-minimize-btn');
  const floatingChatHdr  = document.getElementById('floating-chat-header');

  if (floatingChatHdr) {
    floatingChatHdr.addEventListener('click', () => {
      chatbotPanel?.classList.toggle('minimized');
    });
  }

  if (chatMinimizeBtn) {
    chatMinimizeBtn.addEventListener('click', e => {
      e.stopPropagation();
      chatbotPanel?.classList.toggle('minimized');
    });
  }

  // â”€â”€ Floating panel chat â”€â”€
  function setupChatPanel(historyId, inputId, sendBtnId, bodyId, chips) {
    const history = document.getElementById(historyId);
    const input   = document.getElementById(inputId);
    const sendBtn = document.getElementById(sendBtnId);
    const body    = document.getElementById(bodyId);

    function appendMsg(text, sender) {
      if (!history) return;
      const bubble = document.createElement('div');
      bubble.className = sender === 'user' ? 'user-bubble' : 'bot-bubble';
      bubble.innerHTML = text;
      history.appendChild(bubble);
      if (body) body.scrollTop = body.scrollHeight;
    }

    function appendTyping() {
      if (!history) return;
      const bubble = document.createElement('div');
      bubble.className = 'typing-bubble';
      bubble.id = `typing-${historyId}`;
      bubble.innerHTML = `<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>`;
      history.appendChild(bubble);
      if (body) body.scrollTop = body.scrollHeight;
    }

    function removeTyping() {
      document.getElementById(`typing-${historyId}`)?.remove();
    }

    function triggerResponse(userMsg, key) {
      const material = getActiveMaterial();
      if (!material) {
        appendMsg(userMsg, 'user');
        appendMsg('Upload and transform a study document first, then I can answer with document context.', 'bot');
        return;
      }
      appendMsg(userMsg, 'user');
      activityState.chatHistory.push({ sender: 'user', text: userMsg, materialId: material.id, at: new Date().toISOString() });
      appendTyping();
      setTimeout(() => {
        removeTyping();
        const reply = key ? buildStudyReply(key, material) : buildStudyReply(userMsg, material);
        appendMsg(reply, 'bot');
        activityState.chatHistory.push({ sender: 'bot', text: reply, materialId: material.id, at: new Date().toISOString() });
        recordStudyActivity('chat', 10, material.id);
      }, 1200);
    }

    chips?.forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.querySelector('span')?.textContent || '';
        const key  = chip.getAttribute('data-prompt');
        triggerResponse(text, key);
      });
    });

    if (sendBtn && input) {
      const handleSend = () => {
        const val = input.value.trim();
        if (!val) return;
        input.value = '';
        triggerResponse(val);
      };
      sendBtn.addEventListener('click', handleSend);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });
    }
  }

  // Setup floating panel
  setupChatPanel(
    'chatbot-history', 'chatbot-input', 'chatbot-send-btn', 'chatbot-body',
    document.querySelectorAll('#ai-chatbot-panel .prompt-chip')
  );

  // Setup tab chat panel
  setupChatPanel(
    'tab-chat-history', 'tab-chat-input', 'tab-chat-send-btn', 'tab-chat-body',
    document.querySelectorAll('#tab-chat .prompt-chip')
  );

  /* ==========================================================================
     SECTION 18: SETTINGS â€” RESET PROFILE
  ========================================================================== */
  const resetBtn = document.getElementById('reset-onboarding-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      if (confirm('Reset your profile? This will clear all saved preferences and return you to the Welcome Screen.')) {
        userState = {
          ...userState,
          goal: '',
          exam: 'ECET',
          xp: 0,
          level: 1,
          streak: 0,
          onboarded: false
        };
        activityState = cloneEmptyActivity();
        await writeUserDocumentNow();
        location.reload();
      }
    });
  }

  function showAuthMode(mode = 'signin') {
    console.log("[LearnVerse Auth] Auth Screen");
    showScreen(screenAuth);
    document.getElementById('auth-signin-pane')?.classList.toggle('active', mode === 'signin');
    document.getElementById('auth-register-pane')?.classList.toggle('active', mode === 'register');
    setAuthMessage('signin', '');
    setAuthMessage('register', '');
    initIcons();
  }

  function setAuthMessage(mode, message, type = '') {
    const el = document.getElementById(`${mode}-message`);
    if (!el) return;
    el.textContent = message;
    el.className = `auth-message ${type}`.trim();
  }

  function humanAuthError(err) {
    const code = err?.code || '';
    if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
      return 'Email or password is incorrect.';
    }
    if (code.includes('email-already-in-use')) return 'An account already exists for this email.';
    if (code.includes('weak-password')) return 'Use a password with at least 6 characters.';
    if (code.includes('invalid-email')) return 'Enter a valid email address.';
    if (code.includes('operation-not-allowed')) return 'Email/password sign-in is not enabled in Firebase Authentication.';
    return err?.message || 'Authentication failed. Please try again.';
  }

  const googleSignoutBtn = document.getElementById('google-signout-btn');
  if (googleSignoutBtn) {
    googleSignoutBtn.addEventListener('click', async () => {
      if (firebaseAuth) await signOut(firebaseAuth);
      location.reload();
    });
  }

  /* ==========================================================================
     SECTION 19: BOOT SEQUENCE
  ========================================================================== */
  function boot() {
    // Always start in light mode
    applyTheme('light');

    if (!firebaseAuth) {
      console.log("[LearnVerse Auth] Welcome Screen (Firebase not configured)");
      showScreen(screenWelcome);
      applyLanguage(userState.lang || 'en');
      const btn = document.getElementById('welcome-start-btn');
      const label = btn?.querySelector('span');
      if (label) label.textContent = 'Configure Firebase';
      initIcons();
      hideLoadingOverlay();
      return;
    }

    onAuthStateChanged(firebaseAuth, async user => {
      console.log("[LearnVerse Auth] onAuthStateChanged Fired. User:", user ? user.uid : "null");
      
      if (!user) {
        currentFirebaseUser = null;
        firestoreReady = false;
        
        // If the user is currently authenticating via Google popup, do not navigate back to Welcome
        if (googlePopupActive) {
          console.log("[LearnVerse Auth] Google Sign-In popup is open. Preventing Welcome Screen redirect.");
          hideLoadingOverlay();
          return;
        }
        
        if (requestedScreen !== screenAuth) {
          console.log("[LearnVerse Auth] Welcome Screen");
          requestedScreen = screenWelcome;
          showScreen(screenWelcome);
        } else {
          console.log("[LearnVerse Auth] Auth Screen (User clicked Get Started, waiting for sign-in)");
        }
        applyLanguage(userState.lang || 'en');
        const btn = document.getElementById('welcome-start-btn');
        const label = btn?.querySelector('span');
        if (label) label.textContent = 'Get Started';
        initIcons();
        hideLoadingOverlay();
        return;
      }
      
      try {
        showLoadingOverlay("Syncing with LearnVerse...");
        console.log("[LearnVerse Auth] Firestore Loading...");
        await loadOrCreateFirestoreUser(user);
        console.log("[LearnVerse Auth] Firestore Loaded");
        applyTheme(userState.theme || 'light');
        applyLanguage(userState.lang || 'en');
        
        if (!userState.onboarded) {
          console.log("[LearnVerse Auth] Onboarding Required");
          // New / un-onboarded user → show onboarding wizard
          const nameInput = document.getElementById('ob-name');
          if (nameInput) nameInput.value = userState.name || user.displayName || '';
          currentSlide = 1;
          goToSlide(1);
          requestedScreen = screenOnboarding;
          showScreen(screenOnboarding);
          initIcons();
        } else {
          console.log("[LearnVerse Auth] Dashboard Opened");
          // Existing onboarded user → go straight to dashboard
          requestedScreen = screenDashboard;
          showScreen(screenDashboard);
          launchDashboard();
          initIcons();
        }
      } catch (err) {
        console.error('[LearnVerse Auth] Firebase profile load failed:', err);
        alert('Could not load your LearnVerse profile from Firestore. Check Firebase configuration and Firestore rules.');
        if (requestedScreen !== screenAuth) {
          requestedScreen = screenWelcome;
          showScreen(screenWelcome);
        }
      } finally {
        hideLoadingOverlay();
      }
    });
  }

  boot();

};
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAppContent);
} else {
  initializeAppContent();
}

