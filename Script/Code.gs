function doGet() {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('Bike Buyers Analytics & Data Management')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Fungsi untuk mendapatkan referensi sheet aktif
function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheets()[0]; // Mengambil sheet pertama
}

// 1. FUNGSI UNTUK DASHBOARD & STATISTIK
function getDashboardData() {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows = data.slice(1);
  
  var totalData = rows.length;
  var purchasedYes = 0;
  var purchasedNo = 0;
  var totalIncome = 0;
  
  var genderDist = {};
  var regionDist = {};
  var educationDist = {};

  // Indeks kolom berdasarkan nama header
  var idxPurchased = headers.indexOf('Purchased Bike');
  var idxIncome = headers.indexOf('Income');
  var idxGender = headers.indexOf('Gender');
  var idxRegion = headers.indexOf('Region');
  var idxEducation = headers.indexOf('Education');

  rows.forEach(function(row) {
    // Hitung Pembelian Sepeda
    if (row[idxPurchased] === 'Yes') purchasedYes++;
    if (row[idxPurchased] === 'No') purchasedNo++;
    
    // Hitung Total Income (bersihkan karakter non-numerik seperti $, koma)
    if (row[idxIncome]) {
      var incStr = row[idxIncome].toString().replace(/[^0-9.-]+/g, "");
      var incVal = parseFloat(incStr);
      if (!isNaN(incVal)) totalIncome += incVal;
    }
    
    // Distribusi Gender
    var gen = row[idxGender] || 'Unknown';
    genderDist[gen] = (genderDist[gen] || 0) + 1;
    
    // Distribusi Region
    var reg = row[idxRegion] || 'Unknown';
    regionDist[reg] = (regionDist[reg] || 0) + 1;

    // Distribusi Education
    var edu = row[idxEducation] || 'Unknown';
    educationDist[edu] = (educationDist[edu] || 0) + 1;
  });

  var avgIncome = totalData > 0 ? (totalIncome / totalData) : 0;

  return {
    totalData: totalData,
    purchasedYes: purchasedYes,
    purchasedNo: purchasedNo,
    avgIncome: avgIncome,
    genderDist: genderDist,
    regionDist: regionDist,
    educationDist: educationDist
  };
}

// 2. FUNGSI CRUD: AMBIL SEMUA DATA
function getAllData() {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  return {
    headers: data[0],
    rows: data.slice(1)
  };
}

// 3. FUNGSI CRUD: TAMBAH DATA BARU
function addRecord(formData) {
  var sheet = getSheet();
  var headers = sheet.getDataRange().getValues()[0];
  var newRow = [];
  
  headers.forEach(function(header) {
    if (header === 'ID') {
      newRow.push(Math.floor(10000 + Math.random() * 90000)); // Generate ID otomatis jika kosong
    } else {
      newRow.push(formData[header] || "");
    }
  });
  
  sheet.appendRow(newRow);
  return { success: true, message: "Data berhasil ditambahkan!" };
}

// 4. FUNGSI CRUD: HAPUS DATA BERDASARKAN ID
function deleteRecord(id) {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  var idxId = data[0].indexOf('ID');
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][idxId].toString() == id.toString()) {
      sheet.deleteRow(i + 1);
      return { success: true, message: "Data dengan ID " + id + " berhasil dihapus!" };
    }
  }
  return { success: false, message: "Data tidak ditemukan." };
}