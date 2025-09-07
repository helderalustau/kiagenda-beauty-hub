// Service Worker para Ki Agenda PWA
const CACHE_NAME = 'ki-agenda-v1';
const STATIC_CACHE = 'ki-agenda-static-v1';

// Recursos para cache
const urlsToCache = [
  '/',
  '/admin',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching App Shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação de requests
self.addEventListener('fetch', (event) => {
  // Apenas cache recursos da mesma origem
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna do cache se encontrado
        if (response) {
          return response;
        }
        
        // Busca na rede
        return fetch(event.request).then((response) => {
          // Verifica se é uma resposta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clona a resposta
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// ===== PUSH NOTIFICATIONS =====

// Listener para mensagens push
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received', event);
  
  let notificationData = {
    title: 'Novo Agendamento!',
    body: 'Você tem um novo agendamento pendente.',
    icon: '/placeholder.svg',
    badge: '/placeholder.svg',
    tag: 'new-appointment',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'Ver Agendamento',
        icon: '/placeholder.svg'
      },
      {
        action: 'dismiss',
        title: 'Dispensar'
      }
    ],
    data: {
      url: '/admin',
      appointmentId: null
    }
  };

  // Parse dos dados se enviados
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = { ...notificationData, ...pushData };
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }

  // Exibir notificação
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      actions: notificationData.actions,
      data: notificationData.data,
      vibrate: [200, 100, 200],
      sound: '/notification-sound.mp3'
    })
  );
});

// Listener para cliques em notificações
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Abrir ou focar na janela do app
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      const url = event.notification.data?.url || '/admin';
      
      // Procurar janela existente
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Abrir nova janela se não encontrar
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Listener para fechamento de notificações
self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notification closed', event);
  
  // Analytics ou limpeza se necessário
  event.waitUntil(
    Promise.resolve() // Placeholder para futuras operações
  );
});

// Background sync para operações offline
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'sync-appointments') {
    event.waitUntil(syncAppointments());
  }
});

// Função para sincronizar agendamentos
async function syncAppointments() {
  try {
    // Implementar sincronização se necessário
    console.log('Service Worker: Syncing appointments...');
  } catch (error) {
    console.error('Service Worker: Sync failed', error);
  }
}

// Log de instalação
console.log('Service Worker: Script loaded');