<template>
  <Transition name="toast-slide-top">
    <div v-if="toast.show" class="fixed top-20 left-1/2 z-[100] w-full max-w-sm -translate-x-1/2 transform px-4">
      <div class="flex items-center overflow-hidden rounded-2xl p-4 shadow-2xl backdrop-blur-xl ring-1 transition-all"
        :class="{ 
          'bg-white/95 text-slate-800 ring-slate-200': true, 
          'border-l-4 border-green-500': toast.type === 'success', 
          'border-l-4 border-red-500': toast.type === 'error' 
        }">
        <div class="flex-shrink-0">
          <CheckCircleIcon v-if="toast.type === 'success'" class="h-6 w-6 text-green-500" />
          <XCircleIcon v-if="toast.type === 'error'" class="h-6 w-6 text-red-500" />
        </div>
        <div class="ml-3 flex-1"><p class="text-sm font-semibold">{{ toast.message }}</p></div>
        <button @click="toast.show = false" class="ml-4 flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"><XMarkIcon class="h-5 w-5" /></button>
      </div>
    </div>
  </Transition>

  <div v-if="deleteModal.show" class="relative z-[1100]">
    <div class="fixed inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" @click="closeDeleteModal"></div>
    <div class="fixed inset-0 z-10 overflow-y-auto flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl transform transition-all">
         <div class="p-6 flex gap-4 items-start">
            <div class="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
               <NoSymbolIcon class="h-6 w-6" />
            </div>
            <div>
               <h3 class="text-lg font-bold text-slate-900">Hapus Barang Master</h3>
               <p class="text-sm text-slate-500 mt-1 leading-relaxed">
                  Yakin hapus <strong>{{ itemToDelete?.name }}</strong>? Menghapus item master akan memutus referensi data stok di seluruh unit kerja.
               </p>
            </div>
         </div>
         <div class="bg-slate-50 px-6 py-4 flex justify-end gap-3">
            <button @click="confirmDeleteAction" class="px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 shadow-sm transition-all">Hapus Permanen</button>
            <button @click="closeDeleteModal" class="px-5 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">Batal</button>
         </div>
      </div>
    </div>
  </div>

  <div class="space-y-8 animate-fade-in">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">Master Data ATK</h1>
        <p class="mt-2 text-base text-slate-500">Katalog Barang & Spesifikasi Teknis (Tabel: eatk_item).</p>
      </div>
      <div class="hidden sm:flex flex-col items-end justify-center">
        <div class="text-sm font-bold text-slate-700">{{ currentDate }}</div>
        <div class="text-xs font-mono text-slate-400">{{ currentTime }} WIB</div>
      </div>
    </div>

    <div class="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
      
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
          <ClipboardDocumentListIcon class="h-5 w-5 text-slate-400" /> Katalog Master
        </h2>
        <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div class="relative w-full sm:w-72">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><MagnifyingGlassIcon class="h-4 w-4 text-slate-400" /></div>
            <input v-model="searchQuery" @input="handleSearch" type="text" class="block w-full rounded-lg border-0 h-10 py-1.5 pl-10 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 transition-shadow" placeholder="Cari SKU atau nama barang...">
          </div>
          <button @click="openModal(null)" class="inline-flex items-center justify-center rounded-lg bg-blue-600 h-10 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-all whitespace-nowrap"><PlusIcon class="mr-1.5 h-4 w-4" /> Tambah Item</button>
        </div>
      </div>

      <div class="overflow-hidden rounded-xl border border-slate-200">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th class="w-[35%] py-3.5 pl-6 pr-3 text-left text-xs font-bold uppercase text-slate-500">Info Barang</th>
                <th class="w-[20%] px-3 py-3.5 text-left text-xs font-bold uppercase text-slate-500">Kategori</th>
                <th class="w-[15%] px-3 py-3.5 text-left text-xs font-bold uppercase text-slate-500">Batas Stok</th>
                <th class="w-[15%] px-3 py-3.5 text-right text-xs font-bold uppercase text-slate-500">Harga Acuan</th>
                <th class="w-[15%] py-3.5 pr-6 text-center text-xs font-bold uppercase text-slate-500">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              <tr v-if="filteredItems.length === 0"><td colspan="5" class="py-12 text-center text-sm text-slate-500">Data master tidak ditemukan.</td></tr>
              
              <tr v-for="item in paginatedItems" :key="item.id" class="hover:bg-slate-50 transition-colors">
                <td class="py-4 pl-6 pr-3">
                  <div class="flex items-center gap-4">
                    <div class="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                       <img v-if="item.url_photo" :src="item.url_photo" class="h-full w-full object-contain p-1" />
                       <PhotoIcon v-else class="h-6 w-6 text-slate-300" />
                    </div>
                    <div class="min-w-0">
                      <div class="font-bold text-slate-800 text-sm truncate">{{ item.name }}</div>
                      <div class="text-[10px] font-mono text-blue-600 mt-0.5">{{ item.code }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-3 py-4">
                   <span class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                     {{ getCategoryName(item.category_id) }}
                   </span>
                   <p class="text-[10px] text-slate-400 mt-1 uppercase font-bold">SATUAN: {{ item.uom }}</p>
                </td>
                <td class="px-3 py-4">
                   <div class="text-[10px] text-slate-500 uppercase font-bold">Min: <span class="text-slate-800">{{ item.min_stock }}</span></div>
                   <div class="text-[10px] text-slate-500 uppercase font-bold">Max: <span class="text-slate-800">{{ item.max_stock }}</span></div>
                </td>
                <td class="px-3 py-4 text-right text-sm font-bold text-slate-700 font-mono">
                   Rp {{ item.price?.toLocaleString('id-ID') }}
                </td>
                <td class="py-4 pr-6 text-center">
                  <div class="flex justify-center gap-3">
                    <button @click="openModal(item)" class="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wider">Edit</button>
                    <button @click="handleDelete(item)" class="text-red-600 hover:text-red-800 font-bold text-xs uppercase tracking-wider">Hapus</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-slate-700">
                Menampilkan
                <span class="font-bold text-slate-900">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
                sampai
                <span class="font-bold text-slate-900">{{ Math.min(currentPage * itemsPerPage, filteredItems.length) }}</span>
                dari
                <span class="font-bold text-slate-900">{{ filteredItems.length }}</span>
                data
              </p>
            </div>
            <div>
              <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button 
                  @click="prevPage" 
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="sr-only">Previous</span>
                  <ChevronLeftIcon class="h-5 w-5" aria-hidden="true" />
                </button>
                
                <button 
                  v-for="page in totalPages" 
                  :key="page"
                  @click="goToPage(page)"
                  :class="[
                    page === currentPage 
                      ? 'relative z-10 inline-flex items-center bg-blue-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600' 
                      : 'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0'
                  ]"
                >
                  {{ page }}
                </button>

                <button 
                  @click="nextPage" 
                  :disabled="currentPage === totalPages || totalPages === 0"
                  class="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="sr-only">Next</span>
                  <ChevronRightIcon class="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
          
          <div class="flex flex-1 justify-between sm:hidden">
            <button 
              @click="prevPage" 
              :disabled="currentPage === 1"
              class="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button 
              @click="nextPage" 
              :disabled="currentPage === totalPages || totalPages === 0"
              class="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>

  <ATKFormModal 
    :show="showModal" 
    :item-to-edit="selectedItem" 
    :category-options="store.categories" 
    @close="closeModal" 
    @save="handleSave" 
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useInventoryStore } from '../../stores/inventoryStore';
import ATKFormModal from '../../components/admin/ATKFormModal.vue';
import { 
  ClipboardDocumentListIcon, PlusIcon, MagnifyingGlassIcon, PhotoIcon,
  CheckCircleIcon, XCircleIcon, XMarkIcon, NoSymbolIcon,
  ChevronLeftIcon, ChevronRightIcon
} from '@heroicons/vue/24/outline';

const store = useInventoryStore();

// --- STATE ---
const searchQuery = ref('');
const toast = ref({ show: false, message: '', type: 'success' });
const showModal = ref(false);
const selectedItem = ref(null);
const deleteModal = ref({ show: false });
const itemToDelete = ref(null);

// --- PAGINATION STATE ---
const currentPage = ref(1);
const itemsPerPage = 10;

// --- HELPERS ---
const getCategoryName = (id) => store.categories.find(c => c.id === id)?.name || 'Umum';
const triggerToast = (msg, type) => { 
  toast.value = { show: true, message: msg, type }; 
  setTimeout(() => toast.value.show = false, 3000); 
};

// --- DATA FILTERING & PAGINATION ---
const filteredItems = computed(() => {
  return store.atks.filter(item => 
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
    item.code.toLowerCase().includes(searchQuery.value.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));
});

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredItems.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage));

const handleSearch = () => {
  currentPage.value = 1; // Reset halaman saat pencarian
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const goToPage = (page) => {
  currentPage.value = page;
};

// --- ACTIONS ---
const openModal = (item) => { selectedItem.value = item ? { ...item } : null; showModal.value = true; };
const closeModal = () => { showModal.value = false; selectedItem.value = null; };

const handleSave = async (itemData) => {
  try {
    if (itemData.id) {
      await axios.put(`http://localhost:3000/api/atks/${itemData.id}`, itemData);
      triggerToast('Data master berhasil diperbarui.', 'success');
    } else {
      await axios.post('http://localhost:3000/api/atks', itemData);
      triggerToast('Item master baru berhasil ditambahkan.', 'success');
    }
    await store.fetchAllData();
    closeModal();
  } catch (error) {
    triggerToast(error.response?.data?.message || 'Gagal sinkronisasi ke database.', 'error');
  }
};

const handleDelete = (item) => { itemToDelete.value = item; deleteModal.value.show = true; };
const closeDeleteModal = () => { deleteModal.value.show = false; itemToDelete.value = null; };

const confirmDeleteAction = async () => {
  if (!itemToDelete.value) return;
  try {
    await axios.delete(`http://localhost:3000/api/atks/${itemToDelete.value.id}`);
    await store.fetchAllData();
    triggerToast('Item master berhasil dihapus.', 'success');
  } catch (error) {
    triggerToast('Gagal menghapus data master.', 'error');
  } finally {
    closeDeleteModal();
  }
};

// --- TIME ---
const currentTime = ref('');
const currentDate = ref('');
onMounted(() => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('id-ID', { hour12: false });
  currentDate.value = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  store.fetchAllData();
});
</script>