// Sayfa yüklendiğinde başlat
        window.addEventListener('load', () => {
            updateLiveIndicator();
        });
        
        function viewInNASA(nasa_url) {
            // NASA Eyes sayfasında ilgili asteroidi aç
            const iframe = document.getElementById('nasa-eyes-iframe');
            const base_url = "https://eyes.nasa.gov/apps/asteroids/#/"
            iframe.src = base_url + nasa_url;
            
            // Başarı mesajı göster
            showNotification(`🌌 ${selectedAsteroid ? selectedAsteroid.name : 'Asteroid'} NASA Eyes'ta açılıyor...`, 'success');
        }

        
        // NASA Eyes görünüm değiştirme
        function loadNASAView(viewType) {
            // Aktif butonu güncelle
            document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            const iframe = document.getElementById('nasa-eyes-iframe');
            let url = 'https://eyes.nasa.gov/apps/asteroids/';
            
            switch(viewType) {
                case 'solar-system':
                    url += '#';
                    break;
                case 'earth-view':
                    url += '#/earth';
                    break;
            }
            
            iframe.src = url;
            showNotification(`🌌 ${getViewName(viewType)} görünümü yükleniyor...`, 'info');
        }
        
        function getViewName(viewType) {
            const names = {
                'solar-system': 'Güneş Sistemi',
                'earth-view': 'Dünya Odaklı'
            };
            return names[viewType] || 'Bilinmeyen';
        }
        
        
        function showNotification(message, type = 'info') {
            // Basit bildirim sistemi
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 10px;
                color: white;
                font-weight: bold;
                z-index: 1000;
                opacity: 0;
                transform: translateX(300px);
                transition: all 0.3s ease;
            `;
            
            const colors = {
                'success': 'linear-gradient(45deg, #28a745, #20c997)',
                'error': 'linear-gradient(45deg, #dc3545, #e74c3c)',
                'warning': 'linear-gradient(45deg, #ffc107, #fd7e14)',
                'info': 'linear-gradient(45deg, #17a2b8, #6f42c1)'
            };
            
            notification.style.background = colors[type] || colors.info;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            // Animasyonla göster
            setTimeout(() => {
                notification.style.opacity = '1';
                notification.style.transform = 'translateX(0)';
            }, 100);
            
            // 4 saniye sonra kaldır
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(300px)';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 4000);
        }
        
        function updateLiveIndicator() {
            const indicator = document.querySelector('.live-indicator');
            setInterval(() => {
                indicator.style.opacity = indicator.style.opacity === '0.5' ? '1' : '0.5';
            }, 1000);
        }
        
        // Responsive tasarım için pencere boyutu kontrolü
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768) {
                document.querySelector('.main-content').style.gridTemplateColumns = '1fr';
            } else {
                document.querySelector('.main-content').style.gridTemplateColumns = '2fr 1fr';
            }
        });