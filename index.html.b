<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MamChef - Homemade Food | Coming Soon</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary: #C75430;
            --primary-dark: #A54328;
            --primary-light: #D97A5A;
            --text-dark: #2C2C2C;
            --text-light: #666666;
            --bg-light: #FFF8F5;
            --white: #FFFFFF;
            --shadow: rgba(199, 84, 48, 0.08);
            --gradient: linear-gradient(135deg, #C75430 0%, #E07A54 100%);
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background-color: var(--white);
            color: var(--text-dark);
            overflow-x: hidden;
            line-height: 1.6;
        }

        /* Language Switcher */
        .language-switcher {
            position: absolute;
            right: 24px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            gap: 8px;
            background: var(--bg-light);
            padding: 4px;
            border-radius: 12px;
        }

        .lang-btn {
            padding: 8px 16px;
            border: none;
            background: transparent;
            color: var(--text-light);
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            border-radius: 8px;
            transition: all 0.3s ease;
            text-transform: uppercase;
        }

        .lang-btn.active {
            background: var(--white);
            color: var(--primary);
            box-shadow: 0 2px 8px var(--shadow);
        }

        .lang-btn:hover:not(.active) {
            color: var(--primary);
        }

        /* Hide content based on language */
        [data-lang] {
            display: none;
        }

        body.lang-en [data-lang="en"],
        body.lang-lt [data-lang="lt"] {
            display: block;
        }

        body.lang-en .feature-card[data-lang="en"],
        body.lang-lt .feature-card[data-lang="lt"] {
            display: flex;
        }

        /* Animated Background */
        .bg-animation {
            position: fixed;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            z-index: -1;
            overflow: hidden;
        }

        .floating-icon {
            position: absolute;
            opacity: 0.03;
            animation: float 20s infinite ease-in-out;
        }

        .floating-icon:nth-child(1) {
            width: 300px;
            height: 300px;
            top: -100px;
            right: -100px;
            animation-delay: 0s;
            background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23C75430'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E") no-repeat center;
            background-size: contain;
        }

        .floating-icon:nth-child(2) {
            width: 200px;
            height: 200px;
            bottom: -50px;
            left: -50px;
            animation-delay: 5s;
            background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23E07A54'%3E%3Cpath d='M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z'/%3E%3C/svg%3E") no-repeat center;
            background-size: contain;
        }

        .floating-icon:nth-child(3) {
            width: 250px;
            height: 250px;
            top: 50%;
            right: -100px;
            animation-delay: 10s;
            background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23D97A5A'%3E%3Cpath d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/%3E%3C/svg%3E") no-repeat center;
            background-size: contain;
        }

        @keyframes float {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(30px, -30px) rotate(90deg); }
            50% { transform: translate(-20px, 20px) rotate(180deg); }
            75% { transform: translate(40px, 10px) rotate(270deg); }
        }

        /* Header */
        header {
            position: fixed;
            top: 0;
            width: 100%;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            z-index: 1000;
            transition: all 0.3s ease;
            padding: 20px 0;
            box-shadow: 0 2px 20px var(--shadow);
        }

        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 24px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 24px;
        }

        .logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .logo svg {
            width: 40px;
            height: 40px;
            animation: chef-hat 2s ease-in-out infinite;
        }

        @keyframes chef-hat {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-5deg); }
            75% { transform: rotate(5deg); }
        }

        .logo-text {
            font-size: 32px;
            font-weight: 800;
            color: var(--primary);
            letter-spacing: -1px;
        }

        /* Main Content */
        main {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 120px 0 60px;
        }

        .hero-section {
            text-align: center;
            animation: fadeInUp 1s ease-out;
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .badge {
            display: inline-block;
            background: var(--bg-light);
            padding: 8px 24px;
            border-radius: 100px;
            font-size: 20px;
            font-weight: 600;
            color: var(--primary);
            margin-bottom: 24px;
            animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }

        h1 {
            font-size: clamp(40px, 8vw, 72px);
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 24px;
            color: var(--text-dark);
            letter-spacing: -2px;
        }

        .gradient-text {
            background: var(--gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .subtitle {
            font-size: clamp(18px, 3vw, 24px);
            font-weight: 400;
            color: var(--text-light);
            margin-bottom: 48px;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
            line-height: 1.5;
        }

        /* Features */
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 32px;
            margin: 80px auto;
            max-width: 1000px;
        }

        .feature-card {
            background: var(--white);
            padding: 40px 32px;
            border-radius: 24px;
            box-shadow: 0 10px 40px var(--shadow);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;

            flex-wrap: wrap;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }

        .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--gradient);
            transform: scaleX(0);
            transition: transform 0.3s ease;
        }

        .feature-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 60px var(--shadow);
        }

        .feature-card:hover::before {
            transform: scaleX(1);
        }

        .feature-icon {
            width: 84px;
            height: 84px;
            background: var(--bg-light);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 24px;
            font-size: 42px;
        }

        .feature-title {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 12px;
            color: var(--text-dark);
        }

        .feature-desc {
            font-size: 16px;
            color: var(--text-light);
            line-height: 1.6;
        }

        /* Footer */
        footer {
            padding: 48px 0;
            text-align: center;
            border-top: 1px solid #f0f0f0;
        }

        .social-links {
            display: flex;
            justify-content: center;
            gap: 16px;
            margin-bottom: 24px;
        }

        .social-link {
            width: 48px;
            height: 48px;
            background: var(--bg-light);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            text-decoration: none;
            color: var(--primary);
        }

        .social-link:hover {
            background: var(--primary);
            color: var(--white);
            transform: translateY(-4px);
        }

        .copyright {
            color: var(--text-light);
            font-size: 14px;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .language-switcher {
                position: static;
                transform: none;
                margin-top: 16px;
                justify-content: center;
            }

            .header-content {
                flex-direction: column;
            }

            .features {
                grid-template-columns: 1fr;
                gap: 24px;
            }

            /* Main Content */
            main {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 180px 0 60px;
            }
        }
    </style>
</head>
<body class="lang-en">
<div class="bg-animation">
    <div class="floating-icon"></div>
    <div class="floating-icon"></div>
    <div class="floating-icon"></div>
</div>

<header>
    <div class="header-content">
        <div class="logo">
            <img style="max-width: 200px" src="https://iili.io/F5j2RpI.png" alt="MamChef">
        </div>
        <div class="language-switcher">
            <button class="lang-btn active" onclick="setLanguage('en')">EN</button>
            <button class="lang-btn" onclick="setLanguage('lt')">LT</button>
        </div>
    </div>
</header>

<main>
    <div class="container">
        <div class="hero-section">
            <!-- English Content -->
            <div data-lang="en">
                <div class="badge">🍳 Launching Soon</div>
                <h1>Homemade Goodness<br><span class="gradient-text">Made Fresh Daily</span></h1>
                <p class="subtitle">Discover authentic home-cooked meals crafted with love by talented local chefs in your community</p>
            </div>

            <!-- Lithuanian Content -->
            <div data-lang="lt">
                <div class="badge">🍳 Netrukus startuojame</div>
                <h1>Naminis gėris<br><span class="gradient-text">Kasdien šviežias</span></h1>
                <p class="subtitle">Atraskite autentiškus namų gamybos patiekalus, su meile ruošiamus talentingų vietinių šefų jūsų bendruomenėje</p>
            </div>

            <div class="features">
                <!-- English Features -->
                <div class="feature-card" data-lang="en">
                    <div class="feature-icon">👩‍🍳</div>
                    <h3 class="feature-title">Local Home Chefs</h3>
                    <p class="feature-desc">Connect with passionate home cooks in your neighborhood who craft meals with love</p>
                </div>

                <div class="feature-card" data-lang="en">
                    <div class="feature-icon">🥘</div>
                    <h3 class="feature-title">Authentic Flavors</h3>
                    <p class="feature-desc">Discover traditional recipes and family favorites you won't find anywhere else</p>
                </div>

                <!-- Lithuanian Features -->
                <div class="feature-card" data-lang="lt">
                    <div class="feature-icon">👩‍🍳</div>
                    <h3 class="feature-title">Vietiniai namų šefai</h3>
                    <p class="feature-desc">Susisiekite su aistrngais namų virėjais jūsų kaimynystėje, kurie gamina su meile</p>
                </div>

                <div class="feature-card" data-lang="lt">
                    <div class="feature-icon">🥘</div>
                    <h3 class="feature-title">Autentiški skoniai</h3>
                    <p class="feature-desc">Atraskite tradicinius receptus ir šeimos mėgstamiausius patiekalus, kurių nerasite niekur kitur</p>
                </div>
            </div>
        </div>
    </div>
</main>

<footer>
    <div class="container">
        <div class="social-links">
            <a href="#" class="social-link" aria-label="Facebook">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
            </a>
            <a href="#" class="social-link" aria-label="Instagram">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
            </a>
            <a href="#" class="social-link" aria-label="Twitter">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
            </a>
        </div>
        <p class="copyright" data-lang="en">© 2025 MamChef. All rights reserved. Made with ❤️ for food lovers</p>
        <p class="copyright" data-lang="lt">© 20245 MamChef. Visos teisės saugomos. Sukurta su ❤️ maisto mylėtojams</p>
    </div>
</footer>

<script>
    // Language Switcher
    function setLanguage(lang) {
        document.body.className = 'lang-' + lang;
        document.documentElement.lang = lang;

        // Update active button
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        // Save preference
        localStorage.setItem('preferredLanguage', lang);
    }

    // Load saved language preference
    document.addEventListener('DOMContentLoaded', function() {
        const savedLang = localStorage.getItem('preferredLanguage') || 'en';
        document.body.className = 'lang-' + savedLang;
        document.documentElement.lang = savedLang;

        // Update active button
        document.querySelectorAll('.lang-btn').forEach(btn => {
            if (btn.textContent.toLowerCase() === savedLang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    });

    // Smooth animations on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card').forEach(card => {
        observer.observe(card);
    });
</script>
</body>
</html>
