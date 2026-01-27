import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const useInventoryStore = defineStore('inventory', () => {
  const units = ref([]);
  const atks = ref([]);
  const stocks = ref([]);
  const users = ref([]);
  const categories = ref([]);
  const history = ref([]);
  const transactions = ref([]);
  const transactionDetails = ref([]);
  const isLoading = ref(false);

  // --- REFRESH DATA DARI DATABASE ---
  const fetchAllData = async () => {
    isLoading.value = true;
    try {
      const { data } = await axios.get(`${API_URL}/sync-all`);
      units.value = data.units || [];
      atks.value = data.atks || [];
      categories.value = data.cats || [];
      stocks.value = data.stocks || [];
      users.value = data.users || [];
      history.value = data.history || [];
      transactions.value = data.transactions || [];
      transactionDetails.value = data.transactionDetails || [];
    } catch (error) {
      console.error("Sync Gagal:", error);
    } finally {
      isLoading.value = false;
    }
  };

  // --- CRUD HELPERS (ADD/UPDATE) ---
  // Fungsi umum untuk menyimpan data (User/ATK/Unit)
  const saveData = async (endpoint, payload, id = null) => {
    isLoading.value = true;
    try {
      if (id) {
        await axios.put(`${API_URL}/${endpoint}/${id}`, payload);
      } else {
        await axios.post(`${API_URL}/${endpoint}`, payload);
      }
      await fetchAllData(); // Refresh data setelah simpan
      return true;
    } catch (error) {
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteData = async (endpoint, id) => {
    isLoading.value = true;
    try {
      await axios.delete(`${API_URL}/${endpoint}/${id}`);
      await fetchAllData();
      return true;
    } catch (error) {
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // --- APPROVAL LOGIC ---
  const processBatchTransaction = async (trxId, processedItems) => {
    isLoading.value = true;
    try {
      let adminName = 'Admin';
      try {
        const admin = JSON.parse(localStorage.getItem('activeUser') || '{}');
        adminName = admin.full_name || 'Admin';
      } catch (e) { console.error("Parse Admin Gagal"); }

      await axios.post(`${API_URL}/process-transaction`, {
        trx_id: trxId,
        items: processedItems,
        actor_name: adminName
      });
      await fetchAllData();
      return true;
    } catch (error) {
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // --- USER REQUEST ---
  const createTransaction = async (payload) => {
    isLoading.value = true;
    try {
      await axios.post(`${API_URL}/transactions`, payload);
      await fetchAllData();
      return true;
    } catch (error) {
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // --- GETTERS ---
  const lowStockItems = computed(() => {
    return stocks.value.filter(s => s.stock <= s.stock_min).map(s => ({
      ...s,
      itemName: atks.value.find(a => a.id === s.item_id)?.name || 'Unknown',
      unitAlias: units.value.find(u => u.id === s.unit_id)?.alias || 'Unknown'
    }));
  });

  const pendingTransactionList = computed(() => {
    return transactions.value.filter(t => t.status === 'Pending').map(trx => {
      const details = transactionDetails.value.filter(d => d.transaction_id === trx.id).map(d => ({
        ...d,
        itemName: atks.value.find(i => i.id === d.item_id)?.name || 'Item Terhapus'
      }));
      return {
        ...trx,
        user_name: users.value.find(u => u.id === trx.user_id)?.full_name || 'User',
        unit_name: units.value.find(u => u.id === trx.unit_id)?.alias || 'Unit',
        details,
        itemCount: details.length
      };
    });
  });

  return {
    units, atks, stocks, users, categories, history, transactions, transactionDetails, isLoading,
    lowStockItems, pendingTransactionList,
    fetchAllData, processBatchTransaction, createTransaction, saveData, deleteData
  };
});