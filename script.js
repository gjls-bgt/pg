// --- LOGIKA EMULASI NUMPAD KUSTOM ---
let currentActiveInput = null;

function openNumpad(inputElement) {
    // Blokir keyboard fisik bawaan browser sebisa mungkin
    inputElement.blur(); 
    
    // Hapus penanda aktif dari input lama jika ada
    if(currentActiveInput) {
        currentActiveInput.classList.remove('active-box');
    }

    currentActiveInput = inputElement;
    currentActiveInput.classList.add('active-box');

    // Munculkan panel numpad kustom
    document.getElementById('custom-numpad').classList.add('show');
}

function pressNumpad(value) {
    if (!currentActiveInput) return;

    if (value === 'DEL') {
        // Aturan hapus data string
        currentActiveInput.value = currentActiveInput.value.slice(0, -1);
    } else if (value === 'HIDE') {
        // Sembunyikan panel numpad kustom
        closeNumpad();
    } else {
        // Ambil batas maksimal karakter input dari elemen (jika diset pada mode latihan)
        const maxLen = currentActiveInput.getAttribute('maxlength');
        if (maxLen && currentActiveInput.value.length >= parseInt(maxLen)) {
            // Ganti nilainya langsung jika di set max 1 karakter (mode kotak porogapit)
            currentActiveInput.value = value;
        } else {
            currentActiveInput.value += value;
        }
    }

    // Memicu trigger event oninput buatan agar validasi tetap berjalan lancar
    const event = new Event('input', { bubbles: true });
    currentActiveInput.dispatchEvent(event);
}

function closeNumpad() {
    document.getElementById('custom-numpad').classList.remove('show');
    if(currentActiveInput) {
        currentActiveInput.classList.remove('active-box');
        currentActiveInput = null;
    }
}

// Tutup numpad otomatis jika klik area kosong di luar container aplikasi
document.addEventListener('click', function(e) {
    if (!e.target.closest('.app-container') && !e.target.closest('#custom-numpad')) {
        closeNumpad();
    }
}, true);


// --- NAVIGASI ANTAR HALAMAN VIRTUAL ---
function navigateTo(pageId) {
    closeNumpad();
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    
    if (pageId === 'home') {
        document.getElementById('page-home').classList.add('active');
    } else if (pageId === 'calculator') {
        document.getElementById('page-calculator').classList.add('active');
        hitungPorogapit(); 
    } else if (pageId === 'exercise') {
        document.getElementById('page-exercise').classList.add('active');
        buatSoalAcakLatihan(); 
    }
}

// --- LOGIKA HALAMAN: KALKULATOR ---
function hitungPorogapit() {
    const yangDibagiStr = document.getElementById('yangDibagi').value.trim();
    const pembagiStr = document.getElementById('pembagi').value.trim();
    
    const errorAlert = document.getElementById('errorAlert');
    const hasilContainer = document.getElementById('hasilContainer');
    const hasilEksplisit = document.getElementById('hasilEksplisit');
    const wrapperPorogapit = document.getElementById('wrapperPorogapit');

    errorAlert.style.display = 'none';
    hasilContainer.classList.add('hidden');
    wrapperPorogapit.innerHTML = '';

    if (!yangDibagiStr || !pembagiStr) {
        errorAlert.textContent = "Masukkan angka pembagian dulu ya!";
        errorAlert.style.display = 'block';
        return;
    }

    const N = parseInt(yangDibagiStr);
    const D = parseInt(pembagiStr);

    if (D <= 0 || N <= 0) {
        errorAlert.textContent = "Angkanya harus lebih besar dari 0 ya!";
        errorAlert.style.display = 'block';
        return;
    }

    generatePorogapitDOM(N, D, wrapperPorogapit, false);

    const hasilBagiLengkap = Math.floor(N / D);
    const sisaAkhir = N % D;

    if (sisaAkhir === 0) {
        hasilEksplisit.innerHTML = `${N} : ${D} = <span class="text-amber-result">${hasilBagiLengkap}</span>`;
    } else {
        hasilEksplisit.innerHTML = `${N} : ${D} = <span class="text-amber-result">${hasilBagiLengkap}<span class="fraction-inline"><span class="fraction-top">${sisaAkhir}</span><span class="fraction-bottom">${D}</span></span></span>`;
    }

    hasilContainer.classList.remove('hidden');
}

function resetForm() {
    document.getElementById('yangDibagi').value = '';
    document.getElementById('pembagi').value = '';
    document.getElementById('errorAlert').style.display = 'none';
    document.getElementById('hasilContainer').classList.add('hidden');
    document.getElementById('wrapperPorogapit').innerHTML = '';
    closeNumpad();
}

// --- LOGIKA HALAMAN: LATIHAN INTERAKTIF ---
let latihanN = 0;
let latihanD = 0;

function buatSoalAcakLatihan() {
    closeNumpad();
    const feedback = document.getElementById('feedbackLatihan');
    feedback.classList.add('hidden');
    feedback.className = 'feedback-box';

    latihanD = Math.floor(Math.random() * 11) + 2; 

    let maxHasil = Math.floor(2000 / latihanD);
    let minHasil = Math.max(10, Math.floor(100 / latihanD)); 

    let latihanHasil = Math.floor(Math.random() * (maxHasil - minHasil + 1)) + minHasil;
    latihanN = latihanHasil * latihanD; 

    document.getElementById('soalYangDibagi').textContent = latihanN;
    document.getElementById('soalPembagi').textContent = latihanD;

    const wrapper = document.getElementById('wrapperPorogapitLatihan');
    wrapper.innerHTML = '';
    generatePorogapitDOM(latihanN, latihanD, wrapper, true);
}

function cekJawabanKotak() {
    closeNumpad();
    const inputs = document.querySelectorAll('#wrapperPorogapitLatihan .box-input-porogapit');
    let semuaBenar = true;
    let adaKosong = false;

    inputs.forEach(input => {
        const nilaiUser = input.value.trim();
        const nilaiKunci = input.getAttribute('data-ans');

        if (nilaiUser === '') {
            adaKosong = true;
            input.className = "box-input-porogapit box-wrong";
            semuaBenar = false;
        } else if (nilaiUser === nilaiKunci) {
            input.className = "box-input-porogapit box-correct";
        } else {
            input.className = "box-input-porogapit box-wrong";
            semuaBenar = false;
        }
    });

    const feedback = document.getElementById('feedbackLatihan');
    feedback.classList.remove('hidden');

    if (adaKosong) {
        feedback.textContent = "⚠️ Isilah semua kotak kosong yang tersedia dulu ya!";
        feedback.className = "feedback-box feedback-wrong";
    } else if (semuaBenar) {
        feedback.textContent = "🎉 Hebat! Semua jawaban kamu BENAR dan Sempurna!";
        feedback.className = "feedback-box feedback-success";
    } else {
        feedback.textContent = "❌ Ada angka yang masih kurang tepat. Coba periksa kotak merah!";
        feedback.className = "feedback-box feedback-wrong";
    }
}

// --- INTI MESIN POROGAPIT (GRID MAKER) ---
function generatePorogapitDOM(N, D, targetWrapper, isInteractive = false) {
    const yangDibagiStr = N.toString();
    const pembagiStr = D.toString();

    const lenN = yangDibagiStr.length;
    const lenD = pembagiStr.length;
    const totalKolom = lenD + lenN + 1; 

    function buatBarisGrid(isiKolomArray) {
        const row = document.createElement('div');
        row.className = "grid-row";
        row.style.gridTemplateColumns = `repeat(${totalKolom}, minmax(1.3rem, max-content))`;
        
        for (let i = 0; i < totalKolom; i++) {
            const cell = document.createElement('div');
            cell.className = "grid-cell";
            if (isiKolomArray[i]) {
                cell.innerHTML = isiKolomArray[i];
            }
            row.appendChild(cell);
        }
        return row;
    }

    function getElementComponent(char, isAnswerBox) {
        if (!isInteractive) {
            return isAnswerBox ? `<span class="cell-hasil-atas">${char}</span>` : char;
        } else {
            // Integrasi inputmode none agar keyboard bawaan perangkat tidak aktif sama sekali
            return `<input type="text" maxlength="1" inputmode="none" class="box-input-porogapit" data-ans="${char}" onfocus="openNumpad(this)">`;
        }
    }

    let sisaSmt = 0;
    let hasilDiatasStr = "";
    let langkahLangkah = [];

    for (let i = 0; i < lenN; i++) {
        let digit = yangDibagiStr[i];
        let angkaTurun = sisaSmt * 10 + parseInt(digit);
        let hBagi = Math.floor(angkaTurun / D);
        let hKali = hBagi * D;
        let sisaLama = sisaSmt;
        sisaSmt = angkaTurun - hKali;

        if (hasilDiatasStr === "" && hBagi === 0 && i < lenN - 1) {
            continue;
        }
        hasilDiatasStr += hBagi;

        langkahLangkah.push({
            indexDigit: i,
            angkaTurun: angkaTurun,
            hKali: hKali,
            sisa: sisaSmt,
            sisaLama: sisaLama,
            digitDiturunkan: digit
        });
    }

    // BARIS 1: HASIL ATAS
    let arrBaris1 = Array(totalKolom).fill("");
    for (let i = 0; i < hasilDiatasStr.length; i++) {
        let pos = lenD + (lenN - hasilDiatasStr.length + i);
        arrBaris1[pos] = getElementComponent(hasilDiatasStr[i], true);
    }
    targetWrapper.appendChild(buatBarisGrid(arrBaris1));

    // BARIS 2: ATAP RUMAH POROGAPIT
    let arrBaris2 = Array(totalKolom).fill("");
    for(let i=0; i<lenD; i++) arrBaris2[i] = `<span class="cell-pembagi">${pembagiStr[i]}</span>`;
    
    for(let i=0; i<lenN; i++) {
        let pos = lenD + i;
        if (i === 0) {
            arrBaris2[pos] = `<span class="rumah-porogapit">${yangDibagiStr[i]}</span>`;
        } else {
            arrBaris2[pos] = `<span class="atap-porogapit">${yangDibagiStr[i]}</span>`;
        }
    }
    targetWrapper.appendChild(buatBarisGrid(arrBaris2));

    // PROSES PERULANGAN BERULANG
    langkahLangkah.forEach((lgk, idx) => {
        let posMulai = lenD + lgk.indexDigit - (lgk.hKali.toString().length - 1);
        
        let arrBarisKali = Array(totalKolom).fill("");
        let strKali = lgk.hKali.toString();
        for(let i=0; i<strKali.length; i++) {
            arrBarisKali[posMulai + i] = isInteractive ? getElementComponent(strKali[i], false) : `<span class="cell-kali">${strKali[i]}</span>`;
        }
        arrBarisKali[totalKolom - 1] = `<span class="sign-minus">-</span>`;
        targetWrapper.appendChild(buatBarisGrid(arrBarisKali));

        let arrBarisGaris = Array(totalKolom).fill("");
        let panjangGaris = totalKolom - lenD - 1;
        let posMulaiGaris = lenD;
        for(let i = 0; i < panjangGaris; i++) {
            arrBarisGaris[posMulaiGaris + i] = `<span class="line-pengurang"></span>`;
        }
        targetWrapper.appendChild(buatBarisGrid(arrBarisGaris));

        if (idx < langkahLangkah.length - 1) {
            let lgkBerikutnya = langkahLangkah[idx + 1];
            let arrBarisSisa = Array(totalKolom).fill("");
            
            let strSisa = lgk.sisa.toString();
            let posMulaiSisa = lenD + lgk.indexDigit - (strSisa.length - 1);
            
            for(let i=0; i<strSisa.length; i++) {
                arrBarisSisa[posMulaiSisa + i] = isInteractive ? getElementComponent(strSisa[i], false) : `<span class="cell-sisa-proses">${strSisa[i]}</span>`;
            }
            
            let posDigitTurun = lenD + lgkBerikutnya.indexDigit;
            arrBarisSisa[posDigitTurun] = `
                <span class="digit-turun-container">
                    ${lgkBerikutnya.digitDiturunkan}
                    <span class="line-bantu-vertikal"></span>
                </span>`;
            
            targetWrapper.appendChild(buatBarisGrid(arrBarisSisa));
        } else {
            let arrBarisSisaAkhir = Array(totalKolom).fill("");
            let strSisa = lgk.sisa.toString();
            let posMulaiSisa = lenD + lgk.indexDigit - (strSisa.length - 1);
            for(let i=0; i<strSisa.length; i++) {
                arrBarisSisaAkhir[posMulaiSisa + i] = isInteractive ? getElementComponent(strSisa[i], false) : `<span class="cell-sisa-akhir">${strSisa[i]}</span>`;
            }
            targetWrapper.appendChild(buatBarisGrid(arrBarisSisaAkhir));
        }
    });
}
