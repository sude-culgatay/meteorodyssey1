const starContainer = document.getElementById('stars');
  const numStars = 300; // Daha fazla yıldız
  
  // Tam ekran boyunca yıldızlar oluştur
  for (let i = 0; i < numStars; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    const size = Math.random() * 2 + 1;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    starContainer.appendChild(star);
  }
