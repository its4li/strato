document.addEventListener("mousemove", function(e) {
    const scene = document.querySelector('.scene');
    const layers = scene.querySelectorAll('.layer');
    
    // Get the center of the screen
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Get mouse position
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    layers.forEach(layer => {
        const speed = layer.getAttribute('data-speed');

        // Calculate the movement
        const x = (centerX - mouseX) * speed / 1000;
        const y = (centerY - mouseY) * speed / 1000;

        // Apply the transformation
        layer.style.transform = `translateX(${x}px) translateY(${y}px)`;
    });
});
