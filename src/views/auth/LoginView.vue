<template>
  <div class="font-inter flex min-h-screen flex-col items-center justify-center bg-primary-blue px-4 py-12 overflow-hidden">
    
    <Transition appear name="fade-in-up">
      <div class="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-2 ring-gray-100 transition-all duration-300">
        
        <div class="relative flex flex-col items-center justify-center p-8 text-center text-white border-b border-white/30 bg-primary-blue">
          <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
          <div class="relative z-10 space-y-3">
            <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-xl overflow-hidden shadow-lg ring-4 ring-white/30 bg-white p-3 transform hover:scale-105 transition-transform duration-500">
              <img 
                src="/pln-click.png" 
                alt="Logo PLN Click" 
                class="w-full h-full object-contain"
                onerror="this.onerror=null; this.src='https://placehold.co/100x100/ffffff/000000?text=PLN'"
              >
            </div>
            <p class="text-base font-semibold text-white/90 pt-1 max-w-xs mx-auto">
              Sistem Manajemen Aset & Stok
            </p>
          </div>
        </div>
        
        <div class="p-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">
            Masuk ke Akun Anda
          </h2>

          <form class="space-y-6" @submit.prevent="handleLogin">
            <div>
              <label for="username" class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Username</label>
              <div class="relative group">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <UserIcon class="h-5 w-5 text-gray-400 group-focus-within:text-primary-blue transition-colors" />
                </div>
                <input 
                  id="username" 
                  name="username" 
                  type="text" 
                  required
                  v-model.trim="username"
                  class="block w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:border-primary-blue focus:shadow-lg focus:outline-none focus:ring-1 focus:ring-primary-blue sm:text-sm transition-all"
                  placeholder="Masukkan username"
                />
              </div>
            </div>
            
            <div>
              <label for="password" class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Password</label>
              <div class="relative group">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockClosedIcon class="h-5 w-5 text-gray-400 group-focus-within:text-primary-blue transition-colors" />
                </div>
                <input 
                  id="password" 
                  name="password" 
                  :type="showPassword ? 'text' : 'password'" 
                  required
                  v-model="password"
                  class="block w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-10 text-gray-900 placeholder-gray-400 focus:border-primary-blue focus:shadow-lg focus:outline-none focus:ring-1 focus:ring-primary-blue sm:text-sm transition-all"
                  placeholder="Masukkan password"
                />
                <button 
                  type="button" 
                  class="absolute inset-y-0 right-0 z-10 flex items-center pr-3 text-gray-400 hover:text-primary-blue transition-colors focus:outline-none"
                  @click="showPassword = !showPassword"
                >
                  <EyeSlashIcon v-if="showPassword" class="h-5 w-5" />
                  <EyeIcon v-else class="h-5 w-5" />
                </button>
              </div>
            </div>

            <Transition name="slide-down-fade">
              <div v-if="errorMsg" class="rounded-lg bg-red-50 p-4 border-l-4 border-red-500 flex items-start gap-3">
                <ExclamationCircleIcon class="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p class="text-sm font-medium text-red-700">{{ errorMsg }}</p>
              </div>
            </Transition>

            <button 
              type="submit" 
              :disabled="isLoading"
              class="relative flex w-full justify-center rounded-xl bg-[#00A2B9] px-4 py-3 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:bg-yellow-400 hover:text-slate-900 hover:shadow-2xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-yellow-500/50 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 !mt-8"
            >
              <span v-if="isLoading" class="flex items-center gap-2">
                <svg class="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memvalidasi...
              </span>
              <span v-else>MASUK APLIKASI</span>
            </button>
          </form>

          <div class="mt-8 pt-6 border-t border-slate-100">
             <p class="text-center text-xs text-gray-400">
               Butuh bantuan akses? <a href="#" class="text-primary-blue hover:underline font-bold">Hubungi IT Support</a>
             </p>
          </div>
        </div>
      </div>
    </Transition>
    
    <div class="mt-8 text-center text-xs text-white/80 font-medium">
      &copy; 2026 PT PLN Icon Plus. All rights reserved.
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { UserIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, ExclamationCircleIcon } from '@heroicons/vue/24/solid';

const router = useRouter();

const username = ref('');
const password = ref('');
const errorMsg = ref('');
const isLoading = ref(false);
const showPassword = ref(false);

const handleLogin = async () => {
  errorMsg.value = '';
  
  if (!username.value || !password.value) {
    errorMsg.value = 'Username dan password wajib diisi.';
    return;
  }

  isLoading.value = true;

  try {
    const response = await axios.post('http://localhost:3000/api/login', {
      username: username.value,
      password: password.value
    });

    const data = response.data;

    // --- FIX: Simpan status login agar terbaca oleh router/index.js ---
    localStorage.setItem('userLoggedIn', 'true'); 
    localStorage.setItem('activeUser', JSON.stringify(data));
    localStorage.setItem('userRole', data.role);
    localStorage.setItem('lastActiveTime', Date.now().toString());

    // Berikan jeda sedikit agar transisi lebih smooth
    setTimeout(() => {
      if (data.role === 'Admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/user/request');
      }
    }, 300);

  } catch (err) {
    console.error('[LOGIN ERROR]', err.response?.data || err);
    
    if (err.response && err.response.data) {
      errorMsg.value = err.response.data.message;
    } else {
      errorMsg.value = 'Tidak dapat terhubung ke server. Pastikan Backend berjalan.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style>
:root {
  --color-primary-blue: #00A2B9;
}

.bg-primary-blue { background-color: var(--color-primary-blue); }
.text-primary-blue { color: var(--color-primary-blue); }
.focus\:border-primary-blue:focus { border-color: var(--color-primary-blue); }
.focus\:ring-primary-blue:focus { --tw-ring-color: var(--color-primary-blue); }

.fade-in-up-enter-active { transition: all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.fade-in-up-enter-from { opacity: 0; transform: translateY(30px) scale(0.95); }
.fade-in-up-enter-to { opacity: 1; transform: translateY(0) scale(1); }

.slide-down-fade-enter-active { transition: all 0.3s ease-out; }
.slide-down-fade-leave-active { transition: all 0.2s ease-in; }
.slide-down-fade-enter-from, .slide-down-fade-leave-to { opacity: 0; transform: translateY(-10px); }
</style>