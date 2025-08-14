// Listen for the mousemove event on the entire document
document.addEventListener("mousemove", function(event) {
    
    // Select all elements with the class 'layer'
    const layers = document.querySelectorAll('.layer');
    
    // Get the center of the viewport
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Get the current mouse position
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // Loop through each layer
    layers.forEach(layer => {
        // Get the speed from the data-speed attribute in the HTML
        const speed = parseFloat(layer.getAttribute('data-speed'));

        // Calculate how much the layer should move
        // The further the mouse is from the center, the more the layer moves
        const x = (centerX - mouseX) * speed / 1000;
        const y = (centerY - mouseY) * speed / 1000;

        // Apply the movement using CSS transform for smooth performance
        layer.style.transform = `translateX(${x}px) translateY(${y}px)`;
    });
});
