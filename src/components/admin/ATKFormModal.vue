<template>
  <Teleport to="body">
    <div v-if="show" @click="onClose" class="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"></div>

    <div v-if="show" class="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
      
      <div class="relative w-full max-w-6xl h-[85vh] transform overflow-hidden rounded-2xl bg-slate-50 text-left shadow-2xl transition-all ring-1 ring-slate-900/5 flex flex-col" @click.stop>
        
        <div class="flex items-center justify-between border-b border-slate-200 px-8 py-5 bg-white z-20 flex-shrink-0 shadow-sm relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
          <div class="flex items-center gap-5">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/30 ring-1 ring-white">
              <ClipboardDocumentListIcon class="h-7 w-7" />
            </div>
            <div>
              <h3 class="text-xl font-extrabold leading-6 text-slate-800 tracking-tight">
                {{ isEditing ? 'Edit Master Barang' : 'Registrasi Barang Baru' }}
              </h3>
              <p class="text-sm text-slate-500 mt-0.5 font-medium">
                Kelola katalog referensi barang dan spesifikasi (eatk_item).
              </p>
            </div>
          </div>
          <button @click="onClose" class="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-all duration-200 hover:rotate-90 focus:outline-none">
            <XMarkIcon class="h-7 w-7" />
          </button>
        </div>

        <div class="flex flex-1 overflow-hidden">
          <div class="w-1/3 h-full bg-white border-r border-slate-200 p-8 flex flex-col items-center shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10 hidden md:flex">
             <div class="w-full max-w-xs flex flex-col h-full">
                <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center shrink-0">
                  Foto Produk <span class="text-red-500">*</span>
                </label>
                
                <div 
                  class="relative w-full aspect-square rounded-2xl bg-slate-50 border-4 border-white shadow-xl ring-1 flex items-center justify-center overflow-hidden group cursor-pointer transition-all hover:ring-4 hover:ring-cyan-200 shrink-0"
                  :class="localItem.url_photo ? 'ring-slate-200' : 'ring-red-200 bg-red-50'"
                  @click="triggerFileInput"
                >
                  <img v-if="localItem.url_photo" :src="localItem.url_photo" alt="Produk" class="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" />
                  <div v-else class="text-center p-6 flex flex-col items-center justify-center h-full w-full">
                      <PhotoIcon class="h-16 w-16 mb-3 transition-colors text-red-200" />
                      <span class="text-[10px] font-bold uppercase tracking-wide opacity-50 text-red-400">Wajib Upload</span>
                  </div>
                  <div class="absolute inset-0 bg-slate-900/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[1px]">
                    <CameraIcon class="h-10 w-10 text-white mb-2 drop-shadow-md" />
                    <span class="text-xs font-bold text-white uppercase tracking-wide drop-shadow-md">Ganti Foto</span>
                  </div>
                </div>
                
                <div class="mt-6 flex flex-col items-center w-full">
                  <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileUpload" />
                  <button type="button" @click="triggerFileInput" class="w-full px-5 py-3 rounded-xl bg-white border border-slate-300 text-slate-600 text-xs font-bold hover:border-cyan-500 hover:text-cyan-600 transition-all mb-3 shadow-sm">Pilih File Foto</button>
                  <p class="text-[11px] text-center text-slate-400">Format: JPG, PNG. Maksimal 2MB.</p>
                </div>
             </div>
          </div>

          <div class="flex-1 h-full overflow-y-auto custom-scrollbar bg-slate-50/50">
            <div class="p-8 max-w-3xl mx-auto pb-24">
              <form @submit.prevent="handleValidateAndSave" class="space-y-8">
                
                <div class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                   <div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                   <h4 class="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6 border-b border-slate-100 pb-3 flex items-center gap-2">Identitas Barang</h4>
                   
                   <div class="space-y-6">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Kode Barang (SKU) <span class="text-red-500">*</span></label>
                          <div class="relative group flex items-center">
                              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                  <span class="text-slate-500 font-bold text-sm">ATK</span>
                              </div>
                              <input 
                                :value="atkCodeSuffix"
                                @input="handleCodeInput"
                                type="text" maxlength="5" required 
                                class="form-input-bold pl-[3rem] font-mono tracking-wide" 
                                :class="{'border-red-500 ring-red-100': idValidationError || isCodeDuplicate}"
                                placeholder="001" 
                              />
                          </div>
                          <p v-if="idValidationError" class="text-[10px] text-red-600 font-bold italic animate-pulse">{{ idValidationError }}</p>
                          <p v-else-if="isCodeDuplicate" class="text-[10px] text-red-600 font-bold italic animate-pulse">Kode ini sudah terdaftar pada barang lain!</p>
                        </div>

                        <div class="space-y-2">
                          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nama Barang <span class="text-red-500">*</span></label>
                          <input v-model="localItem.name" type="text" required class="form-input-bold px-4" placeholder="cth: Kertas A4 80gr" />
                        </div>

                        <div class="space-y-2">
                          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Kategori <span class="text-red-500">*</span></label>
                          <select v-model="localItem.category_id" required class="form-select-bold px-4 w-full" @change="localItem.uom = ''">
                            <option value="" disabled>-- Pilih Kategori --</option>
                            <option v-for="cat in categoryOptions" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                          </select>
                        </div>

                        <div class="space-y-2">
                           <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Satuan (UOM) <span class="text-red-500">*</span></label>
                           <div class="relative">
                               <select v-model="localItem.uom" required class="form-select-bold px-4 w-full" :disabled="!localItem.category_id" :class="{'bg-slate-50 cursor-not-allowed opacity-60': !localItem.category_id}">
                                   <option value="" disabled>{{ !localItem.category_id ? 'Pilih kategori dahulu' : 'Pilih Satuan' }}</option>
                                   <option v-for="u in availableUOMs" :key="u" :value="u">{{ u }}</option>
                               </select>
                           </div>
                           <p v-if="!localItem.category_id" class="text-[10px] text-amber-600 mt-1 font-bold italic">Pilih kategori untuk melihat satuan yang tersedia.</p>
                        </div>
                      </div>

                      <div class="space-y-2">
                          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Deskripsi Spesifikasi</label>
                          <textarea v-model="localItem.description" rows="3" class="form-input-bold px-4 py-3 resize-none outline-none" placeholder="Masukkan detail barang..."></textarea>
                      </div>
                   </div>
                </div>

                <div class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                   <div class="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500"></div>
                   <h4 class="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6 border-b border-slate-100 pb-3 flex items-center gap-2">Parameter Stok</h4>
                   <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div class="space-y-2">
                         <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Harga Satuan (Rp)</label>
                         <input v-model.number="localItem.price" type="number" min="0" class="form-input-bold px-4" />
                      </div>
                      <div class="space-y-2">
                         <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Min Stok <span class="text-red-500">*</span></label>
                         <input v-model.number="localItem.min_stock" type="number" min="0" required class="form-input-bold px-4" />
                      </div>
                      <div class="space-y-2">
                         <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Max Stok <span class="text-red-500">*</span></label>
                         <input v-model.number="localItem.max_stock" type="number" min="0" required class="form-input-bold px-4" />
                      </div>
                   </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between px-8 py-5 bg-white border-t border-slate-200 shrink-0 z-20 shadow-sm rounded-b-2xl">
          <div class="text-xs font-bold" :class="isFormReady ? 'text-emerald-600' : 'text-red-400'">
              <span v-if="idValidationError" class="flex items-center gap-1.5"><ExclamationCircleIcon class="h-5 w-5" /> FORMAT KODE SALAH</span>
              <span v-else-if="isCodeDuplicate" class="flex items-center gap-1.5"><ExclamationCircleIcon class="h-5 w-5" /> KODE SUDAH DIGUNAKAN</span>
              <span v-else-if="isFormComplete" class="flex items-center gap-1.5"><CheckBadgeIcon class="h-5 w-5" /> DATA VALID</span>
              <span v-else>Lengkapi kolom wajib (*) dan foto</span>
          </div>
          <div class="flex gap-4">
            <button @click="onClose" class="px-6 py-2.5 text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl transition-all">Batal</button>
            <button 
              @click="handleValidateAndSave" 
              :disabled="!isFormReady"
              class="px-8 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all min-w-[140px]"
              :class="!isFormReady ? 'bg-slate-300 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-blue-500/30'"
            >
              {{ isEditing ? 'Simpan Perubahan' : 'Tambah Barang' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="localError.show" class="fixed bottom-10 right-10 z-[2000] bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl animate-bounce flex items-center gap-3 max-w-sm">
        <ExclamationCircleIcon class="h-6 w-6 shrink-0" />
        <span class="font-bold text-sm">{{ localError.message }}</span>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed, onUnmounted } from 'vue';
import { useInventoryStore } from '../../stores/inventoryStore';
import { 
  ClipboardDocumentListIcon, XMarkIcon, CheckBadgeIcon, TagIcon, 
  ArchiveBoxIcon, PhotoIcon, CameraIcon, ShieldCheckIcon, ExclamationCircleIcon 
} from '@heroicons/vue/24/outline';

const props = defineProps({ show: Boolean, itemToEdit: Object, categoryOptions: Array });
const emit = defineEmits(['close', 'save']);

const store = useInventoryStore();
const localItem = ref({});
const fileInput = ref(null);
const localError = ref({ show: false, message: '' });

// --- LOGIKA UOM & KATEGORI ---
const uomMap = { 
  1: ['Pcs', 'Lusin', 'Pack', 'Box'], // Alat Tulis
  2: ['Rim', 'Lembar', 'Map'],        // Kertas
  3: ['Botol', 'Cartridge'],          // Tinta
  4: ['Unit', 'Roll', 'Buah'],        // Perlengkapan
  5: ['Unit', 'Meter']                // Lain-lain
};
const availableUOMs = computed(() => localItem.value.category_id ? (uomMap[localItem.value.category_id] || ['Pcs']) : []);

// --- LOGIKA KODE BARANG ---
const atkCodeSuffix = computed(() => localItem.value.code?.replace(/^ATK-/, '') || '');
const handleCodeInput = (e) => {
  const val = e.target.value.replace(/[^0-9]/g, '');
  localItem.value.code = 'ATK-' + val;
};

const idValidationError = computed(() => {
  const suffix = atkCodeSuffix.value;
  if (suffix.length === 0) return null;
  if (suffix.length < 3) return "Kode harus minimal 3 digit angka!";
  if (parseInt(suffix) === 0) return "Kode tidak boleh bernilai 0!";
  return null;
});

const isCodeDuplicate = computed(() => {
  const currentCode = localItem.value.code;
  if (!currentCode || atkCodeSuffix.value.length < 3) return false;
  return store.atks.some(a => a.code === currentCode && a.id !== localItem.value.id);
});

// --- LOGIKA VALIDASI FORM ---
const isFormComplete = computed(() => {
  return localItem.value.name?.trim() && localItem.value.category_id && localItem.value.uom && localItem.value.url_photo && atkCodeSuffix.value.length >= 3;
});

const isFormReady = computed(() => isFormComplete.value && !idValidationError.value && !isCodeDuplicate.value);

const handleValidateAndSave = () => {
  if (idValidationError.value) return showError(idValidationError.value);
  if (isCodeDuplicate.value) return showError("Kode barang (SKU) sudah terdaftar!");
  if (!isFormComplete.value) return showError("Lengkapi seluruh data barang!");

  emit('save', { ...localItem.value });
};

const showError = (msg) => {
  localError.value = { show: true, message: msg };
  setTimeout(() => localError.value.show = false, 4000);
};

// --- MISC HELPERS ---
const triggerFileInput = () => fileInput.value.click();
const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) return showError("Ukuran foto maksimal 2MB!");
    localItem.value.url_photo = URL.createObjectURL(file);
  }
};

watch(() => props.show, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden';
    localItem.value = props.itemToEdit ? { ...props.itemToEdit } : {
      code: 'ATK-', name: '', category_id: '', uom: '', 
      min_stock: 0, max_stock: 0, price: 0, status: 'Active', url_photo: ''
    };
  } else {
    document.body.style.overflow = '';
  }
});

const onClose = () => emit('close');
onUnmounted(() => document.body.style.overflow = '');
</script>

<style scoped>
.form-input-bold { @apply block w-full rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold focus:ring-2 focus:ring-blue-100 focus:border-blue-500 py-2.5 transition-all outline-none sm:text-sm; }
.form-select-bold { @apply block w-full rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold focus:ring-2 focus:ring-blue-100 focus:border-blue-500 py-2.5 transition-all cursor-pointer outline-none sm:text-sm; }
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.animate-bounce { animation: bounce 0.5s infinite alternate; }
@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-5px); } }
</style>