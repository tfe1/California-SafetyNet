
function triggerAlert(event) {


    // Prevent the default form submission behavior.
    event.preventDefault();

    // Select the input elements and get their values.
    const alertInput = document.querySelector('input[name="Alert_Message"]');
    const alert = {
        Alert_Message: alertInput.value,
        Triggered_By: document.querySelector('input[name="Triggered_By"]').value,
        County_ID: document.querySelector('input[name="County_ID"]').value,
        Metric_ID: document.querySelector('input[name="Metric_ID"]').value
    };

    // Make an asynchronous POST request to the server's '/api/alert' endpoint.
    fetch('/api/alert', {
        method: 'POST', // Use the POST HTTP method.
        headers: { 'Content-Type': 'application/json' }, // Set the content type to JSON.
        body: JSON.stringify({ alert }) // Send the alert data as a JSON string.
    })
        .then(response => {
            // Check if the response is successful. If not, throw an error.
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to send alert');
            }
        })
        .then(() => {
            // Upon successful submission, clear the alert message input field.
            alertInput.value = '';

            // Temporarily update the placeholder to indicate success.
            alertInput.placeholder = 'Input successful';

            // Reset the placeholder text after a 3-second delay.
            setTimeout(() => {
                alertInput.placeholder = 'Input alert';
            }, 3000);
        })
        .catch(error => {
            // Log any errors to the console.
            console.error(error);
            // Optionally, you can display an error message to the user here.
        });
}


document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('alertForm').addEventListener('submit', triggerAlert);
});
