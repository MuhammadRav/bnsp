<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm transition-opacity" @click="$emit('close')"></div>
    
    <div v-if="show" class="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div class="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        
        <div class="bg-white px-8 py-6 border-b border-slate-100 flex justify-between items-start shrink-0 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          <div class="flex items-start gap-5">
             <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 shadow-sm shrink-0">
               <ArchiveBoxIcon class="h-8 w-8" />
             </div>
             <div class="min-w-0">
               <h3 class="text-2xl font-black text-slate-800 leading-tight truncate">{{ item?.name }}</h3>
               <div class="flex flex-wrap gap-2 mt-2">
                  <span class="text-[10px] font-mono bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-slate-500 font-bold shadow-sm uppercase tracking-wider">SKU: {{ item?.sku }}</span>
                  <span class="text-[10px] text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 font-bold uppercase tracking-wider">
                    <MapPinIcon class="h-3.5 w-3.5" /> {{ item?.unit }}
                  </span>
                  <span class="text-[10px] text-slate-600 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 font-bold uppercase tracking-wider">
                    <TagIcon class="h-3.5 w-3.5 text-slate-400" /> {{ item?.category }}
                  </span>
               </div>
             </div>
          </div>
          <div class="flex items-center gap-3">
             <button @click="$emit('edit')" class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                <PencilSquareIcon class="h-4 w-4" />
                Edit Parameter
             </button>
             <button @click="$emit('close')" class="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-all">
                <XMarkIcon class="h-7 w-7" />
             </button>
          </div>
        </div>

        <div class="p-8 overflow-y-auto custom-scrollbar bg-slate-50/30 flex-1">
           
           <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <div class="lg:col-span-4 space-y-6">
                <div class="relative w-full aspect-square rounded-3xl bg-white border-4 border-white shadow-xl ring-1 ring-slate-200 flex items-center justify-center overflow-hidden group">
                  <img v-if="item?.url_photo" :src="item.url_photo" alt="Foto Barang" class="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-110" />
                  <div v-else class="flex flex-col items-center text-slate-200">
                     <PhotoIcon class="h-24 w-24 mb-2" />
                     <span class="text-xs font-bold uppercase tracking-widest">No Preview</span>
                  </div>
                </div>

                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                   <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Ringkasan Unit</h4>
                   <div class="space-y-4">
                      <div class="flex justify-between items-center">
                         <span class="text-xs font-bold text-slate-500">Satuan Terkecil</span>
                         <span class="text-sm font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{{ item?.uom }}</span>
                      </div>
                      <div class="flex justify-between items-center border-t border-slate-50 pt-4">
                         <span class="text-xs font-bold text-slate-500">Batas Minimum</span>
                         <span class="text-sm font-black text-orange-600">{{ item?.stock_min }} {{ item?.uom }}</span>
                      </div>
                   </div>
                </div>
              </div>

              <div class="lg:col-span-8 space-y-6">
                 <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-3xl text-white shadow-xl shadow-blue-600/20 relative overflow-hidden group">
                       <ArchiveBoxIcon class="absolute -right-4 -bottom-4 h-24 w-24 opacity-10 group-hover:scale-110 transition-transform duration-500" />
                       <p class="text-[11px] uppercase font-black tracking-widest opacity-80 mb-2">Total Stok Tersedia</p>
                       <div class="flex items-baseline gap-2">
                          <span class="text-4xl font-black">{{ totalStock }}</span>
                          <span class="text-sm font-bold opacity-70">{{ item?.uom }}</span>
                       </div>
                       <div v-if="totalStock <= (item?.stock_min || 0)" class="mt-4 bg-white/20 backdrop-blur-md rounded-lg py-1 px-3 w-fit flex items-center gap-2">
                          <ExclamationTriangleIcon class="h-4 w-4 text-yellow-300" />
                          <span class="text-[10px] font-bold uppercase tracking-wide">Segera Restock!</span>
                       </div>
                    </div>

                    <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-emerald-300 transition-all">
                       <div>
                          <p class="text-[11px] uppercase font-black text-slate-400 tracking-widest mb-2">Valuasi Rata-rata</p>
                          <div class="flex items-baseline gap-1">
                             <span class="text-xs font-bold text-slate-400">Rp</span>
                             <span class="text-3xl font-black text-slate-800">{{ averagePrice.toLocaleString('id-ID') }}</span>
                          </div>
                       </div>
                       <div class="mt-4 flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase">
                          <div class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                          Berdasarkan {{ sortedBatches.length }} Batch Aktif
                       </div>
                    </div>
                 </div>

                 <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                       <h4 class="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <ClockIcon class="h-5 w-5 text-blue-500" /> Rincian Batch (FIFO)
                       </h4>
                       <div class="flex gap-1">
                          <button @click="currentPage > 1 ? currentPage-- : null" :disabled="currentPage === 1" class="p-1 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all"><ChevronLeftIcon class="h-5 w-5"/></button>
                          <button @click="currentPage < totalPages ? currentPage++ : null" :disabled="currentPage === totalPages" class="p-1 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all"><ChevronRightIcon class="h-5 w-5"/></button>
                       </div>
                    </div>
                    <div class="overflow-x-auto">
                       <table class="min-w-full divide-y divide-slate-100">
                          <thead>
                             <tr class="bg-slate-50/30 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th class="px-6 py-4 text-left">Tgl Masuk</th>
                                <th class="px-6 py-4 text-right">Harga Beli</th>
                                <th class="px-6 py-4 text-center">Sisa Stok</th>
                                <th class="px-6 py-4 text-right">Nilai Aset</th>
                             </tr>
                          </thead>
                          <tbody class="divide-y divide-slate-100">
                             <tr v-if="sortedBatches.length === 0">
                                <td colspan="4" class="px-6 py-12 text-center text-slate-400 italic text-sm">Tidak ada data batch aktif.</td>
                             </tr>
                             <tr v-for="batch in paginatedBatches" :key="batch.id" class="hover:bg-blue-50/30 transition-colors group">
                                <td class="px-6 py-4 text-xs font-bold text-slate-600 font-mono">{{ formatDate(batch.date) }}</td>
                                <td class="px-6 py-4 text-xs text-right font-black text-slate-800">Rp {{ batch.price.toLocaleString('id-ID') }}</td>
                                <td class="px-6 py-4 text-center">
                                   <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-700 border border-blue-200 group-hover:scale-110 transition-transform">
                                      {{ batch.stock }}
                                   </span>
                                </td>
                                <td class="px-6 py-4 text-xs text-right font-bold text-slate-500 font-mono">Rp {{ (batch.price * batch.stock).toLocaleString('id-ID') }}</td>
                             </tr>
                          </tbody>
                       </table>
                    </div>
                    <div v-if="totalPages > 1" class="px-6 py-3 bg-slate-50/30 border-t border-slate-100 flex justify-between items-center">
                       <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Halaman {{ currentPage }} dari {{ totalPages }}</span>
                       <div class="flex gap-2">
                          <span v-for="p in totalPages" :key="p" @click="currentPage = p" class="w-1.5 h-1.5 rounded-full cursor-pointer transition-all" :class="currentPage === p ? 'bg-blue-600 w-4' : 'bg-slate-300'"></span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div class="bg-white px-8 py-5 border-t border-slate-100 flex justify-between items-center shrink-0">
           <div class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Data Ref: <span class="text-slate-800">EATK_ITEM_UNIT</span>
           </div>
           <button type="button" @click="$emit('close')" class="rounded-xl bg-slate-900 px-8 py-3 text-sm font-bold text-white hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/20 active:scale-95">
             Tutup Detail
           </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { 
  XMarkIcon, MapPinIcon, ArchiveBoxIcon, PencilSquareIcon, PhotoIcon, 
  ExclamationTriangleIcon, TagIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon 
} from '@heroicons/vue/24/outline';

const props = defineProps(['show', 'item']);
defineEmits(['close', 'edit']);

// --- FIFO BATCH LOGIC ---
const currentPage = ref(1);
const itemsPerPage = 5;

const sortedBatches = computed(() => {
  // Integrasi data batch asli (pastikan props.item.batches ada di store)
  const realBatches = props.item?.batches ? [...props.item.batches] : [];
  
  // Sort descending (terbaru di atas)
  return realBatches.sort((a, b) => new Date(b.date) - new Date(a.date));
});

const totalPages = computed(() => Math.ceil(sortedBatches.value.length / itemsPerPage) || 1);

const paginatedBatches = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return sortedBatches.value.slice(start, start + itemsPerPage);
});

// --- STATISTIK ---
const totalStock = computed(() => {
  return sortedBatches.value.reduce((sum, batch) => sum + (parseInt(batch.stock) || 0), 0);
});

const averagePrice = computed(() => {
  if (sortedBatches.value.length === 0) return 0;
  const totalValue = sortedBatches.value.reduce((sum, b) => sum + (b.price * b.stock), 0);
  return totalStock.value > 0 ? Math.round(totalValue / totalStock.value) : 0;
});

// Reset pagination when modal opens or item changes
watch(() => props.item, () => { currentPage.value = 1; });

const formatDate = (str) => {
  if (!str) return '-';
  return new Date(str).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Scroll Lock
watch(() => props.show, (val) => {
  document.body.style.overflow = val ? 'hidden' : '';
});

onUnmounted(() => { document.body.style.overflow = ''; });
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

.animate-scale-up { animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes scaleUp { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
</style>