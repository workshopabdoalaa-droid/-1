import React, { useEffect, useState } from 'react';
import {
  initialCategories,
  initialDeliveryZones,
  initialProducts,
  initialRestaurantInfo,
  initialScannedSheets,
} from './data/initialData';
import {
  CartItem,
  Category,
  DeliveryZone,
  MenuItem,
  Order,
  ProductAddition,
  ProductVariantSize,
  RestaurantInfo,
  ScannedMenuSheet,
} from './types';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MenuSection } from './components/MenuSection';
import { OffersSection } from './components/OffersSection';
import { LocationSection } from './components/LocationSection';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ScannedMenuModal } from './components/ScannedMenuModal';
import { AdminDashboard } from './components/AdminDashboard';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { ShoppingBag } from 'lucide-react';

export default function App() {
  // Data States
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo>(initialRestaurantInfo);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [products, setProducts] = useState<MenuItem[]>(initialProducts);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(initialDeliveryZones);
  const [scannedSheets, setScannedSheets] = useState<ScannedMenuSheet[]>(initialScannedSheets);

  // Cart State (Persisted in localStorage)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('yum_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save cart changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('yum_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  // Modals & Navigation
  const [activeSection, setActiveSection] = useState('hero');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isScannedMenuOpen, setIsScannedMenuOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<MenuItem | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Fetch live server data
  const loadServerData = async () => {
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        if (data.restaurantInfo) setRestaurantInfo(data.restaurantInfo);
        if (data.categories) setCategories(data.categories);
        if (data.products) setProducts(data.products);
        if (data.deliveryZones) setDeliveryZones(data.deliveryZones);
        if (data.scannedSheets) setScannedSheets(data.scannedSheets);
      }
    } catch (err) {
      console.warn('Backend server loading fallback:', err);
    }
  };

  useEffect(() => {
    loadServerData();
  }, []);

  // Cart Operations
  const handleAddToCartQuick = (product: MenuItem) => {
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined;
    const basePrice = defaultSize ? defaultSize.price : product.price;

    const cartItemId = `${product.id}_${defaultSize ? defaultSize.name : 'std'}`;
    const existingIndex = cartItems.findIndex((it) => it.cartItemId === cartItemId);

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].totalPrice =
        updated[existingIndex].unitPrice * updated[existingIndex].quantity;
      setCartItems(updated);
    } else {
      const newItem: CartItem = {
        cartItemId,
        productId: product.id,
        name: product.name,
        image: product.image,
        selectedSize: defaultSize,
        selectedAdditions: [],
        quantity: 1,
        unitPrice: basePrice,
        totalPrice: basePrice,
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const handleAddToCartWithOptions = (
    product: MenuItem,
    size: ProductVariantSize | undefined,
    additions: ProductAddition[],
    quantity: number,
    notes: string
  ) => {
    const basePrice = size ? size.price : product.price;
    const additionsTotal = additions.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = basePrice + additionsTotal;
    const lineTotal = unitPrice * quantity;

    const additionsKey = additions.map((a) => a.id).sort().join('_');
    const cartItemId = `${product.id}_${size ? size.name : 'std'}_${additionsKey}_${notes.trim()}`;

    const existingIndex = cartItems.findIndex((it) => it.cartItemId === cartItemId);

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += quantity;
      updated[existingIndex].totalPrice =
        updated[existingIndex].unitPrice * updated[existingIndex].quantity;
      setCartItems(updated);
    } else {
      const newItem: CartItem = {
        cartItemId,
        productId: product.id,
        name: product.name,
        image: product.image,
        selectedSize: size,
        selectedAdditions: additions,
        quantity,
        unitPrice,
        totalPrice: lineTotal,
        notes: notes.trim() || undefined,
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(cartItemId);
      return;
    }
    const updated = cartItems.map((item) => {
      if (item.cartItemId === cartItemId) {
        return {
          ...item,
          quantity: newQty,
          totalPrice: item.unitPrice * newQty,
        };
      }
      return item;
    });
    setCartItems(updated);
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCartItems(cartItems.filter((it) => it.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const totalCartCount = cartItems.reduce((sum, it) => sum + it.quantity, 0);
  const totalCartPrice = cartItems.reduce((sum, it) => sum + it.totalPrice, 0);

  return (
    <div className="min-h-screen bg-[#0f0e0e] text-[#f7f5f2] flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        restaurantInfo={restaurantInfo}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenScannedMenu={() => setIsScannedMenuOpen(true)}
        activeSection={activeSection}
        onNavigate={scrollToSection}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          restaurantInfo={restaurantInfo}
          onExploreMenu={() => scrollToSection('menu')}
          onOpenScannedMenu={() => setIsScannedMenuOpen(true)}
        />

        {/* Special Offers Section */}
        <OffersSection
          products={products}
          onAddToCart={handleAddToCartQuick}
          onOpenDetails={(p) => setSelectedProductForDetail(p)}
        />

        {/* Main Menu Section */}
        <MenuSection
          categories={categories}
          products={products}
          selectedCategory={selectedCategory}
          onSelectCategory={(id) => setSelectedCategory(id)}
          onAddToCart={handleAddToCartQuick}
          onOpenProductDetails={(p) => setSelectedProductForDetail(p)}
          onOpenScannedMenu={() => setIsScannedMenuOpen(true)}
        />

        {/* Location & Map Section */}
        <LocationSection restaurantInfo={restaurantInfo} />
      </main>

      {/* Footer */}
      <Footer
        restaurantInfo={restaurantInfo}
        onNavigate={scrollToSection}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenScannedMenu={() => setIsScannedMenuOpen(true)}
      />

      {/* Floating Bottom Bar for Mobile when cart has items */}
      {cartItems.length > 0 && !isCartOpen && !isCheckoutOpen && (
        <aside aria-label="Cart Bar" className="md:hidden fixed bottom-4 inset-x-4 z-30">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl shadow-2xl shadow-red-950/80 font-bold text-sm active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span>عرض السلة ({totalCartCount})</span>
            </div>
            <span className="font-black text-amber-300 tabular-nums">
              {totalCartPrice} ج.م
            </span>
          </button>
        </aside>
      )}

      {/* Floating WhatsApp Button */}
      <FloatingWhatsApp whatsappNumber={restaurantInfo.whatsapp} />

      {/* Modals */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        deliveryZones={deliveryZones}
        restaurantInfo={restaurantInfo}
        onOrderSuccess={(order) => {
          setConfirmedOrder(order);
        }}
        onClearCart={handleClearCart}
      />

      <OrderConfirmationModal
        order={confirmedOrder}
        restaurantInfo={restaurantInfo}
        onClose={() => setConfirmedOrder(null)}
      />

      <ProductDetailModal
        product={selectedProductForDetail}
        onClose={() => setSelectedProductForDetail(null)}
        onAddToCartWithOptions={handleAddToCartWithOptions}
      />

      <ScannedMenuModal
        isOpen={isScannedMenuOpen}
        onClose={() => setIsScannedMenuOpen(false)}
        sheets={scannedSheets}
      />

      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        categories={categories}
        products={products}
        deliveryZones={deliveryZones}
        restaurantInfo={restaurantInfo}
        onRefreshData={loadServerData}
      />
    </div>
  );
}
