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

const TIMELINE_MONTHS = [
  { label: "September", yearOffset: -1, month: 8 },
  { label: "Oktober", yearOffset: -1, month: 9 },
  { label: "November", yearOffset: -1, month: 10 },
  { label: "Desember", yearOffset: -1, month: 11 },
  { label: "Januari", yearOffset: 0, month: 0 },
  { label: "Februari", yearOffset: 0, month: 1 },
  { label: "Maret", yearOffset: 0, month: 2 },
  { label: "April", yearOffset: 0, month: 3 },
  { label: "Mei", yearOffset: 0, month: 4 },
  { label: "Juni", yearOffset: 0, month: 5 },
  { label: "Juli", yearOffset: 0, month: 6 },
  { label: "Agustus", yearOffset: 0, month: 7 },
  { label: "September", yearOffset: 0, month: 8 },
  { label: "Oktober", yearOffset: 0, month: 9 },
  { label: "November", yearOffset: 0, month: 10 },
  { label: "Desember", yearOffset: 0, month: 11 }
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
  outStatusJadwal: document.getElementById("outStatusJadwal"),
  outSaranSistem: document.getElementById("outSaranSistem"),

  statusBox: document.getElementById("statusBox"),

  timelineSuperHeader: document.getElementById("timelineSuperHeader"),
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

function getTimelineMonthRange(tahunAnggaran, timelineItem) {
  const year = tahunAnggaran + timelineItem.yearOffset;
  const start = new Date(year, timelineItem.month, 1);
  const end = new Date(year, timelineItem.month + 1, 0);
  return { start, end };
}

function isOverlap(rangeStart, rangeEnd, monthStart, monthEnd) {
  return rangeStart <= monthEnd && rangeEnd >= monthStart;
}

function buildHeader(tahunAnggaran) {
  el.timelineSuperHeader.innerHTML = "";
  el.timelineHeader.innerHTML = "";

  const superSpacer = document.createElement("div");
  superSpacer.className = "timeline-super-spacer";
  el.timelineSuperHeader.appendChild(superSpacer);

  const prevHeader = document.createElement("div");
  prevHeader.className = "timeline-super-cell timeline-super-prev";
  prevHeader.textContent = "TAHUN ANGGARAN SEBELUMNYA";
  el.timelineSuperHeader.appendChild(prevHeader);

  const currentHeader = document.createElement("div");
  currentHeader.className = "timeline-super-cell timeline-super-current";
  currentHeader.textContent = "TAHUN ANGGARAN BERKENAAN";
  el.timelineSuperHeader.appendChild(currentHeader);

  const spacer = document.createElement("div");
  spacer.className = "timeline-spacer";
  el.timelineHeader.appendChild(spacer);

  TIMELINE_MONTHS.forEach((item) => {
    const div = document.createElement("div");
    div.className = "timeline-month";
    div.textContent = item.label;
    el.timelineHeader.appendChild(div);
  });
}

function buildEmptyTrack(container) {
  container.innerHTML = "";

  for (let i = 0; i < TIMELINE_MONTHS.length; i++) {
    const cell = document.createElement("div");
    cell.className = "timeline-cell";
    cell.textContent = "";
    container.appendChild(cell);
  }
}

function fillTrackByRange(container, tahunAnggaran, startDate, endDate, fillClass, label) {
  buildEmptyTrack(container);

  for (let i = 0; i < TIMELINE_MONTHS.length; i++) {
    const timelineItem = TIMELINE_MONTHS[i];
    const monthRange = getTimelineMonthRange(tahunAnggaran, timelineItem);
    const cell = container.children[i];

    if (isOverlap(startDate, endDate, monthRange.start, monthRange.end)) {
      cell.classList.add(fillClass);
      cell.textContent = label || "";
    }
  }
}

function buildTimeline(tahunAnggaran, ranges) {
  buildHeader(tahunAnggaran);

  fillTrackByRange(
    el.rowPersiapan,
    tahunAnggaran,
    ranges.persiapan.start,
    ranges.persiapan.end,
    "fill-persiapan",
    "Persiapan"
  );

  fillTrackByRange(
    el.rowPemilihan,
    tahunAnggaran,
    ranges.pemilihan.start,
    ranges.pemilihan.end,
    "fill-pemilihan",
    "Pilih"
  );

  fillTrackByRange(
    el.rowPelaksanaan,
    tahunAnggaran,
    ranges.pelaksanaan.start,
    ranges.pelaksanaan.end,
    "fill-pelaksanaan",
    "Kerja"
  );

  fillTrackByRange(
    el.rowAkhir,
    tahunAnggaran,
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
  const awalPraTahun = new Date(tahun - 1, 8, 1);
  const totalDurasiHari = diffDays(mulaiPersiapan, selesaiPelaksanaan) + 1;

  let statusType = "valid";
  let statusJadwal = "";
  let kesimpulan = "";
  let saran = "";
  let catatan = "";

  if (jenisKontrak === "single") {
    if (selesaiPelaksanaan > akhirTahunAnggaran) {
      statusType = "invalid";
      statusJadwal = "Belum cocok";
      kesimpulan = "Jadwal belum cocok untuk kontrak tahunan";
      saran = "Pertimbangkan memajukan jadwal atau menggunakan kontrak jamak.";
      catatan = `
        Jadwal ini melewati batas tahun anggaran <strong>${tahun}</strong>.
        Untuk kontrak tahunan, pekerjaan seharusnya selesai paling lambat 31 Desember ${tahun}.
      `;
    } else if (mulaiPersiapan < awalPraTahun) {
      statusType = "warning";
      statusJadwal = "Terlalu awal";
      kesimpulan = "Paket sebaiknya disiapkan jauh sebelum periode simulasi";
      saran = "Durasi paket cukup panjang. Disarankan penyusunan dokumen dimulai lebih awal lagi.";
      catatan = `
        Jadwal persiapan ideal dimulai sebelum <strong>September ${tahun - 1}</strong>.
        Ini menunjukkan paket berdurasi panjang dan perlu perhatian khusus sejak awal.
      `;
    } else {
      const sisaHari = diffDays(selesaiPelaksanaan, akhirTahunAnggaran);

      if (mulaiPersiapan.getFullYear() < tahun) {
        statusType = "warning";
        statusJadwal = "Mulai lebih awal";
        kesimpulan = "Sebaiknya disiapkan sejak akhir tahun sebelumnya";
        saran = "Agar aman, proses persiapan dan pemilihan jangan menunggu tahun anggaran berjalan.";
        catatan = `
          Paket ini masih bisa selesai dalam tahun anggaran <strong>${tahun}</strong>,
          namun jadwal ideal menunjukkan bahwa persiapan sebaiknya sudah dimulai sejak
          akhir tahun sebelumnya.
        `;
      } else if (sisaHari <= 30) {
        statusType = "warning";
        statusJadwal = "Mepet";
        kesimpulan = "Jadwal cukup mepet akhir tahun";
        saran = "Disarankan memajukan persiapan atau pemilihan agar pelaksanaan tidak menumpuk di akhir tahun.";
        catatan = `
          Jadwal masih berada dalam tahun anggaran <strong>${tahun}</strong>,
          tetapi waktu penyelesaian cukup mepet dengan akhir tahun.
        `;
      } else {
        statusType = "valid";
        statusJadwal = "Aman";
        kesimpulan = "Jadwal masih aman";
        saran = "Paket dapat diproses pada tahun anggaran berjalan sesuai simulasi ini.";
        catatan = `
          Jadwal masih aman dalam tahun anggaran <strong>${tahun}</strong>.
          Pelaksanaan diperkirakan selesai sebelum 31 Desember ${tahun}.
        `;
      }
    }
  } else {
    if (mulaiPersiapan < awalPraTahun) {
      statusType = "warning";
      statusJadwal = "Panjang";
      kesimpulan = "Paket berdurasi panjang";
      saran = "Karena paket cukup panjang, penyusunan dokumen dan kesiapan internal sebaiknya dimulai lebih awal.";
      catatan = `
        Untuk kontrak jamak, jadwal ini masih memungkinkan,
        namun persiapan ideal dimulai sebelum periode simulasi yang ditampilkan.
      `;
    } else if (mulaiPersiapan.getFullYear() < tahun) {
      statusType = "valid";
      statusJadwal = "Aman";
      kesimpulan = "Cocok untuk kontrak jamak";
      saran = "Paket dapat disiapkan sejak akhir tahun sebelumnya agar pelaksanaan lebih rapi.";
      catatan = `
        Jadwal dapat dilaksanakan sebagai <strong>kontrak jamak</strong>,
        dan persiapan sejak akhir tahun sebelumnya justru membantu pelaksanaan lebih tertib.
      `;
    } else {
      statusType = "valid";
      statusJadwal = "Aman";
      kesimpulan = "Cocok untuk kontrak jamak";
      saran = "Paket dapat dilanjutkan sesuai simulasi, dengan tetap memperhatikan kesiapan dokumen dan anggaran.";
      catatan = `
        Jadwal dapat dilaksanakan sebagai <strong>kontrak jamak</strong>,
        dengan catatan tetap menyesuaikan ketentuan penganggaran dan kontrak yang berlaku.
      `;
    }
  }

  el.badgeMetode.textContent = metode;

  el.outMulaiPersiapan.textContent = formatDateID(mulaiPersiapan);
  el.outMulaiPemilihan.textContent = formatDateID(mulaiPemilihan);
  el.outSelesaiPemilihan.textContent = formatDateID(selesaiPemilihan);
  el.outMulaiKontrak.textContent = formatDateID(mulaiKontrak);
  el.outSelesaiPelaksanaan.textContent = formatDateID(selesaiPelaksanaan);
  el.outDurasiTotal.textContent = `${totalDurasiHari.toLocaleString("id-ID")} Hari`;
  el.outStatusJadwal.textContent = statusJadwal;
  el.outSaranSistem.textContent = saran;

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
    ? "Kontrak Tahunan (Single Year)"
    : "Kontrak Jamak (Multi Year)";
  el.detailDurasiPemilihan.textContent = `${durasiPemilihanHari} Hari`;
  el.detailWaktuPersiapanAwal.textContent = `${waktuPersiapanAwalHari} Hari`;
  el.detailDurasiPekerjaan.textContent = `${durasiPekerjaanBulan} Bulan`;
  el.detailMulaiPelaksanaan.textContent = formatDateID(mulaiPelaksanaan);
  el.detailKesimpulan.innerHTML = `<strong>${kesimpulan}</strong>`;
  el.catatanTambahan.innerHTML = catatan;

  const bufferStart = selesaiPelaksanaan <= akhirTahunAnggaran
    ? addDays(selesaiPelaksanaan, 1)
    : new Date(tahun, 11, 31);

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
      start: bufferStart,
      end: akhirTahunAnggaran
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
