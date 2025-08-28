import { useEffect, useState, useCallback } from 'react';
import API from '../AgriConnectRCA';

/**
 * Hook données agriculteur (produits + ventes)
 * - Corrige l’accès à res.data (au lieu de res.list)
 * - Robuste si l’API renvoie un tableau direct
 * - Expose stats/ventes/produits et action de vente (mise à jour du stock)
 */

const safeNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export default function useFarmerProducts(user) {
  const [farmerProducts, setFarmerProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFarmerProducts = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await API.getProducts({ farmer_id: user.id });
      // ✅ L’API renvoie { success, data } — on lit res.data
      const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setFarmerProducts(rows);
    } catch (e) {
      console.log('❌ fetch farmer products', e?.message || e);
      setFarmerProducts([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchSales = useCallback(async () => {
    try {
      // L’API /api/orders filtre par token (farmer voit ses commandes)
      const res = await API.getOrders();
      const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setSales(rows);
    } catch (e) {
      console.log('❌ fetch sales', e?.message || e);
      setSales([]);
    }
  }, []);

  // Déclenche les fetchs quand l’utilisateur est agriculteur
  useEffect(() => {
    if (user?.type === 'farmer' && user?.id) {
      fetchFarmerProducts();
      fetchSales();
    }
  }, [user?.type, user?.id, fetchFarmerProducts, fetchSales]);

  /**
   * Action: vente rapide (= décrémenter le stock)
   * Met à jour en base puis recharge la liste.
   */
  const onSellProduct = useCallback(
    async (productId, qty) => {
      try {
        const q = safeNumber(qty);
        if (q <= 0) return;
        const current = farmerProducts.find((p) => p.id === productId);
        if (!current) throw new Error('Produit introuvable');
        const newStock = Math.max(0, safeNumber(current.stock) - q);
        await API.updateProduct(productId, { stock: newStock });
        await fetchFarmerProducts();
      } catch (e) {
        console.log('❌ onSellProduct', e?.message || e);
        throw e;
      }
    },
    [farmerProducts, fetchFarmerProducts]
  );

  /**
   * Statistiques calculées côté client
   */
  const getFarmerStats = useCallback(() => {
    const productsCount = safeNumber(farmerProducts?.length);
    const ordersCount = safeNumber(sales?.length);

    const totalRevenue = (sales || []).reduce((sum, o) => {
      const total =
        safeNumber(o.total_amount) ||
        safeNumber(o.total) ||
        safeNumber(o.unit_price) * safeNumber(o.quantity);
      return sum + total;
    }, 0);

    const totalSold = (sales || []).reduce(
      (sum, o) => sum + safeNumber(o.quantity),
      0
    );

    const salesCount = ordersCount;

    return {
      productsCount,
      ordersCount,
      totalRevenue,
      totalSold,
      salesCount,
    };
  }, [farmerProducts, sales]);

  const getRecentSales = useCallback(
    (n = 5) => {
      const rows = Array.isArray(sales) ? sales : [];
      return rows.slice(0, n);
    },
    [sales]
  );

  const getTopProducts = useCallback(
    (n = 5) => {
      const map = new Map();
      for (const o of sales || []) {
        const pid = o.product_id;
        const q = safeNumber(o.quantity);
        if (!pid) continue;
        map.set(pid, (map.get(pid) || 0) + q);
      }
      const top = [...map.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(([product_id, soldQty]) => {
          const prod = (farmerProducts || []).find((p) => p.id === product_id);
          return {
            product_id,
            soldQty,
            name: prod?.name || 'Produit',
            unit: prod?.unit || 'kg',
            price: safeNumber(prod?.price),
          };
        });
      return top;
    },
    [sales, farmerProducts]
  );

  return {
    loading,
    farmerProducts,
    sales,

    // actions
    fetchFarmerProducts,
    fetchSales,
    onSellProduct,

    // sélecteurs/stats
    getFarmerStats,
    getRecentSales,
    getTopProducts,
  };
}
