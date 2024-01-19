const countyId = localStorage.getItem('county')
const resultsDiv = document.getElementById('results');

fetch(`http://localhost:3000/api/countyById?countyID=${countyId}`).then((res) => res.json()).then((data) => {
    const countyName = data[0].County_Name;
    fetch(`http://localhost:3000/api/county?searchTerm=${countyName}&searchParam=${1}`) // search param of value 1 === all alerts
        .then(response => response.json()).then(data => {
        console.log(data);
        const county = data.county_information
        const result = document.createElement('div');
        result.innerHTML = `
            <div>County Name: ${county.County_Name}</div>
            <div>Latitude: ${county.Latitude}</div>
            <div>Longitude: ${county.Longitude}</div>
            <img src="${county.Image_Path}" alt="Image" width="150" height="150">
          `;
        const alerts = data.alerts;
        const alertContainer = document.createElement('div');
        alerts.forEach((alert) => {
            let alertType;
            switch (alert.Metric_ID) {
                case 2:
                    alertType = "Weather"
                    break;
                case 3:
                    alertType = "Health"
                    break;
                case 4:
                    alertType = "Fire"
                    break;
                default:
                    alertType = "General"
                    break;
            }
            const newAlert = document.createElement('div');
            newAlert.innerHTML = `
              <br />
              <div>Alert Type: ${alertType}</div>
              <div>Alert Description: ${alert.Alert_Message}</div>
              <div>Alert Date: ${alert.Timestamp}</div>
              <br />
            `;
            alertContainer.appendChild(newAlert)
        })
        resultsDiv.appendChild(result);
        resultsDiv.appendChild(alertContainer);
    }).catch(error => {
        console.error('Error fetching county data:', error);
        resultsDiv.innerHTML = "Error fetching data.";
    });
})