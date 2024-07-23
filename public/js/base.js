const init = () => {
    const myCarouselElement = document.querySelector('#carousel')
    
    const carousel = new bootstrap.Carousel(myCarouselElement, {
      interval: 2000,
      touch: false
    })
}

window.onload = init