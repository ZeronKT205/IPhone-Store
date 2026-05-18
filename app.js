// ==================== APP INITIAL STATE & DATA ====================

// 8 curated premium products with custom generated images
const products = [
  {
    id: "prod-1",
    name: "Kính cường lực KingKong iPhone 15 Pro Max",
    code: "SP0001",
    category: "ACCESSORY",
    unit: "Cái",
    costPrice: 25000,
    sellingPrice: 50000,
    stockQuantity: 45,
    lowStockThreshold: 5,
    isActive: true,
    image: "images/cuong_luc_kingkong.png"
  },
  {
    id: "prod-2",
    name: "Củ sạc nhanh Anker 20W PowerPort",
    code: "SP0002",
    category: "ACCESSORY",
    unit: "Cái",
    costPrice: 120000,
    sellingPrice: 250000,
    stockQuantity: 18,
    lowStockThreshold: 5,
    isActive: true,
    image: "images/cu_sac_anker.png"
  },
  {
    id: "prod-3",
    name: "Cáp sạc nhanh Type-C to Lightning Apple",
    code: "SP0003",
    category: "ACCESSORY",
    unit: "Cái",
    costPrice: 150000,
    sellingPrice: 350000,
    stockQuantity: 3,
    lowStockThreshold: 5,
    isActive: true,
    image: "images/cap_sac_apple.png"
  },
  {
    id: "prod-4",
    name: "Ốp lưng Silicon MagSafe iPhone 15 Clear",
    code: "SP0004",
    category: "ACCESSORY",
    unit: "Cái",
    costPrice: 90000,
    sellingPrice: 180000,
    stockQuantity: 24,
    lowStockThreshold: 5,
    isActive: true,
    image: "images/op_lung_silicon.png"
  },
  {
    id: "prod-5",
    name: "Pin dung lượng cao Pisen iPhone 11 Pro Max",
    code: "LK0001",
    category: "COMPONENT",
    unit: "Cái",
    costPrice: 380000,
    sellingPrice: 650000,
    stockQuantity: 12,
    lowStockThreshold: 5,
    isActive: true,
    image: "images/pin_pisen_iphone.png"
  },
  {
    id: "prod-6",
    name: "Màn hình OLED thương hiệu GX iPhone 12 Pro",
    code: "LK0002",
    category: "COMPONENT",
    unit: "Cái",
    costPrice: 1450000,
    sellingPrice: 2200000,
    stockQuantity: 2,
    lowStockThreshold: 5,
    isActive: true,
    image: "images/man_hinh_gx.png"
  },
  {
    id: "prod-7",
    name: "Cụm Camera sau zin bóc máy iPhone 13",
    code: "LK0003",
    category: "COMPONENT",
    unit: "Cái",
    costPrice: 1850000,
    sellingPrice: 2800000,
    stockQuantity: 4,
    lowStockThreshold: 5,
    isActive: true,
    image: "images/camera_sau_iphone.png"
  },
  {
    id: "prod-8",
    name: "Kính lưng nhám zin New iPhone 14 Pro Max",
    code: "LK0004",
    category: "COMPONENT",
    unit: "Cái",
    costPrice: 220000,
    sellingPrice: 450000,
    stockQuantity: 7,
    lowStockThreshold: 5,
    isActive: true,
    image: "images/kinh_lung_iphone.png"
  }
];

// ==================== REPAIR ORDERS MOCK DATA ====================
const customerNames = [
  "Nguyễn Văn A", "Trần Thị B", "Lê Hoàng Nam", "Phạm Minh C", "Vũ Thị D", 
  "Hoàng Văn E", "Phan Thanh F", "Đỗ Thị G", "Bùi Văn H", "Ngô Thị I",
  "Dương Văn J", "Lý Thị K", "Đặng Văn L", "Mai Thị M", "Hồ Văn N",
  "Trịnh Thị O", "Trương Văn P", "Vương Thị Q", "Lâm Văn R", "Phùng Thị S",
  "Tống Văn T", "Diệp Thị U", "Hà Văn V", "Tăng Thị W", "Quách Văn X", "Thái Thị Y"
];
const phonePool = [
  "0901 234 567", "0987 654 321", "0912 345 678", "0934 567 890", "0965 432 109",
  "0976 543 210", "0943 210 987", "0921 098 765", "0954 321 098", "0909 808 707"
];
const devicePool = [
  "iPhone 13 Pro Max", "Samsung Galaxy S22", "iPhone 14 Pro", "iPad Pro 11", "Xiaomi Redmi Note 11",
  "iPhone 12", "Samsung Galaxy A53", "iPhone 11", "Apple Watch S7", "Oppo Reno 7"
];
const issuePool = [
  "Màn hình bị vỡ, cảm ứng không nhạy", "Pin chai phồng, máy nhanh nóng", "Hỏng chân sạc, cắm lúc nhận lúc không", 
  "Vỡ kính lưng sau va đập mạnh", "Camera sau bị mờ, không lấy nét được", "Loa trong nghe nhỏ, rè rè khó chịu",
  "Hỏng nút nguồn vật lý", "Lỗi FaceID không thiết lập được", "Máy bị vào nước, mất nguồn", "Hỏng IC sóng điện thoại"
];
const techPool = [
  "Trần Văn Tú", "Nguyễn Công Thành", "Lê Minh Hoàng", "Phạm Quốc Tuấn"
];

const repairOrders = [];
// Generate exactly 26 repair orders: 10 Đang sửa, 16 Hoàn thành
for (let i = 1; i <= 26; i++) {
  const isCompleted = i > 10;
  const status = isCompleted ? "COMPLETED" : "IN_PROGRESS";
  const dateOffset = Math.floor((26 - i) / 2);
  const date = new Date(Date.now() - dateOffset * 24 * 60 * 60 * 1000 - i * 15 * 60 * 1000);
  const formattedDate = date.toLocaleDateString("vi-VN") + " " + date.toTimeString().slice(0, 5);
  
  repairOrders.push({
    id: `rep-${i}`,
    code: `SC-2405${String(Math.floor(i / 10) + 1)}${String(i % 10).padStart(2, '0')}`,
    customerName: customerNames[i - 1] || `Khách hàng ${i}`,
    phone: phonePool[i % phonePool.length],
    device: devicePool[i % devicePool.length],
    description: issuePool[i % issuePool.length],
    status: status,
    dateReceived: formattedDate,
    notes: i % 4 === 0 ? "Khách quen" : "",
    completedDate: isCompleted ? new Date(date.getTime() + 4 * 60 * 60 * 1000).toLocaleDateString("vi-VN") + " " + new Date(date.getTime() + 4 * 60 * 60 * 1000).toTimeString().slice(0, 5) : "-",
    repairFee: 800000 + (i * 50000),
    warrantyMonths: i % 3 === 0 ? 6 : 3,
    assignee: techPool[i % techPool.length]
  });
}

// ==================== SALES ORDERS MOCK DATA ====================
const salesOrders = [];
// Generate exactly 28 sales orders: 18 Bán tại quầy, 10 Giao hàng
for (let i = 1; i <= 28; i++) {
  let type = "COUNTER";
  if (i <= 10) {
    type = "DELIVERY";
  }
  
  let status = "COUNTER_SALE";
  if (type === "DELIVERY") {
    status = (i % 2 === 0) ? "DELIVERED" : "PROCESSING";
  } else {
    status = "COUNTER_SALE";
  }
  
  const dateOffset = Math.floor((28 - i) / 2);
  const date = new Date(Date.now() - dateOffset * 24 * 60 * 60 * 1000 - i * 20 * 60 * 1000);
  const formattedDate = date.toLocaleDateString("vi-VN") + " " + date.toTimeString().slice(0, 5);
  
  salesOrders.push({
    id: `sale-${i}`,
    code: `DH-2405${String(Math.floor(i / 10) + 1)}${String(i % 10).padStart(2, '0')}`,
    customerName: i % 4 === 0 ? customerNames[i % customerNames.length] : "Khách lẻ",
    type: type,
    status: status,
    totalAmount: 120000 + (i * 35000),
    dateCreated: formattedDate
  });
}

// ==================== WARRANTY MOCK DATA ====================
const warranties = [];
// Generate exactly 20 warranties: 12 Còn bảo hành, 8 Hết hạn
for (let i = 1; i <= 20; i++) {
  const isActive = i <= 12;
  const status = isActive ? "ACTIVE" : "EXPIRED";
  const repair = repairOrders[10 + (i % 16)];
  
  const compDate = repair.dateReceived.split(" ")[0];
  const parts = compDate.split("/");
  const compDateObj = new Date(parts[2], parts[1] - 1, parts[0]);
  
  const expDateObj = new Date(compDateObj);
  expDateObj.setMonth(expDateObj.getMonth() + repair.warrantyMonths);
  const expiredDateStr = expDateObj.toLocaleDateString("vi-VN");
  
  warranties.push({
    id: `war-${i}`,
    code: repair.code,
    customerName: repair.customerName,
    phone: repair.phone,
    content: `${repair.device} - ${repair.description.split(",")[0]}`,
    completedDate: repair.completedDate,
    expiryDate: expiredDateStr,
    status: status
  });
}

// ==================== STATE MANAGEMENT ====================
let currentPage = 1;
let pageSize = 20;
let filteredProducts = [...products];
let activeSection = "kho-hang";
let currentFilters = {
  search: "",
  type: "",
  category: "",
  stockStatus: ""
};

// Sub tab & Filter States
let repairTab = "all";
let repairPage = 1;
let repairPageSize = 20;
let filteredRepairs = [...repairOrders];
let repairFilters = {
  search: "",
  status: "",
  fromDate: "",
  toDate: ""
};

let salesTab = "all";
let salesPage = 1;
let salesPageSize = 20;
let filteredSales = [...salesOrders];
let salesFilters = {
  search: "",
  status: "",
  type: "",
  fromDate: "",
  toDate: ""
};

let warrantyPage = 1;
let warrantyPageSize = 20;
let filteredWarranties = [...warranties];
let warrantySearchQuery = "";
let selectedRepairOrder = null;


// ==================== DOM ELEMENTS ====================
const elements = {
  // Navigation
  menuItems: document.querySelectorAll(".menu-item"),
  sections: document.querySelectorAll(".content-section"),
  pageTitle: document.getElementById("page-title"),
  pageSubtitle: document.getElementById("page-subtitle"),
  
  // Statistics
  statTotalProducts: document.getElementById("stat-total-products"),
  statTotalStock: document.getElementById("stat-total-stock"),
  statLowStock: document.getElementById("stat-low-stock"),
  statValuation: document.getElementById("stat-valuation"),
  cardLowStock: document.getElementById("card-low-stock"),
  
  // Filters
  inputSearch: document.getElementById("input-search"),
  selectType: document.getElementById("select-type"),
  selectCategory: document.getElementById("select-category"),
  selectStockStatus: document.getElementById("select-stock-status"),
  btnApplyFilters: document.getElementById("btn-apply-filters"),
  btnResetFilters: document.getElementById("btn-reset-filters"),
  activeFiltersBadges: document.getElementById("active-filters-badges"),
  filterBadgesList: document.getElementById("filter-badges-list"),
  
  // Table
  tableBody: document.getElementById("product-cards-grid"),
  emptyState: document.getElementById("table-empty-state"),
  
  // Pagination
  paginationSummary: document.getElementById("pagination-summary"),
  selectPageSize: document.getElementById("select-page-size"),
  paginationButtons: document.getElementById("pagination-buttons"),
  
  // Action Buttons
  btnImportStock: document.getElementById("btn-import-stock"),
  btnExportFile: document.getElementById("btn-export-file"),
  btnAddProduct: document.getElementById("btn-add-product"),
  
  // Modals & Forms
  productModal: document.getElementById("product-modal"),
  productForm: document.getElementById("product-form"),
  modalProductTitle: document.getElementById("modal-product-title"),
  inputProductId: document.getElementById("input-product-id"),
  inputName: document.getElementById("input-name"),
  inputCategory: document.getElementById("input-category"),
  inputUnit: document.getElementById("input-unit"),
  inputCostPrice: document.getElementById("input-cost-price"),
  inputSellingPrice: document.getElementById("input-selling-price"),
  inputStockQuantity: document.getElementById("input-stock-quantity"),
  inputLowStockThreshold: document.getElementById("input-low-stock-threshold"),
  btnCancelProductModal: document.getElementById("btn-cancel-product-modal"),
  btnCloseProductModal: document.getElementById("btn-close-product-modal"),
  
  // Quick Import Modal
  importStockModal: document.getElementById("import-stock-modal"),
  importStockForm: document.getElementById("import-stock-form"),
  importProductSelect: document.getElementById("import-product-select"),
  importQuantity: document.getElementById("import-quantity"),
  btnCancelImportModal: document.getElementById("btn-cancel-import-modal"),
  btnCloseImportModal: document.getElementById("btn-close-import-modal"),
  
  // Dropdowns / Bells
  notificationBell: document.getElementById("notification-bell"),
  notificationPopover: document.getElementById("notification-popover"),
  alertCount: document.getElementById("alert-count"),
  alertList: document.getElementById("alert-list"),
  btnClearAlerts: document.getElementById("btn-clear-alerts"),
  
  userProfileMenu: document.getElementById("user-profile-menu"),
  profilePopover: document.getElementById("profile-popover"),
  menuLogoutItem: document.getElementById("menu-logout-item"),
  btnLogout: document.getElementById("btn-logout"),
  
  // Toasts
  toastContainer: document.getElementById("toast-container"),

  // Repair Section Elements
  repairTableBody: document.getElementById("repair-table-body"),
  repairEmptyState: document.getElementById("repair-empty-state"),
  repairPaginationSummary: document.getElementById("repair-pagination-summary"),
  repairPaginationButtons: document.getElementById("repair-pagination-buttons"),
  selectRepairPageSize: document.getElementById("select-repair-page-size"),
  btnCreateRepairOrder: document.getElementById("btn-create-repair-order"),
  inputRepairSearch: document.getElementById("input-repair-search"),
  selectRepairStatus: document.getElementById("select-repair-status"),
  inputRepairFromDate: document.getElementById("input-repair-from-date"),
  inputRepairToDate: document.getElementById("input-repair-to-date"),
  btnApplyRepairFilters: document.getElementById("btn-apply-repair-filters"),
  btnResetRepairFilters: document.getElementById("btn-reset-repair-filters"),
  repairTabs: document.getElementById("repair-tabs"),

  // Sales Section Elements
  salesTableBody: document.getElementById("sales-table-body"),
  salesEmptyState: document.getElementById("sales-empty-state"),
  salesPaginationSummary: document.getElementById("sales-pagination-summary"),
  salesPaginationButtons: document.getElementById("sales-pagination-buttons"),
  selectSalesPageSize: document.getElementById("select-sales-page-size"),
  btnCreateSalesOrder: document.getElementById("btn-create-sales-order"),
  inputSalesSearch: document.getElementById("input-sales-search"),
  selectSalesStatus: document.getElementById("select-sales-status"),
  selectSalesType: document.getElementById("select-sales-type"),
  inputSalesFromDate: document.getElementById("input-sales-from-date"),
  inputSalesToDate: document.getElementById("input-sales-to-date"),
  btnApplySalesFilters: document.getElementById("btn-apply-sales-filters"),
  btnResetSalesFilters: document.getElementById("btn-reset-sales-filters"),
  salesTabs: document.getElementById("sales-tabs"),

  // Warranty Section Elements
  warrantyTableBody: document.getElementById("warranty-table-body"),
  warrantyEmptyState: document.getElementById("warranty-empty-state"),
  warrantyPaginationSummary: document.getElementById("warranty-pagination-summary"),
  warrantyPaginationButtons: document.getElementById("warranty-pagination-buttons"),
  selectWarrantyPageSize: document.getElementById("select-warranty-page-size"),
  inputWarrantySearch: document.getElementById("input-warranty-search"),
  btnWarrantySearch: document.getElementById("btn-warranty-search"),
  statWarrantyActive: document.getElementById("stat-warranty-active"),
  statWarrantyExpired: document.getElementById("stat-warranty-expired"),
  statWarrantyTotal: document.getElementById("stat-warranty-total"),

  // Detail Repair Section Elements
  sectionChiTietDonSua: document.getElementById("section-chi-tiet-don-sua"),
  sectionDonSuaChua: document.getElementById("section-don-sua-chua"),
  breadcrumbRepairList: document.getElementById("breadcrumb-repair-list"),
  detailBreadcrumbCode: document.getElementById("detail-breadcrumb-code"),
  btnDetailPrint: document.getElementById("btn-detail-print"),
  btnDetailEdit: document.getElementById("btn-detail-edit"),
  detailCustomerName: document.getElementById("detail-customer-name"),
  detailCustomerPhone: document.getElementById("detail-customer-phone"),
  detailCustomerNotes: document.getElementById("detail-customer-notes"),
  detailDeviceName: document.getElementById("detail-device-name"),
  detailDeviceStatus: document.getElementById("detail-device-status"),
  detailDeviceAccessories: document.getElementById("detail-device-accessories"),
  detailOrderCode: document.getElementById("detail-order-code"),
  detailOrderDate: document.getElementById("detail-order-date"),
  detailOrderStatusBadge: document.getElementById("detail-order-status-badge"),
  detailOrderAssignee: document.getElementById("detail-order-assignee"),
  detailRepairFee: document.getElementById("detail-repair-fee"),
  detailWarrantyMonths: document.getElementById("detail-warranty-months"),
  detailCompletedDate: document.getElementById("detail-completed-date"),
  detailTotalAmount: document.getElementById("detail-total-amount"),
  btnDetailCancel: document.getElementById("btn-detail-cancel"),
  btnDetailSaveTemp: document.getElementById("btn-detail-save-temp"),
  btnDetailMarkComplete: document.getElementById("btn-detail-mark-complete"),
  btnEditRepairFee: document.getElementById("btn-edit-repair-fee")
};

// ==================== HELPERS & FORMATTING ====================

// Format money: 25000 -> 25.000đ
function formatCurrency(number) {
  if (number === null || number === undefined) return "---";
  return number.toLocaleString("vi-VN") + "đ";
}

// Format thousands separator: 1245 -> 1.245
function formatNumber(number) {
  if (number === null || number === undefined) return "0";
  return number.toLocaleString("vi-VN");
}

// Toast Notifications System
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let iconName = "check-circle";
  if (type === "error") iconName = "alert-circle";
  if (type === "warning") iconName = "alert-triangle";
  
  toast.innerHTML = `
    <i data-lucide="${iconName}"></i>
    <div class="toast-content">${message}</div>
  `;
  
  elements.toastContainer.appendChild(toast);
  lucide.createIcons();
  
  // Slide in effect handled by CSS animation, automatically remove after 3s
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(50px) scale(0.9)";
    setTimeout(() => {
      toast.remove();
    }, 250);
  }, 3000);
}

// ==================== DYNAMIC CALCULATIONS (METRICS) ====================

function updateMetrics() {
  const totalSKU = products.length;
  
  let totalStock = 0;
  let lowStockCount = 0;
  let totalValuation = 0;
  
  products.forEach(p => {
    totalStock += p.stockQuantity;
    totalValuation += p.stockQuantity * (p.costPrice || 0);
    
    // Low stock logic: 1 <= stock <= threshold
    if (p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold) {
      lowStockCount++;
    }
  });
  
  elements.statTotalProducts.textContent = formatNumber(totalSKU);
  elements.statTotalStock.textContent = formatNumber(totalStock);
  elements.statLowStock.textContent = formatNumber(lowStockCount);
  elements.statValuation.textContent = formatCurrency(totalValuation).replace("đ", "") + "đ";
  
  // Update Notification Popover Alerts
  updateAlertsDropdown();
}

function updateAlertsDropdown() {
  const lowStockProducts = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold);
  if (elements.alertCount) {
    elements.alertCount.textContent = lowStockProducts.length;
    if (lowStockProducts.length === 0) {
      elements.alertCount.style.display = "none";
      if (elements.alertList) {
        elements.alertList.innerHTML = `<li class="popover-item-empty">Không có cảnh báo tồn kho</li>`;
      }
      return;
    }
    elements.alertCount.style.display = "flex";
  }
  
  if (elements.alertList) {
    let html = "";
    // Show up to 5 alerts
    lowStockProducts.slice(0, 5).forEach(p => {
      const isCritical = p.stockQuantity <= 2;
      html += `
        <li class="popover-item ${isCritical ? 'critical' : ''}">
          <div class="popover-item-icon">
            <i data-lucide="alert-triangle"></i>
          </div>
          <div class="popover-item-content">
            <h4>${p.name}</h4>
            <p>Mã: <strong>${p.code}</strong>. Còn tồn: <strong class="text-danger">${p.stockQuantity}</strong> ${p.unit} (Ngưỡng: ${p.lowStockThreshold})</p>
          </div>
        </li>
      `;
    });
    
    if (lowStockProducts.length > 5) {
      html += `
        <li class="popover-item-empty" style="padding: 10px; font-weight: 500;">
          Và ${lowStockProducts.length - 5} cảnh báo khác...
        </li>
      `;
    }
    
    elements.alertList.innerHTML = html;
    lucide.createIcons();
  }
}

// ==================== RENDERING PRODUCT DATA TABLE ====================

function renderTable() {
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredProducts.length);
  const pageProducts = filteredProducts.slice(startIndex, endIndex);
  
  if (filteredProducts.length === 0) {
    elements.tableBody.innerHTML = "";
    elements.emptyState.style.display = "flex";
    elements.paginationSummary.textContent = "Hiển thị 0 - 0 của 0 sản phẩm";
    renderPaginationButtons(0);
    return;
  }
  
  elements.emptyState.style.display = "none";
  
  let html = "";
  pageProducts.forEach((p) => {
    // Stock styling
    let stockClass = "stock-sufficient";
    let stockLabelClass = "text-success";
    if (p.stockQuantity === 0) {
      stockClass = "stock-out";
      stockLabelClass = "text-danger";
    } else if (p.stockQuantity <= p.lowStockThreshold) {
      stockClass = "stock-warning";
      stockLabelClass = "text-warning";
    }
    
    // Category Badge
    const categoryBadge = p.category === "ACCESSORY" 
      ? '<span class="card-badge-type bg-accessory">Phụ kiện</span>' 
      : '<span class="card-badge-type bg-component">Linh kiện</span>';
    
    html += `
      <div class="product-card-item">
        ${categoryBadge}
        
        <div class="product-card-image-wrapper">
          <img src="${p.image || 'images/placeholder.png'}" class="product-card-image" alt="${p.name}">
        </div>
        
        <span class="product-code">${p.code}</span>
        <h3 class="product-title" title="${p.name}">${p.name}</h3>
        
        <div class="price-row">
          <span class="price-label">Giá nhập:</span>
          <span class="price-value">${formatCurrency(p.costPrice)}</span>
        </div>
        
        <div class="price-row">
          <span class="price-label">Giá bán:</span>
          <span class="price-value selling">${formatCurrency(p.sellingPrice)}</span>
        </div>
        
        <div class="price-row">
          <span class="price-label">Đơn vị:</span>
          <span class="price-value">${p.unit}</span>
        </div>

        <div class="price-row">
          <span class="price-label">Giá trị tồn:</span>
          <span class="price-value font-weight-700">${formatCurrency(p.stockQuantity * (p.costPrice || 0))}</span>
        </div>
        
        <div class="stock-row">
          <div class="stock-info">
            <i data-lucide="boxes" style="width: 16px; height: 16px;"></i>
            <span class="${stockLabelClass}">Tồn: ${formatNumber(p.stockQuantity)}</span>
          </div>
          <span class="text-muted" style="font-size: 11px;">Cảnh báo: ≤ ${p.lowStockThreshold}</span>
        </div>
        
        <div class="card-actions">
          <button class="btn btn-outline-blue btn-sm" onclick="openEditProductModal('${p.id}')">
            <i data-lucide="edit-3" style="width: 14px; height: 14px; margin-right: 4px;"></i> Sửa
          </button>
          <button class="btn btn-primary btn-sm" onclick="openQuickImportModal('${p.id}')">
            <i data-lucide="plus-circle" style="width: 14px; height: 14px; margin-right: 4px;"></i> Nhập kho
          </button>
        </div>
      </div>
    `;
  });
  
  elements.tableBody.innerHTML = html;
  lucide.createIcons();
  
  // Update pagination summary
  const displayStart = filteredProducts.length > 0 ? startIndex + 1 : 0;
  elements.paginationSummary.textContent = `Hiển thị ${displayStart} - ${endIndex} của ${formatNumber(filteredProducts.length)} sản phẩm`;
  
  // Render pagination buttons
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  renderPaginationButtons(totalPages);
}

// Generate pagination page numbers matching: Left chevron, 1, 2, 3... Right chevron
function renderPaginationButtons(totalPages) {
  if (totalPages <= 1) {
    elements.paginationButtons.innerHTML = "";
    return;
  }
  
  let html = "";
  
  // Previous button
  html += `
    <button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
      <i data-lucide="chevron-left"></i>
    </button>
  `;
  
  // Helper to append page button
  const appendBtn = (pageNum) => {
    html += `
      <button class="page-btn ${currentPage === pageNum ? 'active' : ''}" onclick="changePage(${pageNum})">
        ${pageNum}
      </button>
    `;
  };
  
  // Show page items smartly
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      appendBtn(i);
    }
  } else {
    // Large page count
    if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) {
        appendBtn(i);
      }
      html += `<span class="page-dots">...</span>`;
      appendBtn(totalPages);
    } else if (currentPage >= totalPages - 3) {
      appendBtn(1);
      html += `<span class="page-dots">...</span>`;
      for (let i = totalPages - 4; i <= totalPages; i++) {
        appendBtn(i);
      }
    } else {
      appendBtn(1);
      html += `<span class="page-dots">...</span>`;
      appendBtn(currentPage - 1);
      appendBtn(currentPage);
      appendBtn(currentPage + 1);
      html += `<span class="page-dots">...</span>`;
      appendBtn(totalPages);
    }
  }
  
  // Next button
  html += `
    <button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
      <i data-lucide="chevron-right"></i>
    </button>
  `;
  
  elements.paginationButtons.innerHTML = html;
  lucide.createIcons();
}

window.changePage = function(pageNum) {
  currentPage = pageNum;
  renderTable();
  // Scroll table into view smoothly
  elements.tableBody.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

// ==================== FILTERING LOGIC ====================

function applyFilters() {
  const query = currentFilters.search.toLowerCase().trim();
  const type = currentFilters.type;
  const category = currentFilters.category;
  const stockStatus = currentFilters.stockStatus;
  
  filteredProducts = products.filter(p => {
    // 1. Search Query (name or code)
    const matchesQuery = !query || 
      p.name.toLowerCase().includes(query) || 
      p.code.toLowerCase().includes(query);
      
    // 2. Product Type
    const matchesType = !type || p.category === type;
    
    // 3. Category (by keyword grouping in name or codes for demo realism)
    let matchesCategory = true;
    if (category) {
      const nameL = p.name.toLowerCase();
      if (category === "iphone-15") {
        matchesCategory = nameL.includes("iphone 15");
      } else if (category === "iphone-11") {
        matchesCategory = nameL.includes("iphone 11");
      } else if (category === "sac-cap") {
        matchesCategory = nameL.includes("sạc") || nameL.includes("cáp") || nameL.includes("lightning") || nameL.includes("type-c");
      } else if (category === "pin-man-hinh") {
        matchesCategory = nameL.includes("pin") || nameL.includes("màn hình") || nameL.includes("nắp lưng");
      }
    }
    
    // 4. Stock Status
    let matchesStock = true;
    if (stockStatus) {
      if (stockStatus === "in_stock") {
        matchesStock = p.stockQuantity > p.lowStockThreshold;
      } else if (stockStatus === "low_stock") {
        matchesStock = p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold;
      } else if (stockStatus === "out_of_stock") {
        matchesStock = p.stockQuantity === 0;
      }
    }
    
    return matchesQuery && matchesType && matchesCategory && matchesStock;
  });
  
  currentPage = 1;
  renderTable();
  updateActiveFilterBadges();
}

// Render dynamic badges when filters are active
function updateActiveFilterBadges() {
  const badges = [];
  
  if (currentFilters.search) {
    badges.push({ key: "search", label: `Tìm kiếm: "${currentFilters.search}"` });
  }
  if (currentFilters.type) {
    const label = currentFilters.type === "ACCESSORY" ? "Loại: Phụ kiện" : "Loại: Linh kiện";
    badges.push({ key: "type", label });
  }
  if (currentFilters.category) {
    let label = "Danh mục: Khác";
    if (currentFilters.category === "iphone-15") label = "Danh mục: iPhone 15 Series";
    else if (currentFilters.category === "iphone-11") label = "Danh mục: iPhone 11 Series";
    else if (currentFilters.category === "sac-cap") label = "Danh mục: Sạc & Cáp sạc";
    else if (currentFilters.category === "pin-man-hinh") label = "Danh mục: Pin & Màn hình";
    badges.push({ key: "category", label });
  }
  if (currentFilters.stockStatus) {
    let label = "Tồn kho: Còn hàng";
    if (currentFilters.stockStatus === "low_stock") label = "Tồn kho: Sắp hết hàng (≤ 5)";
    else if (currentFilters.stockStatus === "out_of_stock") label = "Tồn kho: Hết hàng";
    badges.push({ key: "stockStatus", label });
  }
  
  if (badges.length === 0) {
    elements.activeFiltersBadges.style.display = "none";
    return;
  }
  
  elements.activeFiltersBadges.style.display = "flex";
  
  let html = "";
  badges.forEach(b => {
    html += `
      <span class="filter-badge">
        <span>${b.label}</span>
        <i data-lucide="x" onclick="removeSingleFilter('${b.key}')" title="Xóa lọc"></i>
      </span>
    `;
  });
  
  elements.filterBadgesList.innerHTML = html;
  lucide.createIcons();
}

window.removeSingleFilter = function(key) {
  if (key === "search") {
    currentFilters.search = "";
    elements.inputSearch.value = "";
  } else if (key === "type") {
    currentFilters.type = "";
    elements.selectType.value = "";
  } else if (key === "category") {
    currentFilters.category = "";
    elements.selectCategory.value = "";
  } else if (key === "stockStatus") {
    currentFilters.stockStatus = "";
    elements.selectStockStatus.value = "";
  }
  
  applyFilters();
};

// ==================== SIDEBAR SECTIONS SWITCHING ====================

function handleSectionSwitch(targetSection) {
  activeSection = targetSection;
  
  // Toggle menu active classes
  elements.menuItems.forEach(item => {
    if (item.getAttribute("data-section") === targetSection) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
  
  // Toggle display sections
  elements.sections.forEach(sec => {
    if (sec.id === `section-${targetSection}`) {
      sec.classList.add("active");
    } else {
      sec.classList.remove("active");
    }
  });
  
  // Update header text based on active section
  let title = "Kho hàng";
  let subtitle = "Quản lý danh mục sản phẩm và tồn kho";
  
  if (targetSection === "tong-quan") {
    title = "Tổng quan";
    subtitle = "Phân tích số liệu và quản lý hiệu năng cửa hàng";
  } else if (targetSection === "don-sua-chua") {
    title = "Đơn sửa chữa";
    subtitle = "Tiếp nhận sửa chữa, báo giá và bàn giao máy khách hàng";
  } else if (targetSection === "ban-hang") {
    title = "Bán hàng tại quầy";
    subtitle = "Tạo hóa đơn bán lẻ phụ kiện, linh kiện cho khách hàng";
  } else if (targetSection === "bao-hanh") {
    title = "Bảo hành";
    subtitle = "Quản lý phiếu bảo hành, tra cứu thời hạn bảo hành";
  } else if (targetSection === "cai-dat") {
    title = "Cài đặt hệ thống";
    subtitle = "Thiết lập cấu hình chung, quản lý nhân viên và sao lưu";
  }
  
  elements.pageTitle.textContent = title;
  elements.pageSubtitle.textContent = subtitle;
  
  // Render table if inventory section is active
  if (targetSection === "kho-hang") {
    renderTable();
  } else if (targetSection === "don-sua-chua") {
    elements.sectionChiTietDonSua.classList.remove("active");
    elements.sectionDonSuaChua.classList.add("active");
    applyRepairFilters();
  } else if (targetSection === "ban-hang") {
    applySalesFilters();
  } else if (targetSection === "bao-hanh") {
    applyWarrantyFilters();
  }
}

// ==================== NEW PAGES DYNAMIC LOGIC ====================

// ==================== REPAIR ORDERS MANAGEMENT ====================

function applyRepairFilters() {
  const query = repairFilters.search.toLowerCase().trim();
  const status = repairFilters.status;
  const fromDate = repairFilters.fromDate;
  const toDate = repairFilters.toDate;
  const tab = repairTab;

  filteredRepairs = repairOrders.filter(r => {
    // 1. Tab selection filter
    if (tab === "in_progress" && r.status !== "IN_PROGRESS") return false;
    if (tab === "completed" && r.status !== "COMPLETED") return false;

    // 2. Search Query (code, customerName, phone)
    const matchesQuery = !query || 
      r.code.toLowerCase().includes(query) ||
      r.customerName.toLowerCase().includes(query) ||
      r.phone.includes(query);

    // 3. Status filter
    const matchesStatus = !status || r.status === status;

    // 4. Date Range
    let matchesDate = true;
    if (fromDate || toDate) {
      const recDate = r.dateReceived.split(" ")[0]; // DD/MM/YYYY
      const parts = recDate.split("/");
      const rDate = new Date(parts[2], parts[1] - 1, parts[0]);
      
      if (fromDate) {
        const fDate = new Date(fromDate);
        fDate.setHours(0,0,0,0);
        if (rDate < fDate) matchesDate = false;
      }
      if (toDate) {
        const tDate = new Date(toDate);
        tDate.setHours(23,59,59,999);
        if (rDate > tDate) matchesDate = false;
      }
    }

    return matchesQuery && matchesStatus && matchesDate;
  });

  // Recalculate tab counts for real-time fidelity
  document.getElementById("count-repair-all").textContent = repairOrders.length;
  document.getElementById("count-repair-in-progress").textContent = repairOrders.filter(r => r.status === "IN_PROGRESS").length;
  document.getElementById("count-repair-completed").textContent = repairOrders.filter(r => r.status === "COMPLETED").length;

  repairPage = 1;
  renderRepairOrders();
}

function renderRepairOrders() {
  const startIndex = (repairPage - 1) * repairPageSize;
  const endIndex = Math.min(startIndex + repairPageSize, filteredRepairs.length);
  const pageRepairs = filteredRepairs.slice(startIndex, endIndex);

  if (filteredRepairs.length === 0) {
    elements.repairTableBody.innerHTML = "";
    elements.repairEmptyState.style.display = "flex";
    elements.repairPaginationSummary.textContent = "Hiển thị 0 - 0 của 0 đơn";
    renderRepairPaginationButtons(0);
    return;
  }

  elements.repairEmptyState.style.display = "none";
  
  let html = "";
  pageRepairs.forEach(r => {
    // Interactive Status Button
    const statusBtn = r.status === "IN_PROGRESS"
      ? `<button class="btn-status-confirm in-progress" onclick="toggleRepairStatusDirect('${r.id}')" title="Nhấp để xác nhận đã sửa xong">
           <i data-lucide="play" style="width: 14px; height: 14px; margin-right: 4px;"></i> Đang sửa
         </button>`
      : `<button class="btn-status-confirm completed" onclick="toggleRepairStatusDirect('${r.id}')" title="Nhấp để chuyển về đang sửa">
           <i data-lucide="check" style="width: 14px; height: 14px; margin-right: 4px;"></i> Đã xong
         </button>`;

    // Price input field
    const priceInput = `
      <input type="number" class="table-input-price" value="${r.repairFee || ''}" min="0" step="10000" onchange="updateRepairFeeDirect('${r.id}', this.value)" placeholder="Nhập giá...">
    `;

    html += `
      <tr>
        <td class="font-weight-600 text-blue">${r.code}</td>
        <td class="font-weight-500">${r.customerName}</td>
        <td>${r.phone}</td>
        <td class="text-muted" title="${r.description}">${r.description}</td>
        <td>${priceInput}</td>
        <td class="text-center">${statusBtn}</td>
        <td>${r.dateReceived}</td>
      </tr>
    `;
  });

  elements.repairTableBody.innerHTML = html;
  lucide.createIcons();

  // Summary
  const displayStart = filteredRepairs.length > 0 ? startIndex + 1 : 0;
  elements.repairPaginationSummary.textContent = `Hiển thị ${displayStart} - ${endIndex} của ${formatNumber(filteredRepairs.length)} đơn`;

  // Pagination buttons
  const totalPages = Math.ceil(filteredRepairs.length / repairPageSize);
  renderRepairPaginationButtons(totalPages);
}

// Global actions for inline elements in repair order table rows
window.toggleRepairStatusDirect = function(id) {
  const r = repairOrders.find(order => order.id === id);
  if (!r) return;
  
  if (r.status === "IN_PROGRESS") {
    r.status = "COMPLETED";
    r.dateCompleted = new Date().toLocaleDateString("vi-VN") + " " + new Date().toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'});
    showToast(`Đã xác nhận đơn sửa ${r.code} hoàn thành!`, "success");
  } else {
    r.status = "IN_PROGRESS";
    r.dateCompleted = "";
    showToast(`Đã chuyển đơn sửa ${r.code} về trạng thái đang sửa!`, "warning");
  }
  
  applyRepairFilters();
};

window.updateRepairFeeDirect = function(id, val) {
  const r = repairOrders.find(order => order.id === id);
  if (!r) return;
  
  const parsedVal = parseFloat(val) || 0;
  r.repairFee = parsedVal;
  
  // Also synchronize sellingPrice if needed, but simple toast and update is perfect
  showToast(`Đã cập nhật phí sửa chữa đơn ${r.code} thành ${formatCurrency(parsedVal)}!`, "success");
  
  // Reapply filters but do NOT reset search or pagination
  applyRepairFilters();
};

function renderRepairPaginationButtons(totalPages) {
  if (totalPages <= 1) {
    elements.repairPaginationButtons.innerHTML = "";
    return;
  }
  
  let html = "";
  html += `
    <button class="page-btn ${repairPage === 1 ? 'disabled' : ''}" ${repairPage === 1 ? 'disabled' : ''} onclick="changeRepairPage(${repairPage - 1})">
      <i data-lucide="chevron-left"></i>
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="page-btn ${repairPage === i ? 'active' : ''}" onclick="changeRepairPage(${i})">
        ${i}
      </button>
    `;
  }

  html += `
    <button class="page-btn ${repairPage === totalPages ? 'disabled' : ''}" ${repairPage === totalPages ? 'disabled' : ''} onclick="changeRepairPage(${repairPage + 1})">
      <i data-lucide="chevron-right"></i>
    </button>
  `;

  elements.repairPaginationButtons.innerHTML = html;
  lucide.createIcons();
}

window.changeRepairPage = function(pageNum) {
  repairPage = pageNum;
  renderRepairOrders();
};


// ==================== CHI TIẾT ĐƠN SỬA LOGIC ====================

window.showRepairOrderDetail = function(id) {
  const r = repairOrders.find(order => order.id === id);
  if (!r) return;

  selectedRepairOrder = r;

  // UI Navigation Transition
  elements.sectionDonSuaChua.classList.remove("active");
  elements.sectionChiTietDonSua.classList.add("active");

  // Populate Breadcrumb
  elements.detailBreadcrumbCode.textContent = r.code;

  // Populate Customer Card
  elements.detailCustomerName.textContent = r.customerName;
  elements.detailCustomerPhone.textContent = r.phone;
  elements.detailCustomerNotes.textContent = r.notes ? r.notes : "Không có ghi chú";
  if (r.notes) {
    elements.detailCustomerNotes.className = "badge-notes";
  } else {
    elements.detailCustomerNotes.className = "text-muted";
  }

  // Populate Device Card
  elements.detailDeviceName.textContent = r.device;
  elements.detailDeviceStatus.textContent = r.description;
  elements.detailDeviceAccessories.textContent = r.id % 2 === 0 ? "Sạc, ốp lưng" : "Không có phụ kiện";

  // Populate Order Info Card
  elements.detailOrderCode.textContent = r.code;
  elements.detailOrderDate.textContent = r.dateReceived;
  elements.detailOrderAssignee.textContent = r.assignee;
  if (r.assignee === "Chưa phân công") {
    elements.detailOrderAssignee.className = "text-muted font-weight-500";
  } else {
    elements.detailOrderAssignee.className = "text-main font-weight-600";
  }

  // Set Status Badge in card
  const statusBadgeHTML = r.status === "IN_PROGRESS"
    ? '<span class="badge badge-accessory" style="background-color: rgba(37, 99, 235, 0.1); color: var(--primary); width: fit-content;">Đang sửa</span>'
    : '<span class="badge badge-component" style="background-color: rgba(22, 163, 74, 0.1); color: var(--success); width: fit-content;">Hoàn thành</span>';
  elements.detailOrderStatusBadge.innerHTML = statusBadgeHTML;

  // Populate Timeline Visual States
  const timeStep1 = document.getElementById("time-step-1");
  const timeStep2 = document.getElementById("time-step-2");
  const timeStep3 = document.getElementById("time-step-3");
  const step2Container = document.getElementById("timeline-step-2-container");
  const step3Container = document.getElementById("timeline-step-3-container");
  
  const step2Icon = document.getElementById("timeline-step-2-icon");
  const step3Icon = document.getElementById("timeline-step-3-icon");
  const step2Badge = document.getElementById("timeline-step-2-badge");
  const step3Badge = document.getElementById("timeline-step-3-badge");

  timeStep1.textContent = r.dateReceived;

  if (r.status === "COMPLETED") {
    // Step 2 is Completed
    step2Container.className = "timeline-item completed";
    step2Icon.style.display = "block";
    step2Icon.setAttribute("data-lucide", "check");
    step2Badge.innerHTML = '<i data-lucide="check"></i>';
    timeStep2.textContent = r.dateReceived.split(" ")[0] + " " + "09:30";

    // Step 3 is Completed
    step3Container.className = "timeline-item completed";
    step3Icon.style.display = "block";
    step3Badge.innerHTML = '<i data-lucide="check"></i>';
    timeStep3.textContent = r.completedDate;
    timeStep3.className = "timeline-time";

    elements.btnDetailMarkComplete.style.display = "none";
  } else {
    // Step 2 is In-Progress
    step2Container.className = "timeline-item in-progress";
    step2Icon.style.display = "block";
    step2Badge.innerHTML = '<i data-lucide="check"></i>';
    timeStep2.textContent = "Đang thực hiện";

    // Step 3 is Pending
    step3Container.className = "timeline-item";
    step3Icon.style.display = "none";
    step3Badge.innerHTML = '<i data-lucide="check" style="display:none;"></i>';
    timeStep3.textContent = "Chưa hoàn thành";
    timeStep3.className = "timeline-time text-muted";

    elements.btnDetailMarkComplete.style.display = "block";
  }

  // Populate Billing summary
  elements.detailRepairFee.textContent = formatCurrency(r.repairFee);
  elements.detailWarrantyMonths.textContent = `${r.warrantyMonths} tháng`;
  elements.detailCompletedDate.textContent = r.completedDate;
  if (r.status === "COMPLETED") {
    elements.detailCompletedDate.className = "bill-value";
  } else {
    elements.detailCompletedDate.className = "bill-value text-muted";
  }
  elements.detailTotalAmount.textContent = formatCurrency(r.repairFee);

  lucide.createIcons();
  
  // Smooth scroll details to top
  elements.sectionChiTietDonSua.scrollIntoView({ behavior: 'smooth' });
};


// ==================== BÁN HÀNG TẠI QUẦY MANAGEMENT ====================

function applySalesFilters() {
  const query = salesFilters.search.toLowerCase().trim();
  const status = salesFilters.status;
  const type = salesFilters.type;
  const fromDate = salesFilters.fromDate;
  const toDate = salesFilters.toDate;
  const tab = salesTab;

  filteredSales = salesOrders.filter(s => {
    // 1. Tab filter
    if (tab === "counter" && s.type !== "COUNTER") return false;
    if (tab === "delivery" && s.type !== "DELIVERY") return false;

    // 2. Search Query (code, customerName)
    const matchesQuery = !query || 
      s.code.toLowerCase().includes(query) ||
      s.customerName.toLowerCase().includes(query);

    // 3. Status filter
    const matchesStatus = !status || s.status === status;

    // 4. Type filter
    const matchesType = !type || s.type === type;

    // 5. Date Range
    let matchesDate = true;
    if (fromDate || toDate) {
      const recDate = s.dateCreated.split(" ")[0]; // DD/MM/YYYY
      const parts = recDate.split("/");
      const sDate = new Date(parts[2], parts[1] - 1, parts[0]);
      
      if (fromDate) {
        const fDate = new Date(fromDate);
        fDate.setHours(0,0,0,0);
        if (sDate < fDate) matchesDate = false;
      }
      if (toDate) {
        const tDate = new Date(toDate);
        tDate.setHours(23,59,59,999);
        if (sDate > tDate) matchesDate = false;
      }
    }

    return matchesQuery && matchesStatus && matchesType && matchesDate;
  });

  // Tab counts
  document.getElementById("count-sales-all").textContent = salesOrders.length;
  document.getElementById("count-sales-counter").textContent = salesOrders.filter(s => s.type === "COUNTER").length;
  document.getElementById("count-sales-delivery").textContent = salesOrders.filter(s => s.type === "DELIVERY").length;

  salesPage = 1;
  renderSalesOrders();
}

function renderSalesOrders() {
  const startIndex = (salesPage - 1) * salesPageSize;
  const endIndex = Math.min(startIndex + salesPageSize, filteredSales.length);
  const pageSales = filteredSales.slice(startIndex, endIndex);

  if (filteredSales.length === 0) {
    elements.salesTableBody.innerHTML = "";
    elements.salesEmptyState.style.display = "flex";
    elements.salesPaginationSummary.textContent = "Hiển thị 0 - 0 của 0 hóa đơn";
    renderSalesPaginationButtons(0);
    return;
  }

  elements.salesEmptyState.style.display = "none";

  let html = "";
  pageSales.forEach(s => {
    // Type badge
    const typeBadge = s.type === "COUNTER"
      ? '<span class="badge" style="background-color: rgba(147, 51, 234, 0.1); color: var(--purple);">Bán tại quầy</span>'
      : '<span class="badge" style="background-color: rgba(249, 115, 22, 0.1); color: var(--warning-text);">Giao hàng</span>';

    // Status badge
    let statusClass = "badge-accessory";
    let statusLabel = "Thành công";
    let statusStyle = "background-color: rgba(22, 163, 74, 0.1); color: var(--success);";
    
    if (s.status === "PROCESSING") {
      statusLabel = "Đang giao";
      statusStyle = "background-color: rgba(37, 99, 235, 0.1); color: var(--primary);";
    } else if (s.status === "DELIVERED") {
      statusLabel = "Giao thành công";
      statusStyle = "background-color: rgba(22, 163, 74, 0.1); color: var(--success);";
    } else if (s.status === "CANCELLED") {
      statusLabel = "Đã hủy";
      statusStyle = "background-color: rgba(239, 68, 68, 0.1); color: var(--danger-text);";
    }

    html += `
      <tr>
        <td class="font-weight-600 text-blue">${s.code}</td>
        <td class="font-weight-500">${s.customerName}</td>
        <td>${typeBadge}</td>
        <td><span class="badge" style="${statusStyle}">${statusLabel}</span></td>
        <td class="text-right font-weight-600">${formatCurrency(s.totalAmount)}</td>
        <td>${s.dateCreated}</td>
        <td>
          <div class="row-actions">
            <button class="btn-icon" onclick="showSalesInvoiceAlert('${s.code}')" title="In hóa đơn">
              <i data-lucide="printer"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  elements.salesTableBody.innerHTML = html;
  lucide.createIcons();

  // Pagination info
  const displayStart = filteredSales.length > 0 ? startIndex + 1 : 0;
  elements.salesPaginationSummary.textContent = `Hiển thị ${displayStart} - ${endIndex} của ${formatNumber(filteredSales.length)} đơn`;

  const totalPages = Math.ceil(filteredSales.length / salesPageSize);
  renderSalesPaginationButtons(totalPages);
}

function renderSalesPaginationButtons(totalPages) {
  if (totalPages <= 1) {
    elements.salesPaginationButtons.innerHTML = "";
    return;
  }

  let html = "";
  html += `
    <button class="page-btn ${salesPage === 1 ? 'disabled' : ''}" ${salesPage === 1 ? 'disabled' : ''} onclick="changeSalesPage(${salesPage - 1})">
      <i data-lucide="chevron-left"></i>
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="page-btn ${salesPage === i ? 'active' : ''}" onclick="changeSalesPage(${i})">
        ${i}
      </button>
    `;
  }

  html += `
    <button class="page-btn ${salesPage === totalPages ? 'disabled' : ''}" ${salesPage === totalPages ? 'disabled' : ''} onclick="changeSalesPage(${salesPage + 1})">
      <i data-lucide="chevron-right"></i>
    </button>
  `;

  elements.salesPaginationButtons.innerHTML = html;
  lucide.createIcons();
}

window.changeSalesPage = function(pageNum) {
  salesPage = pageNum;
  renderSalesOrders();
};

window.showSalesInvoiceAlert = function(code) {
  showToast(`Đang kết nối máy in để xuất hóa đơn ${code}...`);
  setTimeout(() => {
    showToast(`Đã in hóa đơn ${code} thành công!`, "success");
  }, 1000);
};


// ==================== BẢO HÀNH (WARRANTY) MANAGEMENT ====================

function applyWarrantyFilters() {
  const query = warrantySearchQuery.toLowerCase().trim();

  filteredWarranties = warranties.filter(w => {
    return !query || 
      w.code.toLowerCase().includes(query) ||
      w.customerName.toLowerCase().includes(query) ||
      w.phone.includes(query);
  });

  // Calculate Metrics
  const activeCount = warranties.filter(w => w.status === "ACTIVE").length;
  const expiredCount = warranties.filter(w => w.status === "EXPIRED").length;
  const totalCount = warranties.length;

  elements.statWarrantyActive.textContent = activeCount;
  elements.statWarrantyExpired.textContent = expiredCount;
  elements.statWarrantyTotal.textContent = totalCount;

  warrantyPage = 1;
  renderWarranties();
}

function renderWarranties() {
  const startIndex = (warrantyPage - 1) * warrantyPageSize;
  const endIndex = Math.min(startIndex + warrantyPageSize, filteredWarranties.length);
  const pageWarranties = filteredWarranties.slice(startIndex, endIndex);

  if (filteredWarranties.length === 0) {
    elements.warrantyTableBody.innerHTML = "";
    elements.warrantyEmptyState.style.display = "flex";
    elements.warrantyPaginationSummary.textContent = "Hiển thị 0 - 0 của 0 phiếu bảo hành";
    renderWarrantyPaginationButtons(0);
    return;
  }

  elements.warrantyEmptyState.style.display = "none";

  let html = "";
  pageWarranties.forEach(w => {
    const statusBadge = w.status === "ACTIVE"
      ? '<span class="badge" style="background-color: rgba(22, 163, 74, 0.1); color: var(--success);">Còn bảo hành</span>'
      : '<span class="badge" style="background-color: rgba(239, 68, 68, 0.1); color: var(--danger-text);">Hết hạn</span>';

    html += `
      <tr>
        <td class="font-weight-600 text-blue">${w.code}</td>
        <td class="font-weight-500">${w.customerName}</td>
        <td>${w.phone}</td>
        <td class="text-muted">${w.content}</td>
        <td>${w.completedDate.split(" ")[0]}</td>
        <td class="font-weight-500">${w.expiryDate}</td>
        <td>${statusBadge}</td>
        <td>
          <div class="row-actions">
            <button class="btn-icon" onclick="lookupSingleWarranty('${w.code}')" title="Tra cứu nhanh">
              <i data-lucide="search"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  elements.warrantyTableBody.innerHTML = html;
  lucide.createIcons();

  const displayStart = filteredWarranties.length > 0 ? startIndex + 1 : 0;
  elements.warrantyPaginationSummary.textContent = `Hiển thị ${displayStart} - ${endIndex} của ${formatNumber(filteredWarranties.length)} phiếu bảo hành`;

  const totalPages = Math.ceil(filteredWarranties.length / warrantyPageSize);
  renderWarrantyPaginationButtons(totalPages);
}

function renderWarrantyPaginationButtons(totalPages) {
  if (totalPages <= 1) {
    elements.warrantyPaginationButtons.innerHTML = "";
    return;
  }

  let html = "";
  html += `
    <button class="page-btn ${warrantyPage === 1 ? 'disabled' : ''}" ${warrantyPage === 1 ? 'disabled' : ''} onclick="changeWarrantyPage(${warrantyPage - 1})">
      <i data-lucide="chevron-left"></i>
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="page-btn ${warrantyPage === i ? 'active' : ''}" onclick="changeWarrantyPage(${i})">
        ${i}
      </button>
    `;
  }

  html += `
    <button class="page-btn ${warrantyPage === totalPages ? 'disabled' : ''}" ${warrantyPage === totalPages ? 'disabled' : ''} onclick="changeWarrantyPage(${warrantyPage + 1})">
      <i data-lucide="chevron-right"></i>
    </button>
  `;

  elements.warrantyPaginationButtons.innerHTML = html;
  lucide.createIcons();
}

window.changeWarrantyPage = function(pageNum) {
  warrantyPage = pageNum;
  renderWarranties();
};

window.lookupSingleWarranty = function(code) {
  const w = warranties.find(item => item.code === code);
  if (!w) return;

  const activeMsg = w.status === "ACTIVE" 
    ? `Thiết bị CÒN bảo hành đến ngày ${w.expiryDate}.` 
    : `Thiết bị ĐÃ HẾT HẠN bảo hành từ ngày ${w.expiryDate}.`;

  alert(`[TRA CỨU BẢO HÀNH] \nMã đơn: ${w.code} \nKhách hàng: ${w.customerName} \nNội dung: ${w.content} \nTrạng thái: ${w.status === "ACTIVE" ? "CÒN HẠN" : "HẾT HẠN"} \n\n${activeMsg}`);
};


// ==================== PRODUCT ADD / EDIT MODAL LOGIC ====================

function openAddProductModal() {
  elements.modalProductTitle.textContent = "Thêm sản phẩm mới";
  elements.inputProductId.value = "";
  elements.productForm.reset();
  
  // Default values
  elements.inputUnit.value = "Cái";
  elements.inputStockQuantity.value = "0";
  elements.inputStockQuantity.disabled = false; // Enabled for new creation
  elements.inputLowStockThreshold.value = "5";
  
  elements.productModal.classList.add("active");
}

window.openEditProductModal = function(id) {
  const p = products.find(prod => prod.id === id);
  if (!p) return;
  
  elements.modalProductTitle.textContent = "Cập nhật thông tin sản phẩm";
  elements.inputProductId.value = p.id;
  elements.inputName.value = p.name;
  elements.inputCategory.value = p.category;
  elements.inputUnit.value = p.unit;
  elements.inputCostPrice.value = p.costPrice || 0;
  elements.inputSellingPrice.value = p.sellingPrice;
  
  elements.inputStockQuantity.value = p.stockQuantity;
  elements.inputStockQuantity.disabled = true; // Inventory quantity should be adjusted via Quick Import, not edit info!
  
  elements.inputLowStockThreshold.value = p.lowStockThreshold;
  
  elements.productModal.classList.add("active");
};

function closeProductModal() {
  elements.productModal.classList.remove("active");
  elements.productForm.reset();
}

function handleProductFormSubmit(e) {
  e.preventDefault();
  
  const id = elements.inputProductId.value;
  const name = elements.inputName.value.trim();
  const category = elements.inputCategory.value;
  const unit = elements.inputUnit.value.trim();
  const costPrice = parseInt(elements.inputCostPrice.value);
  const sellingPrice = parseInt(elements.inputSellingPrice.value);
  const lowStockThreshold = parseInt(elements.inputLowStockThreshold.value) || 5;
  
  if (!name || isNaN(costPrice) || isNaN(sellingPrice)) {
    showToast("Vui lòng điền đầy đủ các thông tin bắt buộc!", "error");
    return;
  }
  
  if (id) {
    // Edit mode
    const idx = products.findIndex(p => p.id === id);
    if (idx !== -1) {
      products[idx] = {
        ...products[idx],
        name,
        category,
        unit,
        costPrice,
        sellingPrice,
        lowStockThreshold
      };
      showToast(`Đã cập nhật sản phẩm "${name}" thành công!`);
    }
  } else {
    // Add mode
    const stockQuantity = parseInt(elements.inputStockQuantity.value) || 0;
    
    // Auto generate realistic code
    const isAccessory = category === "ACCESSORY";
    const sameCategoryProducts = products.filter(p => p.category === category);
    
    // Extract code sequential index
    let maxSeq = 0;
    sameCategoryProducts.forEach(p => {
      const match = p.code.match(/\d+/);
      if (match) {
        const seq = parseInt(match[0]);
        if (seq > maxSeq) maxSeq = seq;
      }
    });
    
    const newSeq = maxSeq + 1;
    const prefix = isAccessory ? "SP" : "LK";
    const code = `${prefix}${String(newSeq).padStart(4, '0')}`;
    
    const newProduct = {
      id: `prod-added-${Date.now()}`,
      name,
      code,
      category,
      unit,
      costPrice,
      sellingPrice,
      stockQuantity,
      lowStockThreshold,
      isActive: true
    };
    
    products.unshift(newProduct);
    showToast(`Đã thêm sản phẩm "${name}" thành công với mã ${code}!`);
  }
  
  closeProductModal();
  updateMetrics();
  applyFilters();
}

// ==================== QUICK IMPORT STOCK MODAL LOGIC ====================

window.openQuickImportModal = function(productId = "") {
  // Populate products select list
  let selectHtml = "";
  // Sort alphabetically
  const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name));
  sorted.forEach(p => {
    selectHtml += `<option value="${p.id}" ${p.id === productId ? 'selected' : ''}>${p.name} (${p.code} - Còn ${p.stockQuantity} ${p.unit})</option>`;
  });
  elements.importProductSelect.innerHTML = selectHtml;
  
  elements.importQuantity.value = "10";
  elements.importStockModal.classList.add("active");
};

function closeImportModal() {
  elements.importStockModal.classList.remove("active");
}

function handleImportFormSubmit(e) {
  e.preventDefault();
  
  const id = elements.importProductSelect.value;
  const qty = parseInt(elements.importQuantity.value);
  
  if (!id || isNaN(qty) || qty <= 0) {
    showToast("Vui lòng chọn sản phẩm và số lượng hợp lệ!", "error");
    return;
  }
  
  const p = products.find(prod => prod.id === id);
  if (p) {
    p.stockQuantity += qty;
    showToast(`Đã nhập thêm +${qty} ${p.unit} vào kho cho "${p.name}". Tổng tồn mới: ${p.stockQuantity}!`);
    closeImportModal();
    updateMetrics();
    applyFilters();
  }
}

// ==================== EXPORT DATA TO CSV (EXCEL FRIENDLY) ====================

function exportFilteredProductsToCSV() {
  if (filteredProducts.length === 0) {
    showToast("Không có dữ liệu sản phẩm nào để xuất!", "warning");
    return;
  }
  
  // CSV Headers
  const headers = ["#", "Mã sản phẩm", "Tên sản phẩm", "Loại", "Đơn vị", "Giá nhập (đ)", "Giá bán (đ)", "Tồn kho", "Cảnh báo dưới", "Giá trị tồn (đ)"];
  
  // Rows
  const csvRows = [headers.join(",")];
  
  filteredProducts.forEach((p, idx) => {
    const row = [
      idx + 1,
      p.code,
      `"${p.name.replace(/"/g, '""')}"`, // escape quotes
      p.category === "ACCESSORY" ? "Phụ kiện" : "Linh kiện",
      p.unit,
      p.costPrice || 0,
      p.sellingPrice,
      p.stockQuantity,
      p.lowStockThreshold,
      p.stockQuantity * (p.costPrice || 0)
    ];
    csvRows.push(row.join(","));
  });
  
  // Prepend UTF-8 BOM (\uFEFF) to make it Excel readable in Vietnamese accents!
  const csvContent = "\uFEFF" + csvRows.join("\n");
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  
  // Filename formatted with current timestamp
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  link.setAttribute("download", `KhoHang_CuaHangDienThoai_${dateStr}.csv`);
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showToast(`Xuất file thành công! Đã tải về danh sách gồm ${filteredProducts.length} sản phẩm.`);
}

// ==================== ATTACHING EVENT LISTENERS ====================

function initEventListeners() {
  // Sidebar Tabs Navigation
  elements.menuItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const targetSec = item.getAttribute("data-section");
      if (targetSec) handleSectionSwitch(targetSec);
    });
  });
  
  // Pulsing active card clicking acts as a filter shortcut
  elements.cardLowStock.addEventListener("click", () => {
    elements.selectStockStatus.value = "low_stock";
    currentFilters.stockStatus = "low_stock";
    applyFilters();
    showToast("Đã lọc danh sách theo sản phẩm sắp hết hàng!");
  });
  
  // Applying filters on clicking filter button or hitting Enter
  elements.btnApplyFilters.addEventListener("click", () => {
    currentFilters.search = elements.inputSearch.value;
    currentFilters.type = elements.selectType.value;
    currentFilters.category = elements.selectCategory.value;
    currentFilters.stockStatus = elements.selectStockStatus.value;
    applyFilters();
    showToast("Đã áp dụng các tiêu chí bộ lọc!");
  });
  
  elements.inputSearch.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      currentFilters.search = elements.inputSearch.value;
      applyFilters();
    }
  });
  
  // Live filters trigger on select dropdown changes immediately for better premium feeling!
  elements.selectType.addEventListener("change", () => {
    currentFilters.type = elements.selectType.value;
    applyFilters();
  });
  
  elements.selectCategory.addEventListener("change", () => {
    currentFilters.category = elements.selectCategory.value;
    applyFilters();
  });
  
  elements.selectStockStatus.addEventListener("change", () => {
    currentFilters.stockStatus = elements.selectStockStatus.value;
    applyFilters();
  });
  
  // Resetting all filters
  elements.btnResetFilters.addEventListener("click", () => {
    elements.inputSearch.value = "";
    elements.selectType.value = "";
    elements.selectCategory.value = "";
    elements.selectStockStatus.value = "";
    
    currentFilters = { search: "", type: "", category: "", stockStatus: "" };
    applyFilters();
    showToast("Đã lập lại toàn bộ bộ lọc!");
  });
  
  // Primary Modals launchers
  if (elements.btnAddProduct) elements.btnAddProduct.addEventListener("click", openAddProductModal);
  if (elements.btnImportStock) elements.btnImportStock.addEventListener("click", () => openQuickImportModal());
  if (elements.btnExportFile) elements.btnExportFile.addEventListener("click", exportFilteredProductsToCSV);
  
  // Modals closing triggers
  elements.btnCloseProductModal.addEventListener("click", closeProductModal);
  elements.btnCancelProductModal.addEventListener("click", closeProductModal);
  elements.productForm.addEventListener("submit", handleProductFormSubmit);
  
  elements.btnCloseImportModal.addEventListener("click", closeImportModal);
  elements.btnCancelImportModal.addEventListener("click", closeImportModal);
  elements.importStockForm.addEventListener("submit", handleImportFormSubmit);
  
  // Page Sizes adjustments
  elements.selectPageSize.addEventListener("change", () => {
    pageSize = parseInt(elements.selectPageSize.value);
    currentPage = 1;
    renderTable();
  });
  
  // Notification popover toggle
  if (elements.notificationBell) {
    elements.notificationBell.addEventListener("click", (e) => {
      e.stopPropagation();
      if (elements.notificationPopover) elements.notificationPopover.classList.toggle("active");
      if (elements.profilePopover) elements.profilePopover.classList.remove("active");
    });
  }
  
  if (elements.btnClearAlerts) {
    elements.btnClearAlerts.addEventListener("click", (e) => {
      e.stopPropagation();
      // Replenish inventory of all warnings to clear alerts!
      const warnings = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold);
      warnings.forEach(w => {
        w.stockQuantity = w.lowStockThreshold + 5; // import safety buffer
      });
      showToast("Đã tự động nhập kho tăng cường cho toàn bộ sản phẩm sắp hết hàng!");
      updateMetrics();
      applyFilters();
      if (elements.notificationPopover) elements.notificationPopover.classList.remove("active");
    });
  }
  
  // Profile dropdown menu toggle
  if (elements.userProfileMenu) {
    elements.userProfileMenu.addEventListener("click", (e) => {
      e.stopPropagation();
      if (elements.profilePopover) elements.profilePopover.classList.toggle("active");
      if (elements.notificationPopover) elements.notificationPopover.classList.remove("active");
    });
  }
  
  // Logout options
  const handleLogout = () => {
    showToast("Đã đăng xuất hệ thống! Tự động chuyển hướng về màn hình đăng nhập...", "warning");
    setTimeout(() => {
      alert("Hệ thống sẽ chuyển hướng về màn hình đăng nhập (Tính năng mô phỏng)!");
    }, 500);
  };
  
  if (elements.menuLogoutItem) {
    elements.menuLogoutItem.addEventListener("click", (e) => {
      e.preventDefault();
      handleLogout();
    });
  }
  
  if (elements.btnLogout) {
    elements.btnLogout.addEventListener("click", (e) => {
      e.preventDefault();
      handleLogout();
    });
  }
  
  // Click outside to close dropdowns
  document.addEventListener("click", () => {
    if (elements.notificationPopover) elements.notificationPopover.classList.remove("active");
    if (elements.profilePopover) elements.profilePopover.classList.remove("active");
  });
  
  if (elements.notificationPopover) {
    elements.notificationPopover.addEventListener("click", (e) => e.stopPropagation());
  }
  if (elements.profilePopover) {
    elements.profilePopover.addEventListener("click", (e) => e.stopPropagation());
  }

  // ==================== NEW PAGES INTERACTIONS ====================

  // REPAIR SECTION BINDINGS
  // Sub-tabs switching
  const repTabButtons = document.querySelectorAll("#repair-tabs .sub-tab");
  repTabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      repTabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      repairTab = btn.getAttribute("data-tab");
      applyRepairFilters();
    });
  });

  // Apply filters
  elements.btnApplyRepairFilters.addEventListener("click", () => {
    repairFilters.search = elements.inputRepairSearch.value;
    repairFilters.status = elements.selectRepairStatus.value;
    repairFilters.fromDate = elements.inputRepairFromDate.value;
    repairFilters.toDate = elements.inputRepairToDate.value;
    applyRepairFilters();
    showToast("Đã lọc danh sách đơn sửa chữa!");
  });

  elements.inputRepairSearch.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      repairFilters.search = elements.inputRepairSearch.value;
      applyRepairFilters();
    }
  });

  // Reset filters
  elements.btnResetRepairFilters.addEventListener("click", () => {
    elements.inputRepairSearch.value = "";
    elements.selectRepairStatus.value = "";
    elements.inputRepairFromDate.value = "";
    elements.inputRepairToDate.value = "";
    repairFilters = { search: "", status: "", fromDate: "", toDate: "" };
    applyRepairFilters();
    showToast("Đã lập lại bộ lọc đơn sửa!");
  });

  elements.selectRepairPageSize.addEventListener("change", () => {
    repairPageSize = parseInt(elements.selectRepairPageSize.value);
    repairPage = 1;
    renderRepairOrders();
  });

  elements.btnCreateRepairOrder.addEventListener("click", () => {
    showToast("Tính năng 'Tạo đơn sửa chữa mới' sẽ khả dụng ở phiên bản nâng cấp!", "warning");
  });

  // DETAIL SUB-VIEW ACTIONS
  // Breadcrumb back click
  elements.breadcrumbRepairList.addEventListener("click", (e) => {
    e.preventDefault();
    elements.sectionChiTietDonSua.classList.remove("active");
    elements.sectionDonSuaChua.classList.add("active");
    applyRepairFilters();
  });

  // In phiếu
  elements.btnDetailPrint.addEventListener("click", () => {
    showToast("Đang kết nối cổng PDF và tạo bản in phiếu sửa chữa...");
    setTimeout(() => {
      showToast("Tạo file PDF thành công! Đã gửi lệnh in tới máy in nhiệt tại quầy.", "success");
    }, 1200);
  });

  // Chỉnh sửa
  elements.btnDetailEdit.addEventListener("click", () => {
    showToast("Chức năng chỉnh sửa thông tin đơn hàng đang ở chế độ Chỉ đọc (Read-only)!", "warning");
  });

  // Sửa phí sửa chữa
  elements.btnEditRepairFee.addEventListener("click", (e) => {
    e.preventDefault();
    if (!selectedRepairOrder) return;
    if (selectedRepairOrder.status === "COMPLETED") {
      showToast("Đơn hàng đã hoàn thành, không thể sửa đổi phí thanh toán!", "error");
      return;
    }
    const val = prompt("Nhập phí sửa chữa mới (VND):", selectedRepairOrder.repairFee);
    if (val !== null) {
      const parsed = parseInt(val);
      if (!isNaN(parsed) && parsed >= 0) {
        selectedRepairOrder.repairFee = parsed;
        showRepairOrderDetail(selectedRepairOrder.id);
        showToast("Đã cập nhật phí sửa chữa thành công!");
      } else {
        showToast("Phí sửa chữa không hợp lệ!", "error");
      }
    }
  });

  // Hủy đơn
  elements.btnDetailCancel.addEventListener("click", () => {
    if (!selectedRepairOrder) return;
    if (selectedRepairOrder.status === "COMPLETED") {
      showToast("Không thể hủy đơn sửa chữa đã hoàn thành!", "error");
      return;
    }
    if (confirm(`Bạn chắc chắn muốn hủy đơn sửa chữa ${selectedRepairOrder.code}?`)) {
      repairOrders.splice(repairOrders.findIndex(item => item.id === selectedRepairOrder.id), 1);
      showToast(`Đã hủy đơn ${selectedRepairOrder.code} thành công!`, "warning");
      elements.sectionChiTietDonSua.classList.remove("active");
      elements.sectionDonSuaChua.classList.add("active");
      applyRepairFilters();
    }
  });

  // Lưu tạm
  elements.btnDetailSaveTemp.addEventListener("click", () => {
    showToast("Đã lưu tạm tiến độ và ghi chú kỹ thuật thành công!");
  });

  // Đánh dấu hoàn thành
  elements.btnDetailMarkComplete.addEventListener("click", () => {
    if (!selectedRepairOrder) return;
    selectedRepairOrder.status = "COMPLETED";
    
    const now = new Date();
    selectedRepairOrder.completedDate = now.toLocaleDateString("vi-VN") + " " + now.toTimeString().slice(0, 5);
    
    showToast(`Đơn sửa chữa ${selectedRepairOrder.code} đã được đánh dấu HOÀN THÀNH!`, "success");
    showRepairOrderDetail(selectedRepairOrder.id);
  });


  // SALES SECTION BINDINGS
  const salesTabButtons = document.querySelectorAll("#sales-tabs .sub-tab");
  salesTabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      salesTabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      salesTab = btn.getAttribute("data-tab");
      applySalesFilters();
    });
  });

  // Apply filters
  elements.btnApplySalesFilters.addEventListener("click", () => {
    salesFilters.search = elements.inputSalesSearch.value;
    salesFilters.status = elements.selectSalesStatus.value;
    salesFilters.type = elements.selectSalesType.value;
    salesFilters.fromDate = elements.inputSalesFromDate.value;
    salesFilters.toDate = elements.inputSalesToDate.value;
    applySalesFilters();
    showToast("Đã áp dụng các tiêu chí lọc hóa đơn!");
  });

  elements.inputSalesSearch.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      salesFilters.search = elements.inputSalesSearch.value;
      applySalesFilters();
    }
  });

  // Reset filters
  elements.btnResetSalesFilters.addEventListener("click", () => {
    elements.inputSalesSearch.value = "";
    elements.selectSalesStatus.value = "";
    elements.selectSalesType.value = "";
    elements.inputSalesFromDate.value = "";
    elements.inputSalesToDate.value = "";
    salesFilters = { search: "", status: "", type: "", fromDate: "", toDate: "" };
    applySalesFilters();
    showToast("Đã thiết lập lại bộ lọc bán hàng!");
  });

  elements.selectSalesPageSize.addEventListener("change", () => {
    salesPageSize = parseInt(elements.selectSalesPageSize.value);
    salesPage = 1;
    renderSalesOrders();
  });

  elements.btnCreateSalesOrder.addEventListener("click", () => {
    showToast("Chức năng 'Tạo đơn bán hàng' đang được tích hợp cùng máy POS và sẽ mở trong bản cập nhật kế tiếp!", "warning");
  });


  // WARRANTY SECTION BINDINGS
  elements.btnWarrantySearch.addEventListener("click", () => {
    warrantySearchQuery = elements.inputWarrantySearch.value;
    applyWarrantyFilters();
    showToast("Đã tra cứu dữ liệu bảo hành!");
  });

  elements.inputWarrantySearch.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      warrantySearchQuery = elements.inputWarrantySearch.value;
      applyWarrantyFilters();
    }
  });

  elements.selectWarrantyPageSize.addEventListener("change", () => {
    warrantyPageSize = parseInt(elements.selectWarrantyPageSize.value);
    warrantyPage = 1;
    renderWarranties();
  });
}

// ==================== APP INITIALIZATION ====================

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide Icons
  lucide.createIcons();
  
  // Attach all Event Listeners
  initEventListeners();
  
  // Calculate and draw initial metrics
  updateMetrics();
  
  // Display initial data grid
  renderTable();
  
  // Welcome Toast alert
  showToast("Chào mừng quay trở lại, Chủ cửa hàng! Hệ thống kho hàng đã sẵn sàng.");
});
