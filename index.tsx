document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const personContainer = document.getElementById('person-container') as HTMLElement;
    const personEmoji = document.getElementById('person-emoji') as HTMLElement;
    const airportContainer = document.getElementById('airport-container') as HTMLElement;
    const airportImg = document.getElementById('airport-img') as HTMLElement;
    const airportLabel = document.getElementById('airport-label') as HTMLElement;
    const awayAirportPlaceholder = document.getElementById('away-airport-placeholder') as HTMLElement;
    const passportOfficeContainer = document.getElementById('passport-office-container') as HTMLElement;
    const restaurantContainer = document.getElementById('restaurant-container') as HTMLElement;
    const giftShopContainer = document.getElementById('gift-shop-container') as HTMLElement;
    const mfGroupContainer = document.getElementById('mf-group-container') as HTMLElement;
    const luggageContainer = document.getElementById('luggage-container') as HTMLElement;
    const officerMessage = document.getElementById('officer-message') as HTMLElement;
    const passportDialog = document.getElementById('passport-dialog') as HTMLElement;
    const applyPassportBtn = document.getElementById('apply-passport-btn') as HTMLButtonElement;
    const successMessage = document.getElementById('success-message') as HTMLElement;
    const successText = document.getElementById('success-text') as HTMLElement;
    const scoreEl = document.getElementById('score') as HTMLElement;
    const jobDialog = document.getElementById('job-dialog') as HTMLElement;
    const applyJobBtn = document.getElementById('apply-job-btn') as HTMLButtonElement;
    const flightsDialog = document.getElementById('flights-dialog') as HTMLElement;
    const flightsContainer = document.getElementById('flights-container') as HTMLElement;
    const planeAnimationDialog = document.getElementById('plane-animation') as HTMLElement;
    const passportCelebration = document.getElementById('passport-celebration') as HTMLElement;
    const visaAnimationDialog = document.getElementById('visa-animation') as HTMLElement;
    const visaStickerEmoji = document.getElementById('visa-sticker-emoji') as HTMLElement;
    const cityImageContainer = document.getElementById('city-image-container') as HTMLElement;
    const cityImage = document.getElementById('city-image') as HTMLImageElement;
    const restaurantViewContainer = document.getElementById('restaurant-view-container') as HTMLElement;
    const restaurantImage = document.getElementById('restaurant-image') as HTMLImageElement;
    const exitRestaurantBtn = document.getElementById('exit-restaurant-btn') as HTMLElement;
    const captionContainer = document.getElementById('caption-container') as HTMLElement;
    const cityTitle = document.getElementById('city-title') as HTMLElement;
    const cityEmojis = document.getElementById('city-emojis') as HTMLElement;
    const visitedCitiesList = document.getElementById('visited-cities-list') as HTMLElement;
    const visitedList = document.getElementById('visited-list') as HTMLUListElement;
    const giftShopDialog = document.getElementById('gift-shop-dialog') as HTMLElement;
    const giftShopItemsContainer = document.getElementById('gift-shop-items-container') as HTMLElement;
    const exitGiftShopBtn = document.getElementById('exit-gift-shop-btn') as HTMLButtonElement;
    const souvenirsContainer = document.getElementById('souvenirs-container') as HTMLElement;
    const souvenirsList = document.getElementById('souvenirs-list') as HTMLElement;


    // --- Audio Engine ---
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

    function playSound(type: 'move' | 'earn' | 'success' | 'takeoff' | 'error' | 'click' | 'passport-get' | 'stamp' | 'pop') {
        if (!audioCtx || audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        if (!audioCtx) return;

        const now = audioCtx.currentTime;
        
        const gainNode = audioCtx.createGain();
        gainNode.connect(audioCtx.destination);
        
        if (type === 'pop') {
            const osc = audioCtx.createOscillator();
            osc.type = 'sine';
            gainNode.gain.setValueAtTime(0.1, now);
            osc.frequency.setValueAtTime(800, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.connect(gainNode);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'click') {
            const osc = audioCtx.createOscillator();
            osc.type = 'sine';
            gainNode.gain.setValueAtTime(0.2, now);
            osc.frequency.setValueAtTime(200, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.connect(gainNode);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'stamp') {
             const osc = audioCtx.createOscillator();
             osc.type = 'triangle';
             gainNode.gain.setValueAtTime(0.3, now);
             osc.frequency.setValueAtTime(150, now);
             osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
             gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
             osc.connect(gainNode);
             osc.start(now);
             osc.stop(now + 0.2);
        } else if (type === 'passport-get') {
            const osc = audioCtx.createOscillator();
            gainNode.gain.setValueAtTime(0.2, now);
            osc.type = 'sine';
            [523, 659, 784, 1046].forEach((freq, i) => {
                 osc.frequency.setValueAtTime(freq, now + i * 0.1);
            });
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            osc.connect(gainNode);
            osc.start(now);
            osc.stop(now + 0.5);
        } else if (type === 'success') {
            const osc = audioCtx.createOscillator();
            gainNode.gain.setValueAtTime(0.1, now);
            osc.type = 'triangle';
            [440, 554, 659].forEach((freq, i) => {
                osc.frequency.setValueAtTime(freq, now + i * 0.1);
            });
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc.connect(gainNode);
            osc.start(now);
            osc.stop(now + 0.4);
        } else if (type === 'takeoff') {
            const osc = audioCtx.createOscillator();
            gainNode.gain.setValueAtTime(0.2, now);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.exponentialRampToValueAtTime(1500, now + 1.5);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
            osc.connect(gainNode);
            osc.start(now);
            osc.stop(now + 1.5);
        } else if (type === 'error') {
             const osc = audioCtx.createOscillator();
            gainNode.gain.setValueAtTime(0.1, now);
            osc.type = 'square';
            osc.frequency.setValueAtTime(100, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.connect(gainNode);
            osc.start(now);
            osc.stop(now + 0.2);
        }
    }

    // --- NEW ADVANCED AUDIO ENGINE (from user) ---
    interface CitySound {
        notes: string[];
        durations: number | number[];
        oscType: string;
        filter: {
            type: string;
            cutoff: number;
            Q: number;
        };
        adsr: {
            attack: number;
            decay: number;
            sustain: number;
            release: number;
        };
        amp: number;
        vibrato?: {
            depth: number;
            rate: number;
        };
        percussion?: {
            noiseTime: number;
            noiseGain: number;
        };
    }

    const citySoundData: Record<string, CitySound> = {
        "Istanbul": { notes: ["D4","Eb4","F#4","G4","A4","F#4"], durations: 0.45, oscType: "sawtooth", filter: { type:"lowpass", cutoff:1200, Q:1.0 }, adsr: { attack:0.005, decay:0.12, sustain:0.35, release:0.3 }, amp: 0.12, vibrato: { depth:6, rate:5 } },
        "Paris": { notes: ["G4","B4","D5","B4"], durations: 0.6, oscType: "triangle", filter: { type:"bandpass", cutoff:900, Q:1.4 }, adsr: { attack:0.02, decay:0.08, sustain:0.7, release:0.2 }, amp: 0.14, vibrato: { depth:2.5, rate:5 } },
        "Kyoto": { notes: ["D4","E4","G4","A4","C5"], durations: 0.6, oscType: "sine", filter: { type:"lowpass", cutoff:1800, Q:0.8 }, adsr: { attack:0.01, decay:0.15, sustain:0.4, release:0.4 }, amp: 0.11, vibrato: { depth:4, rate:4 } },
        "Sydney": { notes: ["A2"], durations: 3.0, oscType: "square", filter: { type:"lowpass", cutoff:500, Q:1.0 }, adsr: { attack:0.05, decay:0.2, sustain:0.8, release:0.8 }, amp: 0.12, percussion: { noiseTime:0.6, noiseGain:0.08 } },
        "Barcelona": { notes: ["E4","F4","G4","B4","E5"], durations: 0.35, oscType: "sawtooth", filter: { type:"lowpass", cutoff:2200, Q:0.9 }, adsr: { attack:0.002, decay:0.08, sustain:0.3, release:0.25 }, amp: 0.13, vibrato: { depth:5, rate:6 } },
        "London": { notes: ["C4","E4","G4","C5"], durations: 0.45, oscType: "triangle", filter: { type:"bandpass", cutoff:900, Q:1.8 }, adsr: { attack:0.01, decay:0.08, sustain:0.5, release:0.2 }, amp: 0.15 },
        "New York": { notes: ["Bb3","D4","F4","Ab4","Bb4"], durations: 0.35, oscType: "sawtooth", filter: { type:"bandpass", cutoff:900, Q:1.5 }, adsr: { attack:0.01, decay:0.07, sustain:0.45, release:0.18 }, amp: 0.14, vibrato: { depth:7, rate:5 } },
        "Bangkok": { notes: ["E4","F#4","G#4","B4","C#5"], durations: 0.45, oscType: "square", filter: { type:"lowpass", cutoff:3600, Q:0.7 }, adsr: { attack:0.002, decay:0.06, sustain:0.25, release:0.22 }, amp: 0.12 },
        "Cape Town": { notes: ["C4","D4","E4","G4","A4","G4"], durations: 0.45, oscType: "sine", filter: { type:"lowpass", cutoff:1800, Q:0.5 }, adsr: { attack:0.002, decay:0.06, sustain:0.3, release:0.18 }, amp: 0.11 },
        "Budapest": { notes: ["A3","C#4","D4","E4","G#4","A4"], durations: 0.4, oscType: "sawtooth", filter: { type:"lowpass", cutoff:2100, Q:1.0 }, adsr: { attack:0.01, decay:0.08, sustain:0.4, release:0.25 }, amp: 0.13 },
        "Cairo": { notes: ["D4","E4","F#4","G4","A4"], durations: 0.45, oscType: "sawtooth", filter: { type:"lowpass", cutoff:1200, Q:1.0 }, adsr: { attack:0.005, decay:0.12, sustain:0.35, release:0.3 }, amp: 0.12, vibrato: { depth:6, rate:5 } },
        "Jeddah": { notes: ["C4","D4","E4","F4","G4"], durations: 0.45, oscType: "sawtooth", filter: { type:"lowpass", cutoff:1100, Q:1.0 }, adsr: { attack:0.005, decay:0.12, sustain:0.33, release:0.28 }, amp: 0.12, vibrato: { depth:5, rate:5 } },
        "Karachi": { notes: ["C4","Db4","E4","F4","G4","Ab4","B4","C5"], durations: 0.38, oscType: "sawtooth", filter: { type:"lowpass", cutoff:1400, Q:1.1 }, adsr: { attack:0.005, decay:0.1, sustain:0.3, release:0.25 }, amp: 0.12, vibrato: { depth:6, rate:5.5 } },
        "Toronto": { notes: ["G3", "C4", "C4", "D4", "E4"], durations: [0.7, 0.3, 0.4, 0.7, 0.7], oscType: "triangle", filter: { type:"lowpass", cutoff:1800, Q:1.0 }, adsr: { attack:0.02, decay:0.1, sustain:0.7, release:0.4 }, amp: 0.15 }
    };

    function noteToFreq(note: string): number | null {
      const noteRegex = /^([A-Ga-g])([#b]?)(-?\d+)$/;
      const m = note.match(noteRegex);
      if (!m) return null;
      let [, letter, accidental, octave] = m;
      letter = letter.toUpperCase();
      const semitoneMap: {[key: string]: number} = { 'C':0,'D':2,'E':4,'F':5,'G':7,'A':9,'B':11 };
      let semis = semitoneMap[letter];
      if (accidental === '#') semis += 1;
      if (accidental === 'b') semis -= 1;
      const midi = (parseInt(octave,10) + 1) * 12 + semis;
      const freq = 440 * Math.pow(2, (midi - 69)/12);
      return +freq.toFixed(3);
    }

    function applyADSR(param: AudioParam, startTime: number, attack: number, decay: number, sustainLevel: number, release: number, duration: number) {
      const t0 = startTime;
      param.cancelScheduledValues(t0);
      param.setValueAtTime(0.0001, t0);
      param.exponentialRampToValueAtTime(1.0, t0 + attack);
      param.exponentialRampToValueAtTime(Math.max(0.0001, sustainLevel), t0 + attack + decay);
      const releaseStart = t0 + duration;
      param.setValueAtTime(Math.max(0.0001, sustainLevel), releaseStart);
      param.exponentialRampToValueAtTime(0.0001, releaseStart + release);
    }

    function playCitySound(cityName: keyof typeof citySoundData) {
        const data = citySoundData[cityName];
        if (!data) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        
        const start = audioCtx.currentTime + 0.05;
        const master = audioCtx.createGain();
        master.gain.value = data.amp;
        master.connect(audioCtx.destination);

        let vibOsc: OscillatorNode | null = null, vibGain: GainNode | null = null;
        if (data.vibrato) {
            vibOsc = audioCtx.createOscillator();
            vibOsc.type = "sine";
            vibOsc.frequency.value = data.vibrato.rate;
            vibGain = audioCtx.createGain();
            vibGain.gain.value = data.vibrato.depth;
            vibOsc.connect(vibGain);
            vibOsc.start(start);
        }

        if (data.percussion) {
            const noiseBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * 1.0, audioCtx.sampleRate);
            const arr = noiseBuf.getChannelData(0);
            for (let i=0; i<arr.length; i++) arr[i] = (Math.random()*2-1) * Math.exp(-i/(audioCtx.sampleRate*0.25));
            const src = audioCtx.createBufferSource();
            src.buffer = noiseBuf;
            const g = audioCtx.createGain();
            g.gain.value = data.percussion.noiseGain;
            src.connect(g);
            g.connect(master);
            src.start(start + data.percussion.noiseTime);
        }

        let time = start;
        data.notes.forEach((note, idx) => {
            const hz = noteToFreq(note);
            if (!hz) return;
            const dur = Array.isArray(data.durations) ? data.durations[idx] ?? data.durations[0] : data.durations;
            
            const osc = audioCtx.createOscillator();
            osc.type = data.oscType as OscillatorType || "sine";
            osc.frequency.value = hz;
            if (vibGain) vibGain.connect(osc.frequency);

            const filter = audioCtx.createBiquadFilter();
            filter.type = data.filter.type as BiquadFilterType || "lowpass";
            filter.frequency.value = data.filter.cutoff;
            filter.Q.value = data.filter.Q || 1.0;
            
            const gainNode = audioCtx.createGain();
            gainNode.gain.value = 0.0001;

            osc.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(master);

            applyADSR(gainNode.gain, time, data.adsr.attack, data.adsr.decay, data.adsr.sustain, data.adsr.release, dur);

            osc.start(time);
            osc.stop(time + dur + data.adsr.release + 0.02);
            time += dur;
        });
    }

    // --- Game State ---
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let targetX = x;
    let targetY = y;
    let hasPassport = false;
    let score = 0;
    let salaryIntervalId: number | null = null;
    let currentLocation = 'Toronto';
    let currentMovePromise: Function | null = null;
    let isInteracting = false; // Prevents multiple interactions at once
    const visitedCities = new Set<string>();
    const collectedSouvenirs = new Map<string, { name: string; emoji: string; cost: number }>();

    // --- Data ---
    const flightData = [
        { city: 'Istanbul', airline: 'Turkish Airlines', cost: 750, airport: 'IST', time: 10.5, lang: 'tr-TR', welcomeMessage: 'İstanbul\'a hoşgeldiniz!', fact: 'Did you know? Istanbul is the only city that straddles two continents, Europe and Asia.', fact2: 'Local Tip: For a true taste of the city, try a "simit" (a circular bread with sesame seeds) from a street vendor.', visa: '🇹🇷', fontFamily: "'Meie Script', cursive", flagColors: ['#E30A17', '#FFFFFF'], emojis: ['🇹🇷', '🕌', '🧿', '☕️', '🥙', '🐈', '⛵', '📿'], cityImage: 'https://images.unsplash.com/photo-1636537511494-c3e558e0702b?auto=format&fit=crop&w=1932&q=80', airportImage: 'https://images.unsplash.com/photo-1576530519306-68a3b392f46f?auto=format&fit=crop&w=1950&q=80', restaurantImage: 'https://images.unsplash.com/photo-1596486696512-4448518e8749?auto=format&fit=crop&w=1974&q=80', souvenirs: [{ name: 'Turkish Delight', emoji: '🍬', cost: 25 }, { name: 'Evil Eye Charm', emoji: '🧿', cost: 40 }] },
        { city: 'Paris', airline: 'Air France', cost: 650, airport: 'CDG', time: 7.5, lang: 'fr-FR', welcomeMessage: 'Bienvenue à Paris!', fact: 'Did you know? The Eiffel Tower can be 15 cm taller during the summer due to thermal expansion of the iron.', fact2: 'Local Tip: Skip the tourist traps! Find a local "boulangerie" for a fresh sandwich. It\'s cheaper and more authentic.', visa: '🇫🇷', fontFamily: "'Parisienne', cursive", flagColors: ['#0055A4', '#FFFFFF', '#EF4135'], emojis: ['🇫🇷', '🥐', '🍷', '🎨', '🗼', '🧀', '🧑‍🎨', '👗', '🥖'], cityImage: 'https://images.unsplash.com/photo-1499621574732-72324384dfbc?auto=format&fit=crop&w=1974&q=80', airportImage: 'https://images.unsplash.com/photo-1672310708154-771583101dbb?auto=format&fit=crop&w=1974&q=80', restaurantImage: 'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', souvenirs: [{ name: 'Mini Eiffel Tower', emoji: '🗼', cost: 50 }, { name: 'Beret', emoji: '👒', cost: 75 }] },
        { city: 'Kyoto', airline: 'Japan Airlines', cost: 1350, airport: 'KIX', time: 14.0, lang: 'ja-JP', welcomeMessage: '京都へようこそ！', fact: 'Did you know? Kyoto has over 1,600 Buddhist temples and 400 Shinto shrines.', fact2: 'Local Tip: When visiting Gion, you might spot a real Geiko (Geisha). Remember to be respectful and not block their path.', visa: '🌸', fontFamily: "'Yuji Syuku', serif", flagColors: ['#FFFFFF', '#BC002D'], emojis: ['🇯🇵', '🌸', '🏯', '🍣', '🍵', '🎋', '⛩️', '👘', '🦊'], cityImage: 'https://images.pexels.com/photos/3408353/pexels-photo-3408353.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', airportImage: 'https://images.unsplash.com/photo-1579027889354-95a28102a033?auto=format&fit=crop&w=1932&q=80', restaurantImage: 'https://images.pexels.com/photos/2290075/pexels-photo-2290075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', souvenirs: [{ name: 'Folding Fan', emoji: '🪭', cost: 60 }, { name: 'Omamori Charm', emoji: '🧧', cost: 45 }] },
        { city: 'Sydney', airline: 'Qantas', cost: 1550, airport: 'SYD', time: 22.0, lang: 'en-AU', welcomeMessage: 'G\'day mate, welcome to Sydney!', fact: 'Did you know? The Sydney Opera House design was inspired by the peeling of an orange.', fact2: 'Local Tip: Take the ferry from Circular Quay to Manly for stunning harbor views that rival any expensive tour.', visa: '🇦🇺', fontFamily: "'Poppins', sans-serif", flagColors: ['#00008B', '#FFFFFF', '#FF0000'], emojis: ['🇦🇺', '🐨', '🦘', '🏄‍♂️', '🌉', '☀️', '🚤', '🍖', '🏖️'], cityImage: 'https://images.unsplash.com/photo-1524293581273-7926b78a82ce?auto=format&fit=crop&w=2070&q=80', airportImage: 'https://images.unsplash.com/photo-1542347522-95e24451b1b0?auto=format&fit=crop&w=2070&q=80', restaurantImage: 'https://images.unsplash.com/photo-1598501257922-3c82b1373559?auto=format&fit=crop&w=1974&q=80', souvenirs: [{ name: 'Boomerang', emoji: '🪃', cost: 55 }, { name: 'Koala Plushie', emoji: '🐨', cost: 80 }] },
        { city: 'Barcelona', airline: 'Iberia', cost: 700, airport: 'BCN', time: 8.0, lang: 'es-ES', welcomeMessage: '¡Bienvenido a Barcelona!', fact: 'Did you know? Barcelona\'s famous Sagrada Família has been under construction for over 140 years.', fact2: 'Local Tip: Enjoy "tapas" like a local by bar-hopping in the El Born or Gràcia neighborhoods, not on La Rambla.', visa: '🇪🇸', fontFamily: "'Lobster', cursive", flagColors: ['#AA151B', '#F1BF00'], emojis: ['🇪🇸', '💃', '⚽️', '🥘', '🦎', '🏛️', '🍤', '🎶', ' Gaudí '], cityImage: 'https://images.unsplash.com/photo-1587789202069-f5729a835339?auto=format&fit=crop&w=2070&q=80', airportImage: 'https://images.pexels.com/photos/1056789/pexels-photo-1056789.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', restaurantImage: 'https://images.pexels.com/photos/5419082/pexels-photo-5419082.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', souvenirs: [{ name: 'Mosaic Lizard', emoji: '🦎', cost: 65 }, { name: 'Paella Pan', emoji: '🥘', cost: 90 }] },
        { city: 'London', airline: 'British Airways', cost: 680, airport: 'LHR', time: 7.0, lang: 'en-GB', welcomeMessage: 'Welcome to London, cheers!', fact: 'Did you know? The London Underground is the oldest underground railway network in the world, known as "the Tube".', fact2: 'Local Tip: Many of London\'s best museums, like the British Museum and the National Gallery, are completely free to enter!', visa: '🇬🇧', fontFamily: "'Playfair Display', serif", flagColors: ['#012169', '#FFFFFF', '#C8102E'], emojis: ['🇬🇧', '👑', '💂‍♂️', '☕️', '🚌', '🏛️', '☔', '🎭', '☎️'], cityImage: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?auto=format&fit=crop&w=1974&q=80', airportImage: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/LHR_Terminal_5_departures.jpg', restaurantImage: 'https://images.unsplash.com/photo-1600375685293-84736939965d?auto=format&fit=crop&w=1974&q=80', souvenirs: [{ name: 'Double Decker Bus', emoji: '🚌', cost: 60 }, { name: 'Royal Guard Hat', emoji: '💂‍♂️', cost: 90 }] },
        { city: 'New York', airline: 'Delta Airlines', cost: 250, airport: 'JFK', time: 1.8, lang: 'en-US', welcomeMessage: 'Welcome to the Big Apple!', fact: 'Did you know? The first pizzeria in the United States was opened in New York City in 1905.', fact2: 'Local Tip: Walk across the Brooklyn Bridge from Brooklyn towards Manhattan for an unforgettable skyline view.', visa: '🗽', fontFamily: "'Oswald', sans-serif", flagColors: ['#B22234', '#FFFFFF', '#3C3B6E'], emojis: ['🇺🇸', '🗽', '🚕', '🍎', '🏙️', '🍕', '🥨', '🎭', '🎷'], cityImage: 'https://images.unsplash.com/photo-1546436836-07a91091f160?auto=format&fit=crop&w=2074&q=80', airportImage: 'https://images.unsplash.com/photo-1568603632733-0c4bf4de9059?auto=format&fit=crop&w=1974&q=80', restaurantImage: 'https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', souvenirs: [{ name: 'I ❤️ NY Shirt', emoji: '👕', cost: 40 }, { name: 'Statue of Liberty', emoji: '🗽', cost: 80 }] },
        { city: 'Bangkok', airline: 'Thai Airways', cost: 1100, airport: 'BKK', time: 21.0, lang: 'th-TH', welcomeMessage: 'ยินดีต้อนรับสู่กรุงเทพ!', fact: 'Did you know? Bangkok\'s full ceremonial name is one of the longest city names in the world.', fact2: 'Local Tip: A ride on a Chao Phraya Express Boat is a cheap and scenic way to see the city and avoid the traffic.', visa: '🇹🇭', fontFamily: "'Sriracha', cursive", flagColors: ['#A51931', '#FFFFFF', '#2E428B'], emojis: ['🇹🇭', '🐘', '🥭', '🛶', '🙏', '🛺', '🌶️', 'ക്ഷേത്ര', '🍜'], cityImage: 'https://images.unsplash.com/photo-1539093382943-2c1b9ea9901e?auto=format&fit=crop&w=1974&q=80', airportImage: 'https://images.unsplash.com/photo-1560026339-136336b15a03?auto=format&fit=crop&w=2070&q=80', restaurantImage: 'https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', souvenirs: [{ name: 'Tuk-Tuk Model', emoji: '🛺', cost: 50 }, { name: 'Elephant Pants', emoji: '🐘', cost: 65 }] },
        { city: 'Cape Town', airline: 'South African Airways', cost: 1300, airport: 'CPT', time: 22.5, lang: 'en-ZA', welcomeMessage: 'Welcome to Cape Town!', fact: 'Did you know? Cape Town is home to the incredibly rich Cape Floral Kingdom, a World Heritage site.', fact2: 'Local Tip: For the best sunset, skip the crowds on Table Mountain and hike to the top of Lion\'s Head or Signal Hill.', visa: '🇿🇦', fontFamily: "'Ubuntu', sans-serif", flagColors: ['#007A4D', '#FFB612', '#000000'], emojis: ['🇿🇦', '🐧', '🦁', '🍇', '⛰️', '🌺', '🐋', '🎨', '🥁'], cityImage: 'https://images.pexels.com/photos/259447/pexels-photo-259447.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', airportImage: 'https://images.unsplash.com/photo-1629837941212-909774a38e65?auto=format&fit=crop&w=2070&q=80', restaurantImage: 'https://images.unsplash.com/photo-1623945722345-9ab4a7134262?auto=format&fit=crop&w=1964&q=80', souvenirs: [{ name: 'Vuvuzela', emoji: '🎺', cost: 35 }, { name: 'Beaded Animal', emoji: '🦒', cost: 70 }] },
        { city: 'Budapest', airline: 'Lufthansa', cost: 850, airport: 'BUD', time: 10.5, lang: 'hu-HU', welcomeMessage: 'Üdvözöljük Budapesten!', fact: 'Did you know? Budapest is known as the "City of Spas" with over 120 thermal springs.', fact2: 'Local Tip: Don\'t miss the unique atmosphere of the "ruin bars" in the old Jewish Quarter, built in abandoned buildings.', visa: '🇭🇺', fontFamily: "'Cinzel', serif", flagColors: ['#CD2A3E', '#FFFFFF', '#436F4D'], emojis: ['🇭🇺', '🏰', '🌶️', '♨️', '🎻', '🌉', '🥘', '🍷', '큐브'], cityImage: 'https://images.pexels.com/photos/4674317/pexels-photo-4674317.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', airportImage: 'https://images.unsplash.com/photo-1601842971550-b74a3f379637?auto=format&fit=crop&w=2070&q=80', restaurantImage: 'https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', souvenirs: [{ name: 'Paprika Spice', emoji: '🌶️', cost: 30 }, { name: 'Rubik\'s Cube', emoji: '🧊', cost: 50 }] },
        { city: 'Cairo', airline: 'EgyptAir', cost: 950, airport: 'CAI', time: 11.5, lang: 'ar-EG', welcomeMessage: 'أهلاً بك في القاهرة!', fact: 'Did you know? Cairo is home to the Great Pyramids of Giza, the only one of the Seven Wonders of the Ancient World still standing.', fact2: 'Local Tip: When shopping in the Khan el-Khalili bazaar, friendly bargaining is expected and part of the fun!', visa: '🇪🇬', fontFamily: "'Almendra', serif", flagColors: ['#CE1126', '#FFFFFF', '#000000'], emojis: ['🇪🇬', '🐪', '📜', '🏺', '🏜️', '🔺', '🐱', '⛵', '🪶'], cityImage: 'https://images.pexels.com/photos/261395/pexels-photo-261395.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', airportImage: 'https://images.unsplash.com/photo-1678122421522-834f8a855173?auto=format&fit=crop&w=2070&q=80', restaurantImage: 'https://images.pexels.com/photos/1058272/pexels-photo-1058272.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', souvenirs: [{ name: 'Pyramid Statue', emoji: '🔺', cost: 85 }, { name: 'Papyrus Scroll', emoji: '📜', cost: 60 }] },
        { city: 'Jeddah', airline: 'Saudia', cost: 1250, airport: 'JED', time: 14.5, lang: 'ar-SA', welcomeMessage: 'أهلاً بك في جدة!', fact: 'Did you know? Jeddah is known as the "Gateway to the Two Holy Mosques" for its proximity to Mecca and Medina.', fact2: 'Local Tip: Stroll along the Corniche at sunset to see the spectacular King Fahd\'s Fountain, one of the tallest in the world.', visa: '🇸🇦', fontFamily: "'Amiri', serif", flagColors: ['#006C35', '#FFFFFF'], emojis: ['🇸🇦', '🌴', '🌊', '🕌', '☕', '🏜️', ' DATES ', '🕋'], cityImage: 'https://images.unsplash.com/photo-1614559892277-2c5055b550a2?auto=format&fit=crop&w=1932&q=80', airportImage: 'https://images.unsplash.com/photo-1674043224326-8a50cf4afd39?auto=format&fit=crop&w=2070&q=80', restaurantImage: 'https://images.unsplash.com/photo-1633215091873-a64016a505b8?auto=format&fit=crop&w=1964&q=80', souvenirs: [{ name: 'Prayer Beads', emoji: '📿', cost: 40 }, { name: 'Dates', emoji: '🌴', cost: 30 }] },
        { city: 'Karachi', airline: 'PIA', cost: 1150, airport: 'KHI', time: 16.0, lang: 'ur-PK', welcomeMessage: 'کراچی میں خوش آمدید!', fact: 'Did you know? Karachi is Pakistan\'s largest city and is known as the "City of Lights" for its vibrant nightlife.', fact2: 'Local Tip: Don\'t miss a chance to try Bun Kebab, a classic Karachi street food, from a vendor at Burns Road Food Street.', visa: '🇵🇰', fontFamily: "'Noto Nastaliq Urdu', serif", flagColors: ['#006600', '#FFFFFF'], emojis: ['🇵🇰', '🕌', '🌊', '🐐', '🏏', '🛺', '☕', '⭐', '🌙'], cityImage: 'https://images.unsplash.com/photo-1615840287235-345371c26b5c?auto=format&fit=crop&w=2070&q=80', airportImage: 'https://images.unsplash.com/photo-1587691599368-abb52097e335?auto=format&fit=crop&w=1932&q=80', restaurantImage: 'https://images.unsplash.com/photo-1631459749132-a2fe51586b8?auto=format&fit=crop&w=2070&q=80', souvenirs: [{ name: 'Ajrak Shawl', emoji: '🧣', cost: 75 }, { name: 'Truck Art Model', emoji: '🚚', cost: 95 }] }
    ];

    // --- Utility Functions ---
    function speak(text: string, lang = 'en-US'): Promise<void> {
        return new Promise((resolve) => {
            if (typeof SpeechSynthesisUtterance === "undefined" || typeof speechSynthesis === "undefined") {
                console.warn("Speech Synthesis not supported.");
                return resolve();
            }
            
            // This function will be called once voices are ready.
            const doSpeak = () => {
                // It's good practice to cancel any ongoing or pending speech before starting a new one.
                if (speechSynthesis.speaking || speechSynthesis.pending) {
                    speechSynthesis.cancel();
                }

                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = lang;

                // Attempt to find a suitable voice
                const voices = speechSynthesis.getVoices();
                const voice = voices.find(v => v.lang === lang) || voices.find(v => v.lang.startsWith(lang.split('-')[0]));
                if (voice) {
                    utterance.voice = voice;
                } else {
                    console.warn(`No voice found for lang: ${lang}. Using default.`);
                }
                
                utterance.onend = () => resolve();
                utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
                    // Log the specific error message, not the whole event object.
                    console.error(`SpeechSynthesis Error: ${e.error}`, e);
                    resolve(); // Resolve anyway to not break the game flow.
                };
                
                // A tiny delay can sometimes help prevent race conditions on some browsers.
                setTimeout(() => {
                    speechSynthesis.speak(utterance);
                }, 50);
            };

            // Check if voices are loaded. If not, wait for the onvoiceschanged event.
            if (speechSynthesis.getVoices().length > 0) {
                doSpeak();
            } else {
                speechSynthesis.onvoiceschanged = doSpeak;
            }
        });
    }

    function typeMessage(text: string, element: HTMLElement, typeDelay: number, displayDuration: number): Promise<void> {
        return new Promise(resolve => {
            element.innerHTML = '';
            let i = 0;
            const intervalId = window.setInterval(() => {
                if (i < text.length) {
                    element.innerHTML += text.charAt(i);
                    i++;
                } else {
                    clearInterval(intervalId);
                    setTimeout(() => {
                        resolve();
                    }, displayDuration);
                }
            }, typeDelay);
        });
    }
    
    function updateButtonStates() {
        applyPassportBtn.disabled = score < 200;
        flightData.forEach(flight => {
            const btn = document.getElementById(`flight-btn-${flight.city}`) as HTMLButtonElement | null;
            if (btn) {
                btn.disabled = score < flight.cost;
            }
        });

        if (!giftShopDialog.classList.contains('hidden')) {
            const flight = flightData.find(f => f.city === currentLocation);
            if (flight && flight.souvenirs) {
                flight.souvenirs.forEach(item => {
                    const btn = document.getElementById(`souvenir-btn-${item.name.replace(/\s+/g, '-')}`) as HTMLButtonElement | null;
                    if (btn) {
                        const hasItem = collectedSouvenirs.has(item.name);
                        const canAfford = score >= item.cost;
                        btn.disabled = hasItem || !canAfford;
                        if (hasItem) {
                             const checkmark = btn.querySelector('.visited-checkmark');
                            if (!checkmark) {
                                btn.innerHTML += ' <span class="visited-checkmark">✅</span>';
                            }
                        }
                    }
                });
            }
        }
    }

    function updateScore(amount: number) {
        score += amount;
        scoreEl.textContent = `$${score}`;
        updateButtonStates();
    }

    // --- Movement ---
    function moveTo(targetElement: HTMLElement) {
        return new Promise<void>(resolve => {
            const rect = targetElement.getBoundingClientRect();
            targetX = rect.left + rect.width / 2;
            targetY = rect.top + rect.height / 2;
            currentMovePromise = resolve;
        });
    }

    function gameLoop() {
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 1) {
            x += dx * 0.05;
            y += dy * 0.05;
        } else {
            if (currentMovePromise) {
                currentMovePromise();
                currentMovePromise = null;
            }
        }
        
        personContainer.style.left = `${x}px`;
        personContainer.style.top = `${y}px`;

        requestAnimationFrame(gameLoop);
    }

    // --- UI Logic ---
    function showCityView(flight: (typeof flightData)[0]) {
        passportOfficeContainer.classList.add('hidden');
        airportImg.classList.add('hidden');
        mfGroupContainer.classList.add('hidden');
        luggageContainer.classList.add('hidden');
        airportLabel.classList.add('hidden');
        
        cityImageContainer.classList.remove('hidden');
        restaurantContainer.classList.remove('hidden');
        giftShopContainer.classList.remove('hidden');
        awayAirportPlaceholder.classList.remove('hidden');
        cityTitle.classList.remove('hidden');
        cityEmojis.style.display = 'flex';
        
        currentLocation = flight.city;
        cityImage.src = flight.cityImage;
        awayAirportPlaceholder.textContent = `Return to Toronto\n(${flight.time} hrs)`;
        awayAirportPlaceholder.style.backgroundImage = `url(${flight.airportImage})`;
        
        cityTitle.textContent = flight.city;
        cityTitle.style.fontFamily = flight.fontFamily;
        const gradient = `linear-gradient(45deg, ${flight.flagColors.join(', ')})`;
        cityTitle.style.setProperty('--flag-gradient', gradient);

        cityEmojis.innerHTML = flight.emojis.map(e => `<span>${e}</span>`).join('');
    }

    function showHomeView() {
        cityImageContainer.classList.add('hidden');
        restaurantContainer.classList.add('hidden');
        giftShopContainer.classList.add('hidden');
        awayAirportPlaceholder.classList.add('hidden');
        cityTitle.classList.add('hidden');
        cityEmojis.style.display = 'none';

        passportOfficeContainer.classList.remove('hidden');
        airportImg.classList.remove('hidden');
        mfGroupContainer.classList.remove('hidden');
        luggageContainer.classList.remove('hidden');
        airportLabel.classList.remove('hidden');

        currentLocation = 'Toronto';
        captionContainer.innerHTML = '';
    }

    function playPassportCelebration() {
        passportCelebration.classList.add('active');
        const containerRect = passportCelebration.getBoundingClientRect();
        
        for (let i = 0; i < 30; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            const angle = Math.random() * 2 * Math.PI;
            const radius = Math.random() * (containerRect.width / 2);
            sparkle.style.left = `${containerRect.width / 2 + Math.cos(angle) * radius}px`;
            sparkle.style.top = `${containerRect.height / 2 + Math.sin(angle) * radius}px`;
            const travelDist = 100 + Math.random() * 100;
            sparkle.style.setProperty('--tx', `${Math.cos(angle) * travelDist}px`);
            sparkle.style.setProperty('--ty', `${Math.sin(angle) * travelDist}px`);
            passportCelebration.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 1000);
        }
        
        playSound('passport-get');
        setTimeout(() => passportCelebration.classList.remove('active'), 2500);
    }
    
    async function playNarrationSequence(flight: (typeof flightData)[0]) {
        try {
            await speak(`Welcome aboard flight ${flight.airline} to ${flight.city}. The flight time will be ${flight.time} hours.`, 'en-US');
            if (currentLocation !== flight.city) return;
            await new Promise(res => setTimeout(res, 200));
            playCitySound(flight.city as keyof typeof citySoundData);

            await typeMessage(flight.welcomeMessage, captionContainer, 50, 4000);
            if (currentLocation !== flight.city) return;
            await speak(flight.welcomeMessage, flight.lang);
            if (currentLocation !== flight.city) return;

            await typeMessage(flight.fact, captionContainer, 50, 7000);
            if (currentLocation !== flight.city) return;
            await speak(flight.fact, flight.lang);
            if (currentLocation !== flight.city) return;

            await typeMessage(flight.fact2, captionContainer, 50, 7000);
            if (currentLocation !== flight.city) return;
            await speak(flight.fact2, flight.lang);
        } catch (error) {
            console.error("Error during travel sequence:", error);
        } finally {
            if (currentLocation === flight.city) {
                captionContainer.innerHTML = '';
            }
        }
    }

    async function travelTo(flight: (typeof flightData)[0]) {
        isInteracting = true;
        updateScore(-flight.cost);
        flightsDialog.classList.add('hidden');
        planeAnimationDialog.classList.remove('hidden');
        playSound('takeoff');
        await new Promise(res => setTimeout(res, 3000));
        planeAnimationDialog.classList.add('hidden');
        
        visaStickerEmoji.textContent = flight.visa;
        visaAnimationDialog.classList.remove('hidden');
        playSound('stamp');
        await new Promise(res => setTimeout(res, 2000));
        visaAnimationDialog.classList.add('hidden');

        showCityView(flight);

        if (!visitedCities.has(flight.city)) {
            visitedCities.add(flight.city);
            const li = document.createElement('li');
            li.textContent = flight.city;
            visitedList.appendChild(li);
        }
        if (visitedCities.size > 0) visitedCitiesList.classList.remove('hidden');
        
        isInteracting = false;
        playNarrationSequence(flight);
    }
    
    async function playHomeNarration() {
        try {
            await speak(`Welcome back to Toronto.`);
            if (currentLocation !== 'Toronto') return;
            await new Promise(res => setTimeout(res, 200));
            playCitySound('Toronto');
            await typeMessage('Welcome home!', captionContainer, 50, 4000);
        } catch (error) {
            console.error("Error during return home sequence:", error);
        } finally {
            if (currentLocation === 'Toronto') {
                captionContainer.innerHTML = '';
            }
        }
    }

    async function returnHome() {
        isInteracting = true;
        planeAnimationDialog.classList.remove('hidden');
        playSound('takeoff');
        await new Promise(res => setTimeout(res, 3000));
        
        planeAnimationDialog.classList.add('hidden');
        showHomeView();
        
        isInteracting = false;
        playHomeNarration();
    }

    // --- Event Listeners & Game Init ---
    document.body.addEventListener('click', async (e) => {
        if (isInteracting) return;

        const target = e.target as HTMLElement;

        // Dialog interactions
        if (jobDialog.contains(target) && target === applyJobBtn) {
            playSound('success');
            jobDialog.classList.add('hidden');
            
            speak("Congratulations! You now have a job!");
            successText.textContent = "Congratulations! You now have a job!";
            (successMessage.querySelector('#success-emoji') as HTMLElement).textContent = '💼';
            successMessage.classList.remove('hidden');
            setTimeout(() => successMessage.classList.add('hidden'), 2500);

            if (salaryIntervalId === null) {
                updateScore(50);
                salaryIntervalId = window.setInterval(() => {
                    updateScore(50);
                }, 400); // User requested 0.4 seconds
            }
            return;
        }

        if (passportDialog.contains(target) && target === applyPassportBtn) {
            if (score >= 200) {
                updateScore(-200);
                hasPassport = true;
                passportDialog.classList.add('hidden');
                speak("Congratulations! You now have a passport!");
                playPassportCelebration();
            }
            return;
        }
        
        if (flightsDialog.contains(target)) {
            const button = target.closest('.flight-button');
            if (button && !(button as HTMLButtonElement).disabled) {
                const city = button.getAttribute('data-city');
                const flight = flightData.find(f => f.city === city);
                if (flight) travelTo(flight);
            }
            return;
        }

        if (restaurantViewContainer.contains(target) && target === exitRestaurantBtn) {
            playSound('click');
            restaurantViewContainer.classList.add('hidden');
            return;
        }

        if (giftShopDialog.contains(target)) {
            if (target === exitGiftShopBtn) {
                playSound('click');
                giftShopDialog.classList.add('hidden');
            } else {
                const button = target.closest('.gift-item') as HTMLButtonElement | null;
                if (button && !button.disabled) {
                    const itemName = button.getAttribute('data-name');
                    const flight = flightData.find(f => f.city === currentLocation);
                    const souvenir = flight?.souvenirs?.find(s => s.name === itemName);

                    if (souvenir) {
                        playSound('success');
                        updateScore(-souvenir.cost);
                        collectedSouvenirs.set(souvenir.name, souvenir);
                        
                        const souvenirEl = document.createElement('div');
                        souvenirEl.className = 'souvenir-item';
                        souvenirEl.textContent = `${souvenir.emoji} ${souvenir.name}`;
                        souvenirsList.appendChild(souvenirEl);
                        souvenirsContainer.classList.remove('hidden');
                        
                        updateButtonStates();
                    }
                }
            }
            return;
        }
        
        // World interactions
        const passportOffice = target.closest('#passport-office-container');
        const airport = target.closest('#airport-container');
        const company = target.closest('#mf-group-container');
        const restaurant = target.closest('#restaurant-container');
        const giftShop = target.closest('#gift-shop-container');

        const interactionTarget = passportOffice || airport || company 
            || (restaurant && !restaurant.classList.contains('hidden') ? restaurant : null)
            || (giftShop && !giftShop.classList.contains('hidden') ? giftShop : null);

        if (interactionTarget) {
            isInteracting = true;
            [passportDialog, jobDialog, flightsDialog, officerMessage, restaurantViewContainer, giftShopDialog].forEach(d => d.classList.add('hidden'));
            
            await moveTo(interactionTarget as HTMLElement);
            
            if (interactionTarget === passportOfficeContainer) {
                 if (hasPassport) {
                    officerMessage.querySelector('#speech-bubble')!.textContent = "You already have a passport!";
                    officerMessage.classList.remove('hidden');
                } else {
                    updateButtonStates();
                    passportDialog.classList.remove('hidden');
                }
            } else if (interactionTarget === mfGroupContainer) {
                jobDialog.classList.remove('hidden');
            } else if (interactionTarget === airportContainer) {
                if (!hasPassport) {
                    officerMessage.querySelector('#speech-bubble')!.textContent = "You must have a passport to travel";
                    officerMessage.classList.remove('hidden');
                } else if (currentLocation === 'Toronto') {
                     flightsContainer.innerHTML = flightData
                        .map(f => `
                            <button class="flight-button" data-city="${f.city}" id="flight-btn-${f.city}">
                                <strong>${f.city} (${f.airport})</strong>
                                ${f.airline}<br>
                                Cost: $${f.cost} | Time: ${f.time}h
                                ${visitedCities.has(f.city) ? '<span class="visited-checkmark">✅</span>' : ''}
                            </button>
                        `).join('');
                    updateButtonStates();
                    flightsDialog.classList.remove('hidden');
                } else {
                    await returnHome();
                }
            } else if (interactionTarget === restaurantContainer) {
                const flight = flightData.find(f => f.city === currentLocation);
                if (flight) {
                    restaurantImage.src = flight.restaurantImage;
                    restaurantViewContainer.classList.remove('hidden');
                }
            } else if (interactionTarget === giftShopContainer) {
                const flight = flightData.find(f => f.city === currentLocation);
                if (flight && flight.souvenirs) {
                    giftShopItemsContainer.innerHTML = flight.souvenirs.map(item => `
                        <button class="gift-item action-button" data-name="${item.name}" id="souvenir-btn-${item.name.replace(/\s+/g, '-')}">
                            ${item.emoji} ${item.name}<br>
                            $${item.cost}
                        </button>
                    `).join('');
                    updateButtonStates();
                    giftShopDialog.classList.remove('hidden');
                }
            }
            isInteracting = false;
        } else {
            // If not clicking an interactive element, just move
            targetX = e.clientX;
            targetY = e.clientY;
        }
    });
    
    restaurantContainer.addEventListener('mouseover', () => playSound('pop'));
    giftShopContainer.addEventListener('mouseover', () => playSound('pop'));

    // Game initialization
    updateScore(0);
    gameLoop();
});