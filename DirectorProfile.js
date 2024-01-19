const countyInput = document.getElementById("County_ID")
const countyID = localStorage.getItem("county")
countyInput.value = countyID

const usersID = localStorage.getItem("user_id")
const triggeredBy = document.getElementById("Triggered_By")
triggeredBy.value = usersID

const metricContainer = document.getElementById("Metric_ID_Select");
const metricInput = document.getElementById("Metric_ID");

//Assign selected value to metricID hidden input
metricContainer.addEventListener('change', (e) => {
    metricInput.value = e.target.value;
});