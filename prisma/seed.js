const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai seeding database Digital Warehouse Inventory System...");

  // 1. Bersihkan data lama jika ada
  await prisma.auditLog.deleteMany({});
  await prisma.stockMovement.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.binCard.deleteMany({});
  await prisma.material.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Buat Users (Admin & Petugas)
  const passwordHashAdmin = await bcrypt.hash("admin123", 10);
  const passwordHashPetugas = await bcrypt.hash("petugas123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin Gudang",
      username: "admin",
      passwordHash: passwordHashAdmin,
      role: "ADMIN",
      isActive: true,
    },
  });

  const petugas = await prisma.user.create({
    data: {
      name: "Petugas Gudang",
      username: "petugas",
      passwordHash: passwordHashPetugas,
      role: "PETUGAS",
      isActive: true,
    },
  });

  console.log("✓ User Admin dan Petugas berhasil dibuat");

  // 3. Buat Master Data Material & Bin Card
  // Data array materialsData dari file Excel "materialsdata.xlsx" (52 items)
  // dengan nilai default qrToken: QR-<materialCode>
  let materialsData = [
    {
        "materialCode": "202040992",
        "description": "106990-32701 PUMP ASSY OIL",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 1,
        "minimumStock": 0.3125,
        "maximumStock": 0.5625,
        "storageLocation": "Q2-0101A",
        "remarks": "ROP 0,31",
        "qrToken": "QR-202040992"
    },
    {
        "materialCode": "202041139",
        "description": "PISTON 105950-22092",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 1,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0101B",
        "remarks": "ROP 0,00",
        "qrToken": "QR-202041139"
    },
    {
        "materialCode": "212043651",
        "description": "T- 90117-T0006 U BOLT SPRING RR",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 2,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0102",
        "remarks": "ROP 0,00",
        "qrToken": "QR-212043651"
    },
    {
        "materialCode": "202041554",
        "description": "105950-01900 LINER YANMAR TF300",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 2,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0103",
        "remarks": "ROP 0,00",
        "qrToken": "QR-202041554"
    },
    {
        "materialCode": "202041742",
        "description": "Y2- 705950-01900 LINER ASSY CYLINDER",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 1,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0103",
        "remarks": "ROP 0,00",
        "qrToken": "QR-202041742"
    },
    {
        "materialCode": "2120417084",
        "description": "T- 28100-0L180 STARTING MOTOR",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 2,
        "minimumStock": 0.2777777777777778,
        "maximumStock": 0.4722222222222222,
        "storageLocation": "Q2-0104",
        "remarks": "ROP 0,28",
        "qrToken": "QR-2120417084"
    },
    {
        "materialCode": "2120403476",
        "description": "HOLDER CAB MOUNT 1 52218-0K010",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 6,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0201",
        "remarks": "ROP 0,00",
        "qrToken": "QR-2120403476"
    },
    {
        "materialCode": "212080115",
        "description": "04465-0K340 KANVAS REM DEPAN",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 14,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0202",
        "remarks": "ROP 0,00",
        "qrToken": "QR-212080115"
    },
    {
        "materialCode": "212040554",
        "description": "BUSH FOR RR SPRING (LOWER) 90385-T0010",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 10,
        "minimumStock": 0.8333333333333334,
        "maximumStock": 1.4166666666666667,
        "storageLocation": "Q2-0203",
        "remarks": "ROP 0,83",
        "qrToken": "QR-212040554"
    },
    {
        "materialCode": "202041209",
        "description": "CAP, FILLER 105840-01750",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 4,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0203",
        "remarks": "ROP 0,00",
        "qrToken": "QR-202041209"
    },
    {
        "materialCode": "202041763",
        "description": "Y2 -106990-02310 ROLLER BEARING",
        "category": "Filter alat berat, genset",
        "uom": "UN",
        "currentStock": 3,
        "minimumStock": 0.1388888888888889,
        "maximumStock": 0.2361111111111111,
        "storageLocation": "Q2-0204B",
        "remarks": "ROP 0,14",
        "qrToken": "QR-202041763"
    },
    {
        "materialCode": "2120403285",
        "description": "BOOT STEER RACK NO2 45536-0K010",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 1,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0205",
        "remarks": "ROP 0,00",
        "qrToken": "QR-2120403285"
    },
    {
        "materialCode": "212042279",
        "description": "BUSH FRONT STABILIZER 48815-0K010",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 4,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0205",
        "remarks": "ROP 0,00",
        "qrToken": "QR-212042279"
    },
    {
        "materialCode": "212043773",
        "description": "T- 04466-0K010 PAD KIT DISC BRAKE RR",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 4,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0206",
        "remarks": "ROP 0,00",
        "qrToken": "QR-212043773"
    },
    {
        "materialCode": "2120403479",
        "description": "CAB MOUNTING, REAR 52207-0K010",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 4,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0301A",
        "remarks": "ROP 0,00",
        "qrToken": "QR-2120403479"
    },
    {
        "materialCode": "2120403015",
        "description": "GLOW PLUG 19850-92030",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 10,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0301B",
        "remarks": "ROP 0,00",
        "qrToken": "QR-2120403015"
    },
    {
        "materialCode": "212040963",
        "description": "END S/A TIE ROD LH/RH PN. 45046-09281",
        "category": "Filter alat berat, genset",
        "uom": "SET",
        "currentStock": 1,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0302A",
        "remarks": "ROP 0,00",
        "qrToken": "QR-212040963"
    },
    {
        "materialCode": "2120417135",
        "description": "T- 45503-0K070 RACK END STEERING",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 2,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0302B",
        "remarks": "ROP 0,00",
        "qrToken": "QR-2120417135"
    },
    {
        "materialCode": "212040532",
        "description": "CYLINDER KIT BRAKE MASTER 04493-0K010",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 10,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0303A",
        "remarks": "ROP 0,00",
        "qrToken": "QR-212040532"
    },
    {
        "materialCode": "2120217336",
        "description": "END SUB ASSY 45503-09321",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 2,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0303B",
        "remarks": "ROP 0,00",
        "qrToken": "QR-2120217336"
    },
    {
        "materialCode": "2120403314",
        "description": "PULLEY ALTERNATOR 27415-0L030",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 6,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0304A",
        "remarks": "ROP 0,00",
        "qrToken": "QR-2120403314"
    },
    {
        "materialCode": "2120217342",
        "description": "JOINT ASSY LH 43330-09510",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 6,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0304B",
        "remarks": "ROP 0,00",
        "qrToken": "QR-2120217342"
    },
    {
        "materialCode": "212042533",
        "description": "65768-0K010 STIKER TAIL GATE LOCK",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 2,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0305A",
        "remarks": "ROP 0,00",
        "qrToken": "QR-212042533"
    },
    {
        "materialCode": "2120417132",
        "description": "T- 48252-0K010 SILENCER SPRING",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 44,
        "minimumStock": 1.6666666666666667,
        "maximumStock": 2.8333333333333335,
        "storageLocation": "Q2-0305B",
        "remarks": "ROP 1,67",
        "qrToken": "QR-2120417132"
    },
    {
        "materialCode": "212022459",
        "description": "90033-JGA31 BEARING WHEEL RR OUTER",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 8,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0401A",
        "remarks": "ROP 0,00",
        "qrToken": "QR-212022459"
    },
    {
        "materialCode": "211102044",
        "description": "BEARING ( BEARING CRANKSHAFT STD ) 81558",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 5,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0401B",
        "remarks": "ROP 0,00",
        "qrToken": "QR-211102044"
    },
    {
        "materialCode": "202090452",
        "description": "NUT S11928089",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 4,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0401C",
        "remarks": "ROP 0,00",
        "qrToken": "QR-202090452"
    },
    {
        "materialCode": "2120403297",
        "description": "BEARING NEEDLE 90364-T0009",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 1,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0402A",
        "remarks": "ROP 0,00",
        "qrToken": "QR-2120403297"
    },
    {
        "materialCode": "2120217338",
        "description": "GLOW PLUG 19850-0L010",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 10,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0402B",
        "remarks": "ROP 0,00",
        "qrToken": "QR-2120217338"
    },
    {
        "materialCode": "212042326",
        "description": "BEARING SET, CONNECTING ROD 13205-30020",
        "category": "Filter alat berat, genset",
        "uom": "SET",
        "currentStock": 1,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0402C",
        "remarks": "ROP 0,00",
        "qrToken": "QR-212042326"
    },
    {
        "materialCode": "2120403300",
        "description": "SEAL OIL 23681-0L010",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 2,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0403A",
        "remarks": "ROP 0,00",
        "qrToken": "QR-2120403300"
    },
    {
        "materialCode": "212041804",
        "description": "BEARING CONNECTING ROD 13041-30020-02",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 4,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0403B",
        "remarks": "ROP 0,00",
        "qrToken": "QR-212041804"
    },
    {
        "materialCode": "2120403356",
        "description": "WASHER SET CRANKSHAFT 11011-0L020",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 4,
        "minimumStock": 0.2777777777777778,
        "maximumStock": 0.4722222222222222,
        "storageLocation": "Q2-0403C",
        "remarks": "ROP 0,28",
        "qrToken": "QR-2120403356"
    },
    {
        "materialCode": "212040257",
        "description": "SEAL REAR 90311-52059 DAIHATSU",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 11,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0404A",
        "remarks": "ROP 0,00",
        "qrToken": "QR-212040257"
    },
    {
        "materialCode": "212041009",
        "description": "RETAINER RR AXLE BEARING PN. 42423-0K020",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 4,
        "minimumStock": 0.1388888888888889,
        "maximumStock": 0.2361111111111111,
        "storageLocation": "Q2-0404B",
        "remarks": "ROP 0,14",
        "qrToken": "QR-212041009"
    },
    {
        "materialCode": "2120217472",
        "description": "BEARING CONNECTING ROD PN. 13041-78160",
        "category": "Filter alat berat, genset",
        "uom": "SET",
        "currentStock": 10,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0404C",
        "remarks": "ROP 0,00",
        "qrToken": "QR-2120217472"
    },
    {
        "materialCode": "212021224",
        "description": "13041-78060 BEARING SET TOYOTA",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 4,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0405A",
        "remarks": "ROP 0,00",
        "qrToken": "QR-212021224"
    },
    {
        "materialCode": "212042682",
        "description": "52217-0K020 BOLT TOYOTA HILUX",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 6,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0405B",
        "remarks": "ROP 0,00",
        "qrToken": "QR-212042682"
    },
    {
        "materialCode": "212042327",
        "description": "BEARING SET, CRANKSHAFT 11705-30020",
        "category": "Filter alat berat, genset",
        "uom": "SET",
        "currentStock": 1,
        "minimumStock": 0.1388888888888889,
        "maximumStock": 0.2361111111111111,
        "storageLocation": "Q2-0405C",
        "remarks": "ROP 0,14",
        "qrToken": "QR-212042327"
    },
    {
        "materialCode": "2120403480",
        "description": "STOP CAB MOUNT CUSH 52216-0K020",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 6,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0406A",
        "remarks": "ROP 0,00",
        "qrToken": "QR-2120403480"
    },
    {
        "materialCode": "212040465",
        "description": "LINK FR SUSP STABILIZER 48820-0K030 RH",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 1,
        "minimumStock": 0.1388888888888889,
        "maximumStock": 0.2361111111111111,
        "storageLocation": "Q2-0406B",
        "remarks": "ROP 0,14",
        "qrToken": "QR-212040465"
    },
    {
        "materialCode": "212041234",
        "description": "SEAL OIL FRONT AXLE 90312-T0001",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 2,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0406C",
        "remarks": "ROP 0,00",
        "qrToken": "QR-212041234"
    },
    {
        "materialCode": "212040462",
        "description": "LINK FR SUSP STABILIZER 48810-0K010 LH",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 5,
        "minimumStock": 0.2777777777777778,
        "maximumStock": 0.4722222222222222,
        "storageLocation": "Q2-0407A",
        "remarks": "ROP 0,28",
        "qrToken": "QR-212040462"
    },
    {
        "materialCode": "212043604",
        "description": "T- 04371-0K120 SPIDER KIT REAR",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 2,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0407B",
        "remarks": "ROP 0,00",
        "qrToken": "QR-212043604"
    },
    {
        "materialCode": "212021212",
        "description": "13041-89101 BEARING CON ROD STD TOYOTA",
        "category": "Filter alat berat, genset",
        "uom": "SET",
        "currentStock": 1,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0407C",
        "remarks": "ROP 0,00",
        "qrToken": "QR-212021212"
    },
    {
        "materialCode": "212040701",
        "description": "SPACER PN. 42423-20010 FORTUNER",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 2,
        "minimumStock": 0.1388888888888889,
        "maximumStock": 0.2361111111111111,
        "storageLocation": "Q2-0408A",
        "remarks": "ROP 0,14",
        "qrToken": "QR-212040701"
    },
    {
        "materialCode": "2120417154",
        "description": "T- 84222-0K010 SWITCH INDICAT DIFF LOCK",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 1,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0408B",
        "remarks": "ROP 0,00",
        "qrToken": "QR-2120417154"
    },
    {
        "materialCode": "2120417142",
        "description": "T- 47743-0K300 CLIP PIN HOLD",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 6,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0408C",
        "remarks": "ROP 0,00",
        "qrToken": "QR-2120417142"
    },
    {
        "materialCode": "212041280",
        "description": "CABLE A/S PARKING BRAKE NO.1 46410-0K040",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 3,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0501",
        "remarks": "ROP 0,00",
        "qrToken": "QR-212041280"
    },
    {
        "materialCode": "2120403089",
        "description": "GASKET KIT OVERHAUL PN. 04111-0L190",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 1,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0503",
        "remarks": "ROP 0,00",
        "qrToken": "QR-2120403089"
    },
    {
        "materialCode": "211070541",
        "description": "FAN RADIATOR PN. 600-623-6580",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 2,
        "minimumStock": 0,
        "maximumStock": 0,
        "storageLocation": "Q2-0504",
        "remarks": "ROP 0,00",
        "qrToken": "QR-211070541"
    },
    {
        "materialCode": "202041211",
        "description": "PIPE, LUB OIL 105990-39200",
        "category": "Filter alat berat, genset",
        "uom": "PCS",
        "currentStock": 3,
        "minimumStock": 0.4166666666666667,
        "maximumStock": 0.7083333333333334,
        "storageLocation": "Q2-0505",
        "remarks": "ROP 0,42",
        "qrToken": "QR-202041211"
    }
];

  // Sinkronisasi dinamis jika materialsdata.xlsx tersedia
  const excelPath = path.join(__dirname, "..", "materialsdata.xlsx");
  if (fs.existsSync(excelPath)) {
    try {
      const workbook = XLSX.readFile(excelPath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(sheet);
      if (rawData.length > 0) {
        materialsData = rawData.map((row) => {
          const code = String(row["Material Code"] ?? "").trim();
          return {
            materialCode: code,
            description: String(row["Description"] ?? "").trim(),
            category: String(row["Category"] ?? "Sparepart").trim(),
            uom: String(row["uom"] ?? "PCS").trim().toUpperCase(),
            currentStock: Number(row["currentStock"] ?? 0),
            minimumStock: Number(row["minimumStock"] ?? 0),
            maximumStock:
              row["maximumStock"] !== undefined &&
              row["maximumStock"] !== null &&
              row["maximumStock"] !== ""
                ? Number(row["maximumStock"])
                : null,
            storageLocation: String(row["storageLocation"] ?? "-").trim(),
            remarks: row["remarks"] ? String(row["remarks"]).trim() : null,
            qrToken: `QR-${code}`,
          };
        });
        console.log(`✓ Terhubung dengan materialsdata.xlsx (${materialsData.length} records dibaca dinamis)`);
      }
    } catch (err) {
      console.warn("Membaca materialsdata.xlsx gagal, menggunakan array fallback:", err.message);
    }
  }

  const createdMaterials = [];
  const materialIdMap = new Map();

  for (const item of materialsData) {
    const { qrToken, ...matData } = item;
    const finalQrToken = qrToken || `QR-${item.materialCode}`;

    const material = await prisma.material.create({
      data: {
        ...matData,
        binCard: {
          create: {
            qrToken: finalQrToken,
            isActive: true,
          },
        },
      },
      include: {
        binCard: true,
      },
    });
    createdMaterials.push(material);
    materialIdMap.set(material.materialCode, material.id);
  }

  console.log(`✓ ${createdMaterials.length} Material dan Bin Card QR Code berhasil dibuat`);

  // 4. Buat Data Transaksi GR / GI dari file Excel "History Q2.xlsx"
  // StockMovement disesuaikan otomatis (movementType: IN/OUT, quantityIn, quantityOut, balance, createdAt)
  let transactionsData = [
    {
        "transactionNumber": "5000635486",
        "materialCode": "202040992",
        "transactionType": "GR",
        "quantity": 4,
        "previousBalance": 0,
        "newBalance": 4,
        "transactionDate": "2025-01-21T08:00:00.000Z",
        "referenceNumber": "I522125012115413",
        "remarks": null
    },
    {
        "transactionNumber": "4919535506",
        "materialCode": "202040992",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 4,
        "newBalance": 3,
        "transactionDate": "2025-12-03T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "52210070816"
    },
    {
        "transactionNumber": "4920943554",
        "materialCode": "202040992",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 3,
        "newBalance": 2,
        "transactionDate": "2026-07-20T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "52210078554"
    },
    {
        "transactionNumber": "4921228882",
        "materialCode": "202040992",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 2,
        "newBalance": 1,
        "transactionDate": "2026-09-03T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "52210080334"
    },
    {
        "transactionNumber": "5023201601",
        "materialCode": "202041139",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 0,
        "newBalance": 1,
        "transactionDate": "2018-05-08T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": null
    },
    {
        "transactionNumber": "4913431749",
        "materialCode": "202041139",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 1,
        "newBalance": 0,
        "transactionDate": "2023-03-24T08:00:00.000Z",
        "referenceNumber": "94518",
        "remarks": "52210034135"
    },
    {
        "transactionNumber": "5025309581",
        "materialCode": "202041139",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 0,
        "newBalance": 1,
        "transactionDate": "2025-06-03T08:00:00.000Z",
        "referenceNumber": "I522125060214025",
        "remarks": null
    },
    {
        "transactionNumber": "5025306946",
        "materialCode": "212043651",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 0,
        "newBalance": 1,
        "transactionDate": "2022-11-29T08:00:00.000Z",
        "referenceNumber": "I522122112907481",
        "remarks": null
    },
    {
        "transactionNumber": "5025306946-2",
        "materialCode": "212043651",
        "transactionType": "GR",
        "quantity": 2,
        "previousBalance": 1,
        "newBalance": 3,
        "transactionDate": "2022-11-29T08:00:00.000Z",
        "referenceNumber": "I522122112907481",
        "remarks": null
    },
    {
        "transactionNumber": "5025306951",
        "materialCode": "212043651",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 3,
        "newBalance": 4,
        "transactionDate": "2022-12-03T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": null
    },
    {
        "transactionNumber": "4913753955",
        "materialCode": "212043651",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 4,
        "newBalance": 3,
        "transactionDate": "2023-05-20T08:00:00.000Z",
        "referenceNumber": "125807",
        "remarks": "O5221DT034"
    },
    {
        "transactionNumber": "5025307693",
        "materialCode": "212043651",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 3,
        "newBalance": 4,
        "transactionDate": "2023-06-30T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": null
    },
    {
        "transactionNumber": "4914919875",
        "materialCode": "212043651",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 4,
        "newBalance": 3,
        "transactionDate": "2023-11-07T08:00:00.000Z",
        "referenceNumber": "283724",
        "remarks": "52210042597"
    },
    {
        "transactionNumber": "4916007723",
        "materialCode": "212043651",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 3,
        "newBalance": 2,
        "transactionDate": "2024-05-07T08:00:00.000Z",
        "referenceNumber": "490404",
        "remarks": "52210048874"
    },
    {
        "transactionNumber": "5025309615",
        "materialCode": "212043651",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 2,
        "newBalance": 3,
        "transactionDate": "2025-06-12T08:00:00.000Z",
        "referenceNumber": "I522125061107190",
        "remarks": null
    },
    {
        "transactionNumber": "5025309620",
        "materialCode": "212043651",
        "transactionType": "GR",
        "quantity": 3,
        "previousBalance": 3,
        "newBalance": 6,
        "transactionDate": "2025-06-16T08:00:00.000Z",
        "referenceNumber": "I522125061609575",
        "remarks": null
    },
    {
        "transactionNumber": "4918615472",
        "materialCode": "212043651",
        "transactionType": "GI",
        "quantity": 4,
        "previousBalance": 6,
        "newBalance": 2,
        "transactionDate": "2025-07-04T08:00:00.000Z",
        "referenceNumber": "1037126",
        "remarks": "52210062373"
    },
    {
        "transactionNumber": "5025308254",
        "materialCode": "202041554",
        "transactionType": "GR",
        "quantity": 2,
        "previousBalance": 0,
        "newBalance": 2,
        "transactionDate": "2023-12-07T08:00:00.000Z",
        "referenceNumber": "I522123120715405",
        "remarks": null
    },
    {
        "transactionNumber": "5025306708",
        "materialCode": "202041742",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 0,
        "newBalance": 1,
        "transactionDate": "2022-09-21T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": null
    },
    {
        "transactionNumber": "4912874855",
        "materialCode": "202041742",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 1,
        "newBalance": 0,
        "transactionDate": "2022-12-17T08:00:00.000Z",
        "referenceNumber": "17122022",
        "remarks": "52210024594"
    },
    {
        "transactionNumber": "5025308407",
        "materialCode": "202041742",
        "transactionType": "GR",
        "quantity": 2,
        "previousBalance": 0,
        "newBalance": 2,
        "transactionDate": "2024-01-28T08:00:00.000Z",
        "referenceNumber": "I522124012810164",
        "remarks": null
    },
    {
        "transactionNumber": "4915708775",
        "materialCode": "202041742",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 2,
        "newBalance": 1,
        "transactionDate": "2024-03-14T08:00:00.000Z",
        "referenceNumber": "432582",
        "remarks": "52210047150"
    },
    {
        "transactionNumber": "5025308715",
        "materialCode": "202041742",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 1,
        "newBalance": 2,
        "transactionDate": "2024-05-24T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": null
    },
    {
        "transactionNumber": "4918745615",
        "materialCode": "202041742",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 2,
        "newBalance": 1,
        "transactionDate": "2025-07-25T08:00:00.000Z",
        "referenceNumber": "1070882",
        "remarks": "52210065212"
    },
    {
        "transactionNumber": "5025309442",
        "materialCode": "2120417084",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 0,
        "newBalance": 1,
        "transactionDate": "2025-03-19T08:00:00.000Z",
        "referenceNumber": "I522125031810185",
        "remarks": null
    },
    {
        "transactionNumber": "4918001247",
        "materialCode": "2120417084",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 1,
        "newBalance": 0,
        "transactionDate": "2025-03-27T08:00:00.000Z",
        "referenceNumber": "913386",
        "remarks": "52210059731"
    },
    {
        "transactionNumber": "5025310173",
        "materialCode": "2120417084",
        "transactionType": "GR",
        "quantity": 4,
        "previousBalance": 0,
        "newBalance": 4,
        "transactionDate": "2026-03-16T08:00:00.000Z",
        "referenceNumber": "I522126031414040",
        "remarks": null
    },
    {
        "transactionNumber": "4920375807",
        "materialCode": "2120417084",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 4,
        "newBalance": 3,
        "transactionDate": "2026-04-22T08:00:00.000Z",
        "referenceNumber": "1568781",
        "remarks": "52210075307"
    },
    {
        "transactionNumber": "4920719810",
        "materialCode": "2120417084",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 3,
        "newBalance": 2,
        "transactionDate": "2026-06-17T08:00:00.000Z",
        "referenceNumber": "1666406",
        "remarks": "52210073820"
    },
    {
        "transactionNumber": "4906385788",
        "materialCode": "2120403476",
        "transactionType": "GR",
        "quantity": 2,
        "previousBalance": 0,
        "newBalance": 2,
        "transactionDate": "2019-08-19T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": null
    },
    {
        "transactionNumber": "4906479773",
        "materialCode": "2120403476",
        "transactionType": "GI",
        "quantity": 2,
        "previousBalance": 2,
        "newBalance": 0,
        "transactionDate": "2019-09-02T08:00:00.000Z",
        "referenceNumber": "SIGIT-27647",
        "remarks": "O5221MB036"
    },
    {
        "transactionNumber": "5025302906",
        "materialCode": "2120403476",
        "transactionType": "GR",
        "quantity": 2,
        "previousBalance": 0,
        "newBalance": 2,
        "transactionDate": "2020-08-10T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": null
    },
    {
        "transactionNumber": "4910184918",
        "materialCode": "2120403476",
        "transactionType": "GI",
        "quantity": 2,
        "previousBalance": 2,
        "newBalance": 0,
        "transactionDate": "2021-09-03T08:00:00.000Z",
        "referenceNumber": "5778",
        "remarks": "O5221MB005"
    },
    {
        "transactionNumber": "5025305240",
        "materialCode": "2120403476",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 0,
        "newBalance": 1,
        "transactionDate": "2021-09-30T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": null
    },
    {
        "transactionNumber": "5025305313",
        "materialCode": "2120403476",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 1,
        "newBalance": 2,
        "transactionDate": "2021-10-26T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": null
    },
    {
        "transactionNumber": "5025310398",
        "materialCode": "2120403476",
        "transactionType": "GR",
        "quantity": 4,
        "previousBalance": 2,
        "newBalance": 6,
        "transactionDate": "2026-07-06T08:00:00.000Z",
        "referenceNumber": "I522126070611012",
        "remarks": null
    },
    {
        "transactionNumber": "52OS990490",
        "materialCode": "212080115",
        "transactionType": "GR",
        "quantity": 32,
        "previousBalance": 0,
        "newBalance": 32,
        "transactionDate": "2017-10-01T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": null
    },
    {
        "transactionNumber": "4903704739",
        "materialCode": "212080115",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 32,
        "newBalance": 31,
        "transactionDate": "2017-12-23T08:00:00.000Z",
        "referenceNumber": "17046",
        "remarks": "O5221MB005"
    },
    {
        "transactionNumber": "4903813744",
        "materialCode": "212080115",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 31,
        "newBalance": 30,
        "transactionDate": "2018-02-01T08:00:00.000Z",
        "referenceNumber": "4107",
        "remarks": "O5221MB005"
    },
    {
        "transactionNumber": "4903993204",
        "materialCode": "212080115",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 30,
        "newBalance": 29,
        "transactionDate": "2018-03-23T08:00:00.000Z",
        "referenceNumber": "9584",
        "remarks": "O5221MB027"
    },
    {
        "transactionNumber": "4904422153",
        "materialCode": "212080115",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 29,
        "newBalance": 28,
        "transactionDate": "2018-07-07T08:00:00.000Z",
        "referenceNumber": "20752",
        "remarks": "O5221MB002"
    },
    {
        "transactionNumber": "4904946407",
        "materialCode": "212080115",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 28,
        "newBalance": 27,
        "transactionDate": "2018-10-19T08:00:00.000Z",
        "referenceNumber": "33480",
        "remarks": "O5221MB002"
    },
    {
        "transactionNumber": "4905254726",
        "materialCode": "212080115",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 27,
        "newBalance": 26,
        "transactionDate": "2018-12-14T08:00:00.000Z",
        "referenceNumber": "40242",
        "remarks": "O5221MB005"
    },
    {
        "transactionNumber": "4906479748",
        "materialCode": "212080115",
        "transactionType": "GI",
        "quantity": 2,
        "previousBalance": 26,
        "newBalance": 24,
        "transactionDate": "2019-08-30T08:00:00.000Z",
        "referenceNumber": "SIGIT-27621",
        "remarks": "O5221DT071"
    },
    {
        "transactionNumber": "4906724702",
        "materialCode": "212080115",
        "transactionType": "GI",
        "quantity": 4,
        "previousBalance": 24,
        "newBalance": 20,
        "transactionDate": "2019-10-16T08:00:00.000Z",
        "referenceNumber": "15.10.2019.27",
        "remarks": "O5221MB005"
    },
    {
        "transactionNumber": "4906816794",
        "materialCode": "212080115",
        "transactionType": "GR",
        "quantity": 4,
        "previousBalance": 20,
        "newBalance": 24,
        "transactionDate": "2019-10-16T08:00:00.000Z",
        "referenceNumber": "15.10.2019.27",
        "remarks": "O5221MB005"
    },
    {
        "transactionNumber": "4906825230",
        "materialCode": "212080115",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 24,
        "newBalance": 23,
        "transactionDate": "2019-10-16T08:00:00.000Z",
        "referenceNumber": "16102019-REV",
        "remarks": "O5221MB005"
    },
    {
        "transactionNumber": "4907296063",
        "materialCode": "212080115",
        "transactionType": "GI",
        "quantity": 2,
        "previousBalance": 23,
        "newBalance": 21,
        "transactionDate": "2020-02-03T08:00:00.000Z",
        "referenceNumber": "04022020-07",
        "remarks": "52210000137"
    },
    {
        "transactionNumber": "4910588188",
        "materialCode": "212080115",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 21,
        "newBalance": 20,
        "transactionDate": "2021-11-26T08:00:00.000Z",
        "referenceNumber": "7161",
        "remarks": "O5221MB027"
    },
    {
        "transactionNumber": "4912005757",
        "materialCode": "212080115",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 20,
        "newBalance": 19,
        "transactionDate": "2022-07-31T08:00:00.000Z",
        "referenceNumber": "2754",
        "remarks": "O5221MB040"
    },
    {
        "transactionNumber": "4912456720",
        "materialCode": "212080115",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 19,
        "newBalance": 18,
        "transactionDate": "2022-10-13T08:00:00.000Z",
        "referenceNumber": "13102022",
        "remarks": "52210027557"
    },
    {
        "transactionNumber": "4913523462",
        "materialCode": "212080115",
        "transactionType": "GI",
        "quantity": 2,
        "previousBalance": 18,
        "newBalance": 16,
        "transactionDate": "2023-04-10T08:00:00.000Z",
        "referenceNumber": "10042023",
        "remarks": "52210034471"
    },
    {
        "transactionNumber": "4916022870",
        "materialCode": "212080115",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 16,
        "newBalance": 15,
        "transactionDate": "2024-05-07T08:00:00.000Z",
        "referenceNumber": "493230",
        "remarks": "52210048828"
    },
    {
        "transactionNumber": "4917305698",
        "materialCode": "212080115",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 15,
        "newBalance": 14,
        "transactionDate": "2024-12-06T08:00:00.000Z",
        "referenceNumber": "755956",
        "remarks": "52210057360"
    },
    {
        "transactionNumber": "5025308486",
        "materialCode": "212040554",
        "transactionType": "GR",
        "quantity": 30,
        "previousBalance": 0,
        "newBalance": 30,
        "transactionDate": "2024-03-06T08:00:00.000Z",
        "referenceNumber": "I522124030615011",
        "remarks": null
    },
    {
        "transactionNumber": "4917192370",
        "materialCode": "212040554",
        "transactionType": "GI",
        "quantity": 4,
        "previousBalance": 30,
        "newBalance": 26,
        "transactionDate": "2024-11-20T08:00:00.000Z",
        "referenceNumber": "733784",
        "remarks": "52210056179"
    },
    {
        "transactionNumber": "4917305698-2",
        "materialCode": "212040554",
        "transactionType": "GI",
        "quantity": 6,
        "previousBalance": 26,
        "newBalance": 20,
        "transactionDate": "2024-12-06T08:00:00.000Z",
        "referenceNumber": "755956",
        "remarks": "52210057360"
    },
    {
        "transactionNumber": "4918481204",
        "materialCode": "212040554",
        "transactionType": "GI",
        "quantity": 4,
        "previousBalance": 20,
        "newBalance": 16,
        "transactionDate": "2025-06-13T08:00:00.000Z",
        "referenceNumber": "1006466",
        "remarks": "52210063201"
    },
    {
        "transactionNumber": "4920275083",
        "materialCode": "212040554",
        "transactionType": "GI",
        "quantity": 4,
        "previousBalance": 16,
        "newBalance": 12,
        "transactionDate": "2026-04-07T08:00:00.000Z",
        "referenceNumber": "1539511",
        "remarks": "52210074948"
    },
    {
        "transactionNumber": "4921379563",
        "materialCode": "212040554",
        "transactionType": "GI",
        "quantity": 2,
        "previousBalance": 12,
        "newBalance": 10,
        "transactionDate": "2026-09-28T08:00:00.000Z",
        "referenceNumber": "1863863",
        "remarks": "52210081215"
    },
    {
        "transactionNumber": "5025310370",
        "materialCode": "202041209",
        "transactionType": "GR",
        "quantity": 4,
        "previousBalance": 0,
        "newBalance": 4,
        "transactionDate": "2026-06-26T08:00:00.000Z",
        "referenceNumber": "I522126062614013",
        "remarks": null
    },
    {
        "transactionNumber": "5025310376",
        "materialCode": "202041763",
        "transactionType": "GR",
        "quantity": 4,
        "previousBalance": 0,
        "newBalance": 4,
        "transactionDate": "2026-06-26T08:00:00.000Z",
        "referenceNumber": "I522126062614444",
        "remarks": null
    },
    {
        "transactionNumber": "4921218006",
        "materialCode": "202041763",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 4,
        "newBalance": 3,
        "transactionDate": "2026-09-01T08:00:00.000Z",
        "referenceNumber": "1812558",
        "remarks": "52210080256"
    },
    {
        "transactionNumber": "5025309734",
        "materialCode": "212042279",
        "transactionType": "GR",
        "quantity": 4,
        "previousBalance": 0,
        "newBalance": 4,
        "transactionDate": "2025-08-18T08:00:00.000Z",
        "referenceNumber": "I522125081815542",
        "remarks": null
    },
    {
        "transactionNumber": "5025310331",
        "materialCode": "212043773",
        "transactionType": "GR",
        "quantity": 3,
        "previousBalance": 0,
        "newBalance": 3,
        "transactionDate": "2026-06-04T08:00:00.000Z",
        "referenceNumber": "I522126060413163",
        "remarks": null
    },
    {
        "transactionNumber": "5025310328",
        "materialCode": "212043773",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 0,
        "newBalance": 4,
        "transactionDate": "2026-06-04T08:00:00.000Z",
        "referenceNumber": "I522126060315335",
        "remarks": null
    },
    {
        "transactionNumber": "5025310373",
        "materialCode": "2120403479",
        "transactionType": "GR",
        "quantity": 2,
        "previousBalance": 0,
        "newBalance": 2,
        "transactionDate": "2026-06-26T08:00:00.000Z",
        "referenceNumber": "I522126062614262",
        "remarks": null
    },
    {
        "transactionNumber": "5025310352",
        "materialCode": "2120403479",
        "transactionType": "GR",
        "quantity": 2,
        "previousBalance": 2,
        "newBalance": 4,
        "transactionDate": "2026-06-15T08:00:00.000Z",
        "referenceNumber": "I522126061514395",
        "remarks": null
    },
    {
        "transactionNumber": "5025308486-2",
        "materialCode": "2120417135",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 0,
        "newBalance": 1,
        "transactionDate": "2024-03-06T08:00:00.000Z",
        "referenceNumber": "I522124030615011",
        "remarks": null
    },
    {
        "transactionNumber": "5025308490",
        "materialCode": "2120417135",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 1,
        "newBalance": 2,
        "transactionDate": "2024-03-06T08:00:00.000Z",
        "referenceNumber": "I522124030615060",
        "remarks": null
    },
    {
        "transactionNumber": "5025308496",
        "materialCode": "2120417135",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 2,
        "newBalance": 3,
        "transactionDate": "2024-03-06T08:00:00.000Z",
        "referenceNumber": "I522124030615171",
        "remarks": null
    },
    {
        "transactionNumber": "5025308480",
        "materialCode": "2120417135",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 3,
        "newBalance": 4,
        "transactionDate": "2024-03-06T08:00:00.000Z",
        "referenceNumber": "I522124030614495",
        "remarks": null
    },
    {
        "transactionNumber": "4915676516",
        "materialCode": "2120417135",
        "transactionType": "GI",
        "quantity": 2,
        "previousBalance": 4,
        "newBalance": 2,
        "transactionDate": "2024-03-07T08:00:00.000Z",
        "referenceNumber": "425455",
        "remarks": "52210044214"
    },
    {
        "transactionNumber": "4916371528",
        "materialCode": "2120417135",
        "transactionType": "GI",
        "quantity": 2,
        "previousBalance": 2,
        "newBalance": 0,
        "transactionDate": "2024-07-08T08:00:00.000Z",
        "referenceNumber": "560501",
        "remarks": "52210049263"
    },
    {
        "transactionNumber": "5025309279",
        "materialCode": "2120417135",
        "transactionType": "GR",
        "quantity": 4,
        "previousBalance": 0,
        "newBalance": 4,
        "transactionDate": "2024-12-13T08:00:00.000Z",
        "referenceNumber": "I522124121314553",
        "remarks": null
    },
    {
        "transactionNumber": "4917564725",
        "materialCode": "2120417135",
        "transactionType": "GI",
        "quantity": 2,
        "previousBalance": 4,
        "newBalance": 2,
        "transactionDate": "2025-01-15T08:00:00.000Z",
        "referenceNumber": "802690",
        "remarks": "52210054550"
    },
    {
        "transactionNumber": "5025306831",
        "materialCode": "2120217336",
        "transactionType": "GR",
        "quantity": 2,
        "previousBalance": 0,
        "newBalance": 2,
        "transactionDate": "2022-11-08T08:00:00.000Z",
        "referenceNumber": "I522122110807345",
        "remarks": null
    },
    {
        "transactionNumber": "5025307821",
        "materialCode": "2120217336",
        "transactionType": "GR",
        "quantity": 2,
        "previousBalance": 2,
        "newBalance": 4,
        "transactionDate": "2023-08-07T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": null
    },
    {
        "transactionNumber": "4915795910",
        "materialCode": "2120217336",
        "transactionType": "GI",
        "quantity": 2,
        "previousBalance": 4,
        "newBalance": 2,
        "transactionDate": "2024-03-30T08:00:00.000Z",
        "referenceNumber": "28032024",
        "remarks": "52210037539"
    },
    {
        "transactionNumber": "5025309113",
        "materialCode": "2120403314",
        "transactionType": "GR",
        "quantity": 2,
        "previousBalance": 0,
        "newBalance": 2,
        "transactionDate": "2024-09-27T08:00:00.000Z",
        "referenceNumber": "I522124092715134",
        "remarks": null
    },
    {
        "transactionNumber": "4916930548",
        "materialCode": "2120403314",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 2,
        "newBalance": 1,
        "transactionDate": "2024-10-14T08:00:00.000Z",
        "referenceNumber": "683981",
        "remarks": "52210051268"
    },
    {
        "transactionNumber": "5025309933",
        "materialCode": "2120403314",
        "transactionType": "GR",
        "quantity": 2,
        "previousBalance": 1,
        "newBalance": 3,
        "transactionDate": "2025-10-31T08:00:00.000Z",
        "referenceNumber": "I522125103007515",
        "remarks": null
    },
    {
        "transactionNumber": "5025309934",
        "materialCode": "2120403314",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 3,
        "newBalance": 4,
        "transactionDate": "2025-10-31T08:00:00.000Z",
        "referenceNumber": "I522125103007585",
        "remarks": null
    },
    {
        "transactionNumber": "5025309941",
        "materialCode": "2120403314",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 4,
        "newBalance": 5,
        "transactionDate": "2025-11-10T08:00:00.000Z",
        "referenceNumber": "I522125110814545",
        "remarks": null
    },
    {
        "transactionNumber": "5025309943",
        "materialCode": "2120403314",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 5,
        "newBalance": 6,
        "transactionDate": "2025-11-10T08:00:00.000Z",
        "referenceNumber": "I522125110815024",
        "remarks": null
    },
    {
        "transactionNumber": "5025307182",
        "materialCode": "2120217342",
        "transactionType": "GR",
        "quantity": 2,
        "previousBalance": 0,
        "newBalance": 2,
        "transactionDate": "2023-02-09T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "52210021245"
    },
    {
        "transactionNumber": "4913517446",
        "materialCode": "2120217342",
        "transactionType": "GI",
        "quantity": 2,
        "previousBalance": 2,
        "newBalance": 0,
        "transactionDate": "2023-04-07T08:00:00.000Z",
        "referenceNumber": "7062023",
        "remarks": null
    },
    {
        "transactionNumber": "5025308187",
        "materialCode": "2120217342",
        "transactionType": "GR",
        "quantity": 2,
        "previousBalance": 0,
        "newBalance": 2,
        "transactionDate": "2023-11-24T08:00:00.000Z",
        "referenceNumber": "I522123112414410",
        "remarks": "52210030228"
    },
    {
        "transactionNumber": "4916371528-2",
        "materialCode": "2120217342",
        "transactionType": "GI",
        "quantity": 2,
        "previousBalance": 2,
        "newBalance": 0,
        "transactionDate": "2024-07-08T08:00:00.000Z",
        "referenceNumber": "560501",
        "remarks": null
    },
    {
        "transactionNumber": "5025310485",
        "materialCode": "2120217342",
        "transactionType": "GR",
        "quantity": 6,
        "previousBalance": 0,
        "newBalance": 6,
        "transactionDate": "2026-08-20T08:00:00.000Z",
        "referenceNumber": "I522126082011204",
        "remarks": "52210049263"
    },
    {
        "transactionNumber": "5025301803",
        "materialCode": "212042533",
        "transactionType": "GR",
        "quantity": 2,
        "previousBalance": 0,
        "newBalance": 2,
        "transactionDate": "2020-01-28T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": null
    },
    {
        "transactionNumber": "5025308486-3",
        "materialCode": "2120417132",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 0,
        "newBalance": 1,
        "transactionDate": "2024-03-06T08:00:00.000Z",
        "referenceNumber": "I522124030615011",
        "remarks": null
    },
    {
        "transactionNumber": "5025308490-2",
        "materialCode": "2120417132",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 1,
        "newBalance": 2,
        "transactionDate": "2024-03-06T08:00:00.000Z",
        "referenceNumber": "I522124030615060",
        "remarks": null
    },
    {
        "transactionNumber": "5025308496-2",
        "materialCode": "2120417132",
        "transactionType": "GR",
        "quantity": 2,
        "previousBalance": 2,
        "newBalance": 4,
        "transactionDate": "2024-03-06T08:00:00.000Z",
        "referenceNumber": "I522124030615171",
        "remarks": null
    },
    {
        "transactionNumber": "5025308497",
        "materialCode": "2120417132",
        "transactionType": "GR",
        "quantity": 15,
        "previousBalance": 4,
        "newBalance": 19,
        "transactionDate": "2024-03-06T08:00:00.000Z",
        "referenceNumber": "I522124030615180",
        "remarks": null
    },
    {
        "transactionNumber": "5025308480-2",
        "materialCode": "2120417132",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 19,
        "newBalance": 20,
        "transactionDate": "2024-03-06T08:00:00.000Z",
        "referenceNumber": "I522124030614495",
        "remarks": null
    },
    {
        "transactionNumber": "4915690152",
        "materialCode": "2120417132",
        "transactionType": "GI",
        "quantity": 10,
        "previousBalance": 20,
        "newBalance": 10,
        "transactionDate": "2024-03-12T08:00:00.000Z",
        "referenceNumber": "428575",
        "remarks": "52210044213"
    },
    {
        "transactionNumber": "4915759774",
        "materialCode": "2120417132",
        "transactionType": "GI",
        "quantity": 2,
        "previousBalance": 10,
        "newBalance": 8,
        "transactionDate": "2024-03-22T08:00:00.000Z",
        "referenceNumber": "443006",
        "remarks": "52210047419"
    },
    {
        "transactionNumber": "5025308663",
        "materialCode": "2120417132",
        "transactionType": "GR",
        "quantity": 4,
        "previousBalance": 8,
        "newBalance": 12,
        "transactionDate": "2024-04-30T08:00:00.000Z",
        "referenceNumber": "I522124043009432",
        "remarks": null
    },
    {
        "transactionNumber": "5025308673",
        "materialCode": "2120417132",
        "transactionType": "GR",
        "quantity": 12,
        "previousBalance": 12,
        "newBalance": 24,
        "transactionDate": "2024-05-08T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": null
    },
    {
        "transactionNumber": "4916356886",
        "materialCode": "2120417132",
        "transactionType": "GI",
        "quantity": 10,
        "previousBalance": 24,
        "newBalance": 14,
        "transactionDate": "2024-07-05T08:00:00.000Z",
        "referenceNumber": "557506",
        "remarks": "52210047420"
    },
    {
        "transactionNumber": "4917532791",
        "materialCode": "2120417132",
        "transactionType": "GI",
        "quantity": 12,
        "previousBalance": 14,
        "newBalance": 2,
        "transactionDate": "2025-01-10T08:00:00.000Z",
        "referenceNumber": "796681",
        "remarks": "52210054548"
    },
    {
        "transactionNumber": "5025310082",
        "materialCode": "2120417132",
        "transactionType": "GR",
        "quantity": 2,
        "previousBalance": 2,
        "newBalance": 4,
        "transactionDate": "2026-01-28T08:00:00.000Z",
        "referenceNumber": "I522126012713471",
        "remarks": null
    },
    {
        "transactionNumber": "5025310082-2",
        "materialCode": "2120417132",
        "transactionType": "GR",
        "quantity": 8,
        "previousBalance": 4,
        "newBalance": 12,
        "transactionDate": "2026-01-28T08:00:00.000Z",
        "referenceNumber": "I522126012713471",
        "remarks": null
    },
    {
        "transactionNumber": "4919952124",
        "materialCode": "2120417132",
        "transactionType": "GI",
        "quantity": 12,
        "previousBalance": 12,
        "newBalance": 0,
        "transactionDate": "2026-02-10T08:00:00.000Z",
        "referenceNumber": "1440526",
        "remarks": "52210071704"
    },
    {
        "transactionNumber": "5025310485-2",
        "materialCode": "2120417132",
        "transactionType": "GR",
        "quantity": 44,
        "previousBalance": 0,
        "newBalance": 44,
        "transactionDate": "2026-08-20T08:00:00.000Z",
        "referenceNumber": "I522126082011204",
        "remarks": null
    },
    {
        "transactionNumber": "4904603993",
        "materialCode": "212022459",
        "transactionType": "GR",
        "quantity": 2,
        "previousBalance": 0,
        "newBalance": 2,
        "transactionDate": "2018-08-14T08:00:00.000Z",
        "referenceNumber": "100818017",
        "remarks": null
    },
    {
        "transactionNumber": "4905161765",
        "materialCode": "212022459",
        "transactionType": "GI",
        "quantity": 2,
        "previousBalance": 2,
        "newBalance": 0,
        "transactionDate": "2018-11-30T08:00:00.000Z",
        "referenceNumber": "37928",
        "remarks": "O5221DT012"
    },
    {
        "transactionNumber": "4905359251",
        "materialCode": "212022459",
        "transactionType": "GR",
        "quantity": 2,
        "previousBalance": 0,
        "newBalance": 2,
        "transactionDate": "2019-01-14T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": null
    },
    {
        "transactionNumber": "5023105072",
        "materialCode": "212022459",
        "transactionType": "GR",
        "quantity": 6,
        "previousBalance": 2,
        "newBalance": 8,
        "transactionDate": "2019-02-28T08:00:00.000Z",
        "referenceNumber": "230219002",
        "remarks": null
    },
    {
        "transactionNumber": "4906366044",
        "materialCode": "212022459",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 8,
        "newBalance": 7,
        "transactionDate": "2019-08-13T08:00:00.000Z",
        "referenceNumber": "NURMI-24872",
        "remarks": "O5221DT036"
    },
    {
        "transactionNumber": "4906376353",
        "materialCode": "212022459",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 7,
        "newBalance": 6,
        "transactionDate": "2019-08-15T08:00:00.000Z",
        "referenceNumber": "SIGIT-25402",
        "remarks": "O5221DT029"
    },
    {
        "transactionNumber": "4906455768",
        "materialCode": "212022459",
        "transactionType": "GI",
        "quantity": 2,
        "previousBalance": 6,
        "newBalance": 4,
        "transactionDate": "2019-08-30T08:00:00.000Z",
        "referenceNumber": "SIGIT-27102",
        "remarks": "O5221DT023"
    },
    {
        "transactionNumber": "4908128129",
        "materialCode": "212022459",
        "transactionType": "GR",
        "quantity": 4,
        "previousBalance": 4,
        "newBalance": 8,
        "transactionDate": "2020-08-06T08:00:00.000Z",
        "referenceNumber": "6082020",
        "remarks": null
    },
    {
        "transactionNumber": "4904386221",
        "materialCode": "211102044",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 0,
        "newBalance": 1,
        "transactionDate": "2018-06-30T08:00:00.000Z",
        "referenceNumber": "300618007",
        "remarks": "KEBUTUHAN STOCK GUDANG"
    },
    {
        "transactionNumber": "4904250387",
        "materialCode": "211102044",
        "transactionType": "GR",
        "quantity": 4,
        "previousBalance": 1,
        "newBalance": 5,
        "transactionDate": "2018-05-27T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "KEBUTUHAN STOCK GUDANG"
    },
    {
        "transactionNumber": "5023201710",
        "materialCode": "202090452",
        "transactionType": "GR",
        "quantity": 4,
        "previousBalance": 0,
        "newBalance": 4,
        "transactionDate": "2018-09-18T08:00:00.000Z",
        "referenceNumber": "1000000018",
        "remarks": "MUTASI SPARE PART DARI PT KAM"
    },
    {
        "transactionNumber": "5023200507",
        "materialCode": "2120403297",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 0,
        "newBalance": 1,
        "transactionDate": "2016-02-15T08:00:00.000Z",
        "referenceNumber": "5",
        "remarks": "KEBUTUHAN SPARE PART B 9302 SBA"
    },
    {
        "transactionNumber": "4901683701",
        "materialCode": "2120403297",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 1,
        "newBalance": 0,
        "transactionDate": "2016-02-26T08:00:00.000Z",
        "referenceNumber": "5145",
        "remarks": "O5221MB003"
    },
    {
        "transactionNumber": "5025301038",
        "materialCode": "2120403297",
        "transactionType": "GR",
        "quantity": 2,
        "previousBalance": 0,
        "newBalance": 2,
        "transactionDate": "2016-06-17T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "KEBUTUHAN SPARE PART KT 8619 NE & B 9709 SBA"
    },
    {
        "transactionNumber": "4902007474",
        "materialCode": "2120403297",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 2,
        "newBalance": 1,
        "transactionDate": "2016-07-03T08:00:00.000Z",
        "referenceNumber": "16215",
        "remarks": "O5221MB005"
    },
    {
        "transactionNumber": "4902930372",
        "materialCode": "2120403297",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 1,
        "newBalance": 0,
        "transactionDate": "2017-04-05T08:00:00.000Z",
        "referenceNumber": "JUAL PIR",
        "remarks": "SERAH TERIMA (JUAL) KE PIR FEB 2017"
    },
    {
        "transactionNumber": "52OS990107",
        "materialCode": "2120403297",
        "transactionType": "GR",
        "quantity": 8,
        "previousBalance": 0,
        "newBalance": 8,
        "transactionDate": "2017-10-20T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "PEMBELIAN BARANG PIR"
    },
    {
        "transactionNumber": "4904063006",
        "materialCode": "2120403297",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 8,
        "newBalance": 7,
        "transactionDate": "2018-04-12T08:00:00.000Z",
        "referenceNumber": "11697",
        "remarks": "O5221MB002"
    },
    {
        "transactionNumber": "4904461879",
        "materialCode": "2120403297",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 7,
        "newBalance": 6,
        "transactionDate": "2018-07-17T08:00:00.000Z",
        "referenceNumber": "21588",
        "remarks": "O5221MB002"
    },
    {
        "transactionNumber": "4904502273",
        "materialCode": "2120403297",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 6,
        "newBalance": 5,
        "transactionDate": "2018-07-25T08:00:00.000Z",
        "referenceNumber": "22340",
        "remarks": "O5221MB005"
    },
    {
        "transactionNumber": "4904562407",
        "materialCode": "2120403297",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 5,
        "newBalance": 4,
        "transactionDate": "2018-08-06T08:00:00.000Z",
        "referenceNumber": "24169",
        "remarks": "O5221MB002"
    },
    {
        "transactionNumber": "4906900364",
        "materialCode": "2120403297",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 4,
        "newBalance": 3,
        "transactionDate": "2019-11-19T08:00:00.000Z",
        "referenceNumber": "19112019",
        "remarks": "O5221DT065"
    },
    {
        "transactionNumber": "4907815731",
        "materialCode": "2120403297",
        "transactionType": "GI",
        "quantity": 2,
        "previousBalance": 3,
        "newBalance": 1,
        "transactionDate": "2020-05-26T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "52210003593"
    },
    {
        "transactionNumber": "52OS991185",
        "materialCode": "2120217338",
        "transactionType": "GR",
        "quantity": 10,
        "previousBalance": 0,
        "newBalance": 10,
        "transactionDate": "2017-10-20T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "PEMBELIAN BRG PIR"
    },
    {
        "transactionNumber": "4904468796",
        "materialCode": "212042326",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 0,
        "newBalance": 1,
        "transactionDate": "2018-07-18T08:00:00.000Z",
        "referenceNumber": "160718004",
        "remarks": "KEBUTUHAN STOCK GUDANG"
    },
    {
        "transactionNumber": "52OS990919",
        "materialCode": "2120403356",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 0,
        "newBalance": 1,
        "transactionDate": "2017-10-20T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "PEMBELIAN BARANG PIR"
    },
    {
        "transactionNumber": "4904375642",
        "materialCode": "2120403356",
        "transactionType": "GR",
        "quantity": 3,
        "previousBalance": 1,
        "newBalance": 4,
        "transactionDate": "2018-06-28T08:00:00.000Z",
        "referenceNumber": "270618001",
        "remarks": "KEBUTUHAN STOCK GUDANG"
    },
    {
        "transactionNumber": "4904376037",
        "materialCode": "2120403356",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 4,
        "newBalance": 5,
        "transactionDate": "2018-06-28T08:00:00.000Z",
        "referenceNumber": "270618017",
        "remarks": "KEBUTUHAN STOCK GUDANG"
    },
    {
        "transactionNumber": "4904759294",
        "materialCode": "2120403356",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 5,
        "newBalance": 4,
        "transactionDate": "2018-09-14T08:00:00.000Z",
        "referenceNumber": "28753",
        "remarks": "O5221AB001"
    },
    {
        "transactionNumber": "4905451179",
        "materialCode": "2120403356",
        "transactionType": "GR",
        "quantity": 4,
        "previousBalance": 4,
        "newBalance": 8,
        "transactionDate": "2019-01-31T08:00:00.000Z",
        "referenceNumber": "260119006",
        "remarks": "KEBUTUHAN STOCK GUDANG"
    },
    {
        "transactionNumber": "4905775462",
        "materialCode": "2120403356",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 8,
        "newBalance": 7,
        "transactionDate": "2019-04-12T08:00:00.000Z",
        "referenceNumber": "SOFYAN-12083",
        "remarks": "O5221MB002"
    },
    {
        "transactionNumber": "4909944434",
        "materialCode": "2120403356",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 7,
        "newBalance": 6,
        "transactionDate": "2021-07-13T08:00:00.000Z",
        "referenceNumber": "13072021",
        "remarks": "52210015250"
    },
    {
        "transactionNumber": "4914981843",
        "materialCode": "2120403356",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 6,
        "newBalance": 5,
        "transactionDate": "2023-11-17T08:00:00.000Z",
        "referenceNumber": "294781",
        "remarks": "52210041527"
    },
    {
        "transactionNumber": "4920896655",
        "materialCode": "2120403356",
        "transactionType": "GI",
        "quantity": 2,
        "previousBalance": 5,
        "newBalance": 3,
        "transactionDate": "2026-07-13T08:00:00.000Z",
        "referenceNumber": "5025600464",
        "remarks": null
    },
    {
        "transactionNumber": "5025300747",
        "materialCode": "212040257",
        "transactionType": "GR",
        "quantity": 5,
        "previousBalance": 0,
        "newBalance": 5,
        "transactionDate": "2016-03-12T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "SPRAE PART HILINE"
    },
    {
        "transactionNumber": "4901732292",
        "materialCode": "212040257",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 5,
        "newBalance": 4,
        "transactionDate": "2016-03-17T08:00:00.000Z",
        "referenceNumber": "6761",
        "remarks": "O5221MB011"
    },
    {
        "transactionNumber": "4901749543",
        "materialCode": "212040257",
        "transactionType": "GI",
        "quantity": 2,
        "previousBalance": 4,
        "newBalance": 2,
        "transactionDate": "2016-03-26T08:00:00.000Z",
        "referenceNumber": "7602",
        "remarks": "O5221MB009"
    },
    {
        "transactionNumber": "4901785660",
        "materialCode": "212040257",
        "transactionType": "GI",
        "quantity": 2,
        "previousBalance": 2,
        "newBalance": 0,
        "transactionDate": "2016-04-06T08:00:00.000Z",
        "referenceNumber": "8338",
        "remarks": "O5221MB011"
    },
    {
        "transactionNumber": "5025300904",
        "materialCode": "212040257",
        "transactionType": "GR",
        "quantity": 10,
        "previousBalance": 0,
        "newBalance": 10,
        "transactionDate": "2016-05-02T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "KEBUTUHAN SPARE PART HILINE"
    },
    {
        "transactionNumber": "5025301177",
        "materialCode": "212040257",
        "transactionType": "GR",
        "quantity": 6,
        "previousBalance": 10,
        "newBalance": 16,
        "transactionDate": "2016-09-03T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "KEBUTUHAN SPARE PART HILINE"
    },
    {
        "transactionNumber": "4902273891",
        "materialCode": "212040257",
        "transactionType": "GI",
        "quantity": 2,
        "previousBalance": 16,
        "newBalance": 14,
        "transactionDate": "2016-10-14T08:00:00.000Z",
        "referenceNumber": "23735",
        "remarks": "O5221MB011"
    },
    {
        "transactionNumber": "4902294984",
        "materialCode": "212040257",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 14,
        "newBalance": 13,
        "transactionDate": "2016-10-19T08:00:00.000Z",
        "referenceNumber": "24168",
        "remarks": "O5221MB011"
    },
    {
        "transactionNumber": "4902359625",
        "materialCode": "212040257",
        "transactionType": "GI",
        "quantity": 2,
        "previousBalance": 13,
        "newBalance": 11,
        "transactionDate": "2016-11-03T08:00:00.000Z",
        "referenceNumber": "25493",
        "remarks": "O5221MB015"
    },
    {
        "transactionNumber": "4902930059",
        "materialCode": "212040257",
        "transactionType": "GI",
        "quantity": 11,
        "previousBalance": 11,
        "newBalance": 0,
        "transactionDate": "2017-04-05T08:00:00.000Z",
        "referenceNumber": "JUAL PIR",
        "remarks": "SERAH TERIMA (JUAL) KE PIR FEB 2017"
    },
    {
        "transactionNumber": "52OS990755",
        "materialCode": "212040257",
        "transactionType": "GR",
        "quantity": 11,
        "previousBalance": 0,
        "newBalance": 11,
        "transactionDate": "2017-10-20T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "PEMBELIAN BARANG PIR"
    },
    {
        "transactionNumber": "5025308866",
        "materialCode": "212041009",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 0,
        "newBalance": 1,
        "transactionDate": "2024-07-23T08:00:00.000Z",
        "referenceNumber": "I522124072315164",
        "remarks": null
    },
    {
        "transactionNumber": "4920091395",
        "materialCode": "212041009",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 1,
        "newBalance": 0,
        "transactionDate": "2026-03-05T08:00:00.000Z",
        "referenceNumber": "1485338",
        "remarks": "52210073968"
    },
    {
        "transactionNumber": "5025310513",
        "materialCode": "212041009",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 0,
        "newBalance": 1,
        "transactionDate": "2026-09-15T08:00:00.000Z",
        "referenceNumber": "I522126091511201",
        "remarks": null
    },
    {
        "transactionNumber": "5025310525",
        "materialCode": "212041009",
        "transactionType": "GR",
        "quantity": 3,
        "previousBalance": 1,
        "newBalance": 3,
        "transactionDate": "2026-09-23T08:00:00.000Z",
        "referenceNumber": "I522126092314475",
        "remarks": null
    },
    {
        "transactionNumber": "5025301628",
        "materialCode": "2120217472",
        "transactionType": "GR",
        "quantity": 4,
        "previousBalance": 0,
        "newBalance": 4,
        "transactionDate": "2019-12-10T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "KEBUTUHAN STOCK GUDANG"
    },
    {
        "transactionNumber": "5025301850",
        "materialCode": "2120217472",
        "transactionType": "GR",
        "quantity": 10,
        "previousBalance": 4,
        "newBalance": 14,
        "transactionDate": "2020-01-31T08:00:00.000Z",
        "referenceNumber": "31012020",
        "remarks": "KEBUTUHAN STOCK GUDANG"
    },
    {
        "transactionNumber": "4907779004",
        "materialCode": "2120217472",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 14,
        "newBalance": 13,
        "transactionDate": "2020-05-15T08:00:00.000Z",
        "referenceNumber": "15052020",
        "remarks": "52210003357"
    },
    {
        "transactionNumber": "4908002069",
        "materialCode": "2120217472",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 13,
        "newBalance": 12,
        "transactionDate": "2020-07-06T08:00:00.000Z",
        "referenceNumber": "6072020",
        "remarks": "52210004777"
    },
    {
        "transactionNumber": "4908249842",
        "materialCode": "2120217472",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 12,
        "newBalance": 11,
        "transactionDate": "2020-09-04T08:00:00.000Z",
        "referenceNumber": "4082020",
        "remarks": "52210006501"
    },
    {
        "transactionNumber": "4908345752",
        "materialCode": "2120217472",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 11,
        "newBalance": 10,
        "transactionDate": "2020-09-23T08:00:00.000Z",
        "referenceNumber": "23092020",
        "remarks": "52210007021"
    },
    {
        "transactionNumber": "4906905599",
        "materialCode": "212021224",
        "transactionType": "GR",
        "quantity": 4,
        "previousBalance": 0,
        "newBalance": 4,
        "transactionDate": "2019-11-19T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "KEBUTUHAN STOCK GUDANG"
    },
    {
        "transactionNumber": "4906385788-2",
        "materialCode": "212042682",
        "transactionType": "GR",
        "quantity": 2,
        "previousBalance": 0,
        "newBalance": 2,
        "transactionDate": "2019-08-19T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": null
    },
    {
        "transactionNumber": "4906447690",
        "materialCode": "212042682",
        "transactionType": "GI",
        "quantity": 2,
        "previousBalance": 2,
        "newBalance": 0,
        "transactionDate": "2019-08-29T08:00:00.000Z",
        "referenceNumber": "SIGIT-26172",
        "remarks": "O5221FT002"
    },
    {
        "transactionNumber": "5025302906-2",
        "materialCode": "212042682",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 0,
        "newBalance": 1,
        "transactionDate": "2020-08-10T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": null
    },
    {
        "transactionNumber": "5025302967",
        "materialCode": "212042682",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 1,
        "newBalance": 2,
        "transactionDate": "2020-08-22T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": null
    },
    {
        "transactionNumber": "5025310398-2",
        "materialCode": "212042682",
        "transactionType": "GR",
        "quantity": 4,
        "previousBalance": 2,
        "newBalance": 6,
        "transactionDate": "2026-07-06T08:00:00.000Z",
        "referenceNumber": "I522126070611012",
        "remarks": null
    },
    {
        "transactionNumber": "4904468796-2",
        "materialCode": "212042327",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 0,
        "newBalance": 1,
        "transactionDate": "2018-07-18T08:00:00.000Z",
        "referenceNumber": "160718004",
        "remarks": "KEBUTUHAN STOCK GUDANG"
    },
    {
        "transactionNumber": "4904759294-2",
        "materialCode": "212042327",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 1,
        "newBalance": 0,
        "transactionDate": "2018-09-14T08:00:00.000Z",
        "referenceNumber": "28753",
        "remarks": "O5221AB001"
    },
    {
        "transactionNumber": "5023202084",
        "materialCode": "212042327",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 0,
        "newBalance": 1,
        "transactionDate": "2019-04-20T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "KEBUTUHAN PART HILUX DOKTER"
    },
    {
        "transactionNumber": "4905861305",
        "materialCode": "212042327",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 1,
        "newBalance": 0,
        "transactionDate": "2019-04-30T08:00:00.000Z",
        "referenceNumber": "APRIL-13931",
        "remarks": "O5221MB020"
    },
    {
        "transactionNumber": "5025302967-2",
        "materialCode": "212042327",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 0,
        "newBalance": 1,
        "transactionDate": "2020-08-22T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "KEBUTUHAN STOK GUDANG"
    },
    {
        "transactionNumber": "5025303119",
        "materialCode": "212042327",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 1,
        "newBalance": 2,
        "transactionDate": "2020-09-19T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "KEBUTUHAN STOK GUDANG"
    },
    {
        "transactionNumber": "4910902467",
        "materialCode": "212042327",
        "transactionType": "GI",
        "quantity": 2,
        "previousBalance": 2,
        "newBalance": 0,
        "transactionDate": "2022-01-28T08:00:00.000Z",
        "referenceNumber": "521",
        "remarks": "PERIODICAL SERVICE"
    },
    {
        "transactionNumber": "5025306070",
        "materialCode": "212042327",
        "transactionType": "GR",
        "quantity": 2,
        "previousBalance": 0,
        "newBalance": 2,
        "transactionDate": "2022-03-17T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "O5221MB020"
    },
    {
        "transactionNumber": "4920896655-2",
        "materialCode": "212042327",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 2,
        "newBalance": 1,
        "transactionDate": "2026-07-13T08:00:00.000Z",
        "referenceNumber": "5025600464",
        "remarks": null
    },
    {
        "transactionNumber": "5025310353",
        "materialCode": "2120403480",
        "transactionType": "GR",
        "quantity": 6,
        "previousBalance": 0,
        "newBalance": 6,
        "transactionDate": "2026-06-15T08:00:00.000Z",
        "referenceNumber": "I522126061514512",
        "remarks": null
    },
    {
        "transactionNumber": "5025310210",
        "materialCode": "212040465",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 0,
        "newBalance": 1,
        "transactionDate": "2026-04-16T08:00:00.000Z",
        "referenceNumber": "I522126041614294",
        "remarks": null
    },
    {
        "transactionNumber": "5025308498",
        "materialCode": "212041234",
        "transactionType": "GR",
        "quantity": 2,
        "previousBalance": 0,
        "newBalance": 2,
        "transactionDate": "2024-03-06T08:00:00.000Z",
        "referenceNumber": "I522124030615223",
        "remarks": null
    },
    {
        "transactionNumber": "4916953494",
        "materialCode": "212041234",
        "transactionType": "GI",
        "quantity": 2,
        "previousBalance": 2,
        "newBalance": 0,
        "transactionDate": "2024-10-16T08:00:00.000Z",
        "referenceNumber": "688572",
        "remarks": "52210054610"
    },
    {
        "transactionNumber": "5025309768",
        "materialCode": "212041234",
        "transactionType": "GR",
        "quantity": 2,
        "previousBalance": 0,
        "newBalance": 2,
        "transactionDate": "2025-09-08T08:00:00.000Z",
        "referenceNumber": "I522125090615344",
        "remarks": null
    },
    {
        "transactionNumber": "5023204081",
        "materialCode": "212040462",
        "transactionType": "GR",
        "quantity": 5,
        "previousBalance": 0,
        "newBalance": 5,
        "transactionDate": "2026-07-30T08:00:00.000Z",
        "referenceNumber": "I522126073018194",
        "remarks": null
    },
    {
        "transactionNumber": "5025307182-2",
        "materialCode": "212043604",
        "transactionType": "GR",
        "quantity": 2,
        "previousBalance": 0,
        "newBalance": 2,
        "transactionDate": "2023-02-09T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "KEBUTUHAN STOK GUDANG"
    },
    {
        "transactionNumber": "4913517446-2",
        "materialCode": "212043604",
        "transactionType": "GI",
        "quantity": 2,
        "previousBalance": 2,
        "newBalance": 0,
        "transactionDate": "2023-04-07T08:00:00.000Z",
        "referenceNumber": "7062023",
        "remarks": "52210030228"
    },
    {
        "transactionNumber": "5025308498-2",
        "materialCode": "212043604",
        "transactionType": "GR",
        "quantity": 4,
        "previousBalance": 0,
        "newBalance": 4,
        "transactionDate": "2024-03-06T08:00:00.000Z",
        "referenceNumber": "I522124030615223",
        "remarks": null
    },
    {
        "transactionNumber": "4916456684",
        "materialCode": "212043604",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 4,
        "newBalance": 3,
        "transactionDate": "2024-07-23T08:00:00.000Z",
        "referenceNumber": "581237",
        "remarks": "52210051609"
    },
    {
        "transactionNumber": "4917950968",
        "materialCode": "212043604",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 3,
        "newBalance": 2,
        "transactionDate": "2025-03-19T08:00:00.000Z",
        "referenceNumber": "900954",
        "remarks": "52210059527"
    },
    {
        "transactionNumber": "4906559028",
        "materialCode": "212021212",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 0,
        "newBalance": 1,
        "transactionDate": "2019-09-17T08:00:00.000Z",
        "referenceNumber": "16092019-2",
        "remarks": "KEBUTUHAN UNTUK STOK GUDANG"
    },
    {
        "transactionNumber": "4907078644",
        "materialCode": "212021212",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 1,
        "newBalance": 0,
        "transactionDate": "2019-12-20T08:00:00.000Z",
        "referenceNumber": "SIGIT-38764",
        "remarks": "O5221DT072"
    },
    {
        "transactionNumber": "5025302448",
        "materialCode": "212021212",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 0,
        "newBalance": 1,
        "transactionDate": "2020-05-04T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "KEBUTUHAN STOK GUDANG"
    },
    {
        "transactionNumber": "5025302634",
        "materialCode": "212021212",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 1,
        "newBalance": 2,
        "transactionDate": "2020-07-23T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "KEBUTUHAN STOK GUDANG"
    },
    {
        "transactionNumber": "4908749453",
        "materialCode": "212021212",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 2,
        "newBalance": 1,
        "transactionDate": "2020-11-30T08:00:00.000Z",
        "referenceNumber": "5728",
        "remarks": "O5221TT002"
    },
    {
        "transactionNumber": "4908740923",
        "materialCode": "212021212",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 1,
        "newBalance": 0,
        "transactionDate": "2020-11-30T08:00:00.000Z",
        "referenceNumber": "30112020",
        "remarks": "52210009087"
    },
    {
        "transactionNumber": "5025303840",
        "materialCode": "212021212",
        "transactionType": "GR",
        "quantity": 3,
        "previousBalance": 0,
        "newBalance": 3,
        "transactionDate": "2021-01-26T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "KEBUTUHAN STOK GUDANG"
    },
    {
        "transactionNumber": "4909666509",
        "materialCode": "212021212",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 3,
        "newBalance": 2,
        "transactionDate": "2021-05-21T08:00:00.000Z",
        "referenceNumber": "21052021",
        "remarks": "52210009495"
    },
    {
        "transactionNumber": "4910904633",
        "materialCode": "212021212",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 2,
        "newBalance": 1,
        "transactionDate": "2022-01-29T08:00:00.000Z",
        "referenceNumber": "29012022",
        "remarks": "52210019514"
    },
    {
        "transactionNumber": "5023204081-2",
        "materialCode": "212040701",
        "transactionType": "GR",
        "quantity": 3,
        "previousBalance": 0,
        "newBalance": 3,
        "transactionDate": "2026-07-30T08:00:00.000Z",
        "referenceNumber": "I522126073018194",
        "remarks": null
    },
    {
        "transactionNumber": "4921065940",
        "materialCode": "212040701",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 3,
        "newBalance": 2,
        "transactionDate": "2026-08-06T08:00:00.000Z",
        "referenceNumber": "1766526",
        "remarks": "52210079334"
    },
    {
        "transactionNumber": "5025309735",
        "materialCode": "2120417154",
        "transactionType": "GR",
        "quantity": 2,
        "previousBalance": 0,
        "newBalance": 2,
        "transactionDate": "2025-08-19T08:00:00.000Z",
        "referenceNumber": "I522125081915273",
        "remarks": null
    },
    {
        "transactionNumber": "4919020367",
        "materialCode": "2120417154",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 2,
        "newBalance": 1,
        "transactionDate": "2025-09-11T08:00:00.000Z",
        "referenceNumber": "1160503",
        "remarks": "52210063832"
    },
    {
        "transactionNumber": "5025309739",
        "materialCode": "2120417142",
        "transactionType": "GR",
        "quantity": 8,
        "previousBalance": 0,
        "newBalance": 8,
        "transactionDate": "2025-08-19T08:00:00.000Z",
        "referenceNumber": "I522125081915334",
        "remarks": null
    },
    {
        "transactionNumber": "4918968885",
        "materialCode": "2120417142",
        "transactionType": "GI",
        "quantity": 2,
        "previousBalance": 8,
        "newBalance": 6,
        "transactionDate": "2025-09-02T08:00:00.000Z",
        "referenceNumber": "1145740",
        "remarks": "52210067247"
    },
    {
        "transactionNumber": "5025301514",
        "materialCode": "212041280",
        "transactionType": "GR",
        "quantity": 2,
        "previousBalance": 0,
        "newBalance": 2,
        "transactionDate": "2016-12-29T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "KEBUTUHAN SPARE PART TOYOTA HILUX"
    },
    {
        "transactionNumber": "4902638824",
        "materialCode": "212041280",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 2,
        "newBalance": 1,
        "transactionDate": "2017-01-17T08:00:00.000Z",
        "referenceNumber": "1131",
        "remarks": "O5221MB002"
    },
    {
        "transactionNumber": "4903809745",
        "materialCode": "212041280",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 1,
        "newBalance": 0,
        "transactionDate": "2018-02-01T08:00:00.000Z",
        "referenceNumber": "3880",
        "remarks": "O5221BS001"
    },
    {
        "transactionNumber": "4905238006",
        "materialCode": "212041280",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 0,
        "newBalance": 1,
        "transactionDate": "2018-12-17T08:00:00.000Z",
        "referenceNumber": "121218007",
        "remarks": "KEBUTUHAN STOCK GUDANG"
    },
    {
        "transactionNumber": "4905577851",
        "materialCode": "212041280",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 1,
        "newBalance": 0,
        "transactionDate": "2019-02-27T08:00:00.000Z",
        "referenceNumber": "1558582",
        "remarks": "O5221MB028"
    },
    {
        "transactionNumber": "4905935950",
        "materialCode": "212041280",
        "transactionType": "GR",
        "quantity": 2,
        "previousBalance": 0,
        "newBalance": 2,
        "transactionDate": "2019-05-16T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "TERIMA MUTASI BARANG DARI RO03"
    },
    {
        "transactionNumber": "4908535544",
        "materialCode": "212041280",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 2,
        "newBalance": 1,
        "transactionDate": "2020-10-27T08:00:00.000Z",
        "referenceNumber": "27102020",
        "remarks": "52210008532"
    },
    {
        "transactionNumber": "5025303602",
        "materialCode": "212041280",
        "transactionType": "GR",
        "quantity": 2,
        "previousBalance": 1,
        "newBalance": 3,
        "transactionDate": "2020-12-16T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "KEBUTUHAN STOK GUDANG"
    },
    {
        "transactionNumber": "5025300106",
        "materialCode": "2120403089",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 0,
        "newBalance": 1,
        "transactionDate": "2015-05-20T08:00:00.000Z",
        "referenceNumber": "STOCK GUDANG",
        "remarks": "STOCK GUDANG PT.MSL"
    },
    {
        "transactionNumber": "4900930545",
        "materialCode": "2120403089",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 1,
        "newBalance": 0,
        "transactionDate": "2015-06-04T08:00:00.000Z",
        "referenceNumber": "13879",
        "remarks": "O5221AB001"
    },
    {
        "transactionNumber": "4904375866",
        "materialCode": "2120403089",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 0,
        "newBalance": 1,
        "transactionDate": "2018-06-28T08:00:00.000Z",
        "referenceNumber": "270618005",
        "remarks": "KEBUTUHAN STOCK GUDANG"
    },
    {
        "transactionNumber": "4904759294-3",
        "materialCode": "2120403089",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 1,
        "newBalance": 0,
        "transactionDate": "2018-09-14T08:00:00.000Z",
        "referenceNumber": "28753",
        "remarks": "O5221AB001"
    },
    {
        "transactionNumber": "4905244184",
        "materialCode": "2120403089",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 0,
        "newBalance": 1,
        "transactionDate": "2018-12-18T08:00:00.000Z",
        "referenceNumber": "121218021",
        "remarks": "KEBUTUHAN STOCK GUDANG"
    },
    {
        "transactionNumber": "4905451179-2",
        "materialCode": "2120403089",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 1,
        "newBalance": 2,
        "transactionDate": "2019-01-31T08:00:00.000Z",
        "referenceNumber": "260119006",
        "remarks": "KEBUTUHAN STOCK GUDANG"
    },
    {
        "transactionNumber": "4905775481",
        "materialCode": "2120403089",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 2,
        "newBalance": 1,
        "transactionDate": "2019-04-12T08:00:00.000Z",
        "referenceNumber": "SOFYAN-12102",
        "remarks": "O5221MB020"
    },
    {
        "transactionNumber": "5025302905",
        "materialCode": "2120403089",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 1,
        "newBalance": 2,
        "transactionDate": "2020-08-10T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "KEBUTUHAN STOK GUDANG"
    },
    {
        "transactionNumber": "5025302892",
        "materialCode": "2120403089",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 2,
        "newBalance": 3,
        "transactionDate": "2020-08-10T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "KEBUTUHAN STOK GUDANG"
    },
    {
        "transactionNumber": "4908792297",
        "materialCode": "2120403089",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 3,
        "newBalance": 2,
        "transactionDate": "2020-12-07T08:00:00.000Z",
        "referenceNumber": "5847",
        "remarks": "O5221AR008"
    },
    {
        "transactionNumber": "5025303861",
        "materialCode": "2120403089",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 2,
        "newBalance": 3,
        "transactionDate": "2021-01-26T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "KEBUTUHAN STOK GUDANG"
    },
    {
        "transactionNumber": "5025303848",
        "materialCode": "2120403089",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 3,
        "newBalance": 4,
        "transactionDate": "2021-01-26T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "KEBUTUHAN STOK GUDANG"
    },
    {
        "transactionNumber": "4909666509-2",
        "materialCode": "2120403089",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 4,
        "newBalance": 3,
        "transactionDate": "2021-05-21T08:00:00.000Z",
        "referenceNumber": "21052021",
        "remarks": "52210009495"
    },
    {
        "transactionNumber": "4914981843-2",
        "materialCode": "2120403089",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 3,
        "newBalance": 2,
        "transactionDate": "2023-11-17T08:00:00.000Z",
        "referenceNumber": "294781",
        "remarks": "52210041527"
    },
    {
        "transactionNumber": "4919196259",
        "materialCode": "2120403089",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 2,
        "newBalance": 1,
        "transactionDate": "2025-10-10T08:00:00.000Z",
        "referenceNumber": "1212719",
        "remarks": "52210059454"
    },
    {
        "transactionNumber": "4907005455",
        "materialCode": "211070541",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 0,
        "newBalance": 1,
        "transactionDate": "2018-11-06T08:00:00.000Z",
        "referenceNumber": "61118004",
        "remarks": "KEBUTUHAN STOCK GUDANG"
    },
    {
        "transactionNumber": "4905039173",
        "materialCode": "211070541",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 1,
        "newBalance": 2,
        "transactionDate": "2019-12-07T08:00:00.000Z",
        "referenceNumber": "07122019-2",
        "remarks": "KEBUTUHAN STOCK GUDANG"
    },
    {
        "transactionNumber": "5025307895",
        "materialCode": "202041211",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 0,
        "newBalance": 1,
        "transactionDate": "2023-08-25T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "KEBUTUHAN STOK GUDANG"
    },
    {
        "transactionNumber": "5025307895-2",
        "materialCode": "202041211",
        "transactionType": "GR",
        "quantity": 1,
        "previousBalance": 1,
        "newBalance": 2,
        "transactionDate": "2023-08-25T08:00:00.000Z",
        "referenceNumber": null,
        "remarks": "KEBUTUHAN STOK GUDANG"
    },
    {
        "transactionNumber": "4917104589",
        "materialCode": "202041211",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 2,
        "newBalance": 1,
        "transactionDate": "2024-11-07T08:00:00.000Z",
        "referenceNumber": "717653",
        "remarks": "52210055523"
    },
    {
        "transactionNumber": "4918283052",
        "materialCode": "202041211",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 1,
        "newBalance": 0,
        "transactionDate": "2025-05-14T08:00:00.000Z",
        "referenceNumber": "968391",
        "remarks": "52210062292"
    },
    {
        "transactionNumber": "5025309980",
        "materialCode": "202041211",
        "transactionType": "GR",
        "quantity": 3,
        "previousBalance": 0,
        "newBalance": 3,
        "transactionDate": "2025-11-22T08:00:00.000Z",
        "referenceNumber": "I522125112211044",
        "remarks": null
    },
    {
        "transactionNumber": "4919610485",
        "materialCode": "202041211",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 3,
        "newBalance": 2,
        "transactionDate": "2025-12-15T08:00:00.000Z",
        "referenceNumber": "1338314",
        "remarks": "52210071159"
    },
    {
        "transactionNumber": "4919829926",
        "materialCode": "202041211",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 2,
        "newBalance": 1,
        "transactionDate": "2026-01-21T08:00:00.000Z",
        "referenceNumber": "1401909",
        "remarks": "52210072204"
    },
    {
        "transactionNumber": "5025310370-2",
        "materialCode": "202041211",
        "transactionType": "GR",
        "quantity": 3,
        "previousBalance": 1,
        "newBalance": 4,
        "transactionDate": "2026-06-26T08:00:00.000Z",
        "referenceNumber": "I522126062614013",
        "remarks": null
    },
    {
        "transactionNumber": "4921503261",
        "materialCode": "202041211",
        "transactionType": "GI",
        "quantity": 1,
        "previousBalance": 4,
        "newBalance": 3,
        "transactionDate": "2026-10-16T08:00:00.000Z",
        "referenceNumber": "1903397",
        "remarks": "52210081847"
    }
];

  // Sinkronisasi dinamis jika History Q2.xlsx tersedia
  const historyPath = path.join(__dirname, "..", "History Q2.xlsx");
  if (fs.existsSync(historyPath)) {
    try {
      const hWorkbook = XLSX.readFile(historyPath);
      const hSheet = hWorkbook.Sheets[hWorkbook.SheetNames[0]];
      const hRaw = XLSX.utils.sheet_to_json(hSheet);
      if (hRaw.length > 0) {
        const txCounter = new Map();
        transactionsData = hRaw.map((r) => {
          const norm = {};
          for (const k of Object.keys(r)) norm[k.trim()] = r[k];

          const baseTxNum = String(norm.transactionNumber ?? "").trim();
          const seen = (txCounter.get(baseTxNum) || 0) + 1;
          txCounter.set(baseTxNum, seen);
          const transactionNumber = seen === 1 ? baseTxNum : `${baseTxNum}-${seen}`;

          const materialCode = String(norm.materialId ?? "").trim();
          const txType = String(norm.transactionType ?? "").trim().toUpperCase() === "GI" ? "GI" : "GR";
          const previousBalance = Number(norm.previousBalance ?? 0);
          const newBalance = Number(norm.newBalance ?? 0);

          let quantity = 1;
          const rawQty = norm.quantity;
          if (rawQty !== undefined && rawQty !== null && String(rawQty).trim() !== "" && String(rawQty).trim() !== "-") {
            const cleaned = String(rawQty).replace("-", "").trim();
            const parsed = parseFloat(cleaned);
            if (!isNaN(parsed) && parsed > 0) quantity = parsed;
          } else {
            const diff = Math.abs(newBalance - previousBalance);
            if (diff > 0) quantity = diff;
          }

          let transactionDate = new Date().toISOString();
          const rawDate = norm.transactionDate;
          if (rawDate instanceof Date) {
            transactionDate = rawDate.toISOString();
          } else if (typeof rawDate === "string") {
            const parts = rawDate.trim().split(".");
            if (parts.length === 3) {
              const day = parseInt(parts[0], 10);
              const month = parseInt(parts[1], 10) - 1;
              const year = parseInt(parts[2], 10);
              transactionDate = new Date(Date.UTC(year, month, day, 8, 0, 0)).toISOString();
            } else {
              const d = new Date(rawDate);
              if (!isNaN(d.getTime())) transactionDate = d.toISOString();
            }
          } else if (typeof rawDate === "number") {
            transactionDate = new Date((rawDate - (25567 + 2)) * 86400 * 1000).toISOString();
          }

          const rawRef = norm.referanceNumber ?? norm.referenceNumber;
          const referenceNumber =
            rawRef !== undefined && rawRef !== null && String(rawRef).trim() !== "" && String(rawRef).trim() !== "-"
              ? String(rawRef).trim()
              : null;

          const rawRemarks = norm.remarks;
          const remarks =
            rawRemarks !== undefined && rawRemarks !== null && String(rawRemarks).trim() !== "" && String(rawRemarks).trim() !== "-"
              ? String(rawRemarks).trim()
              : null;

          return {
            transactionNumber,
            materialCode,
            transactionType: txType,
            quantity,
            previousBalance,
            newBalance,
            transactionDate,
            referenceNumber,
            remarks,
          };
        });
        console.log(`✓ Terhubung dengan History Q2.xlsx (${transactionsData.length} transaksi GR/GI dibaca dinamis)`);
      }
    } catch (err) {
      console.warn("Membaca History Q2.xlsx gagal, menggunakan array fallback:", err.message);
    }
  }

  console.log(`⚡ Memproses dan menyimpan ${transactionsData.length} transaksi GR & GI beserta StockMovement...`);

  // Simpan transaksi dan stock movements secara batch atomik via Prisma transaction
  await prisma.$transaction(async (tx) => {
    const latestBalanceByMaterial = new Map();

    for (const t of transactionsData) {
      const materialId = materialIdMap.get(t.materialCode);
      if (!materialId) {
        console.warn(`Peringatan: Material ${t.materialCode} tidak ditemukan di database!`);
        continue;
      }

      const isGR = t.transactionType === "GR";
      const assignedUserId = isGR ? admin.id : petugas.id;
      const txDate = new Date(t.transactionDate);

      // Simpan transaksi dan relasi StockMovement
      await tx.transaction.create({
        data: {
          transactionNumber: t.transactionNumber,
          materialId: materialId,
          transactionType: t.transactionType,
          quantity: t.quantity,
          previousBalance: t.previousBalance,
          newBalance: t.newBalance,
          transactionDate: txDate,
          referenceNumber: t.referenceNumber,
          remarks: t.remarks,
          userId: assignedUserId,
          stockMovements: {
            create: {
              materialId: materialId,
              movementType: isGR ? "IN" : "OUT",
              quantityIn: isGR ? t.quantity : 0,
              quantityOut: !isGR ? t.quantity : 0,
              balance: t.newBalance,
              createdAt: txDate,
            },
          },
        },
      });

      // Catat saldo akhir transaksi terakhir untuk sinkronisasi saldo aktual
      latestBalanceByMaterial.set(materialId, t.newBalance);
    }

    // Update currentStock pada Material agar sinkron 100% dengan saldo akhir transaksi
    for (const [matId, finalBal] of latestBalanceByMaterial.entries()) {
      await tx.material.update({
        where: { id: matId },
        data: { currentStock: finalBal },
      });
    }
  }, {
    timeout: 60000,
  });

  console.log(`✓ ${transactionsData.length} Transaksi GR & GI serta StockMovement berhasil disimpan!`);

  // 5. Buat Audit Log
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: "INITIAL_SEED",
        entity: "Database",
        entityId: "SYSTEM",
        newValue: `Inisialisasi sistem: ${createdMaterials.length} material dari materialsdata.xlsx & ${transactionsData.length} transaksi GR/GI dari History Q2.xlsx`,
      },
      {
        userId: admin.id,
        action: "IMPORT_HISTORY",
        entity: "Transaction",
        entityId: "BATCH_Q2",
        newValue: `Import ${transactionsData.length} mutasi fisik barang (Goods Receipt & Goods Issue) dari History Q2.xlsx`,
      },
    ],
  });

  console.log("✓ Audit log inisialisasi berhasil dibuat!");
  console.log("==================================================================");
  console.log("🎉 SEEDING SELESAI SUKSES!");
  console.log(`Total Material Terdaftar: ${createdMaterials.length} item dari materialsdata.xlsx`);
  console.log(`Total Transaksi Tercatat: ${transactionsData.length} riwayat GR/GI dari History Q2.xlsx`);
  console.log("Format default qrToken : QR-<materialCode>");
  console.log("StockMovement           : movementType (IN/OUT), quantityIn, quantityOut, balance, createdAt");
  console.log("AKUN DEMO LOGIN:");
  console.log("1. Admin Gudang  : Username: admin   | Password: admin123");
  console.log("2. Petugas Gudang: Username: petugas | Password: petugas123");
  console.log("==================================================================");
}

main()
  .catch((e) => {
    console.error("❌ Error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
