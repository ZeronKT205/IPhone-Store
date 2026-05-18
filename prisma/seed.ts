import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function main() {
  console.log("🌱 Seeding database...");

  // ── Xóa dữ liệu cũ theo thứ tự FK ──────────────────────
  await prisma.warranty.deleteMany();
  await prisma.salesOrderItem.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.repairOrder.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.employee.deleteMany();

  // ── Danh mục sản phẩm ───────────────────────────────────
  const [catAccessory, catComponent] = await Promise.all([
    prisma.category.create({ data: { name: "Phụ kiện" } }),
    prisma.category.create({ data: { name: "Linh kiện" } }),
  ]);
  console.log("✓ 2 danh mục");

  // ── Nhân viên ────────────────────────────────────────────
  const employees = await Promise.all([
    prisma.employee.create({ data: {
      name: "Nguyễn Văn Hùng",
      phone: "0901 000 001",
      dateOfBirth: new Date("1995-03-15"),
      cccd: "079095001234",
      isActive: true,
    }}),
    prisma.employee.create({ data: {
      name: "Trần Thị Minh",
      phone: "0901 000 002",
      dateOfBirth: new Date("1998-07-22"),
      cccd: "079098002345",
      isActive: true,
    }}),
    prisma.employee.create({ data: {
      name: "Lê Quang Tùng",
      phone: "0901 000 003",
      dateOfBirth: new Date("1997-11-08"),
      cccd: "079097003456",
      isActive: true,
    }}),
    prisma.employee.create({ data: {
      name: "Phạm Thị Lan",
      phone: "0901 000 004",
      dateOfBirth: new Date("2000-01-30"),
      isActive: true,
    }}),
  ]);
  const [empHung, empMinh, empTung, empLan] = employees;
  console.log(`✓ ${employees.length} nhân viên`);

  // ── Khách hàng ───────────────────────────────────────────
  const customers = await Promise.all([
    prisma.customer.create({ data: { name: "Nguyễn Văn An", phone: "0901 111 222", address: "123 Nguyễn Huệ, Q.1, TP.HCM" } }),
    prisma.customer.create({ data: { name: "Trần Thị Bích", phone: "0922 333 444", address: "45 Lê Lợi, Q.3, TP.HCM" } }),
    prisma.customer.create({ data: { name: "Lê Thị Cúc", phone: "0933 555 666", address: "78 Đinh Tiên Hoàng, Q.Bình Thạnh, TP.HCM" } }),
    prisma.customer.create({ data: { name: "Phạm Văn Đức", phone: "0944 777 888", address: "12 Hoàng Văn Thụ, Q.Tân Bình, TP.HCM" } }),
    prisma.customer.create({ data: { name: "Hoàng Thị Em", phone: "0955 999 000", address: "99 Cộng Hòa, Q.Tân Bình, TP.HCM" } }),
  ]);
  const [cusAn, cusBich, cusCuc, cusDuc, cusEm] = customers;
  console.log(`✓ ${customers.length} khách hàng`);

  // ── Sản phẩm ─────────────────────────────────────────────
  const products = await Promise.all([
    prisma.product.create({ data: {
      name: "Màn hình iPhone 14 Pro (GX)",
      categoryId: catComponent.id, unit: "Cái",
      image: "/products/man_hinh_gx.png",
      costPrice: 850000, sellingPrice: 1200000,
      stockQuantity: 8, lowStockThreshold: 3,
    }}),
    prisma.product.create({ data: {
      name: "Pin Pisen iPhone 13",
      categoryId: catComponent.id, unit: "Cái",
      image: "/products/pin_pisen_iphone.png",
      costPrice: 180000, sellingPrice: 280000,
      stockQuantity: 15, lowStockThreshold: 5,
    }}),
    prisma.product.create({ data: {
      name: "Camera sau iPhone 12",
      categoryId: catComponent.id, unit: "Cái",
      image: "/products/camera_sau_iphone.png",
      costPrice: 350000, sellingPrice: 520000,
      stockQuantity: 6, lowStockThreshold: 3,
    }}),
    prisma.product.create({ data: {
      name: "Kính lưng iPhone 11",
      categoryId: catComponent.id, unit: "Cái",
      image: "/products/kinh_lung_iphone.png",
      costPrice: 120000, sellingPrice: 200000,
      stockQuantity: 20, lowStockThreshold: 5,
    }}),
    prisma.product.create({ data: {
      name: "Kính cường lực KingKong",
      categoryId: catAccessory.id, unit: "Cái",
      image: "/products/cuong_luc_kingkong.png",
      costPrice: 25000, sellingPrice: 60000,
      stockQuantity: 45, lowStockThreshold: 10,
    }}),
    prisma.product.create({ data: {
      name: "Ốp lưng silicon trong",
      categoryId: catAccessory.id, unit: "Cái",
      image: "/products/op_lung_silicon.png",
      costPrice: 20000, sellingPrice: 50000,
      stockQuantity: 38, lowStockThreshold: 10,
    }}),
    prisma.product.create({ data: {
      name: "Cáp sạc Apple Lightning",
      categoryId: catAccessory.id, unit: "Cái",
      image: "/products/cap_sac_apple.png",
      costPrice: 65000, sellingPrice: 120000,
      stockQuantity: 22, lowStockThreshold: 8,
    }}),
    prisma.product.create({ data: {
      name: "Củ sạc Anker 20W",
      categoryId: catAccessory.id, unit: "Cái",
      image: "/products/cu_sac_anker.png",
      costPrice: 150000, sellingPrice: 250000,
      stockQuantity: 4, lowStockThreshold: 5,
    }}),
  ]);
  const [manHinh, pin, camera, kinhLung, cuongLuc, opLung, capSac, cuSac] = products;
  console.log(`✓ ${products.length} sản phẩm`);

  // ── Đơn sửa chữa + Bảo hành ──────────────────────────────
  const repairData = [
    { code: "SC-20260510-001", name: "Lý Thị Kim", phone: "0912 345 678", desc: "iPhone 14 Pro – Hỏng chân sạc, không nhận sạc", fee: 250000, daysAgoCreated: 8, daysAgoCompleted: 7, warranty: { days: 180, notes: "Bảo hành 6 tháng chân sạc" } },
    { code: "SC-20260511-001", name: "Đặng Văn Long", phone: "0934 567 890", desc: "iPad Pro 11 – Vỡ kính lung sau, vết nứt do va đập mạnh từ góc phải", fee: 380000, daysAgoCreated: 7, daysAgoCompleted: 6, warranty: { days: 90, notes: "Bảo hành 3 tháng kính lưng" } },
    { code: "SC-20260511-002", name: "Mai Thị Minh", phone: "0965 432 109", desc: "Xiaomi Redmi Note 11 – Camera sau bị mờ, ảnh không nét", fee: 520000, daysAgoCreated: 7, daysAgoCompleted: 6, warranty: { days: 90, notes: "Bảo hành 3 tháng camera" } },
    { code: "SC-20260512-001", name: "Hồ Văn Nam", phone: "0976 543 210", desc: "iPhone 12 – Loa trong nghe nhỏ, tiếng rè khi nghe gọi điện", fee: 180000, daysAgoCreated: 6, daysAgoCompleted: 5, warranty: { days: 60, notes: "Bảo hành 2 tháng loa" } },
    { code: "SC-20260512-002", name: "Trịnh Thị Oanh", phone: "0943 210 987", desc: "Samsung Galaxy A53 – Hỏng nút nguồn vật lý, bấm không ăn", fee: 150000, daysAgoCreated: 6, daysAgoCompleted: 5, warranty: { days: 90, notes: "Bảo hành 3 tháng nút nguồn" } },
    { code: "SC-20260513-001", name: "Trương Văn Phúc", phone: "0921 098 765", desc: "iPhone 11 – Lỗi FaceID không thiết lập được sau khi thay màn hình", fee: 450000, daysAgoCreated: 5, daysAgoCompleted: 4, warranty: { days: 180, notes: "Bảo hành 6 tháng FaceID và màn hình" } },
    { code: "SC-20260513-002", name: "Vương Thị Quỳnh", phone: "0954 321 098", desc: "Apple Watch S7 – Máy bị vào nước, màn hình mờ và pin hao nhanh", fee: 650000, daysAgoCreated: 5, daysAgoCompleted: 4, warranty: { days: 30, notes: "Bảo hành 30 ngày, không áp dụng nếu tiếp xúc nước lần nữa" } },
    { code: "SC-20260514-001", name: "Lâm Văn Rạng", phone: "0909 808 707", desc: "Oppo Reno 7 – Hỏng IC sóng điện thoại, mất sóng liên tục", fee: 820000, daysAgoCreated: 4, daysAgoCompleted: 3, warranty: { days: 90, notes: "Bảo hành 3 tháng IC sóng" } },
    { code: "SC-20260401-001", name: "Bùi Thị Sen", phone: "0888 111 222", desc: "iPhone X – Thay màn hình bị vỡ do rớt", fee: 950000, daysAgoCreated: 47, daysAgoCompleted: 46, warranty: { days: 30, notes: "Bảo hành 30 ngày" } },
    { code: "SC-20260415-001", name: "Nguyễn Minh Tuấn", phone: "0777 333 444", desc: "Samsung S22 – Thay pin phồng", fee: 350000, daysAgoCreated: 33, daysAgoCompleted: 32, warranty: { days: 7, notes: "Bảo hành 7 ngày pin" } },
    { code: "SC-20260516-001", name: "Phạm Quốc Bảo", phone: "0901 234 567", desc: "iPhone 15 – Màn hình bị sọc ngang, cảm ứng giật lag ở 1/3 trên", fee: 0, daysAgoCreated: 2 },
    { code: "SC-20260516-002", name: "Trần Thị Cẩm", phone: "0912 876 543", desc: "OPPO A78 – Loa ngoài không có âm thanh sau khi bị rơi", fee: 0, daysAgoCreated: 2 },
    { code: "SC-20260517-001", name: "Lê Hoàng Dũng", phone: "0966 555 444", desc: "Xiaomi 13 Lite – Pin tụt nhanh, dùng được 2 tiếng là hết pin dù mới thay 3 tháng trước", fee: 280000, daysAgoCreated: 1 },
    { code: "SC-20260517-002", name: "Võ Thị Gia Hân", phone: "0977 666 888", desc: "Samsung A34 – Không kết nối được Wifi, icon Wifi bị xám và không bật lên được", fee: 0, daysAgoCreated: 1 },
    { code: "SC-20260518-001", name: "Huỳnh Văn Khoa", phone: "0933 777 999", desc: "iPhone 13 – Thay kính lưng bị vỡ, cần lấy trong ngày", fee: 200000, daysAgoCreated: 0 },
  ];

  for (const r of repairData) {
    const isCompleted = !!r.daysAgoCompleted;
    const createdAt = daysAgo(r.daysAgoCreated);
    const completedAt = isCompleted ? daysAgo(r.daysAgoCompleted!) : null;
    const order = await prisma.repairOrder.create({
      data: { orderCode: r.code, customerName: r.name, phoneNumber: r.phone, description: r.desc, repairFee: r.fee, status: isCompleted ? "COMPLETED" : "IN_PROGRESS", createdAt, completedAt },
    });
    if (isCompleted && r.warranty && completedAt) {
      await prisma.warranty.create({
        data: { repairOrderId: order.id, startDate: completedAt, expiryDate: new Date(completedAt.getTime() + r.warranty.days * 86400000), notes: r.warranty.notes },
      });
    }
  }
  console.log(`✓ ${repairData.length} đơn sửa chữa`);

  // ── Đơn bán hàng ─────────────────────────────────────────
  const salesData = [
    { code: "SO-20260510-001", type: "COUNTER", status: "COUNTER_SALE", payment: "CASH", daysAgoCreated: 8, items: [{ p: cuongLuc, qty: 2 }, { p: opLung, qty: 1 }] },
    { code: "SO-20260511-001", type: "COUNTER", status: "COUNTER_SALE", payment: "BANK_TRANSFER", daysAgoCreated: 7, items: [{ p: capSac, qty: 1 }, { p: cuSac, qty: 1 }] },
    { code: "SO-20260512-001", type: "COUNTER", status: "COUNTER_SALE", payment: "CASH", daysAgoCreated: 6, items: [{ p: pin, qty: 1 }] },
    { code: "SO-20260513-001", type: "COUNTER", status: "COUNTER_SALE", payment: "CASH", daysAgoCreated: 5, items: [{ p: cuongLuc, qty: 3 }, { p: capSac, qty: 2 }] },
    { code: "SO-20260514-001", type: "COUNTER", status: "COUNTER_SALE", payment: "BANK_TRANSFER", daysAgoCreated: 4, items: [{ p: manHinh, qty: 1 }] },
    {
      code: "SO-20260511-002", type: "DELIVERY", status: "DELIVERED", payment: "CASH", daysAgoCreated: 7,
      customer: cusAn, employee: empHung,
      address: cusAn.address, items: [{ p: opLung, qty: 2 }, { p: cuongLuc, qty: 1 }],
    },
    {
      code: "SO-20260513-002", type: "DELIVERY", status: "DELIVERED", payment: "BANK_TRANSFER", daysAgoCreated: 5,
      customer: cusBich, employee: empMinh,
      address: cusBich.address, items: [{ p: camera, qty: 1 }],
    },
    {
      code: "SO-20260517-001", type: "DELIVERY", status: "PROCESSING", daysAgoCreated: 1,
      customer: cusCuc, employee: empTung,
      address: cusCuc.address, items: [{ p: capSac, qty: 1 }, { p: cuSac, qty: 1 }],
    },
    {
      code: "SO-20260518-001", type: "DELIVERY", status: "PROCESSING", daysAgoCreated: 0,
      customer: cusDuc, employee: empLan,
      address: cusDuc.address, items: [{ p: pin, qty: 1 }, { p: kinhLung, qty: 2 }],
    },
    {
      code: "SO-20260509-001", type: "DELIVERY", status: "CANCELLED", daysAgoCreated: 9,
      customer: cusEm, employee: empHung,
      address: cusEm.address, items: [{ p: manHinh, qty: 1 }],
    },
  ];

  for (const s of salesData as any[]) {
    const itemsData = s.items.map((i: any) => ({ productId: i.p.id, productName: i.p.name, quantity: i.qty, unitPrice: i.p.sellingPrice }));
    const total = s.items.reduce((sum: number, i: any) => sum + i.p.sellingPrice * i.qty, 0);
    const createdAt = daysAgo(s.daysAgoCreated);
    await prisma.salesOrder.create({
      data: {
        orderCode: s.code,
        orderType: s.type,
        status: s.status,
        paymentMethod: s.payment ?? null,
        totalAmount: total,
        customerName: s.customer?.name ?? null,
        customerPhone: s.customer?.phone ?? null,
        deliveryAddress: s.address ?? null,
        deliveryPerson: s.employee?.name ?? null,
        customerId: s.customer?.id ?? null,
        employeeId: s.employee?.id ?? null,
        createdAt,
        completedAt: ["COUNTER_SALE", "DELIVERED"].includes(s.status) ? createdAt : null,
        items: { create: itemsData },
      },
    });
  }
  console.log(`✓ ${salesData.length} đơn bán hàng`);

  const warrantyCount = await prisma.warranty.count();
  console.log(`✓ ${warrantyCount} phiếu bảo hành`);
  console.log("✅ Seed hoàn tất!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
