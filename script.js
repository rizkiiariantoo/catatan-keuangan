// =========================================================================
// 1. DATA STRUKTUR KATEGORI & SUB-KATEGORI
// =========================================================================
const dataKeuangan = {
    income: {
        "Pendapatan Rutin": ["Gaji Pokok", "Tunjangan Kinerja", "Uang Makan"],
        "Pendapatan Tambahan": ["Honor", "Insentif/Bonus/THR", "Passive Income", "Side Hustle", "Digital Content", "Endorsment"],
        "Pencairan & Pengembalian": ["Piutang/Pinjaman", "Refund/Cashback", "Barang Bekas", "Kado/Angpao", "Arisan", "Reimburst"],
        "Pendapatan Investasi": ["Hasil Investasi", "Jual Aset", "Dividen"] 
    },
    expense: {
        "Kebutuhan Pokok": ["Bahan Masak", "Kebersihan", "Anak & Bayi", "Tagihan Rumah", "Pulsa/Internet", "Transportasi", "Pemeliharaan", "Kesehatan & Obat", "Pendidikan Anak"],
        "Gaya Hidup & Hiburan": ["Makan diluar & Jajan", "Fashion", "Self-Care", "Barang/Peralatan", "Hiburan & Rekreasi", "Hobi", "Edukasi & Pengembangan diri"],
        "Masa Depan": ["KPR", "Investasi", "Tabungan & Arisan", "Cicilan Barang"],
        "Sosial & Keluarga": ["Kado", "Keluarga Besar", "Zakat & Sedekah", "Dana Sosial"],
        "Piutang/Pinjaman": ["Saudara", "Teman"],
        "Reimburst": ["Perjalanan Dinas"],
        "Khusus": ["Lainnya"] 
    }
};

// =========================================================================
// 2. MENGAMBIL ELEMEN HTML & MEMORI LOCALSTORAGE
// =========================================================================
const selectJenis = document.getElementById('jenis');
const selectKategori = document.getElementById('kategori');
const selectSubKategori = document.getElementById('sub-kategori');
const formFinance = document.getElementById('finance-form');
const inputTanggal = document.getElementById('tanggal');
const inputNominal = document.getElementById('nominal');
const selectMataUang = document.getElementById('mata-uang');
const selectPic = document.getElementById('pic'); 
const inputCatatan = document.getElementById('keterangan'); 
const selectDompet = document.getElementById('dompet');
const tableBody = document.getElementById('table-body');

// Mengambil data dari browser (Auto-Save Memory)
let daftarTransaksi = JSON.parse(localStorage.getItem('transaksi_keuangan')) || [];

// =========================================================================
// 3. LOGIKA DROPDOWN BERTINGKAT (DINAMIS)
// =========================================================================
selectJenis.addEventListener('change', function() {
    selectKategori.innerHTML = '<option value="" disabled selected>Pilih Kategori...</option>';
    selectSubKategori.innerHTML = '<option value="" disabled selected>Pilih Sub Kategori...</option>';
    
    const jenisTerpilih = this.value; 
    if (jenisTerpilih && dataKeuangan[jenisTerpilih]) {
        const daftarKategori = Object.keys(dataKeuangan[jenisTerpilih]);
        daftarKategori.forEach(function(kategori) {
            const opsi = document.createElement('option');
            opsi.value = kategori;
            opsi.textContent = kategori;
            selectKategori.appendChild(opsi);
        });
    }
});

selectKategori.addEventListener('change', function() {
    selectSubKategori.innerHTML = '<option value="" disabled selected>Pilih Sub Kategori...</option>';
    
    const jenisTerpilih = selectJenis.value;
    const kategoriTerpilih = this.value;
    
    if (jenisTerpilih && kategoriTerpilih && dataKeuangan[jenisTerpilih][kategoriTerpilih]) {
        const daftarSub = dataKeuangan[jenisTerpilih][kategoriTerpilih];
        daftarSub.forEach(function(sub) {
            const opsi = document.createElement('option');
            opsi.value = sub;
            opsi.textContent = sub;
            selectSubKategori.appendChild(opsi);
        });
    }
});

// =========================================================================
// 4. FUNGSI FORMAT MATA UANG (Helper)
// =========================================================================
function formatUang(nominal, mataUang) {
    if (mataUang === "USD") {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 2
        }).format(nominal);
    } else {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(nominal);
    }
}

// =========================================================================
// 5. FUNGSI UPDATE SUMMARY CARDS (dengan filter tahun)
// =========================================================================
function updateSummaryCards() {
    const filterEl = document.getElementById('filter-tahun-summary');
    const tahunDipilih = filterEl ? filterEl.value : '';

    // Update opsi tahun di dropdown summary
    if (filterEl) {
        const current = filterEl.value;
        const tahunSet = new Set();
        daftarTransaksi.forEach(t => {
            const th = t.tanggal ? t.tanggal.split('-')[0] : '';
            if (th) tahunSet.add(th);
        });
        filterEl.innerHTML = '<option value="">Semua Tahun</option>';
        Array.from(tahunSet).sort().reverse().forEach(th => {
            const o = document.createElement('option');
            o.value = th; o.textContent = th;
            if (th === current) o.selected = true;
            filterEl.appendChild(o);
        });
        // Restore pilihan setelah rebuild
        if (current) filterEl.value = current;
    }

    const tahunAktif = filterEl ? filterEl.value : '';

    let totalIncome = 0;
    let totalExpense = 0;

    daftarTransaksi.forEach(function(item) {
        if (item.mataUang !== 'IDR') return;
        if (tahunAktif && !item.tanggal.startsWith(tahunAktif)) return;
        const nominal = parseFloat(item.nominal) || 0;
        if (item.jenis === 'income') totalIncome += nominal;
        else totalExpense += nominal;
    });

    const saldo = totalIncome - totalExpense;

    // Update label judul kartu sesuai filter
    const labelTahun = tahunAktif ? `Tahun ${tahunAktif}` : 'Semua Waktu';
    document.querySelector('.card-income .card-title').textContent  = `Pemasukan — ${labelTahun}`;
    document.querySelector('.card-expense .card-title').textContent = `Pengeluaran — ${labelTahun}`;
    document.querySelector('.card-balance .card-title').textContent = `Saldo — ${labelTahun}`;

    document.getElementById('card-income-value').textContent  = formatUang(totalIncome, 'IDR');
    document.getElementById('card-expense-value').textContent = formatUang(totalExpense, 'IDR');

    const cardBalanceValue = document.getElementById('card-balance-value');
    cardBalanceValue.textContent = formatUang(saldo, 'IDR');
    cardBalanceValue.style.color = saldo >= 0 ? '#10b981' : '#ef4444';
}

// =========================================================================
// 6. FUNGSI MENAMPILKAN DATA KE TABEL (dengan filter & search)
// =========================================================================
function tampilkanDataKeTabel() {
    const searchInput = document.getElementById('search-input');
    const filterJenis = document.getElementById('filter-jenis');
    const filterTahun = document.getElementById('filter-tahun');

    const kataCari = searchInput ? searchInput.value.toLowerCase() : '';
    const jenisDipilih = filterJenis ? filterJenis.value : '';
    const tahunDipilih = filterTahun ? filterTahun.value : '';

    tableBody.innerHTML = "";

    const dataFiltered = daftarTransaksi.filter(function(item, index) {
        item._originalIndex = index; // simpan index asli untuk keperluan hapus
        
        const cocokJenis = !jenisDipilih || item.jenis === jenisDipilih;
        const cocokTahun = !tahunDipilih || item.tanggal.startsWith(tahunDipilih);
        const cocokCari = !kataCari || 
            item.kategori.toLowerCase().includes(kataCari) ||
            item.subKategori.toLowerCase().includes(kataCari) ||
            item.catatan.toLowerCase().includes(kataCari) ||
            item.pic.toLowerCase().includes(kataCari);
        
        return cocokJenis && cocokTahun && cocokCari;
    });

    if (dataFiltered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 30px; color: #94a3b8;">Tidak ada transaksi ditemukan.</td></tr>`;
    } else {
        dataFiltered.forEach(function(item) {
            const barisBaru = document.createElement('tr');
            let formatNominal = formatUang(item.nominal, item.mataUang);
            
            let kelasWarnaTeks = item.jenis === "income" ? "text-income" : "text-expense";
            let teksJenis = item.jenis === "income" ? "Income" : "Expense";

            // Escape HTML untuk mencegah XSS
            const safeCatatan = item.catatan.replace(/</g, "&lt;").replace(/>/g, "&gt;");

            barisBaru.innerHTML = `
                <td>${item.tanggal}</td>
                <td class="${kelasWarnaTeks}">${teksJenis}</td>
                <td>${item.kategori}</td>
                <td>${item.subKategori}</td>
                <td class="${kelasWarnaTeks}">${formatNominal}</td>
                <td>${item.mataUang}</td>
                <td>${item.pic}</td>
                <td>${safeCatatan}</td>
                <td>${item.dompet}</td>
                <td style="white-space:nowrap;">
                    <button class="btn-edit"  data-index="${item._originalIndex}">Edit</button>
                    <button class="btn-hapus" data-index="${item._originalIndex}">Hapus</button>
                </td>
            `;

            tableBody.appendChild(barisBaru);
        });
    }

    // Update summary cards setiap kali tabel dirender
    updateSummaryCards();

    // Update opsi tahun di filter
    updateFilterTahun();
}

// =========================================================================
// 7. UPDATE OPSI TAHUN DI FILTER SECARA OTOMATIS
// =========================================================================
function updateFilterTahun() {
    const filterTahun = document.getElementById('filter-tahun');
    if (!filterTahun) return;

    const nilaiSekarang = filterTahun.value;
    const tahunSet = new Set();
    daftarTransaksi.forEach(function(item) {
        const tahun = item.tanggal.split('-')[0];
        if (tahun) tahunSet.add(tahun);
    });

    filterTahun.innerHTML = '<option value="">Semua Tahun</option>';
    Array.from(tahunSet).sort().reverse().forEach(function(tahun) {
        const opsi = document.createElement('option');
        opsi.value = tahun;
        opsi.textContent = tahun;
        if (tahun === nilaiSekarang) opsi.selected = true;
        filterTahun.appendChild(opsi);
    });
}

// =========================================================================
// 8. LOGIKA SIMPAN TRANSAKSI BARU
// =========================================================================
formFinance.addEventListener('submit', function(event) {
    event.preventDefault();

    // Validasi nominal tidak boleh negatif atau nol
    const nominalValue = parseFloat(inputNominal.value);
    if (!nominalValue || nominalValue <= 0) {
        alert("Nominal harus lebih dari 0!");
        inputNominal.focus();
        return;
    }

    const catatanMentah = inputCatatan ? inputCatatan.value : "";

    const transaksiBaru = {
        tanggal: inputTanggal.value,
        jenis: selectJenis.value,
        kategori: selectKategori.value,
        subKategori: selectSubKategori.value || "-",
        nominal: nominalValue,
        mataUang: selectMataUang.value,
        pic: selectPic.value || "-",
        catatan: catatanMentah.trim() || "-",
        dompet: selectDompet.value || "-"
    };

    daftarTransaksi.push(transaksiBaru);
    localStorage.setItem('transaksi_keuangan', JSON.stringify(daftarTransaksi));

    // Render ulang tabel
    tampilkanDataKeTabel();

    // Reset Form ke default awal
    formFinance.reset();
    selectKategori.innerHTML = '<option value="" disabled selected>Pilih Kategori...</option>';
    selectSubKategori.innerHTML = '<option value="" disabled selected>Pilih Sub Kategori...</option>';

    // Tampilkan notifikasi sukses
    tampilkanNotifikasi('✅ Transaksi berhasil disimpan!', 'sukses');
});

// =========================================================================
// 9. LOGIKA HAPUS & EDIT TRANSAKSI
// =========================================================================
tableBody.addEventListener('click', function(event) {
    // HAPUS
    if (event.target.classList.contains('btn-hapus')) {
        const index = parseInt(event.target.getAttribute('data-index'));
        if (confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
            daftarTransaksi.splice(index, 1);
            localStorage.setItem('transaksi_keuangan', JSON.stringify(daftarTransaksi));
            tampilkanDataKeTabel();
            tampilkanNotifikasi('🗑️ Transaksi berhasil dihapus.', 'hapus');
        }
    }

    // EDIT
    if (event.target.classList.contains('btn-edit')) {
        const index = parseInt(event.target.getAttribute('data-index'));
        bukaModalEdit(index);
    }
});

// =========================================================================
// 10. FUNGSI NOTIFIKASI TOAST
// =========================================================================
function tampilkanNotifikasi(pesan, tipe) {
    const toast = document.getElementById('toast-notifikasi');
    if (!toast) return;
    toast.textContent = pesan;
    toast.className = 'toast-notif show ' + tipe;
    setTimeout(function() {
        toast.className = 'toast-notif';
    }, 3000);
}

// =========================================================================
// 11. FUNGSI MODAL EDIT
// =========================================================================
function bukaModalEdit(index) {
    const item = daftarTransaksi[index];
    if (!item) return;

    // Isi semua field di modal
    document.getElementById('edit-index').value   = index;
    document.getElementById('edit-tanggal').value = item.tanggal;
    document.getElementById('edit-nominal').value = item.nominal;
    document.getElementById('edit-keterangan').value = item.catatan !== '-' ? item.catatan : '';

    // Jenis → lalu isi kategori → lalu isi sub-kategori
    const selJenis = document.getElementById('edit-jenis');
    selJenis.value = item.jenis;
    isiKategoriEdit(item.jenis, item.kategori);
    isiSubKategoriEdit(item.jenis, item.kategori, item.subKategori);

    document.getElementById('edit-mata-uang').value = item.mataUang;
    document.getElementById('edit-pic').value       = item.pic;
    document.getElementById('edit-dompet').value    = item.dompet;

    document.getElementById('modal-edit').style.display = 'flex';
}

function isiKategoriEdit(jenis, pilihanKategori) {
    const sel = document.getElementById('edit-kategori');
    sel.innerHTML = '<option value="" disabled>Pilih Kategori...</option>';
    if (jenis && dataKeuangan[jenis]) {
        Object.keys(dataKeuangan[jenis]).forEach(kat => {
            const o = document.createElement('option');
            o.value = kat; o.textContent = kat;
            if (kat === pilihanKategori) o.selected = true;
            sel.appendChild(o);
        });
    }
}

function isiSubKategoriEdit(jenis, kategori, pilihanSub) {
    const sel = document.getElementById('edit-sub-kategori');
    sel.innerHTML = '<option value="">- (tidak ada)</option>';
    if (jenis && kategori && dataKeuangan[jenis] && dataKeuangan[jenis][kategori]) {
        dataKeuangan[jenis][kategori].forEach(sub => {
            const o = document.createElement('option');
            o.value = sub; o.textContent = sub;
            if (sub === pilihanSub) o.selected = true;
            sel.appendChild(o);
        });
    }
}

function tutupModalEdit() {
    document.getElementById('modal-edit').style.display = 'none';
}

// Dropdown bertingkat di dalam modal
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('edit-jenis').addEventListener('change', function() {
        isiKategoriEdit(this.value, '');
        isiSubKategoriEdit(this.value, '', '');
    });
    document.getElementById('edit-kategori').addEventListener('change', function() {
        const jenis = document.getElementById('edit-jenis').value;
        isiSubKategoriEdit(jenis, this.value, '');
    });

    // Simpan hasil edit
    document.getElementById('form-edit').addEventListener('submit', function(e) {
        e.preventDefault();
        const index    = parseInt(document.getElementById('edit-index').value);
        const nominal  = parseFloat(document.getElementById('edit-nominal').value);

        if (!nominal || nominal <= 0) {
            alert("Nominal harus lebih dari 0!");
            return;
        }

        daftarTransaksi[index] = {
            tanggal:     document.getElementById('edit-tanggal').value,
            jenis:       document.getElementById('edit-jenis').value,
            kategori:    document.getElementById('edit-kategori').value,
            subKategori: document.getElementById('edit-sub-kategori').value || '-',
            nominal:     nominal,
            mataUang:    document.getElementById('edit-mata-uang').value,
            pic:         document.getElementById('edit-pic').value,
            catatan:     document.getElementById('edit-keterangan').value.trim() || '-',
            dompet:      document.getElementById('edit-dompet').value
        };

        localStorage.setItem('transaksi_keuangan', JSON.stringify(daftarTransaksi));
        tutupModalEdit();
        tampilkanDataKeTabel();
        tampilkanNotifikasi('✏️ Transaksi berhasil diperbarui!', 'edit');
    });

    // Tutup modal saat klik backdrop
    document.getElementById('modal-edit').addEventListener('click', function(e) {
        if (e.target === this) tutupModalEdit();
    });
});

// =========================================================================
// 12. EVENT LISTENER UNTUK FILTER & SEARCH
// =========================================================================
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const filterJenis = document.getElementById('filter-jenis');
    const filterTahun = document.getElementById('filter-tahun');
    const filterSummary = document.getElementById('filter-tahun-summary');

    if (searchInput) searchInput.addEventListener('input', tampilkanDataKeTabel);
    if (filterJenis) filterJenis.addEventListener('change', tampilkanDataKeTabel);
    if (filterTahun) filterTahun.addEventListener('change', tampilkanDataKeTabel);
    if (filterSummary) filterSummary.addEventListener('change', updateSummaryCards);
});

// =========================================================================
// 12. FUNGSI PINDAH VIEW (TAB)
// =========================================================================
function tampilkanView(view) {
    const listView = document.querySelector('.table-container');
    const rekapView = document.getElementById('rekap-view');
    const buttons = document.querySelectorAll('.tab-btn');

    buttons.forEach(btn => btn.classList.remove('active'));

    if (view === 'rekap') {
        buttons[1].classList.add('active');
        listView.style.display = 'none';
        rekapView.style.display = 'block';
        hitungRekap();
    } else {
        buttons[0].classList.add('active');
        listView.style.display = 'block';
        rekapView.style.display = 'none';
    }
}

// =========================================================================
// 13. FUNGSI REKAPITULASI — BUGFIX: Dipisah per Tahun
// =========================================================================
function hitungRekap() {
    const bulanList = ["01","02","03","04","05","06","07","08","09","10","11","12"];
    const kategoriUrut = [
        "Pendapatan Rutin", "Pendapatan Tambahan", "Pencairan & Pengembalian", "Pendapatan Investasi",
        "Kebutuhan Pokok", "Gaya Hidup & Hiburan", "Masa Depan", "Sosial & Keluarga", 
        "Piutang/Pinjaman", "Reimburst", "Khusus"
    ];

    // Ambil tahun yang dipilih di filter rekap
    const filterRekap = document.getElementById('filter-tahun-rekap');
    const tahunDipilih = filterRekap ? filterRekap.value : '';

    // Update opsi tahun rekap
    const tahunSet = new Set();
    daftarTransaksi.forEach(t => tahunSet.add(t.tanggal.split('-')[0]));
    if (filterRekap) {
        const current = filterRekap.value;
        filterRekap.innerHTML = '<option value="">Semua Tahun</option>';
        Array.from(tahunSet).sort().reverse().forEach(tahun => {
            const o = document.createElement('option');
            o.value = tahun; o.textContent = tahun;
            if (tahun === current) o.selected = true;
            filterRekap.appendChild(o);
        });
    }

    // Filter transaksi berdasarkan tahun
    const transaksiFiltered = tahunDipilih 
        ? daftarTransaksi.filter(t => t.tanggal.startsWith(tahunDipilih))
        : daftarTransaksi;

    // Inisialisasi Data
    let dataTotal = { income: Array(12).fill(0), expense: Array(12).fill(0) };
    let dataMap = {};
    let subDataMap = {};
    let picDataMap = {};

    // Proses Pengolahan Data
    transaksiFiltered.forEach(t => {
        let bIndex = parseInt(t.tanggal.split('-')[1]) - 1;
        let nominal = parseFloat(t.nominal) || 0;
        
        if (t.jenis === 'income') dataTotal.income[bIndex] += nominal;
        else dataTotal.expense[bIndex] += nominal;

        // Per Kategori
        if (!dataMap[t.kategori]) dataMap[t.kategori] = {};
        if (!dataMap[t.kategori][bIndex]) dataMap[t.kategori][bIndex] = { inc: 0, exp: 0 };
        if (t.jenis === 'income') dataMap[t.kategori][bIndex].inc += nominal;
        else dataMap[t.kategori][bIndex].exp += nominal;

        // Per Sub-Kategori
        if (!subDataMap[t.subKategori]) subDataMap[t.subKategori] = {};
        if (!subDataMap[t.subKategori][bIndex]) subDataMap[t.subKategori][bIndex] = { inc: 0, exp: 0 };
        if (t.jenis === 'income') subDataMap[t.subKategori][bIndex].inc += nominal;
        else subDataMap[t.subKategori][bIndex].exp += nominal;

        // Per PIC
        let pic = t.pic || "-";
        if (!picDataMap[pic]) picDataMap[pic] = {};
        if (!picDataMap[pic][bIndex]) picDataMap[pic][bIndex] = { inc: 0, exp: 0 };
        if (t.jenis === 'income') picDataMap[pic][bIndex].inc += nominal;
        else picDataMap[pic][bIndex].exp += nominal;
    });

    // Helper render angka di cell
    function renderCell(d) {
        let isi = "";
        if (d.inc > 0) isi += `<div style="color:#10b981; font-weight:600;">${d.inc.toLocaleString('id-ID')}</div>`;
        if (d.exp > 0) isi += `<div style="color:#ef4444; font-weight:600;">${d.exp.toLocaleString('id-ID')}</div>`;
        return isi || '-';
    }

    // 1. Render Tabel Total Bulanan
    const totalBody = document.getElementById('rekap-total-body');
    totalBody.innerHTML = `
        <tr>
            <td style="border:1px solid #e2e8f0; padding:8px; font-weight:bold;">Income</td>
            ${dataTotal.income.map(n => `<td style="border:1px solid #e2e8f0; text-align:center; color:#10b981; font-weight:bold; padding:8px;">${n > 0 ? n.toLocaleString('id-ID') : '-'}</td>`).join('')}
        </tr>
        <tr>
            <td style="border:1px solid #e2e8f0; padding:8px; font-weight:bold;">Expense</td>
            ${dataTotal.expense.map(n => `<td style="border:1px solid #e2e8f0; text-align:center; color:#ef4444; font-weight:bold; padding:8px;">${n > 0 ? n.toLocaleString('id-ID') : '-'}</td>`).join('')}
        </tr>
        <tr style="background-color:#f1f5f9;">
            <td style="border:1px solid #e2e8f0; padding:8px; font-weight:bold;">Saldo</td>
            ${dataTotal.income.map((n, i) => {
                const saldo = n - dataTotal.expense[i];
                const warna = saldo > 0 ? '#2563eb' : (saldo < 0 ? '#ef4444' : '#94a3b8');
                return `<td style="border:1px solid #e2e8f0; text-align:center; color:${warna}; font-weight:bold; padding:8px;">${(n > 0 || dataTotal.expense[i] > 0) ? saldo.toLocaleString('id-ID') : '-'}</td>`;
            }).join('')}
        </tr>
    `;

    // 1b. Render Grafik Bulanan
    renderGrafikBulanan(dataTotal);

    // 2. Render Tabel Kategori
    const rekapBody = document.getElementById('rekap-body');
    const rowsKat = [];
    kategoriUrut.forEach((kat, index) => {
        const bgColor = index % 2 === 0 ? "#ffffff" : "#f8fafc";
        let row = `<tr style="background-color:${bgColor};">
                    <td style="border:1px solid #e2e8f0; padding:8px; text-align:left; font-weight:600;">${kat}</td>`;
        bulanList.forEach((b, i) => {
            let d = dataMap[kat] ? (dataMap[kat][i] || {inc:0,exp:0}) : {inc:0,exp:0};
            row += `<td style="border:1px solid #e2e8f0; padding:5px; text-align:center;">${renderCell(d)}</td>`;
        });
        row += `</tr>`;
        rowsKat.push(row);
    });
    rekapBody.innerHTML = rowsKat.join('');

    // 2b. Render Grafik Kategori
    renderGrafikKategori(dataMap, kategoriUrut);

    // 3. Render Tabel Sub-Kategori
    const subBody = document.getElementById('rekap-sub-body');
    const subKategoriUrut = [
        "Gaji Pokok","Tunjangan Kinerja","Uang Makan",
        "Honor","Insentif/Bonus/THR","Passive Income","Side Hustle","Digital Content","Endorsment",
        "Piutang/Pinjaman","Refund/Cashback","Barang Bekas","Kado/Angpao","Arisan","Reimburst","Jual Aset","Dividen",
        "Bahan Masak","Kebersihan","Anak & Bayi","Tagihan Rumah","Pulsa/Internet","Transportasi","Pemeliharaan","Kesehatan & Obat","Pendidikan Anak",
        "Makan diluar & Jajan","Fashion","Self-Care","Barang/Peralatan","Hiburan & Rekreasi","Hobi","Edukasi & Pengembangan diri",
        "KPR","Investasi","Tabungan & Arisan","Cicilan Barang",
        "Kado","Keluarga Besar","Zakat & Sedekah","Dana Sosial",
        "Saudara","Teman","Perjalanan Dinas","Lainnya"
    ];
    const rowsSub = [];
    subKategoriUrut.forEach((sub, index) => {
        const bgColor = index % 2 === 0 ? "#ffffff" : "#f8fafc";
        let row = `<tr style="background-color:${bgColor};"><td style="border:1px solid #e2e8f0; padding:8px; text-align:left; font-weight:600;">${sub}</td>`;
        bulanList.forEach((b, i) => {
            let d = subDataMap[sub] ? (subDataMap[sub][i] || {inc:0,exp:0}) : {inc:0,exp:0};
            row += `<td style="border:1px solid #e2e8f0; padding:5px; text-align:center;">${renderCell(d)}</td>`;
        });
        row += `</tr>`;
        rowsSub.push(row);
    });
    subBody.innerHTML = rowsSub.join('');

    // 3b. Render Grafik Sub-Kategori
    renderGrafikSubKategori(subDataMap, subKategoriUrut);

    // 4. Render Tabel PIC
    const picBody = document.getElementById('rekap-pic-body');
    const daftarPIC = ["Ayah", "Bunda"];
    const rowsPIC = [];
    daftarPIC.forEach((p, index) => {
        const bgColor = index % 2 === 0 ? "#ffffff" : "#f8fafc";
        let row = `<tr style="background-color:${bgColor};"><td style="border:1px solid #e2e8f0; padding:8px; text-align:left; font-weight:600;">${p}</td>`;
        bulanList.forEach((b, i) => {
            let d = picDataMap[p] ? (picDataMap[p][i] || {inc:0,exp:0}) : {inc:0,exp:0};
            row += `<td style="border:1px solid #e2e8f0; padding:5px; text-align:center;">${renderCell(d)}</td>`;
        });
        row += `</tr>`;
        rowsPIC.push(row);
    });
    picBody.innerHTML = rowsPIC.join('');

    // 4b. Render Grafik PIC
    renderGrafikPIC(picDataMap, daftarPIC);
}

// =========================================================================
// 14–18. HELPER GRAFIK AREA BERTUMPUK
// =========================================================================

// Setup canvas dengan DPR
function setupCanvas(canvasId, height) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    const dpr  = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width * dpr;
    canvas.height = height * dpr;
    canvas.style.height = height + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, W: rect.width, H: height };
}

function fmtAngka(v) {
    const a = Math.abs(v);
    return (v < 0 ? '-' : '') + (a >= 1e9 ? (a/1e9).toFixed(1)+'M' : a >= 1e6 ? (a/1e6).toFixed(1)+'jt' : a >= 1e3 ? (a/1e3).toFixed(0)+'rb' : a.toFixed(0));
}

// Gambar area bertumpuk (stacked area) + garis di atasnya
// series: [{ label, color, data[12] }, ...]  — urutan bawah ke atas
function drawStackedArea(ctx, W, H, namaBulan, series, opts = {}) {
    const padTop   = opts.padTop   || 30;
    const padBot   = opts.padBot   || 45;
    const padLeft  = opts.padLeft  || 68;
    const padRight = opts.padRight || 16;
    const chartW   = W - padLeft - padRight;
    const chartH   = H - padTop - padBot;

    // Hitung stack per bulan
    const stacked = Array.from({length: 12}, (_, i) => {
        let cum = 0;
        return series.map(s => { cum += (s.data[i] || 0); return cum; });
    }); // stacked[bulan][seriesIdx] = nilai kumulatif

    const maxVal = Math.max(...stacked.flat(), 1) * 1.12;

    const xOf  = i  => padLeft + i * (chartW / 11);
    const yOf  = v  => padTop + chartH - (v / maxVal) * chartH;

    // Gridlines & label Y
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
    for (let s = 0; s <= 5; s++) {
        const v = maxVal * s / 5;
        const y = yOf(v);
        ctx.beginPath(); ctx.moveTo(padLeft, y); ctx.lineTo(W - padRight, y); ctx.stroke();
        ctx.fillStyle = '#94a3b8'; ctx.font = '10px Segoe UI,sans-serif'; ctx.textAlign = 'right';
        ctx.fillText(fmtAngka(v), padLeft - 5, y + 4);
    }

    // Gambar area bertumpuk dari seri terbesar ke terkecil (reverse agar tumpuk benar)
    for (let si = series.length - 1; si >= 0; si--) {
        const topVals    = stacked.map(s => s[si]);
        const bottomVals = si === 0 ? Array(12).fill(0) : stacked.map(s => s[si - 1]);

        ctx.beginPath();
        // Garis atas kiri → kanan
        ctx.moveTo(xOf(0), yOf(topVals[0]));
        for (let i = 1; i < 12; i++) ctx.lineTo(xOf(i), yOf(topVals[i]));
        // Balik kanan → kiri di garis bawah
        for (let i = 11; i >= 0; i--) ctx.lineTo(xOf(i), yOf(bottomVals[i]));
        ctx.closePath();

        const hex = series[si].color;
        ctx.fillStyle = hex + '55'; // transparan 33%
        ctx.fill();

        // Garis tepi atas
        ctx.beginPath();
        ctx.moveTo(xOf(0), yOf(topVals[0]));
        for (let i = 1; i < 12; i++) ctx.lineTo(xOf(i), yOf(topVals[i]));
        ctx.strokeStyle = series[si].color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Titik data
        for (let i = 0; i < 12; i++) {
            if (topVals[i] > 0 || bottomVals[i] > 0) {
                ctx.beginPath();
                ctx.arc(xOf(i), yOf(topVals[i]), 3.5, 0, Math.PI * 2);
                ctx.fillStyle = series[si].color;
                ctx.fill();
                ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        }
    }

    // Label bulan
    for (let i = 0; i < 12; i++) {
        ctx.fillStyle = '#64748b'; ctx.font = '11px Segoe UI,sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(namaBulan[i], xOf(i), H - padBot + 16);
    }

    // Legenda
    const legendY = H - 8;
    let lx = padLeft;
    series.forEach(s => {
        ctx.fillStyle = s.color;
        ctx.fillRect(lx, legendY - 9, 14, 9);
        ctx.fillStyle = '#475569'; ctx.font = '11px Segoe UI,sans-serif'; ctx.textAlign = 'left';
        ctx.fillText(s.label, lx + 17, legendY);
        lx += ctx.measureText(s.label).width + 34;
    });
}

// =========================================================================
// 14. GRAFIK RINGKASAN BULANAN — Stacked Area Income & Expense + garis Saldo
// =========================================================================
function renderGrafikBulanan(dataTotal) {
    const namaBulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    const income  = dataTotal.income;
    const expense = dataTotal.expense;

    const cv = setupCanvas('grafik-bulanan', 320);
    if (!cv) return;
    const { ctx, W, H } = cv;

    ctx.clearRect(0, 0, W, H);

    const bulanAktif = income.some((v, i) => v > 0 || expense[i] > 0);
    if (!bulanAktif) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px Segoe UI,sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Belum ada data transaksi', W / 2, H / 2);
        return;
    }

    // Gambar stacked area Income (bawah) + Expense (atas)
    drawStackedArea(ctx, W, H, namaBulan, [
        { label: 'Income',  color: '#10b981', data: income  },
        { label: 'Expense', color: '#ef4444', data: expense }
    ], { padTop: 30, padBot: 50, padLeft: 72, padRight: 20 });

    // Tambahkan garis Saldo di atasnya
    const padTop = 30, padBot = 50, padLeft = 72, padRight = 20;
    const chartW = W - padLeft - padRight;
    const chartH = H - padTop - padBot;

    // Hitung maxVal sama dengan yang dipakai drawStackedArea
    const stacked = income.map((v, i) => v + expense[i]);
    const maxVal  = Math.max(...stacked, 1) * 1.12;
    const xOf = i => padLeft + i * (chartW / 11);
    const yOf = v => padTop + chartH - (v / maxVal) * chartH;

    const saldo = income.map((v, i) => v - expense[i]);
    // Saldo bisa negatif — gambar relatif terhadap sumbu 0 pada skala yOf
    // Kita klem ke dalam area supaya tidak keluar canvas
    const saldoY = i => {
        const ratio = saldo[i] / maxVal;
        return padTop + chartH - ratio * chartH;
    };

    const saldoPoints = saldo.map((v, i) => ({
        x: xOf(i), y: saldoY(i), val: v,
        active: income[i] > 0 || expense[i] > 0
    })).filter(p => p.active);

    if (saldoPoints.length > 1) {
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        saldoPoints.forEach((p, idx) => idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.stroke();
        ctx.setLineDash([]);
    }

    saldoPoints.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = p.val >= 0 ? '#2563eb' : '#f97316';
        ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
        ctx.stroke();
    });

    // Tambahkan Saldo ke legenda (sudah ada Income & Expense dari drawStackedArea)
    const legendY = H - 8;
    const lxSaldo = padLeft + 2 * (ctx.measureText('Income').width + 51);
    ctx.fillStyle = '#2563eb';
    ctx.beginPath(); ctx.arc(lxSaldo + 5, legendY - 4, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#475569'; ctx.font = '11px Segoe UI,sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('Saldo', lxSaldo + 13, legendY);
}

// =========================================================================
// 15. WARNA PALETTE
// =========================================================================
const WARNA_PALETTE = [
    '#6366f1','#f59e0b','#06b6d4','#8b5cf6','#ec4899',
    '#14b8a6','#f97316','#84cc16','#3b82f6','#ef4444',
    '#10b981','#a855f7','#0ea5e9','#eab308','#64748b'
];

// =========================================================================
// 16. GRAFIK PER KATEGORI — Stacked Area per bulan, tiap kategori warna berbeda
// =========================================================================
function renderGrafikKategori(dataMap, kategoriUrut) {
    const namaBulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

    // Ambil kategori yang punya data
    const katAktif = kategoriUrut.filter(kat => {
        for (let i = 0; i < 12; i++) {
            const d = dataMap[kat] ? (dataMap[kat][i] || {inc:0,exp:0}) : {inc:0,exp:0};
            if (d.inc > 0 || d.exp > 0) return true;
        }
        return false;
    });

    const cv = setupCanvas('grafik-kategori', 320);
    if (!cv) return;
    const { ctx, W, H } = cv;
    ctx.clearRect(0, 0, W, H);

    if (katAktif.length === 0) {
        ctx.fillStyle = '#94a3b8'; ctx.font = '13px Segoe UI,sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Belum ada data', W/2, H/2); return;
    }

    // Series: total (inc+exp) per kategori per bulan, ditumpuk
    const series = katAktif.map((kat, idx) => ({
        label: kat,
        color: WARNA_PALETTE[idx % WARNA_PALETTE.length],
        data:  Array.from({length: 12}, (_, i) => {
            const d = dataMap[kat] ? (dataMap[kat][i] || {inc:0,exp:0}) : {inc:0,exp:0};
            return d.inc + d.exp;
        })
    }));

    drawStackedArea(ctx, W, H, namaBulan, series, { padTop: 30, padBot: 50, padLeft: 72, padRight: 16 });
}

// =========================================================================
// 17. GRAFIK PER SUB-KATEGORI — Stacked Area per bulan, tiap sub warna berbeda
// =========================================================================
function renderGrafikSubKategori(subDataMap, subKategoriUrut) {
    const namaBulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

    const subAktif = subKategoriUrut.filter(sub => {
        for (let i = 0; i < 12; i++) {
            const d = subDataMap[sub] ? (subDataMap[sub][i] || {inc:0,exp:0}) : {inc:0,exp:0};
            if (d.inc > 0 || d.exp > 0) return true;
        }
        return false;
    });

    const cv = setupCanvas('grafik-sub-kategori', 320);
    if (!cv) return;
    const { ctx, W, H } = cv;
    ctx.clearRect(0, 0, W, H);

    if (subAktif.length === 0) {
        ctx.fillStyle = '#94a3b8'; ctx.font = '13px Segoe UI,sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Belum ada data', W/2, H/2); return;
    }

    const series = subAktif.map((sub, idx) => ({
        label: sub,
        color: WARNA_PALETTE[idx % WARNA_PALETTE.length],
        data:  Array.from({length: 12}, (_, i) => {
            const d = subDataMap[sub] ? (subDataMap[sub][i] || {inc:0,exp:0}) : {inc:0,exp:0};
            return d.inc + d.exp;
        })
    }));

    drawStackedArea(ctx, W, H, namaBulan, series, { padTop: 30, padBot: 50, padLeft: 72, padRight: 16 });
}

// =========================================================================
// 18. GRAFIK PER PIC — Stacked Area per bulan, tiap PIC warna berbeda
// =========================================================================
function renderGrafikPIC(picDataMap, daftarPIC) {
    const namaBulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    const warnaIncome  = ['#10b981','#06b6d4','#8b5cf6','#f59e0b'];
    const warnaExpense = ['#ef4444','#f97316','#ec4899','#eab308'];

    const cv = setupCanvas('grafik-pic', 340);
    if (!cv) return;
    const { ctx, W, H } = cv;
    ctx.clearRect(0, 0, W, H);

    const adaData = daftarPIC.some(p => {
        for (let i = 0; i < 12; i++) {
            const d = picDataMap[p] ? (picDataMap[p][i] || {inc:0,exp:0}) : {inc:0,exp:0};
            if (d.inc > 0 || d.exp > 0) return true;
        }
        return false;
    });

    if (!adaData) {
        ctx.fillStyle = '#94a3b8'; ctx.font = '13px Segoe UI,sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Belum ada data', W/2, H/2); return;
    }

    // Buat series: Income dan Expense terpisah per PIC, ditumpuk semua
    const series = [];
    daftarPIC.forEach((p, pi) => {
        series.push({
            label: p + ' Inc',
            color: warnaIncome[pi % warnaIncome.length],
            data:  Array.from({length: 12}, (_, i) => {
                const d = picDataMap[p] ? (picDataMap[p][i] || {inc:0,exp:0}) : {inc:0,exp:0};
                return d.inc;
            })
        });
        series.push({
            label: p + ' Exp',
            color: warnaExpense[pi % warnaExpense.length],
            data:  Array.from({length: 12}, (_, i) => {
                const d = picDataMap[p] ? (picDataMap[p][i] || {inc:0,exp:0}) : {inc:0,exp:0};
                return d.exp;
            })
        });
    });

    drawStackedArea(ctx, W, H, namaBulan, series, { padTop: 30, padBot: 55, padLeft: 72, padRight: 16 });
}

// Event listener filter tahun di rekap
document.addEventListener('DOMContentLoaded', function() {
    const filterRekap = document.getElementById('filter-tahun-rekap');
    if (filterRekap) filterRekap.addEventListener('change', hitungRekap);
});

// Jalankan pemuatan data pertama kali saat web dibuka
tampilkanDataKeTabel();