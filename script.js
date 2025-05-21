// Configuração da data inicial
const startDate = new Date('2024-05-25T22:11:00');

// Função para atualizar o contador
function updateCounter() {
    const now = new Date();
    const diff = now - startDate;
    
    // Cálculo de tempo
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    // Atualização dos elementos HTML
    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;
    
    // Atualização do texto da mensagem
    document.getElementById('days-text').textContent = days;
    document.getElementById('hours-text').textContent = hours;
    document.getElementById('minutes-text').textContent = minutes;
    document.getElementById('seconds-text').textContent = seconds;
}

// Atualizar o contador a cada segundo
setInterval(updateCounter, 1000);
updateCounter(); // Inicializar o contador imediatamente

// Classe para o carrossel otimizado com ordem aleatória
class RandomizedCarousel {
    constructor() {
        this.carousel = document.querySelector('.carousel');
        this.carouselContainer = document.querySelector('.carousel-container');
        this.prevButton = document.querySelector('.carousel-button.prev');
        this.nextButton = document.querySelector('.carousel-button.next');
        
        this.currentIndex = 0;
        this.totalImages = 0;
        this.images = [];
        this.randomizedImages = [];
        this.loadedImages = new Set();
        this.isTransitioning = false;
        this.autoplayInterval = null;
        
        // Configurações
        this.autoplaySpeed = 5000; // 5 segundos entre slides
        this.preloadCount = 3; // Número de imagens para pré-carregar em cada direção
        
        // Inicialização
        this.loadImageList();
        this.setupEventListeners();
        this.startAutoplay();
    }
    
    // Carregar a lista de imagens da pasta 'images'
    loadImageList() {
        // Definir o padrão de nomenclatura para as imagens
        this.images = Array.from({length: 50}, (_, i) => `images/imagem${i + 1}.jpg`);
        this.totalImages = this.images.length;
        
        // Randomizar a ordem das imagens
        this.randomizeImageOrder();
        
        // Inicializar o carrossel com os primeiros slides
        this.initializeCarousel();
    }
    
    // Randomizar a ordem das imagens
    randomizeImageOrder() {
        // Criar uma cópia do array de imagens
        this.randomizedImages = [...this.images];
        
        // Algoritmo de Fisher-Yates para embaralhar o array
        for (let i = this.randomizedImages.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.randomizedImages[i], this.randomizedImages[j]] = [this.randomizedImages[j], this.randomizedImages[i]];
        }
    }
    
    // Inicializar o carrossel com os primeiros slides
    initializeCarousel() {
        // Adicionar um spinner de carregamento
        const loadingSpinner = document.createElement('div');
        loadingSpinner.className = 'loading-spinner';
        this.carouselContainer.appendChild(loadingSpinner);
        
        // Carregar o primeiro slide e seus vizinhos
        this.loadImage(0).then(() => {
            // Remover o spinner quando a primeira imagem estiver carregada
            if (this.carouselContainer.contains(loadingSpinner)) {
                this.carouselContainer.removeChild(loadingSpinner);
            }
            
            // Pré-carregar as próximas imagens
            for (let i = 1; i <= this.preloadCount; i++) {
                const nextIndex = i % this.totalImages;
                this.loadImage(nextIndex);
            }
        });
    }
    
    // Carregar uma imagem específica
    async loadImage(index) {
        if (this.loadedImages.has(index)) return;
        
        return new Promise((resolve) => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.dataset.index = index;
            
            const img = new Image();
            img.src = this.randomizedImages[index];
            img.alt = 'Foto do casal';
            img.loading = 'lazy';
            
            img.onload = () => {
                this.loadedImages.add(index);
                resolve();
            };
            
            img.onerror = () => {
                // Se a imagem não existir, usar uma imagem de fallback ou pular
                console.log(`Imagem ${this.randomizedImages[index]} não encontrada`);
                resolve();
            };
            
            slide.appendChild(img);
            this.carousel.appendChild(slide);
        });
    }
    
    // Navegar para um slide específico
    goToSlide(index) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        // Garantir que o índice esteja dentro dos limites
        const targetIndex = (index + this.totalImages) % this.totalImages;
        
        // Carregar a imagem alvo e suas vizinhas
        this.loadImage(targetIndex).then(() => {
            // Pré-carregar as próximas imagens
            for (let i = 1; i <= this.preloadCount; i++) {
                const nextIndex = (targetIndex + i) % this.totalImages;
                const prevIndex = (targetIndex - i + this.totalImages) % this.totalImages;
                this.loadImage(nextIndex);
                this.loadImage(prevIndex);
            }
            
            // Atualizar a posição do carrossel
            this.carousel.style.transform = `translateX(-${targetIndex * 100}%)`;
            this.currentIndex = targetIndex;
            
            // Permitir nova transição após a atual terminar
            setTimeout(() => {
                this.isTransitioning = false;
            }, 800); // Tempo igual à duração da transição CSS
        });
    }
    
    // Ir para o próximo slide
    nextSlide() {
        this.goToSlide(this.currentIndex + 1);
    }
    
    // Ir para o slide anterior
    prevSlide() {
        this.goToSlide(this.currentIndex - 1);
    }
    
    // Configurar os event listeners
    setupEventListeners() {
        // Botões de navegação
        this.prevButton.addEventListener('click', () => {
            this.pauseAutoplay();
            this.prevSlide();
            this.startAutoplay();
        });
        
        this.nextButton.addEventListener('click', () => {
            this.pauseAutoplay();
            this.nextSlide();
            this.startAutoplay();
        });
        
        // Configurar Hammer.js para gestos de swipe
        const hammer = new Hammer(this.carouselContainer);
        
        // Configurar para detectar apenas swipes horizontais
        hammer.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });
        
        hammer.on('swipeleft', () => {
            this.pauseAutoplay();
            this.nextSlide();
            this.startAutoplay();
        });
        
        hammer.on('swiperight', () => {
            this.pauseAutoplay();
            this.prevSlide();
            this.startAutoplay();
        });
        
        // Pausar autoplay quando o mouse estiver sobre o carrossel
        this.carouselContainer.addEventListener('mouseenter', () => {
            this.pauseAutoplay();
        });
        
        this.carouselContainer.addEventListener('mouseleave', () => {
            this.startAutoplay();
        });
        
        // Pausar autoplay quando a página estiver em segundo plano
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoplay();
            } else {
                this.startAutoplay();
            }
        });
    }
    
    // Iniciar reprodução automática
    startAutoplay() {
        this.pauseAutoplay(); // Limpar qualquer intervalo existente
        this.autoplayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoplaySpeed);
    }
    
    // Pausar reprodução automática
    pauseAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }
}

// Inicializar o carrossel quando a página for carregada
window.addEventListener('load', () => {
    const carousel = new RandomizedCarousel();
    
    // Prevenir comportamento de scroll padrão no contêiner do carrossel
    document.querySelector('.carousel-container').addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
});
