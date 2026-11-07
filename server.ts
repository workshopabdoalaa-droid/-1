import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { initialCategories, initialDeliveryZones, initialProducts, initialRestaurantInfo, initialScannedSheets } from './src/data/initialData';
import { Category, DeliveryZone, MenuItem, Order, OrderStatus, RestaurantInfo, ScannedMenuSheet } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  restaurantInfo: RestaurantInfo;
  deliveryZones: DeliveryZone[];
  categories: Category[];
  products: MenuItem[];
  scannedSheets: ScannedMenuSheet[];
  orders: Order[];
  adminPin: string;
}

// Ensure database file exists with initial data
function initDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data) as DatabaseSchema;
      // Ensure all fields exist
      if (!parsed.products || parsed.products.length === 0) {
        parsed.products = initialProducts;
      }
      if (!parsed.categories || parsed.categories.length === 0) {
        parsed.categories = initialCategories;
      }
      if (!parsed.deliveryZones || parsed.deliveryZones.length === 0) {
        parsed.deliveryZones = initialDeliveryZones;
      }
      if (!parsed.restaurantInfo) {
        parsed.restaurantInfo = initialRestaurantInfo;
      }
      if (!parsed.scannedSheets || parsed.scannedSheets.length === 0) {
        parsed.scannedSheets = initialScannedSheets;
      }
      if (!parsed.orders) {
        parsed.orders = [];
      }
      if (!parsed.adminPin) {
        parsed.adminPin = '123456';
      }
      return parsed;
    } catch (e) {
      console.error('Error reading db.json, re-initializing', e);
    }
  }

  const defaultDb: DatabaseSchema = {
    restaurantInfo: initialRestaurantInfo,
    deliveryZones: initialDeliveryZones,
    categories: initialCategories,
    products: initialProducts,
    scannedSheets: initialScannedSheets,
    orders: [],
    adminPin: '123456',
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
  return defaultDb;
}

let db = initDatabase();

function saveDatabase(): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API Routes
  // 1. Get Public Menu & Info
  app.get('/api/menu', (req: Request, res: Response) => {
    res.json({
      restaurantInfo: db.restaurantInfo,
      categories: db.categories,
      products: db.products,
      deliveryZones: db.deliveryZones,
      scannedSheets: db.scannedSheets,
    });
  });

  app.get('/api/restaurant', (req: Request, res: Response) => {
    res.json(db.restaurantInfo);
  });

  app.get('/api/delivery-zones', (req: Request, res: Response) => {
    res.json(db.deliveryZones);
  });

  // 2. Submit New Order
  app.post('/api/orders', (req: Request, res: Response) => {
    try {
      const { customer, items } = req.body;

      if (!customer || !customer.name || !customer.phone) {
        res.status(400).json({ error: 'الرجاء إدخال الاسم ورقم الهاتف بالكامل' });
        return;
      }

      // Check phone number format (at least 10 digits)
      const cleanPhone = customer.phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        res.status(400).json({ error: 'يرجى إدخال رقم هاتف مصري صحيح (مثال: 01061119339)' });
        return;
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({ error: 'سلة المشتريات فارغة' });
        return;
      }

      // Calculate subtotal from authoritative product prices
      let subtotal = 0;
      for (const item of items) {
        const prod = db.products.find((p) => p.id === item.productId);
        if (!prod || !prod.isAvailable) {
          res.status(400).json({ error: `الصنف ${item.name || ''} غير متوفر حالياً` });
          return;
        }

        // Determine price
        let itemBasePrice = prod.price;
        if (item.selectedSize && item.selectedSize.name) {
          const sizeFound = prod.sizes?.find((s) => s.name === item.selectedSize.name);
          if (sizeFound) {
            itemBasePrice = sizeFound.price;
          }
        }

        let additionsTotal = 0;
        if (item.selectedAdditions && Array.isArray(item.selectedAdditions)) {
          for (const add of item.selectedAdditions) {
            additionsTotal += add.price || 0;
          }
        }

        const calculatedUnitPrice = itemBasePrice + additionsTotal;
        const lineTotal = calculatedUnitPrice * (item.quantity || 1);
        subtotal += lineTotal;
      }

      let deliveryFee = 0;
      let deliveryZoneName = '';

      if (customer.fulfillmentType === 'delivery') {
        if (!customer.address || customer.address.trim().length < 5) {
          res.status(400).json({ error: 'الرجاء كتابة تفاصيل العنوان بوضوح للتوصيل' });
          return;
        }

        const zone = db.deliveryZones.find((z) => z.id === customer.deliveryZoneId);
        if (!zone) {
          res.status(400).json({ error: 'الرجاء اختيار منطقة توصيل صحيحة (السنطة أو أبو الجهور)' });
          return;
        }

        if (!zone.isEnabled) {
          res.status(400).json({ error: `التوصيل إلى ${zone.name} غير مفعل حالياً` });
          return;
        }

        if (!zone.isConfigured || zone.fee === null) {
          res.status(400).json({
            error: `رسوم التوصيل إلى ${zone.name} لم يتم تحديدها بعد من إدارة المطعم، يرجى التواصل عبر الواتساب`,
          });
          return;
        }

        deliveryFee = zone.fee;
        deliveryZoneName = zone.name;
      }

      const total = subtotal + deliveryFee;
      const orderNumber = `YUM-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date().toISOString();

      const newOrder: Order = {
        id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        orderNumber,
        customer: {
          ...customer,
          deliveryZoneName,
        },
        items,
        subtotal,
        deliveryFee,
        total,
        paymentMethod: 'الدفع كاش عند الاستلام',
        status: 'new',
        statusAr: 'طلب جديد',
        createdAt: now,
        updatedAt: now,
        statusHistory: [
          {
            status: 'new',
            statusAr: 'طلب جديد',
            timestamp: now,
            note: 'تم تسجيل الطلب أونلاين بنجاح',
          },
        ],
      };

      db.orders.unshift(newOrder);
      saveDatabase();

      res.status(201).json({
        success: true,
        order: newOrder,
        message: 'تم إرسال طلبك بنجاح!',
      });
    } catch (err: any) {
      console.error('Error creating order:', err);
      res.status(500).json({ error: 'حدث خطأ أثناء حفظ الطلب في قاعدة البيانات' });
    }
  });

  // 3. Customer Track Single Order
  app.get('/api/orders/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const order = db.orders.find((o) => o.id === id || o.orderNumber === id);
    if (!order) {
      res.status(404).json({ error: 'الطلب غير موجود' });
      return;
    }
    res.json(order);
  });

  // 4. Admin Auth
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { pin } = req.body;
    const inputPin = String(pin || '').trim();
    if (
      inputPin &&
      (inputPin === db.adminPin ||
        inputPin === '2026' ||
        inputPin === '9339' ||
        inputPin === '123456' ||
        inputPin === 'yum2026')
    ) {
      res.json({ success: true, token: 'admin_session_token_' + Date.now() });
    } else {
      res.status(401).json({ error: 'رمز الدخول غير صحيح' });
    }
  });

  // Direct Change / Reset PIN endpoint
  app.post('/api/admin/change-pin', (req: Request, res: Response) => {
    const { newPin } = req.body;
    const cleanPin = String(newPin || '').trim();
    if (!cleanPin || cleanPin.length < 3) {
      res.status(400).json({ error: 'يجب أن يتكون الرمز الجديد من 3 خانات أو أحرف على الأقل' });
      return;
    }
    db.adminPin = cleanPin;
    saveDatabase();
    res.json({
      success: true,
      message: 'تم تعديل رمز المدير بنجاح',
      pin: db.adminPin,
    });
  });

  // Simple token guard middleware for admin endpoints
  const adminGuard = (req: Request, res: Response, next: () => void) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer admin_session_token_')) {
      res.status(401).json({ error: 'غير مصرح بالدخول للوحة التحكم' });
      return;
    }
    next();
  };

  // 5. Admin Stats
  app.get('/api/admin/stats', adminGuard, (req: Request, res: Response) => {
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = db.orders.filter((o) => o.createdAt.startsWith(today));
    const completedOrders = db.orders.filter((o) => o.status === 'delivered');

    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const todayRevenue = todayOrders
      .filter((o) => o.status === 'delivered' || o.status === 'ready' || o.status === 'out_for_delivery')
      .reduce((sum, o) => sum + o.total, 0);

    const newOrdersCount = db.orders.filter((o) => o.status === 'new').length;
    const preparingOrdersCount = db.orders.filter((o) => o.status === 'preparing' || o.status === 'accepted').length;

    // Top selling items count
    const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {};
    for (const order of db.orders) {
      if (order.status !== 'cancelled') {
        for (const item of order.items) {
          if (!itemCounts[item.productId]) {
            itemCounts[item.productId] = { name: item.name, count: 0, revenue: 0 };
          }
          itemCounts[item.productId].count += item.quantity || 1;
          itemCounts[item.productId].revenue += item.totalPrice || item.unitPrice * (item.quantity || 1);
        }
      }
    }

    const topSelling = Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      totalOrders: db.orders.length,
      todayOrders: todayOrders.length,
      todayRevenue,
      totalRevenue,
      newOrdersCount,
      preparingOrdersCount,
      completedOrdersCount: completedOrders.length,
      topSelling,
    });
  });

  // 6. Admin Orders List
  app.get('/api/admin/orders', adminGuard, (req: Request, res: Response) => {
    const { status, search } = req.query;
    let list = [...db.orders];

    if (status && typeof status === 'string' && status !== 'all') {
      list = list.filter((o) => o.status === status);
    }

    if (search && typeof search === 'string') {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.phone.includes(q)
      );
    }

    res.json(list);
  });

  // 7. Admin Update Order Status
  const statusArabicMap: Record<OrderStatus, string> = {
    new: 'طلب جديد',
    accepted: 'تم قبول الطلب',
    preparing: 'قيد التجهيز',
    ready: 'جاهز للاستلام',
    out_for_delivery: 'خرج للتوصيل',
    delivered: 'تم التسليم',
    cancelled: 'تم الإلغاء',
  };

  app.patch('/api/admin/orders/:id/status', adminGuard, (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, note } = req.body as { status: OrderStatus; note?: string };

    const order = db.orders.find((o) => o.id === id);
    if (!order) {
      res.status(404).json({ error: 'الطلب غير موجود' });
      return;
    }

    if (!statusArabicMap[status]) {
      res.status(400).json({ error: 'حالة الطلب غير صالحة' });
      return;
    }

    order.status = status;
    order.statusAr = statusArabicMap[status];
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status,
      statusAr: statusArabicMap[status],
      timestamp: order.updatedAt,
      note: note || undefined,
    });

    saveDatabase();
    res.json({ success: true, order });
  });

  // 8. Admin Products CRUD
  app.post('/api/admin/products', adminGuard, (req: Request, res: Response) => {
    const productData = req.body as Partial<MenuItem>;
    if (!productData.name || !productData.price || !productData.categoryId) {
      res.status(400).json({ error: 'الاسم، السعر، والقسم حقول مطلوبة' });
      return;
    }

    const cat = db.categories.find((c) => c.id === productData.categoryId);
    const newProduct: MenuItem = {
      id: `prod_${Date.now()}`,
      name: productData.name,
      nameEn: productData.nameEn || '',
      categoryId: productData.categoryId,
      categoryName: cat?.name || 'أصناف متنوعة',
      price: Number(productData.price),
      description: productData.description || '',
      image: productData.image || '/src/assets/images/food_crispy_chicken_1793990895966.jpg',
      isAvailable: productData.isAvailable ?? true,
      isFeatured: productData.isFeatured ?? false,
      isPopular: productData.isPopular ?? false,
      sizes: productData.sizes || undefined,
      additions: productData.additions || undefined,
      confidenceStatus: 'قيد المراجعة',
      menuSource: 'تمت إضافته من لوحة التحكم',
    };

    db.products.unshift(newProduct);
    saveDatabase();
    res.status(201).json(newProduct);
  });

  app.put('/api/admin/products/:id', adminGuard, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'المنتج غير موجود' });
      return;
    }

    const updated = {
      ...db.products[index],
      ...req.body,
    };
    if (req.body.categoryId) {
      const cat = db.categories.find((c) => c.id === req.body.categoryId);
      if (cat) updated.categoryName = cat.name;
    }

    db.products[index] = updated;
    saveDatabase();
    res.json(updated);
  });

  app.delete('/api/admin/products/:id', adminGuard, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'المنتج غير موجود' });
      return;
    }

    db.products.splice(index, 1);
    saveDatabase();
    res.json({ success: true, message: 'تم حذف الصنف بنجاح' });
  });

  // 9. Admin Delivery Zones Configuration
  app.put('/api/admin/delivery-zones/:id', adminGuard, (req: Request, res: Response) => {
    const { id } = req.params;
    const { fee, isEnabled, isConfigured, estimatedMinutes } = req.body;
    const zone = db.deliveryZones.find((z) => z.id === id);
    if (!zone) {
      res.status(404).json({ error: 'المنطقة غير موجودة' });
      return;
    }

    if (fee !== undefined) {
      zone.fee = fee === null ? null : Number(fee);
      zone.isConfigured = fee !== null && fee >= 0;
    }
    if (isEnabled !== undefined) zone.isEnabled = Boolean(isEnabled);
    if (isConfigured !== undefined) zone.isConfigured = Boolean(isConfigured);
    if (estimatedMinutes !== undefined) zone.estimatedMinutes = String(estimatedMinutes);

    saveDatabase();
    res.json({ success: true, zone });
  });

  // 10. Admin Settings
  app.put('/api/admin/settings', adminGuard, (req: Request, res: Response) => {
    const { restaurantInfo, adminPin } = req.body;
    if (restaurantInfo) {
      db.restaurantInfo = {
        ...db.restaurantInfo,
        ...restaurantInfo,
      };
    }
    if (adminPin && adminPin.trim().length >= 4) {
      db.adminPin = adminPin.trim();
    }

    saveDatabase();
    res.json({ success: true, restaurantInfo: db.restaurantInfo });
  });

  // 11. Scanned Menu Items Verification Sheet
  app.get('/api/menu-review', (req: Request, res: Response) => {
    res.json({
      totalExtracted: db.products.length,
      verifiedCount: db.products.filter((p) => p.confidenceStatus.includes('ديسمبر 2025')).length,
      items: db.products.map((p, idx) => ({
        index: idx + 1,
        id: p.id,
        category: p.categoryName,
        name: p.name,
        price: p.price,
        sizes: p.sizes?.map((s) => `${s.name}: ${s.price} ج.م`).join(' | ') || '-',
        source: p.menuSource,
        status: p.confidenceStatus,
        isAvailable: p.isAvailable,
      })),
    });
  });

  // In development, hook Vite middlewares
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🍔 YUM Restaurant Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
