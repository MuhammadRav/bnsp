<template>
  <div class="space-y-6 pb-20 animate-fade-in-up">
    
    <Transition name="toast">
      <div v-if="toast.show" 
           class="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border transition-all w-max max-w-sm backdrop-blur-md" 
           :class="toast.type === 'success' ? 'bg-white/95 text-slate-800 border-l-4 border-green-500' : 'bg-white/95 text-slate-800 border-l-4 border-red-500'"
      >
        <div class="h-8 w-8 rounded-full flex items-center justify-center shrink-0" :class="toast.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'">
          <CheckIcon v-if="toast.type === 'success'" class="h-5 w-5" />
          <XMarkIcon v-else class="h-5 w-5" />
        </div>
        <div>
          <h4 class="text-sm font-bold">{{ toast.title }}</h4>
          <p class="text-xs opacity-80">{{ toast.message }}</p>
        </div>
        <button @click="toast.show = false" class="ml-4 opacity-40 hover:opacity-100 transition-opacity"><XMarkIcon class="h-5 w-5" /></button>
      </div>
    </Transition>

    <Transition name="modal-fade">
      <div v-if="detailModal.show" class="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" @click="closeDetailModal"></div>

        <div class="relative w-full max-w-4xl h-[85vh] bg-slate-50 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-up ring-1 ring-white/20">
            <div class="px-8 py-6 border-b border-slate-200 bg-white flex justify-between items-start shrink-0 z-10 relative">
                <div>
                    <div class="flex items-center gap-3 mb-2">
                        <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border flex items-center gap-1.5"
                              :class="{
                                'bg-amber-100 text-amber-700 border-amber-200': detailModal.data.status === 'Pending',
                                'bg-blue-100 text-blue-700 border-blue-200': detailModal.data.status === 'Completed',
                                'bg-red-100 text-red-700 border-red-200': detailModal.data.status === 'Rejected'
                              }">
                              <span class="w-2 h-2 rounded-full" :class="{
                                'bg-amber-500': detailModal.data.status === 'Pending',
                                'bg-blue-500': detailModal.data.status === 'Completed',
                                'bg-red-500': detailModal.data.status === 'Rejected'
                              }"></span>
                              {{ detailModal.data.status === 'Pending' ? 'Menunggu Proses' : (detailModal.data.status === 'Completed' ? 'Disetujui' : 'Ditolak') }}
                        </span>
                        <span class="text-xs text-slate-400 font-mono font-bold tracking-wider">#{{ detailModal.data.code }}</span>
                    </div>
                    <h2 class="text-2xl font-black text-slate-800 tracking-tight">Detail Transaksi</h2>
                    <p class="text-sm text-slate-500 mt-1 flex items-center gap-2">
                        <UserIcon class="h-4 w-4 text-blue-600" /> 
                        <span class="font-bold text-slate-700">{{ currentUser?.full_name }}</span> 
                    </p>
                </div>
                <button @click="closeDetailModal" class="p-2 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors">
                    <XMarkIcon class="h-6 w-6" />
                </button>
            </div>

            <div class="px-8 py-5 bg-white border-b border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                <div class="space-y-1">
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Waktu Pengajuan</p>
                    <p class="text-sm font-bold text-slate-700 font-mono flex items-center gap-2 bg-slate-50 w-fit px-2 py-1 rounded border border-slate-100">
                        <PaperAirplaneIcon class="h-4 w-4 text-blue-500" />
                        {{ formatDateTimeFull(detailModal.data.created_at) }} WIB
                    </p>
                </div>
                <div class="col-span-1 md:col-span-2">
                    <p class="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Catatan Pengajuan</p>
                    <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm text-slate-600 italic flex gap-2">
                        <ChatBubbleBottomCenterTextIcon class="h-5 w-5 text-slate-400 shrink-0" />
                        "{{ detailModal.data.description || 'Tidak ada catatan.' }}"
                    </div>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                <div v-for="(item, idx) in detailModal.data.details" :key="idx" 
                     class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                    <div class="h-16 w-16 bg-slate-50 rounded-xl flex items-center justify-center p-2 border border-slate-100 shrink-0">
                         <img v-if="getDetailItem(item.item_id)?.url_photo" :src="getDetailItem(item.item_id).url_photo" class="h-full w-full object-contain" />
                         <CubeIcon v-else class="h-8 w-8 text-slate-300" />
                    </div>
                    <div class="flex-1">
                        <h4 class="text-sm font-bold text-slate-800">{{ getDetailItem(item.item_id)?.name || 'Unknown Item' }}</h4>
                        <p class="text-xs text-slate-400 font-mono">{{ getDetailItem(item.item_id)?.code }}</p>
                        <p v-if="item.qty_approved < item.qty && detailModal.data.status === 'Completed'" class="text-[10px] text-orange-600 font-bold mt-1 bg-orange-50 w-fit px-2 py-0.5 rounded">
                           Disetujui: {{ item.qty_approved }} / {{ item.qty }}
                        </p>
                    </div>
                    <div class="text-right">
                        <p class="text-[10px] text-slate-400 font-bold uppercase">Jumlah Request</p>
                        <p class="text-lg font-black text-slate-700">{{ item.qty }} <span class="text-xs font-medium text-slate-400">Pcs</span></p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </Transition>

    <div class="bg-white rounded-2xl p-5 shadow-sm border border-blue-50 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-30 backdrop-blur-xl bg-white/90">
      <div class="flex items-center gap-4 w-full md:w-auto">
        <div class="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md ring-2 ring-blue-100">
          {{ getFirstName(currentUser?.full_name).charAt(0) }}
        </div>
        <div>
          <h1 class="text-xl font-bold text-slate-800 leading-tight">Halo, {{ getFirstName(currentUser?.full_name) }}!</h1>
          <p class="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
            <BuildingOfficeIcon class="h-3 w-3 text-blue-500" /> {{ currentUser?.unit_name }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto justify-end">
        <div class="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button @click="switchTab('catalog')" class="px-4 py-2 rounded-lg text-xs font-bold transition-all" :class="activeTab === 'catalog' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'">Katalog</button>
          <button @click="switchTab('history')" class="px-4 py-2 rounded-lg text-xs font-bold transition-all" :class="activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'">Riwayat</button>
        </div>
        <button v-if="activeTab === 'catalog'" @click="isCartOpen = true" class="relative p-2.5 rounded-xl bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 pr-4">
           <ShoppingCartIcon class="h-5 w-5" />
           <span class="text-xs font-bold">Keranjang ({{ cart.length }})</span>
        </button>
      </div>
    </div>

    <div v-if="activeTab === 'catalog'">
      <div class="mb-6 flex flex-col sm:flex-row gap-4">
        <div class="relative flex-1">
          <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input v-model="searchQuery" @input="resetPage" type="text" placeholder="Cari barang..." class="w-full pl-11 pr-4 py-3 rounded-2xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="item in paginatedCatalog" :key="item.id" 
             class="bg-white rounded-2xl border border-slate-100 shadow-sm transition-all overflow-hidden flex flex-col group relative"
             :class="isFull(item.id) ? 'opacity-80' : 'hover:shadow-md'">
          
          <div class="h-40 bg-slate-50 flex items-center justify-center p-4 relative">
              <img v-if="item.url_photo" :src="item.url_photo" class="h-full object-contain transition-transform" :class="isFull(item.id) ? 'grayscale' : 'group-hover:scale-105'" />
              <CubeIcon v-else class="h-10 w-10 text-slate-300" />
              
              <div v-if="isFull(item.id)" class="absolute inset-0 bg-slate-100/50 flex items-center justify-center backdrop-blur-[1px]">
                  <span class="bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-md tracking-wider border-2 border-white -rotate-6">GUDANG PENUH</span>
              </div>
              <div v-else class="absolute top-3 right-3 bg-white/80 backdrop-blur rounded-lg px-2 py-1 text-[10px] font-bold border shadow-sm">
                 Stok Unit: <span class="text-blue-600">{{ getUnitStock(item.id) }}</span> / {{ item.max_stock }}
              </div>
          </div>

          <div class="p-4 flex-1 flex flex-col">
              <h3 class="text-sm font-bold text-slate-800 line-clamp-2 min-h-[40px]">{{ item.name }}</h3>
              <p class="text-[10px] text-slate-400 mt-1 font-mono">{{ item.code }}</p>
              
              <div class="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div class="text-[10px] font-bold text-slate-400 uppercase">Satuan: {{ item.uom }}</div>
                  
                  <button @click="addToCart(item)" 
                          :disabled="isInCart(item.id) || isFull(item.id)"
                          class="p-2 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2"
                          :class="{
                              'bg-emerald-100 text-emerald-600 cursor-default': isInCart(item.id),
                              'bg-slate-100 text-slate-400 cursor-not-allowed': isFull(item.id) && !isInCart(item.id),
                              'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white': !isInCart(item.id) && !isFull(item.id)
                          }">
                      <CheckCircleIcon v-if="isInCart(item.id)" class="h-5 w-5" />
                      <NoSymbolIcon v-else-if="isFull(item.id)" class="h-5 w-5" />
                      <PlusCircleIcon v-else class="h-5 w-5" />
                  </button>
              </div>
          </div>
        </div>
      </div>

      <div v-if="filteredCatalog.length > 0" class="flex items-center justify-between mt-8 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
         <p class="text-sm text-slate-500">
            Menampilkan <span class="font-bold text-slate-800">{{ (catalogPage - 1) * itemsPerPage + 1 }}</span> - 
            <span class="font-bold text-slate-800">{{ Math.min(catalogPage * itemsPerPage, filteredCatalog.length) }}</span> 
            dari <span class="font-bold text-slate-800">{{ filteredCatalog.length }}</span> barang
         </p>
         <div class="flex gap-2">
            <button @click="catalogPage > 1 ? catalogPage-- : null" :disabled="catalogPage === 1" class="px-3 py-1.5 rounded-lg border text-xs font-bold hover:bg-slate-50 disabled:opacity-50">Prev</button>
            <button @click="catalogPage < totalCatalogPages ? catalogPage++ : null" :disabled="catalogPage >= totalCatalogPages" class="px-3 py-1.5 rounded-lg border text-xs font-bold hover:bg-slate-50 disabled:opacity-50">Next</button>
         </div>
      </div>
    </div>

    <div v-if="activeTab === 'history'" class="space-y-4">
        <div v-if="myTransactions.length === 0" class="text-center py-12 text-slate-400 text-sm italic">Belum ada riwayat pengajuan.</div>
        
        <div v-for="trx in paginatedHistory" :key="trx.id" @click="openDetailModal(trx)" class="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 transition-all cursor-pointer shadow-sm group">
            <div class="flex justify-between items-center">
                <div class="flex items-center gap-4">
                    <div class="h-12 w-12 rounded-xl flex items-center justify-center transition-colors" 
                         :class="{
                            'bg-amber-100 text-amber-600': trx.status === 'Pending',
                            'bg-blue-100 text-blue-600': trx.status === 'Completed',
                            'bg-red-100 text-red-600': trx.status === 'Rejected'
                         }">
                        <ClockIcon v-if="trx.status === 'Pending'" class="h-6 w-6" />
                        <ClipboardDocumentCheckIcon v-else-if="trx.status === 'Completed'" class="h-6 w-6" />
                        <XMarkIcon v-else class="h-6 w-6" />
                    </div>
                    <div>
                        <h4 class="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{{ trx.code }}</h4>
                        <p class="text-[10px] text-slate-400 uppercase font-bold mt-0.5">{{ formatDateTimeFull(trx.created_at) }}</p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase border"
                          :class="{
                            'bg-amber-50 text-amber-700 border-amber-200': trx.status === 'Pending',
                            'bg-blue-50 text-blue-700 border-blue-200': trx.status === 'Completed',
                            'bg-red-50 text-red-700 border-red-200': trx.status === 'Rejected'
                          }">
                        {{ trx.status === 'Pending' ? 'Menunggu' : (trx.status === 'Completed' ? 'Selesai' : 'Ditolak') }}
                    </span>
                </div>
            </div>
        </div>

        <div v-if="myTransactions.length > 0" class="flex items-center justify-between mt-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <p class="text-sm text-slate-500">
               Halaman <span class="font-bold text-slate-800">{{ historyPage }}</span> dari <span class="font-bold text-slate-800">{{ totalHistoryPages }}</span>
            </p>
            <div class="flex gap-2">
               <button @click="historyPage > 1 ? historyPage-- : null" :disabled="historyPage === 1" class="px-3 py-1.5 rounded-lg border text-xs font-bold hover:bg-slate-50 disabled:opacity-50">Prev</button>
               <button @click="historyPage < totalHistoryPages ? historyPage++ : null" :disabled="historyPage >= totalHistoryPages" class="px-3 py-1.5 rounded-lg border text-xs font-bold hover:bg-slate-50 disabled:opacity-50">Next</button>
            </div>
        </div>
    </div>

    <Transition name="slide-over">
      <div v-if="isCartOpen" class="fixed inset-0 z-[100] flex justify-end">
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" @click="isCartOpen = false"></div>
          <div class="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col">
             
             <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-blue-600 text-white">
                <h3 class="font-bold flex items-center gap-2"><ShoppingCartIcon class="h-6 w-6"/> Keranjang Request</h3>
                <button @click="isCartOpen = false"><XMarkIcon class="h-6 w-6"/></button>
             </div>

             <div class="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                <div v-if="cart.length === 0" class="text-center py-10 text-slate-400 text-sm">Keranjang kosong.</div>
                
                <div v-for="(cartItem, idx) in cart" :key="cartItem.id" class="p-4 border border-slate-200 rounded-2xl bg-white shadow-sm flex gap-4 relative group">
                    <button @click="removeFromCart(idx)" class="absolute top-2 right-2 text-slate-300 hover:text-red-500"><XMarkIcon class="h-5 w-5" /></button>
                    
                    <div class="h-14 w-14 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                         <img v-if="cartItem.url_photo" :src="cartItem.url_photo" class="h-full object-contain" />
                         <CubeIcon v-else class="h-6 w-6 text-slate-300" />
                    </div>
                    
                    <div class="flex-1">
                        <p class="text-xs font-bold text-slate-800 line-clamp-1">{{ cartItem.name }}</p>
                        
                        <div class="flex items-center gap-2 mt-2">
                             <button @click="updateCartItem(cartItem, -1)" class="h-7 w-7 border rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-200 font-bold">-</button>
                             
                             <input 
                                type="text" 
                                v-model.number="cartItem.qty"
                                @input="validateCartInput(cartItem)"
                                @keypress="isNumber($event)"
                                @focus="$event.target.select()"
                                class="w-16 text-center text-sm font-bold border rounded-lg py-1 px-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                             />
                             
                             <button @click="updateCartItem(cartItem, 1)" class="h-7 w-7 border rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-200 font-bold" :disabled="getRemainingQuota(cartItem.id) <= cartItem.qty">+</button>
                        </div>

                        <p v-if="getRemainingQuota(cartItem.id) < cartItem.qty" class="text-[9px] text-red-500 font-bold mt-1 animate-pulse">Melebihi sisa stok unit!</p>
                        <p v-else class="text-[9px] mt-1 text-slate-400">Sisa Kuota: <span class="font-bold text-blue-600">{{ getRemainingQuota(cartItem.id) - (cartItem.qty - (cart.find(c => c.id === cartItem.id)?.qty || 0)) }}</span> (Realtime)</p>
                    </div>
                </div>
             </div>

             <div class="p-6 border-t border-slate-100 bg-white">
                <label class="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Keterangan Pengajuan</label>
                <textarea v-model="requestDescription" rows="2" class="w-full rounded-xl border-slate-200 text-sm p-3 bg-slate-50 mb-4 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Kebutuhan untuk..."></textarea>
                <button @click="handleSubmit" :disabled="cart.length === 0 || !requestDescription || isCartInvalid" class="w-full py-4 rounded-xl font-bold text-sm text-white transition-all bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed">Kirim Request</button>
             </div>
          </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useInventoryStore } from '../../stores/inventoryStore'; 
import { 
  PlusCircleIcon, CheckCircleIcon, CubeIcon, ShoppingCartIcon, 
  MagnifyingGlassIcon, XMarkIcon, ClockIcon, 
  BuildingOfficeIcon, CheckIcon, PaperAirplaneIcon,
  ClipboardDocumentCheckIcon, ChatBubbleBottomCenterTextIcon,
  UserIcon, NoSymbolIcon
} from '@heroicons/vue/24/outline';

const store = useInventoryStore();
const activeTab = ref('catalog'); 
const isCartOpen = ref(false);
const cart = ref([]);
const requestDescription = ref('');
const searchQuery = ref('');
const toast = ref({ show: false, type: 'success', title: '', message: '' });
let pollingInterval = null;

const catalogPage = ref(1);
const historyPage = ref(1);
const itemsPerPage = 12;

const detailModal = ref({ show: false, data: {} });

const currentUser = computed(() => {
  const stored = JSON.parse(localStorage.getItem('activeUser') || '{}');
  const user = store.users.find(u => u.id === stored.id) || stored;
  const unit = store.units.find(u => u.id === user?.unit_id);
  return { ...user, unit_name: unit ? unit.alias : 'Unit Tidak Diketahui' };
});

const getFirstName = (name) => name ? name.split(' ')[0] : 'User';
const getDetailItem = (itemId) => store.atks.find(i => i.id === itemId);

const getUnitStock = (itemId) => {
    const stock = store.stocks.find(s => s.item_id === itemId && s.unit_id === currentUser.value.unit_id);
    return stock ? stock.stock : 0;
};

const getRemainingQuota = (itemId) => {
    const masterItem = store.atks.find(i => i.id === itemId);
    const currentStock = getUnitStock(itemId);
    const max = masterItem ? masterItem.max_stock : 0;
    return Math.max(0, max - currentStock);
};

const isFull = (itemId) => getRemainingQuota(itemId) <= 0;

const formatDateTimeFull = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const filteredCatalog = computed(() => {
    return store.atks.filter(i => 
        i.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
        i.code.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

const paginatedCatalog = computed(() => {
    const start = (catalogPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredCatalog.value.slice(start, end);
});

const totalCatalogPages = computed(() => Math.ceil(filteredCatalog.value.length / itemsPerPage) || 1);

const myTransactions = computed(() => {
    return store.transactions
        .filter(t => t.user_id === currentUser.value.id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) 
        .map(trx => ({
            ...trx,
            details: store.transactionDetails.filter(d => d.transaction_id === trx.id)
        }));
});

const paginatedHistory = computed(() => {
    const start = (historyPage.value - 1) * 10;
    const end = start + 10;
    return myTransactions.value.slice(start, end);
});

const totalHistoryPages = computed(() => Math.ceil(myTransactions.value.length / 10) || 1);

const resetPage = () => { catalogPage.value = 1; };
const switchTab = (tab) => { activeTab.value = tab; };

// --- LOGIC KERANJANG (UPDATED) ---
const isInCart = (itemId) => cart.value.some(c => c.id === itemId);
const isCartInvalid = computed(() => cart.value.some(c => getRemainingQuota(c.id) < c.qty));

// Fungsi Helper: Hanya izinkan angka
const isNumber = (evt) => {
  const charCode = (evt.which) ? evt.which : evt.keyCode;
  // Blokir jika charCode > 31 (bukan kontrol) DAN bukan angka (48-57)
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    evt.preventDefault();
  }
};

// 1. Validasi Input Manual
const validateCartInput = (cartItem) => {
    const quota = getRemainingQuota(cartItem.id);
    
    // Cegah angka negatif atau kosong
    if (cartItem.qty < 1 || isNaN(cartItem.qty)) {
        cartItem.qty = 1;
    }
    
    // Cegah melebihi kuota
    if (cartItem.qty > quota) {
        cartItem.qty = quota;
        showToast('error', 'Auto Limit', `Jumlah disesuaikan ke maksimal ${quota} item.`);
    }
};

// 2. Tombol Plus Minus
const updateCartItem = (cartItem, amount) => {
    const newVal = cartItem.qty + amount;
    const quota = getRemainingQuota(cartItem.id);

    if (newVal < 1) return; // Tidak boleh 0
    if (newVal > quota) {
        showToast('error', 'Batas Maksimal', `Stok unit penuh! Maksimal tambah ${quota} lagi.`);
        return;
    }
    cartItem.qty = newVal;
};

const addToCart = (item) => {
    const quota = getRemainingQuota(item.id);
    if (quota <= 0) {
        showToast('error', 'Gudang Penuh', 'Kapasitas penyimpanan unit untuk barang ini sudah penuh.');
        return;
    }
    cart.value.push({ ...item, qty: 1, notes: '' });
    showToast('success', 'Berhasil', 'Masuk keranjang.');
};

const removeFromCart = (index) => cart.value.splice(index, 1);

const handleSubmit = async () => {
    // Validasi data sebelum kirim
    if (!currentUser.value.id || !currentUser.value.unit_id) {
        showToast('error', 'Sesi Tidak Valid', 'Silakan logout dan login kembali.');
        return;
    }

    try {
        const payload = {
            user_id: parseInt(currentUser.value.id),
            unit_id: parseInt(currentUser.value.unit_id),
            description: requestDescription.value || 'Permintaan ATK Rutin',
            details: cart.value.map(c => ({ 
                item_id: c.id, 
                qty: parseInt(c.qty), 
                notes: c.notes || '' 
            }))
        };

        console.log("Kirim Payload:", payload); // Cek di console browser (F12)

        const res = await store.createTransaction(payload);
        
        if (res) {
            cart.value = [];
            requestDescription.value = '';
            isCartOpen.value = false;
            showToast('success', 'Berhasil', 'Pengajuan terkirim ke Admin.');
        }
    } catch (error) {
        console.error("Detail Error:", error.response?.data);
        showToast('error', 'Gagal', error.response?.data?.error || 'Terjadi kesalahan database.');
    }
};

const openDetailModal = (trx) => {
    detailModal.value.data = trx;
    detailModal.value.show = true;
};
const closeDetailModal = () => { detailModal.value.show = false; };

const showToast = (type, title, message) => {
    toast.value = { show: true, type, title, message };
    setTimeout(() => toast.value.show = false, 3000);
};

onMounted(() => {
    store.fetchAllData();
    pollingInterval = setInterval(() => { store.fetchAllData(); }, 5000);
});

onUnmounted(() => { if (pollingInterval) clearInterval(pollingInterval); });
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.animate-fade-in-up { animation: fadeInUp 0.6s ease-out; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.toast-enter-active { transition: all 0.3s ease-out; }
.toast-enter-from { opacity: 0; transform: translateY(-20px) translateX(-50%); }
.slide-over-enter-active, .slide-over-leave-active { transition: transform 0.3s ease-in-out; }
.slide-over-enter-from, .slide-over-leave-to { transform: translateX(100%); }
</style>