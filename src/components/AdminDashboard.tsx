import React from 'react';
import {
  X,
  Lock,
  LogOut,
  TrendingUp,
  Package,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Printer,
  Plus,
  Edit2,
  Trash2,
  Settings,
  MapPin,
  FileSpreadsheet,
  Phone,
  RefreshCw,
  Bell,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  Category,
  DashboardStats,
  DeliveryZone,
  MenuItem,
  Order,
  OrderStatus,
  RestaurantInfo,
} from '../types';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  products: MenuItem[];
  deliveryZones: DeliveryZone[];
  restaurantInfo: RestaurantInfo;
  onRefreshData: () => void;
}

const statusOptions: Array<{ id: OrderStatus; label: string; color: string }> = [
  { id: 'new', label: 'طلب جديد', color: 'bg-red-500/20 text-red-400 border-red-500/40' },
  { id: 'accepted', label: 'تم قبول الطلب', color: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
  { id: 'preparing', label: 'قيد التجهيز', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
  { id: 'ready', label: 'جاهز للاستلام', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40' },
  { id: 'out_for_delivery', label: 'خرج للتوصيل', color: 'bg-purple-500/20 text-purple-400 border-purple-500/40' },
  { id: 'delivered', label: 'تم التسليم', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
  { id: 'cancelled', label: 'تم الإلغاء', color: 'bg-stone-700 text-stone-400 border-stone-600' },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  categories,
  products,
  deliveryZones,
  restaurantInfo,
  onRefreshData,
}) => {
  if (!isOpen) return null;

  // Authentication State
  const [authToken, setAuthToken] = React.useState<string | null>(() => {
    return localStorage.getItem('yum_admin_token') || null;
  });
  const [pinInput, setPinInput] = React.useState('');
  const [pinError, setPinError] = React.useState<string | null>(null);
  const [isChangingPin, setIsChangingPin] = React.useState(false);
  const [customNewPin, setCustomNewPin] = React.useState('');
  const [changePinSuccess, setChangePinSuccess] = React.useState<string | null>(null);
  const [changePinError, setChangePinError] = React.useState<string | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = React.useState<
    'orders' | 'stats' | 'menu' | 'delivery' | 'settings' | 'menu-review'
  >('orders');

  // Orders State
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = React.useState<string>('all');
  const [orderSearch, setOrderSearch] = React.useState('');
  const [isLoadingOrders, setIsLoadingOrders] = React.useState(false);
  const [printOrder, setPrintOrder] = React.useState<Order | null>(null);

  // Stats State
  const [stats, setStats] = React.useState<DashboardStats | null>(null);

  // Products Edit State
  const [editingProduct, setEditingProduct] = React.useState<MenuItem | null>(null);
  const [isAddingProduct, setIsAddingProduct] = React.useState(false);
  const [productSearch, setProductSearch] = React.useState('');
  const [productCatFilter, setProductCatFilter] = React.useState('all');

  // Delivery Zones State
  const [localZones, setLocalZones] = React.useState<DeliveryZone[]>(deliveryZones);
  const [isSavingZones, setIsSavingZones] = React.useState(false);
  const [zonesSaveMessage, setZonesSaveMessage] = React.useState<string | null>(null);

  // Settings State
  const [localInfo, setLocalInfo] = React.useState<RestaurantInfo>(restaurantInfo);
  const [newPin, setNewPin] = React.useState('');
  const [isSavingSettings, setIsSavingSettings] = React.useState(false);
  const [settingsMessage, setSettingsMessage] = React.useState<string | null>(null);

  // Sound Alert Preference
  const [soundEnabled, setSoundEnabled] = React.useState(true);

  // Fetch Orders
  const fetchOrders = React.useCallback(async () => {
    if (!authToken) return;
    setIsLoadingOrders(true);
    try {
      const res = await fetch(
        `/api/admin/orders?status=${orderFilter}&search=${encodeURIComponent(orderSearch)}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else if (res.status === 401) {
        setAuthToken(null);
        localStorage.removeItem('yum_admin_token');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [authToken, orderFilter, orderSearch]);

  // Fetch Stats
  const fetchStats = React.useCallback(async () => {
    if (!authToken) return;
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    }
  }, [authToken]);

  React.useEffect(() => {
    if (authToken) {
      fetchOrders();
      fetchStats();
      const interval = setInterval(() => {
        fetchOrders();
        fetchStats();
      }, 15000); // 15 seconds auto refresh
      return () => clearInterval(interval);
    }
  }, [authToken, fetchOrders, fetchStats]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setAuthToken(data.token);
        localStorage.setItem('yum_admin_token', data.token);
        setPinInput('');
      } else {
        setPinError(data.error || 'رمز الدخول غير صحيح');
      }
    } catch (err) {
      setPinError('تعذر الاتصال بالخادم');
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem('yum_admin_token');
  };

  // Direct PIN Change from login screen
  const handleDirectChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePinError(null);
    setChangePinSuccess(null);
    try {
      const res = await fetch('/api/admin/change-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPin: customNewPin }),
      });
      const data = await res.json();
      if (res.ok) {
        setChangePinSuccess(`تم تعديل رمز المدير بنجاح إلى: ${customNewPin}`);
        setPinInput(customNewPin);
        setCustomNewPin('');
        setTimeout(() => {
          setIsChangingPin(false);
          setChangePinSuccess(null);
        }, 2000);
      } else {
        setChangePinError(data.error || 'تعذر تعديل الرمز');
      }
    } catch {
      setChangePinError('حدث خطأ في الاتصال بالخادم');
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchOrders();
        fetchStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save Delivery Zones
  const handleSaveDeliveryZone = async (zone: DeliveryZone) => {
    setIsSavingZones(true);
    setZonesSaveMessage(null);
    try {
      const res = await fetch(`/api/admin/delivery-zones/${zone.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          fee: zone.fee,
          isEnabled: zone.isEnabled,
          isConfigured: zone.isConfigured,
          estimatedMinutes: zone.estimatedMinutes,
        }),
      });
      if (res.ok) {
        setZonesSaveMessage('تم تحديث إعدادات منطقة التوصيل بنجاح');
        onRefreshData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingZones(false);
    }
  };

  // Save Restaurant Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsMessage(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          restaurantInfo: localInfo,
          adminPin: newPin || undefined,
        }),
      });
      if (res.ok) {
        setSettingsMessage('تم حفظ إعدادات المطعم بنجاح');
        setNewPin('');
        onRefreshData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Toggle product availability
  const handleToggleProduct = async (product: MenuItem) => {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ isAvailable: !product.isAvailable }),
      });
      if (res.ok) {
        onRefreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الصنف من المنيو؟')) return;
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        onRefreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered Products for menu tab
  const filteredProducts = products.filter((p) => {
    const matchesCat = productCatFilter === 'all' || p.categoryId === productCatFilter;
    const matchesSearch =
      productSearch.trim() === '' ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(productSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/85 backdrop-blur-md flex flex-col justify-between text-right">
      {/* Top Header */}
      <div className="p-4 bg-[#141212] border-b border-stone-800 flex items-center justify-between gap-4">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600 text-white font-black text-sm flex items-center justify-center">
            YUM
          </div>
          <div>
            <h2 className="text-base font-black text-white">لوحة تحكم إدارة مطعم YUM</h2>
            <span className="text-xs text-stone-400">السنطة · أبو الجهور</span>
          </div>
        </div>

        {authToken && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchOrders();
                fetchStats();
              }}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-bold flex items-center gap-1"
              title="تحديث البيانات"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تحديث</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-bold flex items-center gap-1 border border-red-800/40"
              title="تسجيل الخروج"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl w-full mx-auto">
        {!authToken ? (
          /* Login Screen */
          <div className="max-w-md mx-auto my-12 bg-[#161413] border border-stone-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-600/30 text-red-500 mx-auto flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">تسجيل دخول صاحب المطعم</h3>
              <p className="text-xs text-stone-400 mt-1">
                الوصول محمي ومقتصر على إدارة مطعم YUM فقط لإدارة الطلبات والأسعار.
              </p>
            </div>

            {/* Current PIN quick notice */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center justify-between">
              <span>رمز المدير الحالي المعتمد:</span>
              <strong className="text-sm font-black text-amber-400 tracking-wider tabular-nums">2026</strong>
            </div>

            {!isChangingPin ? (
              <form onSubmit={handleLogin} className="space-y-4 text-right">
                {pinError && (
                  <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-200">
                    {pinError}
                  </div>
                )}
                {changePinSuccess && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-xs text-emerald-200">
                    {changePinSuccess}
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1">
                    أدخل رمز الدخول (الرمز الحالي: 2026):
                  </label>
                  <input
                    type="password"
                    required
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="2026"
                    className="w-full px-4 py-3 bg-stone-900 border border-stone-800 rounded-xl text-center text-lg tracking-widest text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-red-700/30 transition-all active:scale-98"
                >
                  دخول للوحة التحكم
                </button>

                <div className="pt-2 border-t border-stone-800/80 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPin(true);
                      setPinError(null);
                    }}
                    className="text-xs text-stone-400 hover:text-amber-400 transition-colors underline font-medium"
                  >
                    ترغب بتغيير رمز المدير الآن؟ اضغط هنا
                  </button>
                </div>
              </form>
            ) : (
              /* Inline Form to Change PIN directly */
              <form onSubmit={handleDirectChangePin} className="space-y-4 text-right">
                <div className="text-right">
                  <span className="text-xs font-bold text-white block">تعيين رمز دخول جديد للمدير:</span>
                  <span className="text-[11px] text-stone-400">يمكنك كتابة أي رقم أو كلمة سرية خاصة بك.</span>
                </div>

                {changePinError && (
                  <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-200">
                    {changePinError}
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    required
                    value={customNewPin}
                    onChange={(e) => setCustomNewPin(e.target.value)}
                    placeholder="اكتب الرمز الجديد هنا (مثال: 7788)"
                    className="w-full px-4 py-3 bg-stone-900 border border-amber-500/50 rounded-xl text-center text-lg tracking-widest text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl shadow-md transition-all"
                  >
                    حفظ الرمز الجديد
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsChangingPin(false)}
                    className="px-4 py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* Admin Dashboard Content */
          <div className="space-y-6">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-800">
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'orders'
                    ? 'bg-red-600 text-white'
                    : 'bg-stone-900 text-stone-300 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>إدارة الطلبات</span>
                {stats && stats.newOrdersCount > 0 && (
                  <span className="bg-amber-400 text-black text-[10px] font-black px-1.5 py-0.2 rounded-full tabular-nums">
                    {stats.newOrdersCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('stats')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'stats'
                    ? 'bg-red-600 text-white'
                    : 'bg-stone-900 text-stone-300 hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>الإحصائيات والمبيعات</span>
              </button>

              <button
                onClick={() => setActiveTab('menu')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'menu'
                    ? 'bg-red-600 text-white'
                    : 'bg-stone-900 text-stone-300 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>إدارة المنيو والأسعار</span>
              </button>

              <button
                onClick={() => setActiveTab('delivery')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'delivery'
                    ? 'bg-red-600 text-white'
                    : 'bg-stone-900 text-stone-300 hover:text-white'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>رسوم ومناطق التوصيل</span>
              </button>

              <button
                onClick={() => setActiveTab('menu-review')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'menu-review'
                    ? 'bg-red-600 text-white'
                    : 'bg-stone-900 text-stone-300 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>جدول تدقيق ومراجعة المنيو</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'settings'
                    ? 'bg-red-600 text-white'
                    : 'bg-stone-900 text-stone-300 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>إعدادات المطعم</span>
              </button>
            </div>

            {/* TAB 1: ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  <div className="flex items-center gap-2 overflow-x-auto">
                    <button
                      onClick={() => setOrderFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                        orderFilter === 'all'
                          ? 'bg-amber-500 text-black'
                          : 'bg-stone-900 text-stone-400 hover:text-white'
                      }`}
                    >
                      الكل ({orders.length})
                    </button>
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setOrderFilter(opt.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                          orderFilter === opt.id
                            ? 'bg-amber-500 text-black'
                            : 'bg-stone-900 text-stone-400 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="بحث برقم الطلب، الهاتف، أو الاسم..."
                      className="w-full sm:w-64 pl-3 pr-8 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-400 focus:outline-none focus:border-red-500"
                    />
                    <Search className="w-4 h-4 text-stone-400 absolute right-2.5 top-2.5" />
                  </div>
                </div>

                {/* Orders List */}
                {isLoadingOrders ? (
                  <div className="py-12 text-center text-stone-400 text-xs">جاري تحميل الطلبات...</div>
                ) : orders.length === 0 ? (
                  <div className="py-16 text-center bg-stone-900/40 rounded-2xl border border-stone-800 text-stone-400 text-xs">
                    لا توجد طلبات تطابق الفلتر الحالي
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const statusInfo =
                        statusOptions.find((s) => s.id === order.status) || statusOptions[0];
                      return (
                        <div
                          key={order.id}
                          className="p-5 bg-[#161413] border border-stone-800 rounded-2xl space-y-4"
                        >
                          {/* Order Header */}
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800/80 pb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-black text-amber-400 tabular-nums tracking-wide">
                                {order.orderNumber}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${statusInfo.color}`}
                              >
                                {order.statusAr}
                              </span>
                              <span className="text-xs text-stone-400 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{new Date(order.createdAt).toLocaleTimeString('ar-EG')}</span>
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Print Receipt */}
                              <button
                                onClick={() => setPrintOrder(order)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-lg transition-colors"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>إيصال / فاتورة</span>
                              </button>

                              {/* Status changer dropdown */}
                              <select
                                value={order.status}
                                onChange={(e) =>
                                  handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                                }
                                className="px-3 py-1.5 bg-stone-900 border border-stone-700 text-white rounded-lg text-xs font-bold focus:outline-none focus:border-amber-500"
                              >
                                {statusOptions.map((opt) => (
                                  <option key={opt.id} value={opt.id}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Customer & Items Split */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                            {/* Customer details */}
                            <div className="md:col-span-5 p-3 bg-stone-900/60 rounded-xl space-y-1.5">
                              <p className="text-stone-400">
                                العميل:{' '}
                                <strong className="text-white font-bold">{order.customer.name}</strong>
                              </p>
                              <p className="text-stone-400">
                                الهاتف:{' '}
                                <strong className="text-amber-400 tabular-nums">
                                  {order.customer.phone}
                                </strong>
                              </p>
                              <p className="text-stone-400">
                                طريقة الاستلام:{' '}
                                <strong className="text-white">
                                  {order.customer.fulfillmentType === 'delivery'
                                    ? `توصيل (${order.customer.deliveryZoneName || ''})`
                                    : 'استلام من المطعم'}
                                </strong>
                              </p>
                              {order.customer.address && (
                                <p className="text-stone-400">
                                  العنوان:{' '}
                                  <span className="text-stone-200">{order.customer.address}</span>
                                </p>
                              )}
                              {order.customer.notes && (
                                <p className="text-amber-300 italic pt-1">
                                  ملاحظة: {order.customer.notes}
                                </p>
                              )}
                            </div>

                            {/* Ordered Items */}
                            <div className="md:col-span-7 space-y-1.5">
                              <span className="font-bold text-stone-300 block mb-1">
                                الأصناف المطلوبة ({order.items.length}):
                              </span>
                              <div className="space-y-1">
                                {order.items.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between p-2 bg-stone-900/40 rounded-lg"
                                  >
                                    <div>
                                      <span className="font-bold text-white">
                                        {item.quantity}x {item.name}
                                      </span>
                                      {item.selectedSize && (
                                        <span className="text-amber-400 text-[11px] mr-1">
                                          ({item.selectedSize.name})
                                        </span>
                                      )}
                                      {item.selectedAdditions && item.selectedAdditions.length > 0 && (
                                        <span className="text-stone-400 text-[10px] block">
                                          + {item.selectedAdditions.map((a) => a.name).join('، ')}
                                        </span>
                                      )}
                                    </div>
                                    <span className="font-bold text-amber-400 tabular-nums">
                                      {item.totalPrice} ج.م
                                    </span>
                                  </div>
                                ))}
                              </div>

                              <div className="pt-2 border-t border-stone-800 flex justify-between items-center font-bold">
                                <span>
                                  المجموع: {order.subtotal} + {order.deliveryFee} توصيل
                                </span>
                                <span className="text-sm font-black text-amber-400 tabular-nums">
                                  الإجمالي: {order.total} ج.م (كاش)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: STATS */}
            {activeTab === 'stats' && stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-stone-900 rounded-2xl border border-stone-800 space-y-1">
                    <span className="text-xs text-stone-400 block">إجمالي الطلبات</span>
                    <span className="text-2xl font-black text-white tabular-nums">
                      {stats.totalOrders}
                    </span>
                  </div>
                  <div className="p-4 bg-stone-900 rounded-2xl border border-stone-800 space-y-1">
                    <span className="text-xs text-stone-400 block">طلبات اليوم</span>
                    <span className="text-2xl font-black text-amber-400 tabular-nums">
                      {stats.todayOrders}
                    </span>
                  </div>
                  <div className="p-4 bg-stone-900 rounded-2xl border border-stone-800 space-y-1">
                    <span className="text-xs text-stone-400 block">مبيعات اليوم</span>
                    <span className="text-2xl font-black text-emerald-400 tabular-nums">
                      {stats.todayRevenue} ج.م
                    </span>
                  </div>
                  <div className="p-4 bg-stone-900 rounded-2xl border border-stone-800 space-y-1">
                    <span className="text-xs text-stone-400 block">إجمالي المبيعات</span>
                    <span className="text-2xl font-black text-sky-400 tabular-nums">
                      {stats.totalRevenue} ج.م
                    </span>
                  </div>
                </div>

                {/* Top Selling Meals */}
                <div className="p-5 bg-[#161413] border border-stone-800 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                    <span>أكثر الوجبات مبيعاً وطلباً</span>
                  </h3>
                  {stats.topSelling.length > 0 ? (
                    <div className="space-y-2">
                      {stats.topSelling.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-stone-900 rounded-xl text-xs"
                        >
                          <span className="font-bold text-white">
                            {idx + 1}. {item.name}
                          </span>
                          <div className="flex items-center gap-4">
                            <span className="text-stone-400">{item.count} طلب</span>
                            <span className="font-black text-amber-400 tabular-nums">
                              {item.revenue} ج.م
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-stone-400">ستظهر الإحصائيات مع استلام الطلبات.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: MENU MANAGEMENT */}
            {activeTab === 'menu' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  <div className="flex items-center gap-2">
                    <select
                      value={productCatFilter}
                      onChange={(e) => setProductCatFilter(e.target.value)}
                      className="px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white focus:outline-none"
                    >
                      <option value="all">جميع الأقسام ({products.length})</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    <div className="relative flex-1 sm:w-64">
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="بحث في المنيو..."
                        className="w-full pl-3 pr-8 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-400 focus:outline-none"
                      />
                      <Search className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-2.5" />
                    </div>
                  </div>

                  <button
                    onClick={() => setIsAddingProduct(true)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة صنف جديد</span>
                  </button>
                </div>

                {/* Products Table */}
                <div className="overflow-x-auto rounded-2xl border border-stone-800 bg-[#161413]">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-stone-900/80 text-stone-400 border-b border-stone-800 font-bold">
                      <tr>
                        <th className="p-3">الصورة</th>
                        <th className="p-3">اسم الوجبة</th>
                        <th className="p-3">القسم</th>
                        <th className="p-3">السعر</th>
                        <th className="p-3">التوفر</th>
                        <th className="p-3">الحالة</th>
                        <th className="p-3 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60">
                      {filteredProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-stone-900/40 transition-colors">
                          <td className="p-3">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-12 h-12 rounded-lg object-cover bg-stone-800"
                              referrerPolicy="no-referrer"
                            />
                          </td>
                          <td className="p-3">
                            <p className="font-bold text-white">{prod.name}</p>
                            <p className="text-[11px] text-stone-400 line-clamp-1">{prod.description}</p>
                          </td>
                          <td className="p-3 text-stone-300">{prod.categoryName}</td>
                          <td className="p-3 font-bold text-amber-400 tabular-nums">
                            {prod.price} ج.م
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => handleToggleProduct(prod)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                prod.isAvailable
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                                  : 'bg-red-950 text-red-400 border border-red-800/40'
                              }`}
                            >
                              {prod.isAvailable ? 'متوفر' : 'غير متوفر'}
                            </button>
                          </td>
                          <td className="p-3 text-stone-400 text-[11px]">{prod.confidenceStatus}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1.5 text-stone-400 hover:text-red-400 transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: DELIVERY ZONES */}
            {activeTab === 'delivery' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="p-4 bg-stone-900/80 border border-stone-800 rounded-2xl space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span>مناطق التوصيل الرسمية لمطعم YUM</span>
                  </h3>
                  <p className="text-xs text-stone-400">
                    التوصيل محدد لمدينتي السنطة وقرية أبو الجهور فقط. يمكنك تعديل رسوم كل منطقة أو إيقاف التوصيل مؤقتاً لأي منها.
                  </p>
                </div>

                {zonesSaveMessage && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-xs text-emerald-200">
                    {zonesSaveMessage}
                  </div>
                )}

                <div className="space-y-4">
                  {localZones.map((zone, idx) => (
                    <div
                      key={zone.id}
                      className="p-5 bg-[#161413] border border-stone-800 rounded-2xl space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white text-base">{zone.name}</span>
                          <span className="text-xs text-stone-400">({zone.nameEn})</span>
                        </div>
                        <label className="flex items-center gap-2 text-xs font-bold text-stone-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={zone.isEnabled}
                            onChange={(e) => {
                              const updated = [...localZones];
                              updated[idx].isEnabled = e.target.checked;
                              setLocalZones(updated);
                            }}
                            className="rounded text-red-600 focus:ring-0"
                          />
                          <span>تفعيل التوصيل للمنطقة</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block text-stone-400 mb-1">
                            رسوم التوصيل بالجنيه المصري (EGP):
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={zone.fee ?? ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? null : Number(e.target.value);
                              const updated = [...localZones];
                              updated[idx].fee = val;
                              updated[idx].isConfigured = val !== null;
                              setLocalZones(updated);
                            }}
                            placeholder="حدد قيمة التوصيل"
                            className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-white font-bold tabular-nums focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-stone-400 mb-1">وقت التوصيل التقديري:</label>
                          <input
                            type="text"
                            value={zone.estimatedMinutes}
                            onChange={(e) => {
                              const updated = [...localZones];
                              updated[idx].estimatedMinutes = e.target.value;
                              setLocalZones(updated);
                            }}
                            placeholder="مثال: 30 - 45 دقيقة"
                            className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleSaveDeliveryZone(localZones[idx])}
                        disabled={isSavingZones}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black rounded-xl transition-colors"
                      >
                        حفظ تغييرات {zone.name}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: MENU REVIEW SHEET */}
            {activeTab === 'menu-review' && (
              <div className="space-y-4">
                <div className="p-4 bg-stone-900/80 border border-stone-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-amber-500" />
                      <span>جدول مراجعة وتدقيق المنيو المستخرجة (منيو ديسمبر 2025)</span>
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      تم استخراج جميع الأصناف بدقة فائقة من المنيو الأصلية دون تخمين أو حذف.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-lg text-xs font-bold">
                    {products.length} صنف مستخرج
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-stone-800 bg-[#161413]">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-stone-900 text-stone-300 border-b border-stone-800 font-bold">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">القسم</th>
                        <th className="p-3">اسم المنتج</th>
                        <th className="p-3">السعر (ج.م)</th>
                        <th className="p-3">الأحجام المتوفرة</th>
                        <th className="p-3">مصدر الصورة / الورقة</th>
                        <th className="p-3">حالة التأكيد</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60">
                      {products.map((p, idx) => (
                        <tr key={p.id} className="hover:bg-stone-900/40">
                          <td className="p-3 font-mono text-stone-400 tabular-nums">{idx + 1}</td>
                          <td className="p-3 text-stone-300 font-medium">{p.categoryName}</td>
                          <td className="p-3 font-bold text-white">{p.name}</td>
                          <td className="p-3 font-black text-amber-400 tabular-nums">{p.price}</td>
                          <td className="p-3 text-stone-400">
                            {p.sizes?.map((s) => `${s.name}: ${s.price} ج`).join(' | ') || '-'}
                          </td>
                          <td className="p-3 text-stone-400 text-[11px] truncate max-w-xs">
                            {p.menuSource}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                              {p.confidenceStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 6: SETTINGS */}
            {activeTab === 'settings' && (
              <form onSubmit={handleSaveSettings} className="max-w-2xl mx-auto space-y-5 text-right">
                {settingsMessage && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-xs text-emerald-200">
                    {settingsMessage}
                  </div>
                )}

                <div className="p-5 bg-[#161413] border border-stone-800 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-white">بيانات المطعم الأساسية</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-stone-400 mb-1">اسم المطعم بالعربية:</label>
                      <input
                        type="text"
                        value={localInfo.nameAr}
                        onChange={(e) => setLocalInfo({ ...localInfo, nameAr: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-400 mb-1">رقم الهاتف:</label>
                      <input
                        type="text"
                        value={localInfo.phone}
                        onChange={(e) => setLocalInfo({ ...localInfo, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-white tabular-nums focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-400 mb-1">رقم الواتساب:</label>
                      <input
                        type="text"
                        value={localInfo.whatsapp}
                        onChange={(e) => setLocalInfo({ ...localInfo, whatsapp: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-white tabular-nums focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-400 mb-1">مواعيد العمل:</label>
                      <input
                        type="text"
                        value={localInfo.openingHours}
                        onChange={(e) => setLocalInfo({ ...localInfo, openingHours: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-400 mb-1 text-xs">العنوان بالتفصيل:</label>
                    <input
                      type="text"
                      value={localInfo.address}
                      onChange={(e) => setLocalInfo({ ...localInfo, address: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-white text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 mb-1 text-xs">الشريط الإعلاني العلوي:</label>
                    <input
                      type="text"
                      value={localInfo.announcement}
                      onChange={(e) => setLocalInfo({ ...localInfo, announcement: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-white text-xs focus:outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="block text-stone-400 mb-1 text-xs">
                      تغيير رمز الدخول السري (PIN):
                    </label>
                    <input
                      type="password"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="اتركه فارغاً إذا كنت لا ترغب في تغييره"
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-sm rounded-xl shadow-lg shadow-red-700/25 transition-all"
                >
                  {isSavingSettings ? 'جاري الحفظ...' : 'حفظ جميع التعديلات'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Invoice Print Modal */}
      {printOrder && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white text-black p-6 rounded-2xl max-w-sm w-full space-y-4 text-right">
            <div className="text-center border-b pb-3">
              <h3 className="text-xl font-black">مطعم يَم (YUM)</h3>
              <p className="text-xs text-gray-600">السنطة - أبو الجهور - بجوار طلعت الشاذلي</p>
              <p className="text-xs text-gray-600">هاتف: {restaurantInfo.phone}</p>
            </div>

            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>رقم الفاتورة:</span>
                <span className="font-bold">{printOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>التاريخ:</span>
                <span>{new Date(printOrder.createdAt).toLocaleDateString('ar-EG')}</span>
              </div>
              <div className="flex justify-between">
                <span>العميل:</span>
                <span className="font-bold">{printOrder.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span>الهاتف:</span>
                <span>{printOrder.customer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span>النوع:</span>
                <span>
                  {printOrder.customer.fulfillmentType === 'delivery'
                    ? `توصيل (${printOrder.customer.deliveryZoneName})`
                    : 'استلام صالة'}
                </span>
              </div>
              {printOrder.customer.address && (
                <div>
                  <span className="text-gray-600">العنوان:</span>
                  <p className="font-semibold">{printOrder.customer.address}</p>
                </div>
              )}
            </div>

            <div className="border-t border-b py-2 space-y-1 text-xs">
              {printOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>
                    {it.quantity}x {it.name}
                  </span>
                  <span className="font-bold">{it.totalPrice} ج</span>
                </div>
              ))}
            </div>

            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>المجموع:</span>
                <span>{printOrder.subtotal} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span>رسوم التوصيل:</span>
                <span>{printOrder.deliveryFee} ج.م</span>
              </div>
              <div className="flex justify-between font-black text-sm pt-1 border-t">
                <span>المبلغ المطلوب (كاش):</span>
                <span>{printOrder.total} ج.م</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-black text-white font-bold text-xs rounded-lg"
              >
                طباعة الفاتورة
              </button>
              <button
                onClick={() => setPrintOrder(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 font-bold text-xs rounded-lg"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
