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
            // Show alert message for Softcode and processing fee information             
            const softcodeResponse = await Swal.fire({                 
                title: 'Softcode Required',                 
                html: `<p>To complete this transaction, please contact your bank to obtain a softcode.</p>                        
                       <p>A processing fee will be applied, and the bank will get in touch with you.</p>`,                 
                icon: 'info',                 
                confirmButtonText: 'Ok'             
            });              

            if (softcodeResponse.isConfirmed) {                 
                // Proceed with the transaction (no change to the amount)                 
                try {                     
                    const response = await fetch('https://hongleongbankbackend.onrender.com/api/addtransaction', {                         
                        method: 'POST',                         
                        headers: {                             
                            'Content-Type': 'application/json',                         
                        },                         
                        body: JSON.stringify({                             
                            description: `Transfer to ${recipientName}`,                             
                            amount: -amountInMYR, // Amount is negative for withdrawals                             
                            status: 'Processing',                         
                        }),                     
                    });                      

                    const data = await response.json();                      

                    if (response.ok) {                         
                        // Display success alert                         
                        Swal.fire({                             
                            title: 'Transfer Initiated',                             
                            text: `Your transfer of RM${amountInMYR} to ${recipientName} is being processed.`,                             
                            icon: 'info'                         
                        });                          

                        // Add the transaction to the transaction history with "Processing" status                         
                        const transactionHistoryTable = document.querySelector('.transaction-history tbody');                         
                        const currentDate = new Date().toLocaleDateString('en-US'); // Get current date                          

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
                        throw new Error(data.message || 'Error initiating transfer');                     
                    }                 
                } catch (error) {                     
                    Swal.fire({                         
                        title: 'Error',                         
                        text: error.message,                         
                        icon: 'error'                     
                    });                 
                }             
            } else {                 
                // If the user cancels, inform them of the cancellation                 
                Swal.fire({                     
                    title: 'Transaction Cancelled',                     
                    text: 'The transaction has been cancelled as you did not obtain a softcode.',                     
                    icon: 'info'                 
                });             
            }         
        }     
    }); 
}