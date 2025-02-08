document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('https://hongleongbackenddd.onrender.com/api/transactions');
        const transactions = await response.json();

        if (response.ok) {
            const transactionHistoryTable = document.querySelector('.transaction-history tbody');

            transactions.forEach(transaction => {
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td>${new Date(transaction.date).toLocaleDateString('en-US')}</td>
                    <td>${transaction.description}</td>
                    <td>${transaction.amount > 0 ? '+' : ''}$${Math.abs(transaction.amount).toFixed(2)}</td>
                    <td>${transaction.status}</td>
                `;
                transactionHistoryTable.appendChild(newRow);
            });
        } else {
            throw new Error('Error fetching transactions');
        }
    } catch (error) {
        Swal.fire({
            title: 'Error',
            text: error.message,
            icon: 'error'
        });
    }
});
