const METHOD_DEFAULTS = {
  "Tender": {
    duration: 30,
    prep: 14
  },
  "Seleksi": {
    duration: 30,
    prep: 14
  },
  "Pengadaan Langsung / ePL": {
    duration: 7,
    prep: 7
  },
  "Penunjukan Langsung": {
    duration: 7,
    prep: 7
  },
  "e-Purchasing": {
    duration: 3,
    prep: 3
  }
};

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

const el = {
  sidebar: document.getElementById("sidebar"),
  sidebarToggle: document.getElementById("sidebarToggle"),

  tahunAnggaran: document.getElementById("tahunAnggaran"),
  jenisKontrak: document.getElementById("jenisKontrak"),
  jenisPengadaan: document.getElementById("jenisPengadaan"),
  metodePemilihan: document.getElementById("metodePemilihan"),
  durasiPemilihan: document.getElementById("durasiPemilihan"),
  waktuPersiapanAwal: document.getElementById("waktuPersiapanAwal"),
  durasiPekerjaan: document.getElementById("durasiPekerjaan"),
  mulaiPelaksanaan: document.getElementById("mulaiPelaksanaan"),

  btnSimulasikan: document.getElementById("btnSimulasikan"),
  btnReset: document.getElementById("btnReset"),
  btnExportPdf: document.getElementById("btnExportPdf"),
  btnExportPdfTop: document.getElementById("btnExportPdfTop"),

  badgeMetode: document.getElementById("badgeMetode"),

  outMulaiPersiapan: document.getElementById("outMulaiPersiapan"),
  outMulaiPemilihan: document.getElementById("outMulaiPemilihan"),
  outSelesaiPemilihan: document.getElementById("outSelesaiPemilihan"),
  outMulaiKontrak: document.getElementById("outMulaiKontrak"),
  outSelesaiPelaksanaan: document.getElementById("outSelesaiPelaksanaan"),
  outDurasiTotal: document.getElementById("outDurasiTotal"),

  statusBox: document.getElementById("statusBox"),

  timelineHeader: document.getElementById("timelineHeader"),
  rowPersiapan: document.getElementById("rowPersiapan"),
  rowPemilihan: document.getElementById("rowPemilihan"),
  rowPelaksanaan: document.getElementById("rowPelaksanaan"),
  rowAkhir: document.getElementById("rowAkhir"),

  detailTahun: document.getElementById("detailTahun"),
  detailJenisPengadaan: document.getElementById("detailJenisPengadaan"),
  detailMetode: document.getElementById("detailMetode"),
  detailJenisKontrak: document.getElementById("detailJenisKontrak"),
  detailDurasiPemilihan: document.getElementById("detailDurasiPemilihan"),
  detailWaktuPersiapanAwal: document.getElementById("detailWaktuPersiapanAwal"),
  detailDurasiPekerjaan: document.getElementById("detailDurasiPekerjaan"),
  detailMulaiPelaksanaan: document.getElementById("detailMulaiPelaksanaan"),
  detailKesimpulan: document.getElementById("detailKesimpulan"),
  catatanTambahan: document.getElementById("catatanTambahan")
};

function parseLocalDate(dateString) {
  if (!dateString) return null;

  const parts = dateString.split("-");
  if (parts.length !== 3) return null;

  return new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2])
  );
}

function formatDateID(date) {
  if (!(date instanceof Date) || isNaN(date)) return "-";

  const day = date.getDate();
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date, months) {
  const d = new Date(date);
  const originalDate = d.getDate();

  d.setMonth(d.getMonth() + months);

  if (d.getDate() < originalDate) {
    d.setDate(0);
  }

  return d;
}

function diffDays(start, end) {
  const ms = end.getTime() - start.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function getMonthRange(year, monthIndex) {
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 0);

  return { start, end };
}

function isOverlap(rangeStart, rangeEnd, monthStart, monthEnd) {
  return rangeStart <= monthEnd && rangeEnd >= monthStart;
}

function buildHeader(year) {
  el.timelineHeader.innerHTML = "";

  const spacer = document.createElement("div");
  spacer.className = "timeline-spacer";
  el.timelineHeader.appendChild(spacer);

  MONTH_NAMES.forEach((month) => {
    const div = document.createElement("div");
    div.className = "timeline-month";
    div.textContent = `${month} ${year}`;
    el.timelineHeader.appendChild(div);
  });
}

function buildEmptyTrack(container) {
  container.innerHTML = "";

  for (let i = 0; i < 12; i++) {
    const cell = document.createElement("div");
    cell.className = "timeline-cell";
    cell.textContent = "";
    container.appendChild(cell);
  }
}

function fillTrackByRange(container, year, startDate, endDate, fillClass, label) {
  buildEmptyTrack(container);

  for (let i = 0; i < 12; i++) {
    const monthRange = getMonthRange(year, i);
    const cell = container.children[i];

    if (isOverlap(startDate, endDate, monthRange.start, monthRange.end)) {
      cell.classList.add(fillClass);
      cell.textContent = label || "";
    }
  }
}

function buildTimeline(year, ranges) {
  buildHeader(year);

  fillTrackByRange(
    el.rowPersiapan,
    year,
    ranges.persiapan.start,
    ranges.persiapan.end,
    "fill-persiapan",
    "Persiapan"
  );

  fillTrackByRange(
    el.rowPemilihan,
    year,
    ranges.pemilihan.start,
    ranges.pemilihan.end,
    "fill-pemilihan",
    "Pilih"
  );

  fillTrackByRange(
    el.rowPelaksanaan,
    year,
    ranges.pelaksanaan.start,
    ranges.pelaksanaan.end,
    "fill-pelaksanaan",
    "Kerja"
  );

  fillTrackByRange(
    el.rowAkhir,
    year,
    ranges.akhir.start,
    ranges.akhir.end,
    "fill-akhir",
    "Buffer"
  );
}

function setMethodDefaults() {
  const method = el.metodePemilihan.value;
  const defaults = METHOD_DEFAULTS[method];

  if (!defaults) return;

  el.durasiPemilihan.value = defaults.duration;
  el.waktuPersiapanAwal.value = defaults.prep;
}

function setStatus(type, html) {
  el.statusBox.className = "status-box";

  if (type === "valid") {
    el.statusBox.classList.add("status-valid");
  } else if (type === "invalid") {
    el.statusBox.classList.add("status-invalid");
  } else {
    el.statusBox.classList.add("status-warning");
  }

  el.statusBox.innerHTML = html;
}

function renderSimulation() {
  const tahun = Number(el.tahunAnggaran.value || 0);
  const jenisKontrak = el.jenisKontrak.value;
  const jenisPengadaan = el.jenisPengadaan.value;
  const metode = el.metodePemilihan.value;
  const durasiPemilihanHari = Number(el.durasiPemilihan.value || 0);
  const waktuPersiapanAwalHari = Number(el.waktuPersiapanAwal.value || 0);
  const durasiPekerjaanBulan = Number(el.durasiPekerjaan.value || 0);
  const mulaiPelaksanaan = parseLocalDate(el.mulaiPelaksanaan.value);

  if (
    !tahun ||
    !mulaiPelaksanaan ||
    durasiPemilihanHari < 1 ||
    durasiPekerjaanBulan < 1 ||
    waktuPersiapanAwalHari < 0
  ) {
    setStatus(
      "warning",
      "Input belum lengkap atau belum valid. Pastikan seluruh field sudah terisi dengan benar."
    );
    return;
  }

  const mulaiKontrak = new Date(mulaiPelaksanaan);
  const selesaiPelaksanaan = addDays(
    addMonths(mulaiPelaksanaan, durasiPekerjaanBulan),
    -1
  );
  const selesaiPemilihan = addDays(mulaiPelaksanaan, -1);
  const mulaiPemilihan = addDays(
    selesaiPemilihan,
    -(durasiPemilihanHari - 1)
  );
  const mulaiPersiapan = addDays(
    mulaiPemilihan,
    -waktuPersiapanAwalHari
  );

  const akhirTahunAnggaran = new Date(tahun, 11, 31);
  const totalDurasiHari = diffDays(mulaiPersiapan, selesaiPelaksanaan) + 1;

  const sisaAkhirTahunStart = selesaiPelaksanaan <= akhirTahunAnggaran
    ? addDays(selesaiPelaksanaan, 1)
    : new Date(tahun, 11, 31);

  const sisaAkhirTahunEnd = akhirTahunAnggaran;

  let statusType = "valid";
  let kesimpulan = "";
  let catatan = "";

  if (jenisKontrak === "single") {
    if (selesaiPelaksanaan > akhirTahunAnggaran) {
      statusType = "invalid";
      kesimpulan = "Tidak valid untuk Single Year";
      catatan = `
        Jadwal ini melewati batas tahun anggaran <strong>${tahun}</strong>.
        Jika tetap ingin dilaksanakan dengan durasi tersebut, maka perlu
        mempertimbangkan skema <strong>multi year</strong> atau memajukan
        target mulai pelaksanaan.
      `;
    } else {
      const sisaHari = diffDays(selesaiPelaksanaan, akhirTahunAnggaran);

      if (sisaHari <= 30) {
        statusType = "warning";
        kesimpulan = "Valid, namun mepet akhir tahun";
        catatan = `
          Jadwal masih berada dalam tahun anggaran <strong>${tahun}</strong>,
          tetapi waktu penyelesaian cukup mepet dengan akhir tahun.
          Disarankan melakukan percepatan pada tahap persiapan atau pemilihan
          agar lebih aman.
        `;
      } else {
        statusType = "valid";
        kesimpulan = "Valid untuk Single Year";
        catatan = `
          Jadwal masih aman dalam tahun anggaran <strong>${tahun}</strong>.
          Pelaksanaan diperkirakan selesai sebelum 31 Desember ${tahun}.
        `;
      }
    }
  } else {
    statusType = "valid";
    kesimpulan = "Valid untuk Multi Year";
    catatan = `
      Jadwal dapat dilaksanakan sebagai <strong>multi year</strong>,
      dengan catatan tetap menyesuaikan ketentuan penganggaran,
      kontrak, dan persetujuan yang berlaku.
    `;
  }

  el.badgeMetode.textContent = metode;

  el.outMulaiPersiapan.textContent = formatDateID(mulaiPersiapan);
  el.outMulaiPemilihan.textContent = formatDateID(mulaiPemilihan);
  el.outSelesaiPemilihan.textContent = formatDateID(selesaiPemilihan);
  el.outMulaiKontrak.textContent = formatDateID(mulaiKontrak);
  el.outSelesaiPelaksanaan.textContent = formatDateID(selesaiPelaksanaan);
  el.outDurasiTotal.textContent = `${totalDurasiHari.toLocaleString("id-ID")} Hari`;

  if (statusType === "valid") {
    setStatus("valid", `<strong>${kesimpulan}</strong><br>${catatan}`);
  } else if (statusType === "invalid") {
    setStatus("invalid", `<strong>${kesimpulan}</strong><br>${catatan}`);
  } else {
    setStatus("warning", `<strong>${kesimpulan}</strong><br>${catatan}`);
  }

  el.detailTahun.textContent = tahun;
  el.detailJenisPengadaan.textContent = jenisPengadaan;
  el.detailMetode.textContent = metode;
  el.detailJenisKontrak.textContent = jenisKontrak === "single"
    ? "Single Year"
    : "Multi Year";
  el.detailDurasiPemilihan.textContent = `${durasiPemilihanHari} Hari`;
  el.detailWaktuPersiapanAwal.textContent = `${waktuPersiapanAwalHari} Hari`;
  el.detailDurasiPekerjaan.textContent = `${durasiPekerjaanBulan} Bulan`;
  el.detailMulaiPelaksanaan.textContent = formatDateID(mulaiPelaksanaan);
  el.detailKesimpulan.innerHTML = `<strong>${kesimpulan}</strong>`;
  el.catatanTambahan.innerHTML = catatan;

  const ranges = {
    persiapan: {
      start: mulaiPersiapan,
      end: addDays(mulaiPemilihan, -1)
    },
    pemilihan: {
      start: mulaiPemilihan,
      end: selesaiPemilihan
    },
    pelaksanaan: {
      start: mulaiPelaksanaan,
      end: selesaiPelaksanaan
    },
    akhir: {
      start: sisaAkhirTahunStart,
      end: sisaAkhirTahunEnd
    }
  };

  buildTimeline(tahun, ranges);
}

function resetForm() {
  el.tahunAnggaran.value = "2026";
  el.jenisKontrak.value = "single";
  el.jenisPengadaan.value = "Barang";
  el.metodePemilihan.value = "Pengadaan Langsung / ePL";
  el.durasiPemilihan.value = "7";
  el.waktuPersiapanAwal.value = "7";
  el.durasiPekerjaan.value = "12";
  el.mulaiPelaksanaan.value = "2026-04-01";

  renderSimulation();
}

function exportPdf() {
  window.print();
}

function toggleSidebar() {
  el.sidebar.classList.toggle("collapsed");
}

el.metodePemilihan.addEventListener("change", setMethodDefaults);
el.btnSimulasikan.addEventListener("click", renderSimulation);
el.btnReset.addEventListener("click", resetForm);
el.btnExportPdf.addEventListener("click", exportPdf);
el.btnExportPdfTop.addEventListener("click", exportPdf);
el.sidebarToggle.addEventListener("click", toggleSidebar);

function init() {
  el.metodePemilihan.value = "Pengadaan Langsung / ePL";
  setMethodDefaults();
  renderSimulation();
}

init();
