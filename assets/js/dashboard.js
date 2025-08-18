document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selections ---
    const hamburgerBtn = document.getElementById('hamburger-menu');
    const portfolioList = document.getElementById('portfolio-list');

    let provider, userAddress;

    // --- Hamburger Menu Logic ---
    hamburgerBtn.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-open');
    });

    // --- NEW: Function to Fetch and Display REAL Portfolio ---
    const fetchPortfolio = async () => {
        if (!userAddress) return;

        console.log(`Fetching portfolio for ${userAddress}...`);
        portfolioList.innerHTML = `<div class="loading-state"><p>Loading your tokens...</p></div>`;

        try {
            // Step 1: Fetch token balances from our own API
            const balanceRes = await fetch(`/api/portfolio/balances?address=${userAddress}`);
            const balanceData = await balanceRes.json();
            
            const tokenContracts = balanceData.tokenBalances
                .map(token => token.contractAddress)
                .join(',');

            if (!tokenContracts) {
                 portfolioList.innerHTML = `<div class="loading-state"><p>No tokens found.</p></div>`;
                 return;
            }

            // Step 2: Fetch prices for those tokens from our own API
            const priceRes = await fetch(`/api/portfolio/prices?addresses=${tokenContracts}`);
            const priceData = await priceRes.json();

            // Step 3: Combine balance and price data
            const portfolio = balanceData.tokenBalances.map(token => {
                const balance = ethers.utils.formatUnits(token.tokenBalance, 18); // Assuming 18 decimals
                const priceInfo = priceData.data[token.contractAddress][0];
                const price = priceInfo.quote.USD.price;
                const value = parseFloat(balance) * price;

                return {
                    symbol: priceInfo.symbol,
                    balance: parseFloat(balance).toFixed(4),
                    value: value.toFixed(2),
                    // You'd need another API to get token icons reliably
                    icon: `https://via.placeholder.com/32` 
                };
            }).filter(token => token.value > 1); // Filter out dust

            // Step 4: Display the portfolio
            portfolioList.innerHTML = '';
            portfolio.forEach(token => {
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

        } catch (error) {
            console.error("Failed to fetch portfolio:", error);
            portfolioList.innerHTML = `<div class="loading-state"><p>Could not load portfolio.</p></div>`;
        }
    };

    // --- Initialization ---
    async function init() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                provider = new ethers.providers.Web3Provider(window.ethereum);
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                
                if (accounts.length > 0) {
                    userAddress = accounts[0];
                    await fetchPortfolio();
                } else {
                    window.location.href = '/'; 
                }
            } catch (error) {
                window.location.href = '/';
            }
        } else {
            window.location.href = '/';
        }
    }

    init();
});
