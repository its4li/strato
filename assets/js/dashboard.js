document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selections ---
    const hamburgerBtn = document.getElementById('hamburger-menu');
    const sidebar = document.getElementById('sidebar');
    const portfolioList = document.getElementById('portfolio-list');

    let provider, signer, userAddress;

    // --- Hamburger Menu Logic ---
    hamburgerBtn.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-open');
    });

    // --- NEW: Function to Fetch and Display Portfolio ---
    const fetchPortfolio = async () => {
        if (!userAddress) return;

        console.log(`Fetching portfolio for ${userAddress}...`);
        
        // Using mock data for the demo
        const mockTokens = [
            { icon: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', symbol: 'ETH', balance: '1.25', value: '4120.50' },
            { icon: 'https://assets.coingecko.com/coins/images/6319/large/usdc.png', symbol: 'USDC', balance: '1500.72', value: '1500.72' },
            { icon: 'https://assets.coingecko.com/coins/images/9956/large/4c7a591b-1853-4208-97d8-15acc158f090.png', symbol: 'WBTC', balance: '0.05', value: '3500.00' }
        ];

        portfolioList.innerHTML = ''; 

        mockTokens.forEach(token => {
            const row = document.createElement('div');
            row.className = 'token-row';
            row.innerHTML = `
                <div class="token-name-cell">
                    <img src="${token.icon}" alt="${token.symbol}" class="token-icon">
                    <span class="token-symbol">${token.symbol}</span>
                </div>
                <div class="token-balance">${token.balance}</div>
                <div class="token-value">$${token.value}</div>
            `;
            portfolioList.appendChild(row);
        });
    };

    // --- Initialization ---
    async function init() {
        if (typeof window.ethereum === 'undefined') {
            console.log("MetaMask is not installed. Redirecting...");
            window.location.href = '/';
            return;
        }

        try {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            
            // Request account access if not already connected
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            if (accounts.length > 0) {
                userAddress = accounts[0];
                console.log("User connected:", userAddress);
                await fetchPortfolio(); // Fetch the portfolio on load
            } else {
                console.log("No accounts found. Redirecting...");
                window.location.href = '/'; 
            }
        } catch (error) {
            console.error("Initialization error:", error);
            window.location.href = '/';
        }
    }

    init();
});
