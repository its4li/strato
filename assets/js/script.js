// The parallax effect code remains the same
document.addEventListener("mousemove", function(event) {
    const layers = document.querySelectorAll('.layer');
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    layers.forEach(layer => {
        const speed = parseFloat(layer.getAttribute('data-speed'));
        const x = (centerX - mouseX) * speed / 1000;
        const y = (centerY - mouseY) * speed / 1000;
        layer.style.transform = `translateX(${x}px) translateY(${y}px)`;
    });
});

// --- New Web3 Logic ---
const connectWalletBtn = document.querySelector('.cta-button');

const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log("Connected account:", accounts[0]);
            window.location.href = '/dashboard/';
        } catch (error) {
            console.error("User rejected the connection request:", error);
            alert("You need to connect your wallet to continue.");
        }
    } else {
        alert("MetaMask is not installed. Please install it to use this dApp.");
    }
};

connectWalletBtn.addEventListener('click', connectWallet);
