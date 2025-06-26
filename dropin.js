<!DOCTYPE html>
<html>
  <head>
    <base target="_top" />
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      input, textarea {
        border: 1px solid #ccc;
        border-radius: 6px;
        padding: 8px;
        width: 100%;
      }
      label {
        font-weight: 600;
        margin-bottom: 4px;
        display: block;
      }
      .form-group {
        margin-bottom: 16px;
      }
      button {
        background-color: #0081a7;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
      }
      button:hover {
        background-color: #005f77;
      }
      .result {
        margin-top: 20px;
        background: #f8f8f8;
        padding: 16px;
        border-radius: 8px;
      }
    </style>
    <script>
      function handleSubmit(e) {
        e.preventDefault();

        const form = document.getElementById("tar-form");
        const data = {
          tripDate: form.tripDate.value,
          projectName: form.projectName.value,
          taskOrder: form.taskOrder.value,
          traveler: form.traveler.value,
          duration: form.duration.value,
          poc: form.poc.value,
          authority: form.authority.value,
          totalCost: form.totalCost.value,
          purpose: form.purpose.value,
          knowledge: form.knowledge.value,
          city: form.city.value,
          state: form.state.value
        };

        google.script.run
          .withSuccessHandler(displayResult)
          .validateTarWithPerDiem(data);
      }

      function displayResult(result) {
        const resBox = document.getElementById("result");
        resBox.innerHTML = `
          <p><strong>Expected Cost:</strong> $${result.expectedCost}</p>
          <p><strong>Claimed Cost:</strong> $${result.claimedCost}</p>
          <p><strong>Duration:</strong> ${result.duration} days</p>
          <p style="color: ${result.isValid ? 'green' : 'red'};"><strong>${result.message}</strong></p>
        `;
      }
    </script>
  </head>
  <body class="bg-gray-100 min-h-screen flex flex-col items-center justify-start p-6">
    <h1 class="text-2xl font-bold mb-6">TAR Validator + GSA Per Diem</h1>

    <form id="tar-form" onsubmit="handleSubmit(event)" class="w-full max-w-2xl bg-white p-6 rounded-lg shadow">
      <div class="form-group">
        <label>Trip Report Date</label>
        <input type="date" name="tripDate" required />
      </div>
      <div class="form-group">
        <label>City</label>
        <input type="text" name="city" required />
      </div>
      <div class="form-group">
        <label>State</label>
        <input type="text" name="state" required />
      </div>
      <div class="form-group">
        <label>Project Name</label>
        <input type="text" name="projectName" required />
      </div>
      <div class="form-group">
        <label>Task Order Number</label>
        <input type="text" name="taskOrder" required />
      </div>
      <div class="form-group">
        <label>Name of Traveler</label>
        <input type="text" name="traveler" required />
      </div>
      <div class="form-group">
        <label>Duration of Trip (days)</label>
        <input type="number" name="duration" min="1" required />
      </div>
      <div class="form-group">
        <label>Point of Contact (POC)</label>
        <input type="text" name="poc" />
      </div>
      <div class="form-group">
        <label>Gov Approval Authority</label>
        <input type="text" name="authority" />
      </div>
      <div class="form-group">
        <label>Total Cost of Trip ($)</label>
        <input type="number" step="0.01" name="totalCost" required />
      </div>
      <div class="form-group">
        <label>Purpose of the Trip</label>
        <textarea name="purpose" rows="2"></textarea>
      </div>
      <div class="form-group">
        <label>Knowledge Gained</label>
        <textarea name="knowledge" rows="2"></textarea>
      </div>

      <button type="submit">Validate Trip</button>
    </form>

    <div id="result" class="result w-full max-w-2xl"></div>
  </body>
</html>
